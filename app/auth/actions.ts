"use server";

import { getSiteUrl } from "@/config/site-url";
import { getDefaultRedirectForRoles } from "@/lib/auth/redirects";
import { ensureActiveRoleAssignment } from "@/lib/auth/role-assignments";
import {
  PUBLIC_SIGNUP_ROLE,
  hasAllowedRole,
  type UserRole,
} from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

export type AuthSimpleActionResult =
  | {
      ok: true;
      message: string;
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
): Promise<AuthSimpleActionResult> {
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
    const supabase = createServerSupabaseClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/login?verified=1`,
        data: {
          display_name: fullName,
          full_name: fullName,
          name: fullName,
          phone_whatsapp: phoneWhatsapp || null,
          city,
          business_type: businessType,
          intended_role: PUBLIC_SIGNUP_ROLE,
          signup_source: "public_importer_email_verification",
        },
      },
    });

    if (authError) {
      return {
        ok: false,
        message:
          authError?.message ??
          "The importer account could not be created in Supabase Auth.",
      };
    }

    return {
      ok: true,
      message:
        "Account created. Please check your email inbox and verify your email before logging in.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Supabase is not configured for importer signup yet.";

    return { ok: false, message };
  }
}

function getStringMetadataValue(
  metadata: Record<string, unknown>,
  key: string,
) {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : "";
}

function isEmailVerified(user: {
  confirmed_at?: string | null;
  email_confirmed_at?: string | null;
}) {
  return Boolean(user.email_confirmed_at || user.confirmed_at);
}

export async function prepareVerifiedImporterProfileAction(
  accessToken: string,
): Promise<AuthSimpleActionResult> {
  if (!accessToken) {
    return { ok: false, message: "No active Supabase session was found." };
  }

  try {
    const serverSupabase = createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await serverSupabase.auth.getUser(accessToken);

    if (userError || !user) {
      return { ok: false, message: "Your session could not be verified." };
    }

    const adminSupabase = createAdminSupabaseClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from("user_profiles")
      .select("id, status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError) {
      return {
        ok: false,
        message: "Your ChinaPak profile could not be checked.",
      };
    }

    if (profile && profile.status !== "active") {
      return {
        ok: false,
        message:
          "This ChinaPak ImportHub profile is not active. Please contact admin support.",
      };
    }

    if (profile) {
      return {
        ok: true,
        message: "Importer profile is ready.",
      };
    }

    if (!isEmailVerified(user)) {
      return {
        ok: false,
        message: "Please verify your email inbox before logging in.",
      };
    }

    const metadata = user.user_metadata ?? {};
    const intendedRole = getStringMetadataValue(metadata, "intended_role");
    const signupSource = getStringMetadataValue(metadata, "signup_source");

    if (
      intendedRole !== PUBLIC_SIGNUP_ROLE ||
      signupSource !== "public_importer_email_verification"
    ) {
      return {
        ok: false,
        message:
          "This account is missing importer signup verification metadata. Please contact ChinaPak ImportHub support.",
      };
    }

    const fullName =
      getStringMetadataValue(metadata, "full_name") ||
      getStringMetadataValue(metadata, "display_name") ||
      user.email ||
      "Importer";
    const phoneWhatsapp = getStringMetadataValue(metadata, "phone_whatsapp");
    const city = getStringMetadataValue(metadata, "city");
    const businessType = getStringMetadataValue(metadata, "business_type");

    if (!city || !businessType) {
      return {
        ok: false,
        message:
          "This importer signup is missing required profile details. Please contact ChinaPak ImportHub support.",
      };
    }

    const { data: createdProfile, error: createProfileError } =
      await adminSupabase
        .from("user_profiles")
        .insert({
          auth_user_id: user.id,
          display_name: fullName,
          primary_role: PUBLIC_SIGNUP_ROLE,
          preferred_language: "ur",
          status: "active",
          metadata: {
            email_verified_profile_created: true,
            signup_source: "public_importer_email_verification",
          },
        })
        .select("id")
        .single();

    if (createProfileError || !createdProfile) {
      return {
        ok: false,
        message:
          "Your email was verified, but the importer profile could not be created. Please contact admin support.",
      };
    }

    const roleResult = await ensureActiveRoleAssignment({
      metadata: {
        auth_user_id: user.id,
        email_verified_profile_created: true,
      },
      role: PUBLIC_SIGNUP_ROLE,
      source: "public_importer_verified_login",
      userProfileId: createdProfile.id,
    });

    if (!roleResult.ok) {
      return {
        ok: false,
        message:
          "Importer profile was created, but the importer role could not be assigned. Please contact admin support.",
      };
    }

    const { error: importerError } = await adminSupabase
      .from("importer_profiles")
      .upsert(
        {
          user_profile_id: createdProfile.id,
          full_name: fullName,
          phone_whatsapp: phoneWhatsapp || null,
          city,
          business_type: businessType,
          verification_status: "unverified",
          metadata: {
            email_verified_profile_created: true,
            phone_otp_status: "future_sms_setup",
            signup_source: "public_importer_email_verification",
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
      message: "Importer profile is ready.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Importer profile could not be prepared.";

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
