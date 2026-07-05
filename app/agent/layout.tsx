import type { ReactNode } from "react";
import { RoleProtectedPortalShell } from "@/components/navigation/role-protected-portal-shell";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

const AGENT_PROTECTED_PREFIXES = [
  ROUTES.agentCommissions,
  ROUTES.agentDashboard,
  ROUTES.agentLeads,
  ROUTES.agentNotifications,
  ROUTES.agentTraining,
];
const AGENT_PUBLIC_PREFIXES = [ROUTES.agentLogin];
const AGENT_ALLOWED_ROLES = [USER_ROLES.agent];

export default function AgentLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedPortalShell
      allowedRoles={AGENT_ALLOWED_ROLES}
      loginHref={ROUTES.agentLogin}
      protectedPrefixes={AGENT_PROTECTED_PREFIXES}
      publicPrefixes={AGENT_PUBLIC_PREFIXES}
      role={USER_ROLES.agent}
      title="Agent access"
    >
      {children}
    </RoleProtectedPortalShell>
  );
}
