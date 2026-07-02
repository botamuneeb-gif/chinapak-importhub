"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resolveAuthRedirectAction } from "@/app/auth/actions";
import { AuthActionButton } from "@/components/auth/auth-action-button";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthModeNotice } from "@/components/auth/auth-mode-notice";
import { ROUTES } from "@/config/brand";
import { USER_ROLES } from "@/lib/auth/roles";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ImporterLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError || !data.session?.access_token) {
          setError(signInError?.message ?? "Login failed. Please try again.");
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

  return (
    <div className="space-y-5">
      <AuthModeNotice title="Phone OTP planned">
        <p>
          WhatsApp/phone OTP is the main importer auth direction, but it needs
          SMS provider activation. Email/password below is connected now for
          testing importer access.
        </p>
      </AuthModeNotice>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label
          className="block text-sm font-semibold text-brand-navy"
          htmlFor="phone-placeholder"
        >
          Phone/WhatsApp number
        </label>
        <input
          className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text placeholder:text-brand-muted"
          id="phone-placeholder"
          placeholder="+92 300 0000000"
          type="tel"
        />
        <button
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-brand-muted"
          disabled
          type="button"
        >
          Continue with OTP - future SMS setup
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <AuthInput
          autoComplete="email"
          id="importer-email"
          label="Email fallback for testing"
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
          {isPending ? "Checking account..." : "Login with email"}
        </AuthActionButton>
      </form>

      <p className="text-sm leading-7 text-brand-muted">
        New importer?{" "}
        <Link className="font-bold text-brand-emerald" href={ROUTES.signup}>
          Create an account
        </Link>
        . Login/signup will become automatic through phone OTP when SMS is
        active.
      </p>
    </div>
  );
}
