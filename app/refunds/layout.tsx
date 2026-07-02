import type { ReactNode } from "react";
import { RoleProtectedPortalShell } from "@/components/navigation/role-protected-portal-shell";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

const IMPORTER_REFUND_PREFIXES = [ROUTES.refunds];
const IMPORTER_ALLOWED_ROLES = [USER_ROLES.importer];

export default function RefundsLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedPortalShell
      allowedRoles={IMPORTER_ALLOWED_ROLES}
      loginHref={ROUTES.login}
      protectedPrefixes={IMPORTER_REFUND_PREFIXES}
      role={USER_ROLES.importer}
      title="Importer refund access"
    >
      {children}
    </RoleProtectedPortalShell>
  );
}

