"use server";

import { ensureActiveRoleAssignment } from "@/lib/auth/role-assignments";
import {
  USER_ROLES,
  hasAllowedRole,
  isUserRole,
  type UserRole,
} from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications/create-notification";
import type { NotificationType } from "@/lib/notifications/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type DirectoryRow = Database["public"]["Views"]["admin_user_directory"]["Row"];

type ActionResult<T> =
  | {
      ok: true;
      data: T;
      message?: string;
    }
  | {
      ok: false;
      message: string;
    };

export type SuperAdminUserDirectoryItem = {
  activeRoles: string[];
  agentCode: string;
  agentCityMarket: string;
  agentProfileId: string | null;
  agentStatus: string;
  agentStatusRaw: string | null;
  authUserId: string;
  badges: string[];
  createdAt: string;
  displayName: string;
  email: string;
  fmsAcademyStatus: string;
  fmsCategories: string[];
  fmsCityProvince: string;
  fmsCode: string;
  fmsProfileId: string | null;
  fmsStatus: string;
  fmsStatusRaw: string | null;
  fmsTier: string;
  hasAgentProfile: boolean;
  hasFmsProfile: boolean;
  hasImporterProfile: boolean;
  inactiveRoles: string[];
  importerBusinessName: string;
  importerBusinessType: string;
  importerCity: string;
  importerProfileId: string | null;
  primaryRole: string;
  primaryRoleRaw: string | null;
  profileStatus: string;
  profileStatusRaw: string;
  qualityScore: string;
  roleStatuses: string;
  searchableText: string;
  updatedAt: string;
  userProfileId: string;
};

export type ResetUserPasswordInput = {
  authUserId: string;
  temporaryPassword: string;
  userProfileId: string;
};

export type AssignUserRoleInput = {
  confirmedPrivilegedRole: boolean;
  makePrimaryRole: boolean;
  role: string;
  userProfileId: string;
};

export type ChangePrimaryRoleInput = {
  ensureActiveAssignment: boolean;
  role: string;
  userProfileId: string;
};

export type RevokeUserRoleInput = {
  confirmSelfLockout: boolean;
  role: string;
  userProfileId: string;
};

export type ConvertUserToSingleRoleInput = {
  confirmSelfLockout: boolean;
  keepRole: string;
  userProfileId: string;
};

export type SuspendUserInput = {
  confirmSelfLockout: boolean;
  revokeActiveRoles: boolean;
  userProfileId: string;
};

export type DeleteAuthUserInput = {
  authUserId: string;
  confirmSelfDelete: boolean;
  confirmationText: string;
  userProfileId: string;
};

export type UpsertFmsProfileInput = {
  academyStatus: string;
  categories: string;
  cityProvince: string;
  fmsCode: string;
  qualityScore: string;
  status: string;
  tier: string;
  userProfileId: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

function formatRole(role: string | null | undefined) {
  if (!role) {
    return "No primary role";
  }

  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatValue(value: string | null | undefined, fallback = "Not set") {
  return value?.trim() ? value : fallback;
}

function roleStatusesToText(value: DirectoryRow["role_statuses"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "No role statuses";
  }

  return Object.entries(value)
    .map(([role, status]) => `${formatRole(role)}: ${String(status)}`)
    .join(", ");
}

function parseRoleStatusEntries(value: DirectoryRow["role_status_entries"]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is Record<string, Json> => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return false;
      }

      return (
        typeof entry.role === "string" && typeof entry.status === "string"
      );
    })
    .map((entry) => ({
      role: String(entry.role),
      status: String(entry.status),
    }));
}

function buildAccountBadges(row: DirectoryRow, inactiveRoles: string[]) {
  const activeRoles = row.active_roles ?? [];
  const badges: string[] = [];

  if (row.profile_status === "suspended") {
    badges.push("Suspended");
  }

  if (row.primary_role && !activeRoles.includes(row.primary_role)) {
    badges.push("Role mismatch");
  }

  if (activeRoles.length > 1) {
    badges.push("Multiple roles");
  }

  if (activeRoles.includes(USER_ROLES.fms) && !row.fms_profile_id) {
    badges.push("Missing FMS profile");
  }

  if (
    activeRoles.includes(USER_ROLES.fms) &&
    row.fms_profile_id &&
    row.fms_status !== "active"
  ) {
    badges.push("FMS profile not active");
  }

  if (inactiveRoles.length > 0) {
    badges.push("Inactive role history");
  }

  if (activeRoles.includes(USER_ROLES.superAdmin)) {
    badges.push("Super Admin protected");
  }

  return badges;
}

