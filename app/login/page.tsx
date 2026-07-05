import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { ImporterLoginForm } from "@/components/auth/importer-login-form";
import { SecurityNotice } from "@/components/auth/security-notice";
import { publicAuthTrustNotes } from "@/config/auth-roles";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Login | ChinaPak ImportHub",
  description:
    "Secure importer email login for ChinaPak ImportHub project tracking and reports.",
};

export default function LoginPage() {
  return (
    <AuthShell
      description="Login with your registered email and password to track import projects, invoices, reports, refunds, and notifications."
      eyebrow="Importer Account"
      title="Secure Importer Login"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Login with Email">
          <ImporterLoginForm />
        </AuthCard>

        <div className="space-y-6" dir="ltr" lang="en">
          <SecurityNotice title="Trust notes" tone="info">
            <ul className="grid gap-2">
              {publicAuthTrustNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </SecurityNotice>

          <SecurityNotice title="Help and security">
            <p>
              Email/password login checks your Supabase session and active
              importer role assignment before opening the importer portal.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                className="inline-flex font-bold text-brand-emerald no-underline hover:text-brand-navy"
                href={ROUTES.forgotPassword}
              >
                Forgot password?
              </Link>
              <Link
                className="inline-flex font-bold text-brand-emerald no-underline hover:text-brand-navy"
                href={ROUTES.authSecurity}
              >
                View security notes
              </Link>
            </div>
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}
