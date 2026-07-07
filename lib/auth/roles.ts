import type { Database } from "@/lib/supabase/types";

export const USER_ROLES = {
  importer: "importer",
  fms: "fms",
  agent: "agent",
  admin: "admin",
  projectManager: "project_manager",
  superAdmin: "super_admin",
  factoryFuture: "factory_future",
} as const;

export type UserRole = Database["public"]["Enums"]["user_role"];

export const PUBLIC_SIGNUP_ROLE: UserRole = USER_ROLES.importer;

export const STAFF_ROLES = [
  USER_ROLES.admin,
  USER_ROLES.superAdmin,
] as const satisfies readonly UserRole[];

export const PORTAL_ROLES = [
  USER_ROLES.importer,
  USER_ROLES.fms,
  USER_ROLES.agent,
  USER_ROLES.admin,
  USER_ROLES.projectManager,
  USER_ROLES.superAdmin,
  USER_ROLES.factoryFuture,
] as const satisfies readonly UserRole[];

export function isUserRole(value: string): value is UserRole {
  return PORTAL_ROLES.some((role) => role === value);
}

export function hasAllowedRole(
  roles: readonly UserRole[],
  allowedRoles: readonly UserRole[],
) {
  return roles.some((role) => allowedRoles.includes(role));
}
