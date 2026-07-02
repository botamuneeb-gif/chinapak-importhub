import type { ReactNode } from "react";
import { RoleProtectedPortalShell } from "@/components/navigation/role-protected-portal-shell";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

const IMPORTER_REPORT_PREFIXES = [ROUTES.importerReports];
const IMPORTER_ALLOWED_ROLES = [USER_ROLES.importer];

export default function ImporterReportsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleProtectedPortalShell
      allowedRoles={IMPORTER_ALLOWED_ROLES}
      loginHref={ROUTES.login}
      protectedPrefixes={IMPORTER_REPORT_PREFIXES}
      role={USER_ROLES.importer}
      title="Importer report access"
    >
      {children}
    </RoleProtectedPortalShell>
  );
}