function mapDirectoryItem(row: DirectoryRow): SuperAdminUserDirectoryItem {
  const activeRoles = row.active_roles ?? [];
  const roleEntries = parseRoleStatusEntries(row.role_status_entries);
  const inactiveRoles = roleEntries
    .filter((entry) => entry.status !== "active")
    .map((entry) => `${entry.role}:${entry.status}`);
  const badges = buildAccountBadges(row, inactiveRoles);
  const valuesForSearch = [
    row.email,
    row.display_name,
    row.primary_role,
    row.profile_status,
    ...(activeRoles ?? []),
    row.importer_business_name,
    row.importer_business_type,
    row.importer_city,
    row.fms_code,
    row.fms_tier,
    row.fms_status,
    row.agent_code,
    row.agent_status,
    ...badges,
    ...inactiveRoles,
  ];

  return {
    activeRoles,
    agentCode: formatValue(row.agent_code),
    agentCityMarket: formatValue(row.agent_city_market),
    agentProfileId: row.agent_profile_id,
    agentStatus: formatValue(row.agent_status),
    agentStatusRaw: row.agent_status,
    authUserId: row.auth_user_id,
    badges,
    createdAt: formatDate(row.created_at),
    displayName: formatValue(row.display_name, "Name not set"),
    email: formatValue(row.email, "Email not available"),
    fmsAcademyStatus: formatValue(row.fms_academy_status),
    fmsCategories: row.fms_categories ?? [],
    fmsCityProvince: formatValue(row.fms_city_province),
    fmsCode: formatValue(row.fms_code),
    fmsProfileId: row.fms_profile_id,
    fmsStatus: formatValue(row.fms_status),
    fmsStatusRaw: row.fms_status,
    fmsTier: formatValue(row.fms_tier),
    hasAgentProfile: Boolean(row.agent_profile_id),
    hasFmsProfile: Boolean(row.fms_profile_id),
    hasImporterProfile: Boolean(row.importer_profile_id),
    inactiveRoles,
    importerBusinessName: formatValue(row.importer_business_name),
    importerBusinessType: formatValue(row.importer_business_type),
    importerCity: formatValue(row.importer_city),
    importerProfileId: row.importer_profile_id,
    primaryRole: formatRole(row.primary_role),
    primaryRoleRaw: row.primary_role,
    profileStatus: formatRole(row.profile_status),
    profileStatusRaw: row.profile_status,
    qualityScore:
      row.fms_quality_score === null || row.fms_quality_score === undefined
        ? "Not set"
        : String(row.fms_quality_score),
    roleStatuses: roleStatusesToText(row.role_statuses),
    searchableText: valuesForSearch
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase(),
    updatedAt: formatDate(row.updated_at),
    userProfileId: row.user_profile_id,
  };
}

function validateTemporaryPassword(password: string) {
  if (password.length < 10) {
    return "Temporary password must be at least 10 characters.";
  }

  if (!/[a-z]/.test(password)) {
    return "Temporary password must include a lowercase letter.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Temporary password must include an uppercase letter.";
  }

  if (!/(?:\d|[^A-Za-z0-9])/.test(password)) {
    return "Temporary password must include a number or symbol.";
  }

  return "";
}

async function requireSuperAdmin(accessToken: string) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, [USER_ROLES.superAdmin])) {
    return {
      ok: false as const,
      message: "Only active Super Admin users can manage platform users.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
  };
}

function toJsonObject(value: Record<string, Json | undefined>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Record<string, Json>;
}

function notificationTypeForSuperAdminAudit(
  action: string,
): NotificationType | null {
  if (action.includes("suspend") || action.includes("deleted")) {
    return "user_suspended";
  }

  if (
    action.includes("role") ||
    action.includes("single_role") ||
    action.includes("fms_profile")
  ) {
    return "role_changed";
  }

  return null;
}

async function getTargetProfile(userProfileId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, auth_user_id, display_name, primary_role, status")
    .eq("id", userProfileId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false as const,
      message: error?.message ?? "Target user profile was not found.",
    };
  }

  return { ok: true as const, profile: data, supabase };
}

