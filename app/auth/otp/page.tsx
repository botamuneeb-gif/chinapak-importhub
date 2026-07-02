import type { Metadata } from "next";
import Link from "next/link";
import { AuthActionButton } from "@/components/auth/auth-action-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpInputPlaceholder } from "@/components/auth/otp-input-placeholder";
import { SecurityNotice } from "@/components/auth/security-notice";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "OTP Verification | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function OtpPage() {
  return (
    <AuthShell
      description="Future OTP verification for phone and WhatsApp account access. This screen is prepared for Supabase or another secure OTP provider later."
      eyebrow="OTP verification"
      title="Verify Your Code"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Enter OTP">
          <form aria-label="OTP verification placeholder" className="grid gap-5">
            <OtpInputPlaceholder />

            <div className="flex flex-col gap-3 sm:flex-row">
              <AuthActionButton variant="secondary">
                Verify button
              </AuthActionButton>
              <AuthActionButton variant="outline">
                Resend code placeholder
              </AuthActionButton>
            </div>

            <Link
              className="font-semibold text-brand-emerald no-underline hover:text-brand-navy"
              href={ROUTES.login}
            >
              Change number
            </Link>
          </form>
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
