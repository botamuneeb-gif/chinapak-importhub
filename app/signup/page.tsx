import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { ImporterSignupForm } from "@/components/auth/importer-signup-form";
import { SecurityNotice } from "@/components/auth/security-notice";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Sign Up | ChinaPak ImportHub",
  description:
    "Create an importer account for ChinaPak ImportHub project tracking and factory sourcing support.",
};

export default function SignupPage() {
  return (
    <AuthShell
      description="Create an importer account with your email and business details. FMS, Agent, Admin, Super Admin, and Factory accounts remain invitation-only or internally managed."
      eyebrow="Importer Signup"
      title="Create Your Importer Account"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Importer details">
          <ImporterSignupForm />
        </AuthCard>

        <div className="space-y-6">
          <SecurityNotice title="Already have an account?" tone="info">
            <p>
              Use secure email login to return to your importer dashboard,
              project tracking, invoices, reports, and notifications.
            </p>
            <Link
              className="mt-3 inline-flex font-bold text-brand-emerald no-underline hover:text-brand-navy"
              href={ROUTES.login}
            >
              Go to login
            </Link>
          </SecurityNotice>

          <SecurityNotice title="Importer-only signup">
            Public signup creates importer-only Supabase Auth, user profile,
            importer profile, and importer role rows. It does not create admin,
            FMS, agent, factory, payment, or project records.
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}
