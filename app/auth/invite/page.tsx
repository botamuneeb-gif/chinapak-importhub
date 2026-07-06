import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { inviteRoles } from "@/config/auth-roles";

export const metadata: Metadata = {
  title: "Invitation Access | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function InvitePage() {
  return (
    <AuthShell
      description="FMS, Agent, and future Factory accounts require ChinaPak ImportHub approval or invitation before activation."
      eyebrow="Invitation-only access"
      title="Approved Role Entry"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Invitation details">
          <form aria-label="Invitation-only access request" className="grid gap-4">
            <AuthInput
              id="invite-code"
              label="Invitation code"
              placeholder="INV-XXXX-XXXX"
              required
            />
            <AuthInput
              autoComplete="email"
              id="invite-contact"
              label="Email or phone"
              placeholder="name@example.com or phone number"
              required
            />
            <div>
              <label
                className="block text-sm font-semibold text-brand-navy"
                htmlFor="invite-role"
              >
                Role
              </label>
              <select
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text focus:border-brand-emerald focus:outline-none focus:ring-2 focus:ring-brand-emerald/20"
                id="invite-role"
              >
                {inviteRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              Invitation verification is handled by ChinaPak ImportHub admin
              before launch account access is activated.
            </div>
          </form>
        </AuthCard>

        <div className="space-y-6">
          <SecurityNotice title="Approval required">
            FMS and Agent accounts are approved by ChinaPak ImportHub before
            activation. Factory accounts are reserved for future activation or
            admin invitation.
          </SecurityNotice>

          <SecurityNotice title="FMS support note" tone="info">
            <p lang="zh-CN">
              FMS 账户必须通过 ChinaPak ImportHub 审核或邀请后才能使用。
            </p>
            <p className="mt-2">
              Enter your invitation code or secure invite details to continue
              with your FMS account setup. After activation, use the FMS login
              page for portal access.
            </p>
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}
