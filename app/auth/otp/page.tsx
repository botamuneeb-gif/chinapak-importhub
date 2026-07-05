import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "OTP Verification | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function OtpPage() {
  return (
    <AuthShell
      description="Phone/WhatsApp OTP is not active for launch. Use email/password login while SMS provider setup is completed."
      eyebrow="OTP verification"
      title="Phone OTP Is Not Active Yet"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Phone OTP status">
          <div aria-label="OTP verification status" className="grid gap-5">
            <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              Phone and WhatsApp OTP login is disabled until SMS/WhatsApp
              provider setup is complete. No OTP code is being sent from this
              page.
            </div>

            <Link
              className="font-semibold text-brand-emerald no-underline hover:text-brand-navy"
              href={ROUTES.login}
            >
              Use email login
            </Link>
          </div>
        </AuthCard>

        <SecurityNotice title="Security note">
          Phone OTP requires SMS/WhatsApp provider activation and will be
          connected later. OTP codes should expire quickly, be rate-limited, and
          never be logged in plaintext when the real phone auth backend is
          connected.
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}
