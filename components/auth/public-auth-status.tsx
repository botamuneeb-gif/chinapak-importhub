"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  getPublicAuthSessionSummaryAction,
  type PublicAuthSessionSummary,
} from "@/app/auth/actions";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type SignedInSummary = Extract<
  PublicAuthSessionSummary,
  { loggedIn: true }
>;

type AuthMenuState =
  | { status: "checking" }
  | { status: "logged_out" }
  | { status: "logged_in"; summary: SignedInSummary };

function getMetadataLabel(
  metadata: Record<string, unknown>,
  email: string | null | undefined,
) {
  const value =
    metadata.display_name ?? metadata.full_name ?? metadata.name ?? email;

  return typeof value === "string" && value.trim() ? value : "Signed-in user";
}

function getFallbackSignedInSummary(
  metadata: Record<string, unknown>,
  email: string | null | undefined,
): SignedInSummary {
  return {
    dashboardHref: ROUTES.authRoleSelect,
    displayName: getMetadataLabel(metadata, email),
    email: email ?? null,
    loggedIn: true,
    role: null,
    roleLabel: "Role pending",
    showMyProjects: false,
  };
}

function AuthLink({
  children,
  href,
  variant = "outline",
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "outline";
}) {
  return (
    <Link
      className={
        variant === "primary"
          ? "inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-emerald bg-brand-emerald px-3 py-2 text-sm font-bold text-white no-underline transition hover:border-brand-navy hover:bg-brand-navy"
          : "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
      }
      href={href}
    >
      {children}
    </Link>
  );
}

export function PublicAuthStatus() {
  const router = useRouter();
  const [menuState, setMenuState] = useState<AuthMenuState>({
    status: "checking",
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (!session?.access_token || !session.user) {
          setMenuState({ status: "logged_out" });
          return;
        }

        const summary = await getPublicAuthSessionSummaryAction(
          session.access_token,
        );

        if (!isMounted) {
          return;
        }

        if (summary.loggedIn) {
          setMenuState({ status: "logged_in", summary });
          return;
        }

        setMenuState({
          status: "logged_in",
          summary: getFallbackSignedInSummary(
            session.user.user_metadata as Record<string, unknown>,
            session.user.email,
          ),
        });
      } catch {
        if (isMounted) {
          setMenuState({ status: "logged_out" });
        }
      }
    }

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  async function logout() {
    setIsSigningOut(true);

    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } finally {
      setMenuState({ status: "logged_out" });
      setIsSigningOut(false);
      router.replace(ROUTES.home);
      router.refresh();
    }
  }

  if (menuState.status === "logged_in") {
    const identity =
      menuState.summary.displayName ?? menuState.summary.email ?? "Signed-in user";

    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <div className="min-w-0 rounded-lg border border-slate-200 bg-brand-background px-3 py-2">
          <p className="text-xs font-semibold text-brand-muted">Logged in as</p>
          <p className="max-w-48 truncate text-sm font-bold text-brand-navy">
            {identity}
          </p>
          <p className="text-xs font-semibold text-brand-emerald">
            {menuState.summary.roleLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {menuState.summary.showMyProjects ? (
            <AuthLink href={ROUTES.importerProjects}>My Projects</AuthLink>
          ) : null}
          <AuthLink href={menuState.summary.dashboardHref} variant="primary">
            Dashboard
          </AuthLink>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-brand-navy transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSigningOut}
            onClick={() => void logout()}
            type="button"
          >
            {isSigningOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
      <AuthLink href={ROUTES.login}>Login</AuthLink>
      <AuthLink href={ROUTES.signup} variant="primary">
        Sign Up
      </AuthLink>
      <AuthLink href={ROUTES.importerStart}>Start Import Project</AuthLink>
      {menuState.status === "checking" ? (
        <span className="sr-only" aria-live="polite">
          Checking account session
        </span>
      ) : null}
    </div>
  );
}
