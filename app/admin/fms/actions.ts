"use server";

import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

type JsonObject = { [key: string]: Json | undefined };

export type AdminFmsDirectoryItem = {
  assignmentCount: number;
  cityProvince: string;
  displayName: string;
  fmsCode: string;
  fmsProfileId: string;
  isAssignable: boolean;
  languages: string;
  qualityScore: string;
  specialties: string;
  status: string;
  tier: string;
};

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function stringListFromMetadata(value: Json | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function formatTier(tier: Database["public"]["Enums"]["fms_tier"]) {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function formatStatus(status: Database["public"]["Enums"]["profile_status"]) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

async function requireAdmin(accessToken: string) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (
    !hasAllowedRole(authCheck.profile.roles, [
      USER_ROLES.admin,
      USER_ROLES.superAdmin,
    ])
  ) {
    return {
      ok: false as const,
      message: "Only admin or super admin users can view FMS profiles.",
    };
  }

  return { ok: true as const };
}

function mapFmsDirectoryItem(
  fms: TableRow<"fms_profiles">,
  userProfile: TableRow<"user_profiles"> | undefined,
  activeFmsRoleUserProfileIds: Set<string>,
  assignmentCount: number,
): AdminFmsDirectoryItem {
  const metadata = toJsonObject(fms.metadata);
  const languages = stringListFromMetadata(metadata.languages);
  const isAssignable =
    fms.status === "active" && activeFmsRoleUserProfileIds.has(fms.user_profile_id);

  return {
    assignmentCount,
    cityProvince: fms.city_province ?? "Not provided",
    displayName: userProfile?.display_name ?? "FMS profile name pending",
    fmsCode: fms.fms_code,
    fmsProfileId: fms.id,
    isAssignable,
    languages: languages.length > 0 ? languages.join(", ") : "Not provided",
    qualityScore:
      typeof fms.quality_score === "number"
        ? `${fms.quality_score.toFixed(0)}%`
        : "Not scored",
    specialties: fms.categories.length > 0 ? fms.categories.join(", ") : "Not set",
    status: isAssignable
      ? "Active / Assignable"
      : `${formatStatus(fms.status)} / Role not assignable`,
    tier: formatTier(fms.tier),
  };
}

export async function listAdminFmsDirectoryAction(
  accessToken: string,
): Promise<ActionResult<AdminFmsDirectoryItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: fmsRows, error: fmsError } = await supabase
      .from("fms_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (fmsError) {
      return { ok: false, message: fmsError.message };
    }

    const fmsProfiles = fmsRows ?? [];
    const userProfileIds = Array.from(
      new Set(fmsProfiles.map((fms) => fms.user_profile_id)),
    );
    const fmsProfileIds = fmsProfiles.map((fms) => fms.id);

    const { data: userProfiles } =
      userProfileIds.length > 0
        ? await supabase
            .from("user_profiles")
            .select("*")
            .in("id", userProfileIds)
        : { data: [] };

    const { data: roleRows, error: roleError } =
      userProfileIds.length > 0
        ? await supabase
            .from("role_assignments")
            .select("user_profile_id")
            .in("user_profile_id", userProfileIds)
            .eq("role", USER_ROLES.fms)
            .eq("status", "active")
        : { data: [], error: null };

    if (roleError) {
      return { ok: false, message: roleError.message };
    }

    const { data: assignmentRows } =
      fmsProfileIds.length > 0
        ? await supabase
            .from("fms_assignments")
            .select("id, fms_profile_id")
            .in("fms_profile_id", fmsProfileIds)
        : { data: [] };

    const userProfileMap = byId(userProfiles ?? []);
    const activeFmsRoleUserProfileIds = new Set(
      (roleRows ?? []).map((row) => row.user_profile_id),
    );
    const assignmentCounts = new Map<string, number>();

    (assignmentRows ?? []).forEach((assignment) => {
      assignmentCounts.set(
        assignment.fms_profile_id,
        (assignmentCounts.get(assignment.fms_profile_id) ?? 0) + 1,
      );
    });

    return {
      ok: true,
      data: fmsProfiles.map((fms) =>
        mapFmsDirectoryItem(
          fms,
          userProfileMap.get(fms.user_profile_id),
          activeFmsRoleUserProfileIds,
          assignmentCounts.get(fms.id) ?? 0,
        ),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Supabase FMS directory is not configured yet.",
    };
  }
}
