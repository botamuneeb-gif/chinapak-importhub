import type { ReactNode } from "react";
import { RoleProtectedPortalShell } from "@/components/navigation/role-protected-portal-shell";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

const PROJECT_MANAGER_PROTECTED_PREFIXES = [ROUTES.projectManager];
const PROJECT_MANAGER_PUBLIC_PREFIXES = [ROUTES.projectManagerLogin];
const PROJECT_MANAGER_ALLOWED_ROLES = [USER_ROLES.projectManager];

export default function ProjectManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleProtectedPortalShell
      allowedRoles={PROJECT_MANAGER_ALLOWED_ROLES}
      loginHref={ROUTES.projectManagerLogin}
      protectedPrefixes={PROJECT_MANAGER_PROTECTED_PREFIXES}
      publicPrefixes={PROJECT_MANAGER_PUBLIC_PREFIXES}
      role={USER_ROLES.projectManager}
      title="Project Manager access"
    >
      {children}
    </RoleProtectedPortalShell>
  );
}
