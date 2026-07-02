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
import { cn } from "@/lib/utils";

type SignedInSummary = Extract<
  PublicAuthSessionSummary,
  { loggedIn: true }
>;

type PublicAuthStatusProps = {
  className?: string;
  variant?: "desktop" | "mobile";
};

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
  wide = false,
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "outline";
  wide?: boolean;
}) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-bold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold",
        wide ? "w-full" : "",
        variant === "primary"
          ? "border-brand-emerald bg-brand-emerald text-white hover:border-brand-navy hover:bg-brand-navy"
          : "border-slate-200 bg-white text-brand-navy hover:border-brand-emerald hover:text-brand-emerald",
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export function PublicAuthStatus({
  className,
  variant = "desktop",
}: PublicAuthStatusProps) {
  const router = useRouter();
  const [menuState, setMenuState] = useState<AuthMenuState>({
    status: "checking",
  });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isMobile = variant === "mobile";

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
      <div
        className={cn(
          isMobile
            ? "grid gap-3"
            : "flex min-w-0 items-center justify-end gap-2",
          className,
        )}
      >
        <div
          className={cn(
            "min-w-0 rounded-lg border border-slate-200 bg-brand-background px-3 py-2",
            isMobile ? "w-full" : "max-w-52",
          )}
        >
          <p className="text-xs font-semibold text-brand-muted">Logged in as</p>
          <p className="truncate text-sm font-bold text-brand-navy">
            {identity}
          </p>
          <p className="text-xs font-semibold text-brand-emerald">
            {menuState.summary.roleLabel}
          </p>
        </div>

        <div className={cn(isMobile ? "grid gap-2" : "flex items-center gap-2")}>
          {isMobile && menuState.summary.showMyProjects ? (
            <AuthLink href={ROUTES.importerProjects} wide>
              My Projects
            </AuthLink>
          ) : null}
          <AuthLink
            href={menuState.summary.dashboardHref}
            variant="primary"
            wide={isMobile}
          >
            Dashboard
          </AuthLink>
          <button
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-brand-navy transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60",
              isMobile ? "w-full" : "",
            )}
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
    <div
      className={cn(
        isMobile ? "grid gap-2" : "flex items-center justify-end gap-2",
        className,
      )}
    >
      <AuthLink href={ROUTES.login} wide={isMobile}>
        Login
      </AuthLink>
      <AuthLink href={ROUTES.importerStart} variant="primary" wide={isMobile}>
        Start Import Project
      </AuthLink>
      {menuState.status === "checking" ? (
        <span className="sr-only" aria-live="polite">
          Checking account session
        </span>
      ) : null}
    </div>
  );
}