async function getActiveRolesForProfile(userProfileId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("role_assignments")
    .select("id, role")
    .eq("user_profile_id", userProfileId)
    .eq("status", "active");

  if (error) {
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const, roles: data ?? [] };
}

async function getActiveSuperAdminCount() {
  const supabase = createAdminSupabaseClient();
  const { count, error } = await supabase
    .from("role_assignments")
    .select("id", { count: "exact", head: true })
    .eq("role", USER_ROLES.superAdmin)
    .eq("status", "active");

  if (error) {
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const, count: count ?? 0 };
}

async function assertSuperAdminRemovalAllowed({
  activeRoles,
  actionLabel,
  confirmSelfLockout,
  superAdminProfileId,
  targetProfileId,
}: {
  activeRoles: readonly { role: UserRole }[];
  actionLabel: string;
  confirmSelfLockout: boolean;
  superAdminProfileId: string;
  targetProfileId: string;
}) {
  const removesSuperAdmin = activeRoles.some(
    (assignment) => assignment.role === USER_ROLES.superAdmin,
  );

  if (!removesSuperAdmin) {
    return { ok: true as const };
  }

  const superAdminCount = await getActiveSuperAdminCount();

  if (!superAdminCount.ok) {
    return superAdminCount;
  }

  if (superAdminCount.count <= 1) {
    return {
      ok: false as const,
      message: `Blocked ${actionLabel}: this would remove the platform's last active Super Admin.`,
    };
  }

  if (targetProfileId === superAdminProfileId && !confirmSelfLockout) {
    return {
      ok: false as const,
      message:
        "This would remove your own Super Admin access. Confirm self-lockout protection before continuing.",
    };
  }

  return { ok: true as const };
}

async function writeSuperAdminAudit({
  action,
  actorAuthUserId,
  afterData,
  beforeData = null,
  description,
  entityId,
  entityType,
  severity = "high",
  targetAuthUserId,
}: {
  action: string;
  actorAuthUserId: string;
  afterData: Record<string, Json | undefined>;
  beforeData?: Record<string, Json | undefined> | null;
  description: string;
  entityId: string;
  entityType: string;
  severity?: string;
  targetAuthUserId: string;
}) {
  const supabase = createAdminSupabaseClient();
  const auditWrites: PromiseLike<{ error: { message: string } | null }>[] = [
    supabase.from("audit_logs").insert({
      action,
      actor_role: USER_ROLES.superAdmin,
      actor_user_id: actorAuthUserId,
      after_data: toJsonObject(afterData),
      before_data: beforeData ? toJsonObject(beforeData) : null,
      entity_id: entityId,
      entity_type: entityType,
      metadata: {
        action_source: "super_admin_users_page",
        no_secret_values_stored: true,
      },
    }),
    supabase.from("security_events").insert({
      description,
      event_type: action,
      metadata: {
        entity_id: entityId,
        entity_type: entityType,
        no_secret_values_stored: true,
      },
      severity,
      user_id: targetAuthUserId,
    }),
  ];

  const auditResults = await Promise.all(auditWrites);
  const auditError = auditResults.find((result) => result.error)?.error;

  if (auditError) {
    return {
      ok: false as const,
      message:
        "Action completed, but audit logging failed. Review Supabase audit tables immediately: " +
        auditError.message,
    };
  }

  const notificationType = notificationTypeForSuperAdminAudit(action);

  if (notificationType) {
    await createNotification(
      {
        actionUrl: "/super-admin/users",
        metadata: toJsonObject({
          action,
          entity_id: entityId,
          entity_type: entityType,
          target_auth_user_id: targetAuthUserId,
        }),
        priority: "high",
        recipientRole: USER_ROLES.superAdmin,
        type: notificationType,
      },
      supabase,
    );
  }

  return { ok: true as const };
}

export async function listSuperAdminUsersAction(
  accessToken: string,
): Promise<ActionResult<SuperAdminUserDirectoryItem[]>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("admin_user_directory")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);

    if (error) {
      return { ok: false, message: error.message };
    }

    return {
      ok: true,
      data: (data ?? []).map(mapDirectoryItem),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Super Admin user directory is not configured yet.",
    };
  }
}

