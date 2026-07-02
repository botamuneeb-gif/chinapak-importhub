import "server-only";

import {
  PUBLIC_SIGNUP_ROLE,
  USER_ROLES,
  isUserRole,
  type UserRole,
} from "@/lib/auth/roles";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

type EnsureActiveRoleAssignmentInput = {
  actorId?: string | null;
  allowPrivilegedRole?: boolean;
  metadata?: Record<string, Json | undefined>;
  role: UserRole;
  source: string;
  userProfileId: string;
};

type EnsureActiveRoleAssignmentResult =
  | {
      ok: true;
      assignmentId: string;
      created: boolean;
    }
  | {
      ok: false;
      message: string;
    };

function isPubliclyAssignableRole(role: UserRole) {
  return role === PUBLIC_SIGNUP_ROLE;
}

function isUniqueConflict(error: { code?: string } | null) {
  return error?.code === "23505";
}

export async function ensureActiveRoleAssignment({
  actorId = null,
  allowPrivilegedRole = false,
  metadata = {},
  role,
  source,
  userProfileId,
}: EnsureActiveRoleAssignmentInput): Promise<EnsureActiveRoleAssignmentResult> {
  if (!userProfileId.trim()) {
    return { ok: false, message: "A valid user profile is required." };
  }

  if (!isUserRole(role)) {
    return { ok: false, message: "Unsupported role assignment." };
  }

  if (!allowPrivilegedRole && !isPubliclyAssignableRole(role)) {
    return {
      ok: false,
      message:
        "Privileged roles can only be assigned by a protected Super Admin workflow.",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data: existingRole, error: existingRoleError } = await supabase
    .from("role_assignments")
    .select("id")
    .eq("user_profile_id", userProfileId)
    .eq("role", role)
    .eq("status", "active")
    .maybeSingle();

  if (existingRoleError) {
    return {
      ok: false,
      message: existingRoleError.message,
    };
  }

  if (existingRole) {
    return {
      ok: true,
      assignmentId: existingRole.id,
      created: false,
    };
  }

  const { data: insertedRole, error: insertError } = await supabase
    .from("role_assignments")
    .insert({
      assigned_by: actorId,
      created_by: actorId,
      metadata: {
        ...metadata,
        assignment_source: source,
      },
      role,
      status: "active",
      updated_by: actorId,
      user_profile_id: userProfileId,
    })
    .select("id")
    .single();

  if (insertError) {
    if (isUniqueConflict(insertError)) {
      const { data: recoveredRole, error: recoveredRoleError } = await supabase
        .from("role_assignments")
        .select("id")
        .eq("user_profile_id", userProfileId)
        .eq("role", role)
        .eq("status", "active")
        .maybeSingle();

      if (!recoveredRoleError && recoveredRole) {
        return {
          ok: true,
          assignmentId: recoveredRole.id,
          created: false,
        };
      }
    }

    return {
      ok: false,
      message: insertError.message,
    };
  }

  return {
    ok: true,
    assignmentId: insertedRole.id,
    created: true,
  };
}

export function isPrivilegedRole(role: UserRole) {
  return role !== USER_ROLES.importer;
}
