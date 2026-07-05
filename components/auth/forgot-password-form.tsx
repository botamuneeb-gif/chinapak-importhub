"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AuthActionButton } from "@/components/auth/auth-action-button";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { AuthInput } from "@/components/auth/auth-input";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSent(false);

    const cleanEmail = email.trim().toLowerCase();

    startTransition(async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const redirectTo = `${window.location.origin}${ROUTES.resetPassword}`;
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo,
          });

        if (resetError) {
          setError(
            "We could not request a reset email right now. Please wait a moment and try again.",
          );
          return;
        }

        setSent(true);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Password reset is not configured yet.",
        );
      }
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="text-sm leading-7 text-brand-muted">
        Enter the email used for your ChinaPak ImportHub account. If an account
        can receive reset email, Supabase will send password reset instructions.
      </p>
      <AuthInput
        autoComplete="email"
        id="forgot-password-email"
        label="Email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        type="email"
        value={email}
      />
      <AuthErrorMessage message={error} />
      {sent ? (
        <div className="rounded-lg border border-brand-emerald bg-emerald-50 p-4 text-sm leading-7 text-brand-navy">
          If this email is eligible for password reset, instructions have been
          sent. Please check your inbox and spam folder.
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AuthActionButton disabled={isPending} type="submit">
          {isPending ? "Sending reset email..." : "Send reset email"}
        </AuthActionButton>
        <Link
          className="text-sm font-bold text-brand-emerald no-underline hover:text-brand-navy"
          href={ROUTES.login}
        >
          Back to login
        </Link>
      </div>
    </form>
  );
}
