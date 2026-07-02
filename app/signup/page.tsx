import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ImporterSignupForm } from "@/components/auth/importer-signup-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Sign Up | ChinaPak ImportHub",
  description:
    "Urdu-first importer signup with current email/password profile setup and future phone OTP support.",
};

export default function SignupPage() {
  return (
    <AuthShell
      description="Public users کو login vs signup سمجھنے کی ضرورت نہیں ہوگی۔ Phone/WhatsApp OTP future میں account create یا access کرے گا۔ اس phase میں email/password fallback testing کے لیے importer profile بناتا ہے۔"
      dir="rtl"
      eyebrow="Importer Signup"
      lang="ur"
      title="China سے import شروع کرنے کے لیے account بنائیں"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Importer details">
          <ImporterSignupForm />
        </AuthCard>

        <div className="space-y-6">
          <SecurityNotice title="Already entered your number?" tone="info">
            <p className="urdu-text" dir="rtl" lang="ur">
              Existing account ہو یا new account، future OTP flow phone number
              سے right account کھول دے گا۔
            </p>
            <Link
              className="mt-3 inline-flex font-bold text-brand-emerald no-underline hover:text-brand-navy"
              href={ROUTES.login}
            >
              <span className="urdu-text" dir="rtl" lang="ur">
                Login page پر جائیں
              </span>
            </Link>
          </SecurityNotice>

          <SecurityNotice title="Supabase profile setup">
            Public signup creates importer-only Supabase Auth, user profile,
            importer profile, and importer role rows. It does not create admin,
            FMS, agent, factory, payment, or project records.
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}

