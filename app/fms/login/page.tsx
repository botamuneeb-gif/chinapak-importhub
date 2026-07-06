import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RoleLoginForm } from "@/components/auth/role-login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "FMS Login | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FmsLoginPage() {
  return (
    <AuthShell
      description="Factory Match Specialist access is invitation-only. Login requires a Supabase account with an active FMS role assigned by ChinaPak ImportHub."
      eyebrow="Factory Match Specialist"
      title="FMS Login"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Invitation-only FMS access">
          <RoleLoginForm
            allowedRoles={[USER_ROLES.fms]}
            notice="FMS accounts cannot be created publicly. Use this login only after admin approval or invitation."
            submitLabel="Login to FMS dashboard"
          />
        </AuthCard>

        <SecurityNotice title="FMS policy reminder" tone="warning">
          <p>
            FMS users never message importers directly and never see importer
            contact details. All sourcing evidence is submitted for admin
            review first.
          </p>
          <Link
            className="mt-3 inline-flex font-bold text-brand-emerald no-underline hover:text-brand-navy"
            href={ROUTES.authInvite}
          >
            Already have an invitation?
          </Link>
          <p className="mt-4 text-sm">
            FMS 账户必须通过 ChinaPak ImportHub 审核或邀请后才能使用。
          </p>
          <p className="mt-2 text-sm">
            Enter your invitation code or secure invite details to continue
            with your FMS account setup.
          </p>
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}
