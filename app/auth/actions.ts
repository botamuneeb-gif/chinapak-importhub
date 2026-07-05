"use server";

import { getDefaultRedirectForRoles } from "@/lib/auth/redirects";
import { ensureActiveRoleAssignment } from "@/lib/auth/role-assignments";
import {
  PUBLIC_SIGNUP_ROLE,
  hasAllowedRole,
  type UserRole,
} from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type AuthActionResult =
  | {
      ok: true;
      redirectTo: string;
      message?: string;
    }
  | {
      ok: false;
      message: string;
    };

export type PublicAuthSessionSummary =
  | {
      loggedIn: false;
    }
  | {
      dashboardHref: string;
      displayName: string | null;
      email: string | null;
      loggedIn: true;
      role: UserRole | null;
      roleLabel: string;
      showMyProjects: boolean;
    };

export type ImporterSignupInput = {
  businessType: string;
  city: string;
  email: string;
  fullName: string;
  password: string;
  phoneWhatsapp?: string;
};

function cleanText(value: string | undefined) {
  return value?.trim() ?? "";
}

function getPublicRoleLabel(role: UserRole | null, roleCount: number) {
  if (roleCount > 1) {
    return "Multiple roles";
  }

  switch (role) {
    case "importer":
      return "Importer";
    case "fms":
      return "FMS";
    case "agent":
      return "Agent";
    case "admin":
      return "Admin";
    case "super_admin":
      return "Super Admin";
    case "factory_future":
      return "Factory Future";
    default:
      return "Role pending";
  }
}

export async function signupImporterAction(
  input: ImporterSignupInput,
): Promise<AuthActionResult> {
  const fullName = cleanText(input.fullName);
  const email = cleanText(input.email).toLowerCase();
  const password = input.password;
  const city = cleanText(input.city);
  const businessType = cleanText(input.businessType);
  const phoneWhatsapp = cleanText(input.phoneWhatsapp);

  if (!fullName || !email || !password || !city || !businessType) {
    return { ok: false, message: "Please complete all required signup fields." };
  }

  if (password.length < 8) {
    return {
      ok: false,
      message: "Please use a password with at least 8 characters.",
    };
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: fullName,
          full_name: fullName,
          name: fullName,
          phone_whatsapp: phoneWhatsapp || null,
          city,
          business_type: businessType,
          signup_source: "public_importer_email_signup",
        },
      });

    if (authError || !authData.user) {
      return {
        ok: false,
        message:
          authError?.message ??
          "The importer account could not be created in Supabase Auth.",
      };
    }

    const authUserId = authData.user.id;
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          auth_user_id: authUserId,
          display_name: fullName,
          primary_role: PUBLIC_SIGNUP_ROLE,
          preferred_language: "ur",
          status: "active",
          metadata: {
            signup_source: "public_importer_email_signup",
          },
        },
        { onConflict: "auth_user_id" },
      )
      .select("id")
      .single();

    if (profileError || !profile) {
      return {
        ok: false,
        message:
          "Auth user was created, but the importer profile could not be saved. Please contact admin support before trying again.",
      };
    }

    const roleResult = await ensureActiveRoleAssignment({
      metadata: {
        auth_user_id: authUserId,
      },
      role: PUBLIC_SIGNUP_ROLE,
      source: "public_importer_signup",
      userProfileId: profile.id,
    });

    if (!roleResult.ok) {
      return {
        ok: false,
        message:
          "Importer profile was created, but the importer role could not be assigned. Please contact admin support.",
      };
    }

    const { error: importerError } = await supabase
      .from("importer_profiles")
      .upsert(
        {
          user_profile_id: profile.id,
          full_name: fullName,
          phone_whatsapp: phoneWhatsapp || null,
          city,
          business_type: businessType,
          verification_status: "unverified",
          metadata: {
            phone_otp_status: "future_sms_setup",
          },
        },
        { onConflict: "user_profile_id" },
      );

    if (importerError) {
      return {
        ok: false,
        message:
          "Importer role was assigned, but the importer detail profile could not be saved. Please contact admin support.",
      };
    }

    return {
      ok: true,
      redirectTo: "/importer/dashboard",
      message: "Importer account created.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Supabase is not configured for importer signup yet.";

    return { ok: false, message };
  }
}

export async function resolveAuthRedirectAction(
  accessToken: string,
  allowedRoles?: UserRole[],
): Promise<AuthActionResult> {
  const result = await getProfileForAccessToken(accessToken);

  if (!result.ok) {
    return result;
  }

  if (allowedRoles && !hasAllowedRole(result.profile.roles, allowedRoles)) {
    return {
      ok: false,
      message:
        "Access denied. This account does not have the required ChinaPak ImportHub role.",
    };
  }

  return {
    ok: true,
    redirectTo: getDefaultRedirectForRoles(result.profile.roles),
  };
}

export async function getPublicAuthSessionSummaryAction(
  accessToken: string,
): Promise<PublicAuthSessionSummary> {
  const result = await getProfileForAccessToken(accessToken);

  if (!result.ok) {
    return { loggedIn: false };
  }

  const roles = result.profile.roles;
  const singleRole = roles.length === 1 ? roles[0] : null;
  const dashboardHref =
    singleRole === null
      ? "/auth/role-select"
      : getDefaultRedirectForRoles([singleRole], "/auth/role-select");

  return {
    dashboardHref,
    displayName: result.profile.displayName,
    email: result.profile.email,
    loggedIn: true,
    role: singleRole,
    roleLabel: getPublicRoleLabel(singleRole, roles.length),
    showMyProjects: singleRole === PUBLIC_SIGNUP_ROLE,
  };
}
