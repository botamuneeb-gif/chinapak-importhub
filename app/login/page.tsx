import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { ImporterLoginForm } from "@/components/auth/importer-login-form";
import { SecurityNotice } from "@/components/auth/security-notice";
import { publicAuthTrustNotes } from "@/config/auth-roles";
import { ROUTES } from "@/config/brand";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    reset?: string | string[];
    verified?: string | string[];
  }>;
};

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getLoginStatusMessage(params: {
  error?: string | string[];
  reset?: string | string[];
  verified?: string | string[];
}) {
  const error = getSingleParam(params.error);
  const reset = getSingleParam(params.reset);
  const verified = getSingleParam(params.verified);

  if (error === "verification_failed") {
    return {
      tone: "error" as const,
      message:
        "We could not confirm your email link. Please request a new verification email or contact support.",
      title: "Verification link issue",
    };
  }

  if (reset === "1") {
    return {
      tone: "success" as const,
      message:
        "Password updated successfully. Please log in with your new password.",
      title: "Password updated",
    };
  }

  if (verified === "1") {
    return {
      tone: "success" as const,
      message: "Email verified successfully. Please log in to continue.",
      title: "Email verified",
    };
  }

  return null;
}

function LoginStatusBanner({
  status,
}: {
  status: ReturnType<typeof getLoginStatusMessage>;
}) {
  if (!status) {
    return null;
  }

  const classes =
    status.tone === "success"
      ? "border-brand-emerald bg-emerald-50 text-brand-navy"
      : "border-brand-error bg-red-50 text-brand-navy";
  const titleClass =
    status.tone === "success" ? "text-brand-emerald" : "text-brand-error";

  return (
    <div className={`mb-5 rounded-lg border p-4 text-sm leading-7 ${classes}`}>
      <p className={`font-bold ${titleClass}`}>{status.title}</p>
      <p className="mt-1">{status.message}</p>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Login | ChinaPak ImportHub",
  description:
    "Secure importer email login for ChinaPak ImportHub project tracking and reports.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const status = getLoginStatusMessage(params);

  return (
    <AuthShell
      description="Login with your registered email and password to track import projects, invoices, reports, refunds, and notifications."
      eyebrow="Importer Account"
      title="Secure Importer Login"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Login with Email">
          <LoginStatusBanner status={status} />
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
