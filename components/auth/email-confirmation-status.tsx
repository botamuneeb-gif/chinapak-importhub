"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/config/brand";

function hasVerificationError(searchParams: URLSearchParams, hash: string) {
  if (searchParams.get("error") || searchParams.get("error_code")) {
    return true;
  }

  if (!hash) {
    return false;
  }

  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  return Boolean(hashParams.get("error") || hashParams.get("error_code"));
}

export function EmailConfirmationStatus() {
  const searchParams = useSearchParams();
  const [hashState, setHashState] = useState({
    checked: false,
    value: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setHashState({
      checked: true,
      value: window.location.hash,
    });

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }, []);

  const isError = useMemo(
    () => hasVerificationError(searchParams, hashState.value),
    [hashState.value, searchParams],
  );

  if (!hashState.checked) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-brand-muted">
        Checking email verification result...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 rounded-lg border border-brand-error bg-red-50 p-5 text-sm leading-7 text-brand-navy">
        <p className="text-lg font-bold text-brand-error">
          Email verification link could not be confirmed.
        </p>
        <p>
          We could not confirm your email link. Please request a new
          verification email from the login page or contact ChinaPak ImportHub
          support.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-emerald"
            href={`${ROUTES.login}?error=verification_failed`}
          >
            Go to Login
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-emerald bg-white px-4 py-2 text-sm font-bold text-brand-emerald no-underline transition hover:border-brand-navy hover:text-brand-navy"
            href={ROUTES.signup}
          >
            Create account again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-brand-emerald bg-emerald-50 p-5 text-sm leading-7 text-brand-navy">
      <p className="text-lg font-bold text-brand-emerald">
        Email verified successfully.
      </p>
      <p>
        You can now log in and start your Import Project. Your importer profile
        will be prepared securely after your first verified login.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-emerald"
          href={`${ROUTES.login}?verified=1`}
        >
          Go to Login
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-emerald bg-white px-4 py-2 text-sm font-bold text-brand-emerald no-underline transition hover:border-brand-navy hover:text-brand-navy"
          href={ROUTES.importerStart}
        >
          Start Import Project after login
        </Link>
      </div>
    </div>
  );
}
