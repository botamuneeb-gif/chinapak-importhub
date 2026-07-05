import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SecurityNotice } from "@/components/auth/security-notice";

export const metadata: Metadata = {
  title: "Set New Password | ChinaPak ImportHub",
  description: "Set a new password from a secure ChinaPak ImportHub reset link.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      description="Open this page from your password reset email, then set a new secure password for your account."
      eyebrow="Secure password reset"
      title="Set a New Password"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="New password">
          <Suspense
            fallback={
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-brand-muted">
                Preparing secure reset form...
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </AuthCard>

        <SecurityNotice title="After reset">
          After your password is updated, use the correct login page for your
          role. Importer, Admin, FMS, Agent, and Super Admin portals still check
          active role assignment before opening protected dashboards.
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}