export async function resetUserPasswordBySuperAdminAction(
  accessToken: string,
  input: ResetUserPasswordInput,
): Promise<ActionResult<null>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    const authUserId = input.authUserId.trim();
    const userProfileId = input.userProfileId.trim();
    const temporaryPassword = input.temporaryPassword;
    const passwordIssue = validateTemporaryPassword(temporaryPassword);

    if (!authUserId || !userProfileId) {
      return {
        ok: false,
        message: "Select a valid user before resetting a password.",
      };
    }

    if (passwordIssue) {
      return { ok: false, message: passwordIssue };
    }

    const supabase = createAdminSupabaseClient();
    const { data: targetProfile, error: targetError } = await supabase
      .from("user_profiles")
      .select("id, auth_user_id")
      .eq("id", userProfileId)
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return {
        ok: false,
        message:
          targetError?.message ??
          "Target user profile was not found or does not match the Auth user.",
      };
    }

    const { error: resetError } = await supabase.auth.admin.updateUserById(
      authUserId,
      {
        password: temporaryPassword,
      },
    );

    if (resetError) {
      return { ok: false, message: resetError.message };
    }

    const auditMetadata = {
      action_source: "super_admin_users_page",
      no_password_value_stored: true,
      target_user_profile_id: userProfileId,
    };
    const auditWrites: PromiseLike<{ error: { message: string } | null }>[] = [
      supabase.from("audit_logs").insert({
        action: "password_reset_by_super_admin",
        actor_role: USER_ROLES.superAdmin,
        actor_user_id: superAdmin.authUserId,
        after_data: {
          password_replaced: true,
          password_value_stored: false,
        },
        before_data: null,
        entity_id: authUserId,
        entity_type: "auth_user",
        metadata: auditMetadata,
      }),
      supabase.from("security_events").insert({
        description:
          "A Super Admin replaced a user's password through the controlled user management module.",
        event_type: "password_reset_by_super_admin",
        metadata: {
          ...auditMetadata,
          actor_user_id: superAdmin.authUserId,
        },
        severity: "high",
        user_id: authUserId,
      }),
    ];

    const auditResults = await Promise.all(auditWrites);
    const auditError = auditResults.find((result) => result.error)?.error;

    if (auditError) {
      return {
        ok: false,
        message:
          "Password was reset, but audit logging failed. Review Supabase audit tables immediately: " +
          auditError.message,
      };
    }

    await createNotification(
      {
        actionUrl: "/super-admin/users",
        actorProfileId: superAdmin.profileId,
        metadata: {
          no_password_value_stored: true,
          target_user_profile_id: userProfileId,
        },
        priority: "urgent",
        recipientRole: USER_ROLES.superAdmin,
        type: "password_reset_by_super_admin",
      },
      supabase,
    );

    return {
      ok: true,
      data: null,
      message: "Temporary password was set. Do not store it in the platform.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Super Admin password reset could not be completed.",
    };
  }
}

