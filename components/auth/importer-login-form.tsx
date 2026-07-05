"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  prepareVerifiedImporterProfileAction,
  resolveAuthRedirectAction,
} from "@/app/auth/actions";
import { AuthActionButton } from "@/components/auth/auth-action-button";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { AuthInput } from "@/components/auth/auth-input";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ImporterLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const cleanEmail = email.trim().toLowerCase();

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (signInError || !data.session?.access_token) {
          const message = signInError?.message ?? "Login failed. Please try again.";
          setError(
            /confirm|verified/i.test(message)
              ? "Please verify your email inbox before logging in."
              : message,
          );
          return;
        }

        const profileResult = await prepareVerifiedImporterProfileAction(
          data.session.access_token,
        );

        if (!profileResult.ok) {
          await supabase.auth.signOut();
          setError(profileResult.message);
          return;
        }

        const result = await resolveAuthRedirectAction(
          data.session.access_token,
          [USER_ROLES.importer],
        );

        if (!result.ok) {
          await supabase.auth.signOut();
          setError(result.message);
          return;
        }

        router.push(result.redirectTo);
      } catch (loginError) {
        setError(
          loginError instanceof Error
            ? loginError.message
            : "Supabase login is not configured yet.",
        );
      }
    });
  }

  function handleResendVerification() {
    setResendError("");
    setResendMessage("");

    if (!cleanEmail) {
      setResendError("Enter your email above first.");
      return;
    }

    startResendTransition(async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { error: resendVerificationError } =
          await supabase.auth.resend({
            email: cleanEmail,
            options: {
              emailRedirectTo: `${window.location.origin}${ROUTES.login}?verified=1`,
            },
            type: "signup",
          });

        if (resendVerificationError) {
          setResendError(
            "We could not request a verification email right now. Please wait a moment and try again.",
          );
          return;
        }

        setResendMessage(
          "If this email is waiting for verification, a new confirmation link has been sent.",
        );
      } catch (resendError) {
        setResendError(
          resendError instanceof Error
            ? resendError.message
            : "Verification email could not be requested.",
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-7 text-brand-muted">
        Secure importer login uses your registered email and password. Role
        access is checked before your importer dashboard opens.
      </p>

      <form className="space-y-4" onSubmit={handleLogin}>
        <AuthInput
          autoComplete="email"
          id="importer-email"
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        <AuthInput
          autoComplete="current-password"
          id="importer-password"
          label="Password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          required
          type="password"
          value={password}
        />
        <AuthErrorMessage message={error} />
        <AuthActionButton disabled={isPending} type="submit">
          {isPending ? "Checking account..." : "Login with Email"}
        </AuthActionButton>
      </form>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-brand-navy">
          Need a verification email?
        </p>
        <p className="mt-1 text-xs leading-6 text-brand-muted">
          Enter your email above, then request a new verification link. For
          privacy, this does not confirm whether an account exists.
        </p>
        <button
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-emerald bg-white px-4 text-sm font-bold text-brand-emerald transition hover:border-brand-navy hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isResending}
          onClick={handleResendVerification}
          type="button"
        >
          {isResending ? "Requesting..." : "Resend verification email"}
        </button>
        <AuthErrorMessage message={resendError} />
        {resendMessage ? (
          <p className="mt-3 rounded-lg border border-brand-emerald bg-emerald-50 p-3 text-xs leading-6 text-brand-navy">
            {resendMessage}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 text-sm leading-7 text-brand-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
        <span>
          New importer?{" "}
          <Link className="font-bold text-brand-emerald" href={ROUTES.signup}>
            Create an account
          </Link>
        </span>
        <Link
          className="font-bold text-brand-emerald no-underline hover:text-brand-navy"
          href={ROUTES.forgotPassword}
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
