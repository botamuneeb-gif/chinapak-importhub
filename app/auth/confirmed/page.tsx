import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { EmailConfirmationStatus } from "@/components/auth/email-confirmation-status";
import { SecurityNotice } from "@/components/auth/security-notice";

export const metadata: Metadata = {
  title: "Email Verified | ChinaPak ImportHub",
  description:
    "Email verification status for ChinaPak ImportHub importer accounts.",
  robots: { index: false, follow: false },
};

export default function AuthConfirmedPage() {
  return (
    <AuthShell
      description="Your email verification result is shown below. Tokens and private account details are never displayed on this page."
      eyebrow="Email verification"
      title="Email Verification"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Verification status">
          <Suspense
            fallback={
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-brand-muted">
                Checking verification status...
              </div>
            }
          >
            <EmailConfirmationStatus />
          </Suspense>
        </AuthCard>

        <SecurityNotice title="What happens next">
          After email verification, log in with your email and password. The
          importer portal still checks your active role before opening protected
          project pages.
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}
