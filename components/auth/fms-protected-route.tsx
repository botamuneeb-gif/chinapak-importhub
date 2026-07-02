import type { ReactNode } from "react";
import { RoleProtectedPortalShell } from "@/components/navigation/role-protected-portal-shell";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

const FMS_PROTECTED_PREFIXES = [
  ROUTES.fmsAcademy,
  ROUTES.fmsAssignments,
  ROUTES.fmsDashboard,
  ROUTES.fmsEarnings,
  ROUTES.fmsMessages,
  ROUTES.fmsNotifications,
];

const FMS_ALLOWED_ROLES = [USER_ROLES.fms];

export function FmsProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedPortalShell
      allowedRoles={FMS_ALLOWED_ROLES}
      loginHref={ROUTES.fmsLogin}
      protectedPrefixes={FMS_PROTECTED_PREFIXES}
      role={USER_ROLES.fms}
      title="FMS access"
    >
      {children}
    </RoleProtectedPortalShell>
  );
}
