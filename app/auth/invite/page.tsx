import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { InviteActivationForm } from "@/components/auth/invite-activation-form";
import { SecurityNotice } from "@/components/auth/security-notice";

export const metadata: Metadata = {
  title: "Activate FMS Account | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function InvitePage() {
  return (
    <AuthShell
      description="Your FMS account has already been created by ChinaPak ImportHub after approval. Set your password to activate your account."
      eyebrow="Secure invitation"
      title="Activate your FMS account"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Set your password">
          <Suspense
            fallback={
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-brand-muted">
                Checking your secure invitation link...
              </div>
            }
          >
            <InviteActivationForm />
          </Suspense>
        </AuthCard>

        <div className="space-y-6">
          <SecurityNotice title="Approval required">
            FMS accounts are approved by ChinaPak ImportHub before activation.
            Public FMS signup is disabled. This page works only from a secure
            invitation link.
          </SecurityNotice>

          <SecurityNotice title="FMS support note" tone="info">
            <p lang="zh-CN">
              FMS 账户必须通过 ChinaPak ImportHub 审核或邀请后才能使用。
            </p>
            <p className="mt-2">
              Click the secure invitation link from your email, set your
              password here, then use the FMS login page for portal access.
            </p>
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}
