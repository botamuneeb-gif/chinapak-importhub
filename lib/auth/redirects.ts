import { ROUTES } from "@/config/brand";
import { USER_ROLES, type UserRole } from "@/lib/auth/roles";

const ROLE_REDIRECTS: Record<UserRole, string> = {
  importer: ROUTES.importerDashboard,
  fms: ROUTES.fmsDashboard,
  agent: ROUTES.agentDashboard,
  admin: ROUTES.admin,
  super_admin: ROUTES.superAdmin,
  factory_future: ROUTES.factoryLogin,
};

const ROLE_PRIORITY: UserRole[] = [
  USER_ROLES.superAdmin,
  USER_ROLES.admin,
  USER_ROLES.fms,
  USER_ROLES.agent,
  USER_ROLES.importer,
  USER_ROLES.factoryFuture,
];

export function getRoleHomePath(role: UserRole) {
  return ROLE_REDIRECTS[role];
}

export function getDefaultRedirectForRoles(
  roles: readonly UserRole[],
  fallback: string = ROUTES.login,
) {
  const highestRole = ROLE_PRIORITY.find((role) => roles.includes(role));

  return highestRole ? getRoleHomePath(highestRole) : fallback;
}
