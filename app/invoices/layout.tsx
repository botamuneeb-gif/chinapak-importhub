import type { ReactNode } from "react";
import { RoleProtectedPortalShell } from "@/components/navigation/role-protected-portal-shell";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

const IMPORTER_INVOICE_PREFIXES = [ROUTES.invoices];
const IMPORTER_ALLOWED_ROLES = [USER_ROLES.importer];

export default function InvoicesLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedPortalShell
      allowedRoles={IMPORTER_ALLOWED_ROLES}
      loginHref={ROUTES.login}
      protectedPrefixes={IMPORTER_INVOICE_PREFIXES}
      role={USER_ROLES.importer}
      title="Importer invoice access"
    >
      {children}
    </RoleProtectedPortalShell>
  );
}