export async function assignUserRoleBySuperAdminAction(
  accessToken: string,
  input: AssignUserRoleInput,
): Promise<ActionResult<null>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    const userProfileId = input.userProfileId.trim();

    if (!userProfileId) {
      return { ok: false, message: "Select a valid user profile first." };
    }

    if (!isUserRole(input.role)) {
      return { ok: false, message: "Unsupported role assignment." };
    }

    const role: UserRole = input.role;

    if (role !== USER_ROLES.importer && !input.confirmedPrivilegedRole) {
      return {
        ok: false,
        message:
          "Confirm privileged role assignment before adding staff, FMS, agent, Project Manager, super admin, or factory-future access.",
      };
    }

    const supabase = createAdminSupabaseClient();
    const { data: targetProfile, error: targetError } = await supabase
      .from("user_profiles")
      .select("id, auth_user_id, primary_role")
      .eq("id", userProfileId)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return {
        ok: false,
        message: targetError?.message ?? "Target user profile was not found.",
      };
    }

    const roleResult = await ensureActiveRoleAssignment({
      actorId: superAdmin.authUserId,
      allowPrivilegedRole: true,
      metadata: {
        assigned_by_super_admin_profile_id: superAdmin.profileId,
        previous_primary_role: targetProfile.primary_role,
        target_auth_user_id: targetProfile.auth_user_id,
      },
      role,
      source: "super_admin_users_page",
      userProfileId,
    });

    if (!roleResult.ok) {
      return roleResult;
    }

    if (input.makePrimaryRole) {
      const { error: profileUpdateError } = await supabase
        .from("user_profiles")
        .update({
          primary_role: role,
          updated_by: superAdmin.authUserId,
        })
        .eq("id", userProfileId);

      if (profileUpdateError) {
        return {
          ok: false,
          message:
            "Role assignment exists, but primary role update failed: " +
            profileUpdateError.message,
        };
      }
    }

    const auditWrites: PromiseLike<{ error: { message: string } | null }>[] = [
      supabase.from("audit_logs").insert({
        action: "role_assigned_by_super_admin",
        actor_role: USER_ROLES.superAdmin,
        actor_user_id: superAdmin.authUserId,
        after_data: {
          assignment_id: roleResult.assignmentId,
          created: roleResult.created,
          make_primary_role: input.makePrimaryRole,
          role,
          target_auth_user_id: targetProfile.auth_user_id,
          target_user_profile_id: userProfileId,
        },
        before_data: {
          previous_primary_role: targetProfile.primary_role,
        },
        entity_id: userProfileId,
        entity_type: "user_profile",
        metadata: {
          action_source: "super_admin_users_page",
          no_secret_values_stored: true,
        },
      }),
      supabase.from("security_events").insert({
        description:
          "A Super Admin ensured an active role assignment for a user profile.",
        event_type: "role_assigned_by_super_admin",
        metadata: {
          assignment_id: roleResult.assignmentId,
          created: roleResult.created,
          make_primary_role: input.makePrimaryRole,
          role,
          target_user_profile_id: userProfileId,
        },
        severity: role === USER_ROLES.importer ? "medium" : "high",
        user_id: targetProfile.auth_user_id,
      }),
    ];

    const auditResults = await Promise.all(auditWrites);
    const auditError = auditResults.find((result) => result.error)?.error;

    if (auditError) {
      return {
        ok: false,
        message:
          "Role was assigned, but audit logging failed. Review Supabase audit tables immediately: " +
          auditError.message,
      };
    }

    return {
      ok: true,
      data: null,
      message: roleResult.created
        ? `Active ${role} role assignment was created.`
        : `Active ${role} role assignment already existed.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Role assignment could not be completed.",
    };
  }
}

export async function changePrimaryRoleBySuperAdminAction(
  accessToken: string,
  input: ChangePrimaryRoleInput,
): Promise<ActionResult<null>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    if (!isUserRole(input.role)) {
      return { ok: false, message: "Unsupported primary role." };
    }

    const target = await getTargetProfile(input.userProfileId.trim());

    if (!target.ok) {
      return target;
    }

    const role: UserRole = input.role;

    if (input.ensureActiveAssignment) {
      const roleResult = await ensureActiveRoleAssignment({
        actorId: superAdmin.authUserId,
        allowPrivilegedRole: true,
        metadata: {
          assigned_by_super_admin_profile_id: superAdmin.profileId,
          target_auth_user_id: target.profile.auth_user_id,
        },
        role,
        source: "super_admin_primary_role_change",
        userProfileId: target.profile.id,
      });

      if (!roleResult.ok) {
        return roleResult;
      }
    }

    const { error: updateError } = await target.supabase
      .from("user_profiles")
      .update({
        primary_role: role,
        updated_by: superAdmin.authUserId,
      })
      .eq("id", target.profile.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    const audit = await writeSuperAdminAudit({
      action: "primary_role_changed_by_super_admin",
      actorAuthUserId: superAdmin.authUserId,
      afterData: {
        ensured_active_assignment: input.ensureActiveAssignment,
        primary_role: role,
        target_user_profile_id: target.profile.id,
      },
      beforeData: {
        primary_role: target.profile.primary_role,
      },
      description: "A Super Admin changed a user's primary display role.",
      entityId: target.profile.id,
      entityType: "user_profile",
      targetAuthUserId: target.profile.auth_user_id,
    });

    if (!audit.ok) {
      return audit;
    }

    return {
      ok: true,
      data: null,
      message: `Primary role changed to ${role}.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Primary role could not be changed.",
    };
  }
}

