import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { SecurityNotice } from "@/components/auth/security-notice";

export const metadata: Metadata = {
  title: "Forgot Password | ChinaPak ImportHub",
  description: "Request a secure email password reset for ChinaPak ImportHub.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      description="Request a secure password reset email for your ChinaPak ImportHub account. For privacy, this page does not confirm whether an email exists."
      eyebrow="Account recovery"
      title="Reset Your Password"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Password reset email">
          <ForgotPasswordForm />
        </AuthCard>

        <SecurityNotice title="Security note">
          Reset links are handled by Supabase Auth and should only be opened by
          the account owner. ChinaPak ImportHub support will never ask for your
          password or reset token.
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}
