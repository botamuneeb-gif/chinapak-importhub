"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { resolveAuthRedirectAction } from "@/app/auth/actions";
import { AuthModeNotice } from "@/components/auth/auth-mode-notice";
import { ROUTES } from "@/config/brand";
import type { UserRole } from "@/lib/auth/roles";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type RoleProtectedShellProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  loginHref: string;
  protectedPrefixes: string[];
  publicPrefixes?: string[];
  title: string;
};

type GateState = "checking" | "allowed" | "denied";

const ROLE_VERIFICATION_TIMEOUT_MS = 12000;

export function RoleProtectedShell({
  allowedRoles,
  children,
  loginHref,
  protectedPrefixes,
  publicPrefixes = [],
  title,
}: RoleProtectedShellProps) {
  const pathname = usePathname();
  const [gateState, setGateState] = useState<GateState>("checking");
  const [message, setMessage] = useState("");

  const shouldProtect = useMemo(() => {
    if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return false;
    }

    return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  }, [pathname, protectedPrefixes, publicPrefixes]);

  useEffect(() => {
    let isMounted = true;

    async function verifyRole() {
      if (!shouldProtect) {
        setGateState("allowed");
        return;
      }

      setGateState("checking");
      setMessage("");

      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (!isMounted) {
            return;
          }
          setGateState("denied");
          setMessage("Please login with an authorized account first.");
          return;
        }

        const result = await Promise.race([
          resolveAuthRedirectAction(session.access_token, allowedRoles),
          new Promise<Awaited<ReturnType<typeof resolveAuthRedirectAction>>>(
            (resolve) => {
              window.setTimeout(() => {
                resolve({
                  ok: false,
                  message:
                    "Role verification timed out. Please refresh or login again.",
                });
              }, ROLE_VERIFICATION_TIMEOUT_MS);
            },
          ),
        ]);

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setGateState("denied");
          setMessage(result.message);
          return;
        }

        setGateState("allowed");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setGateState("denied");
        setMessage(
          error instanceof Error
            ? error.message
            : "Supabase role protection is not configured yet.",
        );
      }
    }

    void verifyRole();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, shouldProtect]);

  if (!shouldProtect || gateState === "allowed") {
    return children;
  }

  return (
    <main className="min-h-screen bg-brand-background px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-brand-gold">{title}</p>
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">
          Protected portal
        </h1>
        {gateState === "checking" ? (
          <p className="mt-4 text-sm leading-7 text-brand-muted">
            Checking your Supabase session and role assignment...
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            <AuthModeNotice title="Access blocked" tone="warning">
              <p>{message}</p>
            </AuthModeNotice>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white no-underline hover:bg-brand-emerald"
                href={loginHref}
              >
                Go to login
              </Link>
              <Link
                className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline hover:border-brand-emerald hover:text-brand-emerald"
                href={ROUTES.authRoleSelect}
              >
                Choose role
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
