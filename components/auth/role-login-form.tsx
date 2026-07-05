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
import type { UserRole } from "@/lib/auth/roles";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type RoleLoginFormProps = {
  allowedRoles: UserRole[];
  notice: string;
  submitLabel: string;
};

export function RoleLoginForm({
  allowedRoles,
  notice,
  submitLabel,
}: RoleLoginFormProps) {
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

        const roleResult = await resolveAuthRedirectAction(
          data.session.access_token,
          allowedRoles,
        );

        if (!roleResult.ok) {
          await supabase.auth.signOut();
          setError(roleResult.message);
          return;
        }

        router.push(roleResult.redirectTo);
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
    <form className="space-y-4" onSubmit={handleLogin}>
      <AuthModeNotice title="Role verification enabled">{notice}</AuthModeNotice>
      <AuthInput
        autoComplete="email"
        id="role-email"
        label="Email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@chinapakimporthub.com"
        required
        type="email"
        value={email}
      />
      <AuthInput
        autoComplete="current-password"
        id="role-password"
        label="Password"
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        required
        type="password"
        value={password}
      />
      <AuthErrorMessage message={error} />
      <AuthActionButton disabled={isPending} type="submit">
        {isPending ? "Verifying role..." : submitLabel}
      </AuthActionButton>
      <Link
        className="inline-flex text-sm font-bold text-brand-emerald no-underline hover:text-brand-navy"
        href={ROUTES.forgotPassword}
      >
        Forgot password?
      </Link>
    </form>
  );
}
