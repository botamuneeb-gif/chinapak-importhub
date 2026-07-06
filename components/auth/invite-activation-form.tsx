"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AuthActionButton } from "@/components/auth/auth-action-button";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { AuthInput } from "@/components/auth/auth-input";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type InviteState = "checking" | "ready" | "invalid" | "activated";

function getPasswordIssue(password: string) {
  if (password.length < 8) {
    return "Please use a password with at least 8 characters.";
  }

  return "";
}

export function InviteActivationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [inviteState, setInviteState] = useState<InviteState>("checking");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    async function prepareInviteSession() {
      try {
        const supabase = createBrowserSupabaseClient();
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            if (isMounted) {
              setInviteState("invalid");
              setError(
                "This invitation link is invalid or expired. Please request a new invitation from ChinaPak ImportHub.",
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
                setInviteState("invalid");
                setError(
                  "This invitation link could not be opened safely. Please request a new invitation from ChinaPak ImportHub.",
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

        if (!session) {
          setInviteState("invalid");
          setError(
            "This invitation link is invalid or expired. Please request a new invitation from ChinaPak ImportHub.",
          );
          return;
        }

        setInviteState("ready");
      } catch (sessionError) {
        if (!isMounted) {
          return;
        }

        setInviteState("invalid");
        setError(
          sessionError instanceof Error
            ? "This invitation link could not be verified. Please request a new invitation from ChinaPak ImportHub."
            : "This invitation link could not be verified.",
        );
      }
    }

    void prepareInviteSession();

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
          setError("Your password could not be set from this invitation link.");
          return;
        }

        await supabase.auth.signOut();
        setInviteState("activated");
        setPassword("");
        setConfirmPassword("");

        window.setTimeout(() => {
          router.push(`${ROUTES.fmsLogin}?activated=1`);
        }, 1400);
      } catch {
        setError(
          "Your FMS account could not be activated. Please request a new invitation from ChinaPak ImportHub.",
        );
      }
    });
  }

  if (inviteState === "checking") {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-brand-muted">
        Checking your secure invitation link...
      </div>
    );
  }

  if (inviteState === "invalid") {
    return (
      <div className="space-y-4">
        <AuthErrorMessage message={error} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <AuthActionButton href={ROUTES.contact} variant="secondary">
            Contact support
          </AuthActionButton>
          <AuthActionButton href={ROUTES.fmsApply} variant="outline">
            Submit FMS application
          </AuthActionButton>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {inviteState === "activated" ? (
        <div className="rounded-lg border border-brand-emerald bg-emerald-50 p-4 text-sm leading-7 text-brand-navy">
          Your FMS account is activated. You can now log in to the FMS Portal.
        </div>
      ) : (
        <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
          Your FMS account has already been created by ChinaPak ImportHub after
          approval. Set your password to activate your invited account.
        </div>
      )}
      <AuthInput
        autoComplete="new-password"
        id="invite-password"
        label="Set password"
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="At least 8 characters"
        required
        type="password"
        value={password}
      />
      <AuthInput
        autoComplete="new-password"
        id="invite-password-confirm"
        label="Confirm password"
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
          disabled={isPending || inviteState === "activated"}
          type="submit"
        >
          {isPending ? "Activating..." : "Set Password & Continue"}
        </AuthActionButton>
        <Link
          className="text-sm font-bold text-brand-emerald no-underline hover:text-brand-navy"
          href={ROUTES.fmsLogin}
        >
          FMS login after activation
        </Link>
      </div>
    </form>
  );
}
