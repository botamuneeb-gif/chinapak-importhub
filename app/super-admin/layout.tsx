import type { ReactNode } from "react";
import { RoleProtectedPortalShell } from "@/components/navigation/role-protected-portal-shell";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

const SUPER_ADMIN_PROTECTED_PREFIXES = [ROUTES.superAdmin];
const SUPER_ADMIN_PUBLIC_PREFIXES = [ROUTES.superAdminLogin];
const SUPER_ADMIN_ALLOWED_ROLES = [USER_ROLES.superAdmin];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedPortalShell
      allowedRoles={SUPER_ADMIN_ALLOWED_ROLES}
      loginHref={ROUTES.superAdminLogin}
      protectedPrefixes={SUPER_ADMIN_PROTECTED_PREFIXES}
      publicPrefixes={SUPER_ADMIN_PUBLIC_PREFIXES}
      role={USER_ROLES.superAdmin}
      title="Super Admin access"
    >
      {children}
    </RoleProtectedPortalShell>
  );
}
