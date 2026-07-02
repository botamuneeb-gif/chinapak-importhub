import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type AuthSessionProfile = {
  authUserId: string;
  email: string | null;
  displayName: string | null;
  profileId: string;
  roles: Database["public"]["Enums"]["user_role"][];
};

export type AuthCheckResult =
  | {
      ok: true;
      profile: AuthSessionProfile;
    }
  | {
      ok: false;
      message: string;
    };

export async function getProfileForAccessToken(
  accessToken: string,
): Promise<AuthCheckResult> {
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
      .select("id, display_name, status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        ok: false,
        message:
          "Your account exists, but its ChinaPak profile is not active yet.",
      };
    }

    if (profile.status !== "active") {
      return {
        ok: false,
        message:
          "This ChinaPak ImportHub profile is not active. Please contact admin support.",
      };
    }

    const { data: assignments, error: rolesError } = await adminSupabase
      .from("role_assignments")
      .select("role")
      .eq("user_profile_id", profile.id)
      .eq("status", "active");

    if (rolesError) {
      return {
        ok: false,
        message: "Your role assignment could not be verified.",
      };
    }

    const roles = (assignments ?? []).map((assignment) => assignment.role);

    if (roles.length === 0) {
      return {
        ok: false,
        message: "No active role is assigned to this account.",
      };
    }

    return {
      ok: true,
      profile: {
        authUserId: user.id,
        email: user.email ?? null,
        displayName: profile.display_name,
        profileId: profile.id,
        roles,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Supabase authentication is not configured yet.";

    return { ok: false, message };
  }
}
