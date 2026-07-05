"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resolveAuthRedirectAction } from "@/app/auth/actions";
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