export async function revokeUserRoleBySuperAdminAction(
  accessToken: string,
  input: RevokeUserRoleInput,
): Promise<ActionResult<null>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    if (!isUserRole(input.role)) {
      return { ok: false, message: "Unsupported role revocation." };
    }

    const target = await getTargetProfile(input.userProfileId.trim());

    if (!target.ok) {
      return target;
    }

    const role: UserRole = input.role;
    const activeRoles = await getActiveRolesForProfile(target.profile.id);

    if (!activeRoles.ok) {
      return activeRoles;
    }

    const roleToRevoke = activeRoles.roles.filter(
      (assignment) => assignment.role === role,
    );

    if (roleToRevoke.length === 0) {
      return { ok: false, message: "This user does not have that active role." };
    }

    const superAdminSafety = await assertSuperAdminRemovalAllowed({
      activeRoles: roleToRevoke,
      actionLabel: "role revocation",
      confirmSelfLockout: input.confirmSelfLockout,
      superAdminProfileId: superAdmin.profileId,
      targetProfileId: target.profile.id,
    });

    if (!superAdminSafety.ok) {
      return superAdminSafety;
    }

    const { error: revokeError } = await target.supabase
      .from("role_assignments")
      .update({
        revoked_at: new Date().toISOString(),
        status: "revoked",
        updated_by: superAdmin.authUserId,
      })
      .eq("user_profile_id", target.profile.id)
      .eq("role", role)
      .eq("status", "active");

    if (revokeError) {
      return { ok: false, message: revokeError.message };
    }

    const audit = await writeSuperAdminAudit({
      action: "role_revoked_by_super_admin",
      actorAuthUserId: superAdmin.authUserId,
      afterData: {
        role,
        status: "revoked",
        target_user_profile_id: target.profile.id,
      },
      beforeData: {
        active_role_count: activeRoles.roles.length,
        primary_role: target.profile.primary_role,
      },
      description: "A Super Admin revoked an active user role.",
      entityId: target.profile.id,
      entityType: "user_profile",
      targetAuthUserId: target.profile.auth_user_id,
    });

    if (!audit.ok) {
      return audit;
    }

    return { ok: true, data: null, message: `Active ${role} role revoked.` };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Role could not be revoked.",
    };
  }
}

