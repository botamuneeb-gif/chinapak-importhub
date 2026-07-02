import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ImporterLoginForm } from "@/components/auth/importer-login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { publicAuthTrustNotes } from "@/config/auth-roles";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Login | ChinaPak ImportHub",
  description:
    "Urdu-first importer login with future phone OTP and current email/password testing fallback.",
};

export default function LoginPage() {
  return (
    <AuthShell
      description="اپنا WhatsApp نمبر درج کریں۔ اگر آپ کا account موجود ہے تو login ہو جائے گا، ورنہ نیا account بن جائے گا۔ Email fallback ابھی testing کے لیے connected ہے۔"
      dir="rtl"
      eyebrow="Importer Account"
      lang="ur"
      title="اپنا Import Account کھولیں"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Importer access">
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
              Public importer login is designed to become phone/WhatsApp
              OTP-first. For this phase, email/password login checks the
              Supabase role assignment before opening a portal.
            </p>
            <Link
              className="mt-3 inline-flex font-bold text-brand-emerald no-underline hover:text-brand-navy"
              href={ROUTES.authSecurity}
            >
              View security notes
            </Link>
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}

