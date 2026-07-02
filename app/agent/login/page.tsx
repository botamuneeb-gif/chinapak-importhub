import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RoleLoginForm } from "@/components/auth/role-login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Agent Login | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AgentLoginPage() {
  return (
    <AuthShell
      description="Pakistani Local Agent access is approved by ChinaPak ImportHub. Login requires an active agent role assignment."
      eyebrow="Local Representative Portal"
      title="Agent Login"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Approved agent access">
          <RoleLoginForm
            allowedRoles={[USER_ROLES.agent]}
            notice="Agent accounts are not created through public signup. Use this login only after approval or invitation."
            submitLabel="Login to agent dashboard"
          />
        </AuthCard>

        <SecurityNotice title="Agent compliance reminder" tone="warning">
          <p>
            Agents help importers understand official packages and payment
            support. Agents must not collect unofficial payments or promise
            outcomes beyond official ChinaPak ImportHub package terms.
          </p>
          <Link
            className="mt-3 inline-flex font-bold text-brand-emerald no-underline hover:text-brand-navy"
            href={ROUTES.authInvite}
          >
            Request invitation support
          </Link>
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}
