import type { ReactNode } from "react";
import { RoleProtectedPortalShell } from "@/components/navigation/role-protected-portal-shell";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

const IMPORTER_DASHBOARD_PREFIXES = [ROUTES.importerDashboard];
const IMPORTER_ALLOWED_ROLES = [USER_ROLES.importer];

export default function ImporterDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleProtectedPortalShell
      allowedRoles={IMPORTER_ALLOWED_ROLES}
      loginHref={ROUTES.login}
      protectedPrefixes={IMPORTER_DASHBOARD_PREFIXES}
      role={USER_ROLES.importer}
      title="Importer access"
    >
      {children}
    </RoleProtectedPortalShell>
  );
}
