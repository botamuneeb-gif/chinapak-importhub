"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AuthActionButton } from "@/components/auth/auth-action-button";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { AuthInput } from "@/components/auth/auth-input";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type RecoveryState = "checking" | "ready" | "invalid" | "updated";

function getPasswordIssue(password: string) {
  if (password.length < 8) {
    return "Please use a password with at least 8 characters.";
  }

  return "";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [recoveryState, setRecoveryState] =
    useState<RecoveryState>("checking");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession() {
      try {
        const supabase = createBrowserSupabaseClient();
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            if (isMounted) {
              setRecoveryState("invalid");
              setError(
                "This reset link is invalid or expired. Please request a new password reset email.",
              );
            }
            return;
          }
        } else if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(
            window.location.hash.replace(/^#/, ""),
          );
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              if (isMounted) {
                setRecoveryState("invalid");
                setError(
                  "This reset link could not be opened. Please request a new password reset email.",
                );
              }
              return;
            }
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        setRecoveryState(session ? "ready" : "invalid");
        if (!session) {
          setError(
            "Open this page from the password reset email, or request a new reset link.",
          );
        }
      } catch (sessionError) {
        if (!isMounted) {
          return;
        }

        setRecoveryState("invalid");
        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Password reset link could not be verified.",
        );
      }
    }

    void prepareRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const issue = getPasswordIssue(password);
    if (issue) {
      setError(issue);
      return;
    }

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          setError(updateError.message);
          return;
        }

        setRecoveryState("updated");
        setPassword("");
        setConfirmPassword("");
        window.setTimeout(() => {
          router.push(ROUTES.login);
        }, 1200);
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "Password could not be updated.",
        );
      }
    });
  }

  if (recoveryState === "checking") {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-brand-muted">
        Checking your secure reset link...
      </div>
    );
  }

  if (recoveryState === "invalid") {
    return (
      <div className="space-y-4">
        <AuthErrorMessage message={error} />
        <AuthActionButton href={ROUTES.forgotPassword} variant="secondary">
          Request a new reset link
        </AuthActionButton>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {recoveryState === "updated" ? (
        <div className="rounded-lg border border-brand-emerald bg-emerald-50 p-4 text-sm leading-7 text-brand-navy">
          Password updated. Redirecting to login...
        </div>
      ) : null}
      <AuthInput
        autoComplete="new-password"
        id="reset-password"
        label="New password"
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="At least 8 characters"
        required
        type="password"
        value={password}
      />
      <AuthInput
        autoComplete="new-password"
        id="reset-password-confirm"
        label="Confirm new password"
        minLength={8}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Re-enter password"
        required
        type="password"
        value={confirmPassword}
      />
      <AuthErrorMessage message={error} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AuthActionButton
          disabled={isPending || recoveryState === "updated"}
          type="submit"
        >
          {isPending ? "Updating password..." : "Update password"}
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
