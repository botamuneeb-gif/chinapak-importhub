import type { ReactNode } from "react";
import { RoleProtectedPortalShell } from "@/components/navigation/role-protected-portal-shell";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

const ADMIN_PROTECTED_PREFIXES = [ROUTES.admin];
const ADMIN_PUBLIC_PREFIXES = [ROUTES.adminLogin];
const ADMIN_ALLOWED_ROLES = [USER_ROLES.admin, USER_ROLES.superAdmin];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedPortalShell
      allowedRoles={ADMIN_ALLOWED_ROLES}
      loginHref={ROUTES.adminLogin}
      protectedPrefixes={ADMIN_PROTECTED_PREFIXES}
      publicPrefixes={ADMIN_PUBLIC_PREFIXES}
      role={USER_ROLES.admin}
      title="Admin access"
    >
      {children}
    </RoleProtectedPortalShell>
  );
}