export async function convertUserToSingleRoleBySuperAdminAction(
  accessToken: string,
  input: ConvertUserToSingleRoleInput,
): Promise<ActionResult<null>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    if (!isUserRole(input.keepRole)) {
      return { ok: false, message: "Unsupported single-role conversion." };
    }

    const target = await getTargetProfile(input.userProfileId.trim());

    if (!target.ok) {
      return target;
    }

    const keepRole: UserRole = input.keepRole;
    const roleResult = await ensureActiveRoleAssignment({
      actorId: superAdmin.authUserId,
      allowPrivilegedRole: true,
      metadata: {
        assigned_by_super_admin_profile_id: superAdmin.profileId,
        target_auth_user_id: target.profile.auth_user_id,
      },
      role: keepRole,
      source: "super_admin_single_role_conversion",
      userProfileId: target.profile.id,
    });

    if (!roleResult.ok) {
      return roleResult;
    }

    const activeRoles = await getActiveRolesForProfile(target.profile.id);

    if (!activeRoles.ok) {
      return activeRoles;
    }

    const rolesToRevoke = activeRoles.roles.filter(
      (assignment) => assignment.role !== keepRole,
    );
    const superAdminSafety = await assertSuperAdminRemovalAllowed({
      activeRoles: rolesToRevoke,
      actionLabel: "single-role conversion",
      confirmSelfLockout: input.confirmSelfLockout,
      superAdminProfileId: superAdmin.profileId,
      targetProfileId: target.profile.id,
    });

    if (!superAdminSafety.ok) {
      return superAdminSafety;
    }

    if (rolesToRevoke.length > 0) {
      const { error: revokeError } = await target.supabase
        .from("role_assignments")
        .update({
          revoked_at: new Date().toISOString(),
          status: "revoked",
          updated_by: superAdmin.authUserId,
        })
        .eq("user_profile_id", target.profile.id)
        .neq("role", keepRole)
        .eq("status", "active");

      if (revokeError) {
        return { ok: false, message: revokeError.message };
      }
    }

    const { error: profileError } = await target.supabase
      .from("user_profiles")
      .update({
        primary_role: keepRole,
        updated_by: superAdmin.authUserId,
      })
      .eq("id", target.profile.id);

    if (profileError) {
      return { ok: false, message: profileError.message };
    }

    const audit = await writeSuperAdminAudit({
      action: "converted_to_single_role_by_super_admin",
      actorAuthUserId: superAdmin.authUserId,
      afterData: {
        kept_role: keepRole,
        revoked_roles: rolesToRevoke.map((assignment) => assignment.role),
        target_user_profile_id: target.profile.id,
      },
      beforeData: {
        active_roles_before: activeRoles.roles.map(
          (assignment) => assignment.role,
        ),
        primary_role: target.profile.primary_role,
      },
      description: "A Super Admin converted an account to a single active role.",
      entityId: target.profile.id,
      entityType: "user_profile",
      targetAuthUserId: target.profile.auth_user_id,
    });

    if (!audit.ok) {
      return audit;
    }

    return {
      ok: true,
      data: null,
      message: `Account converted to single active role: ${keepRole}.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Single-role conversion could not be completed.",
    };
  }
}

export async function suspendUserBySuperAdminAction(
  accessToken: string,
  input: SuspendUserInput,
): Promise<ActionResult<null>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    const target = await getTargetProfile(input.userProfileId.trim());

    if (!target.ok) {
      return target;
    }

    const activeRoles = await getActiveRolesForProfile(target.profile.id);

    if (!activeRoles.ok) {
      return activeRoles;
    }

    const superAdminSafety = await assertSuperAdminRemovalAllowed({
      activeRoles: activeRoles.roles,
      actionLabel: "user suspension",
      confirmSelfLockout: input.confirmSelfLockout,
      superAdminProfileId: superAdmin.profileId,
      targetProfileId: target.profile.id,
    });

    if (!superAdminSafety.ok) {
      return superAdminSafety;
    }

    const { error: suspendError } = await target.supabase
      .from("user_profiles")
      .update({
        status: "suspended",
        updated_by: superAdmin.authUserId,
      })
      .eq("id", target.profile.id);

    if (suspendError) {
      return { ok: false, message: suspendError.message };
    }

    if (input.revokeActiveRoles && activeRoles.roles.length > 0) {
      const { error: revokeError } = await target.supabase
        .from("role_assignments")
        .update({
          revoked_at: new Date().toISOString(),
          status: "revoked",
          updated_by: superAdmin.authUserId,
        })
        .eq("user_profile_id", target.profile.id)
        .eq("status", "active");

      if (revokeError) {
        return {
          ok: false,
          message:
            "Profile was suspended, but role revocation failed: " +
            revokeError.message,
        };
      }
    }

    const audit = await writeSuperAdminAudit({
      action: "user_suspended_by_super_admin",
      actorAuthUserId: superAdmin.authUserId,
      afterData: {
        profile_status: "suspended",
        revoked_active_roles: input.revokeActiveRoles,
        target_user_profile_id: target.profile.id,
      },
      beforeData: {
        active_roles_before: activeRoles.roles.map(
          (assignment) => assignment.role,
        ),
        profile_status: target.profile.status,
      },
      description: "A Super Admin suspended a user profile.",
      entityId: target.profile.id,
      entityType: "user_profile",
      targetAuthUserId: target.profile.auth_user_id,
    });

    if (!audit.ok) {
      return audit;
    }

    return {
      ok: true,
      data: null,
      message: input.revokeActiveRoles
        ? "User suspended and active roles revoked."
        : "User suspended. Active roles remain recorded but profile access is blocked.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "User could not be suspended.",
    };
  }
}

export async function deleteAuthUserBySuperAdminAction(
  accessToken: string,
  input: DeleteAuthUserInput,
): Promise<ActionResult<null>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    if (input.confirmationText !== "DELETE USER") {
      return {
        ok: false,
        message: 'Type "DELETE USER" before soft-deleting an Auth user.',
      };
    }

    const target = await getTargetProfile(input.userProfileId.trim());

    if (!target.ok) {
      return target;
    }

    if (target.profile.auth_user_id !== input.authUserId.trim()) {
      return {
        ok: false,
        message: "Selected Auth user and user profile do not match.",
      };
    }

    const activeRoles = await getActiveRolesForProfile(target.profile.id);

    if (!activeRoles.ok) {
      return activeRoles;
    }

    const superAdminSafety = await assertSuperAdminRemovalAllowed({
      activeRoles: activeRoles.roles,
      actionLabel: "Auth user deletion",
      confirmSelfLockout: input.confirmSelfDelete,
      superAdminProfileId: superAdmin.profileId,
      targetProfileId: target.profile.id,
    });

    if (!superAdminSafety.ok) {
      return superAdminSafety;
    }

    if (target.profile.id === superAdmin.profileId && !input.confirmSelfDelete) {
      return {
        ok: false,
        message:
          "Deleting your own Auth user requires extra self-delete confirmation.",
      };
    }

    const { error: deleteError } = await target.supabase.auth.admin.deleteUser(
      target.profile.auth_user_id,
      true,
    );

    if (deleteError) {
      return { ok: false, message: deleteError.message };
    }

    await target.supabase
      .from("user_profiles")
      .update({
        status: "revoked",
        updated_by: superAdmin.authUserId,
      })
      .eq("id", target.profile.id);

    const audit = await writeSuperAdminAudit({
      action: "auth_user_soft_deleted_by_super_admin",
      actorAuthUserId: superAdmin.authUserId,
      afterData: {
        auth_user_soft_deleted: true,
        profile_status: "revoked",
        target_user_profile_id: target.profile.id,
      },
      beforeData: {
        active_roles_before: activeRoles.roles.map(
          (assignment) => assignment.role,
        ),
        profile_status: target.profile.status,
      },
      description:
        "A Super Admin soft-deleted an Auth user through Supabase Admin Auth.",
      entityId: target.profile.auth_user_id,
      entityType: "auth_user",
      targetAuthUserId: target.profile.auth_user_id,
    });

    if (!audit.ok) {
      return audit;
    }

    return {
      ok: true,
      data: null,
      message:
        "Auth user was soft-deleted. Historical app records may remain for audit/history.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Auth user could not be soft-deleted.",
    };
  }
}

export async function upsertFmsProfileBySuperAdminAction(
  accessToken: string,
  input: UpsertFmsProfileInput,
): Promise<ActionResult<null>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    const target = await getTargetProfile(input.userProfileId.trim());

    if (!target.ok) {
      return target;
    }

    const activeRoles = await getActiveRolesForProfile(target.profile.id);

    if (!activeRoles.ok) {
      return activeRoles;
    }

    if (!activeRoles.roles.some((assignment) => assignment.role === "fms")) {
      return {
        ok: false,
        message: "Add an active FMS role before creating an FMS profile.",
      };
    }

    const fmsCode = input.fmsCode.trim();
    const qualityScore = input.qualityScore.trim()
      ? Number(input.qualityScore)
      : null;

    if (!fmsCode) {
      return { ok: false, message: "FMS code is required." };
    }

    if (qualityScore !== null && (qualityScore < 0 || qualityScore > 100)) {
      return { ok: false, message: "Quality score must be between 0 and 100." };
    }

    if (!["bronze", "silver", "gold"].includes(input.tier)) {
      return { ok: false, message: "Unsupported FMS tier." };
    }

    if (
      !["not_started", "in_progress", "certified", "suspended"].includes(
        input.academyStatus,
      )
    ) {
      return { ok: false, message: "Unsupported academy status." };
    }

    if (
      !["pending", "active", "suspended", "revoked", "hidden_future"].includes(
        input.status,
      )
    ) {
      return { ok: false, message: "Unsupported FMS profile status." };
    }

    const categories = input.categories
      .split(",")
      .map((category) => category.trim())
      .filter(Boolean);

    const { error: fmsError } = await target.supabase
      .from("fms_profiles")
      .upsert(
        {
          academy_status: input.academyStatus as Database["public"]["Enums"]["training_status"],
          categories,
          city_province: input.cityProvince.trim() || null,
          created_by: superAdmin.authUserId,
          fms_code: fmsCode,
          metadata: {
            profile_source: "super_admin_users_page",
          },
          quality_score: qualityScore,
          status: input.status as Database["public"]["Enums"]["profile_status"],
          tier: input.tier as Database["public"]["Enums"]["fms_tier"],
          updated_by: superAdmin.authUserId,
          user_profile_id: target.profile.id,
        },
        { onConflict: "user_profile_id" },
      );

    if (fmsError) {
      return { ok: false, message: fmsError.message };
    }

    const audit = await writeSuperAdminAudit({
      action: "fms_profile_upserted_by_super_admin",
      actorAuthUserId: superAdmin.authUserId,
      afterData: {
        fms_code: fmsCode,
        status: input.status,
        target_user_profile_id: target.profile.id,
        tier: input.tier,
      },
      description:
        "A Super Admin created or activated a basic FMS profile for a user.",
      entityId: target.profile.id,
      entityType: "user_profile",
      targetAuthUserId: target.profile.auth_user_id,
    });

    if (!audit.ok) {
      return audit;
    }

    return {
      ok: true,
      data: null,
      message: "FMS profile created or updated.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "FMS profile could not be saved.",
    };
  }
}
