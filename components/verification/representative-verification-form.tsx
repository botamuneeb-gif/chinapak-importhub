"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  verifyRepresentativeCodeAction,
  type PublicRepresentativeVerificationResult,
} from "@/app/verify/representative/actions";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";

function ResultPanel({
  result,
}: {
  result: PublicRepresentativeVerificationResult;
}) {
  const isVerified = result.result === "verified";

  return (
    <section
      className={
        isVerified
          ? "rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm"
          : "rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm"
      }
      aria-live="polite"
    >
      <p
        className={
          isVerified
            ? "text-sm font-bold uppercase tracking-wide text-emerald-700"
            : "text-sm font-bold uppercase tracking-wide text-amber-800"
        }
      >
        {isVerified ? "Verified Representative" : "Verification Result"}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-brand-navy">
        {isVerified ? result.displayName : result.message}
      </h2>
      {isVerified ? (
        <div className="mt-4 grid gap-3 text-sm text-brand-muted sm:grid-cols-2">
          <p>
            Role
            <br />
            <span className="font-bold text-brand-text">{result.roleTitle}</span>
          </p>
          <p>
            Status
            <br />
            <span className="font-bold text-emerald-700">
              {result.statusLabel}
            </span>
          </p>
          <p>
            City / Province
            <br />
            <span className="font-bold text-brand-text">
              {[result.city, result.province].filter(Boolean).join(", ") ||
                "Not listed"}
            </span>
          </p>
          <p>
            Service area
            <br />
            <span className="font-bold text-brand-text">
              {result.serviceArea || "Not listed"}
            </span>
          </p>
          <p>
            Code checked
            <br />
            <span className="font-bold text-brand-text" translate="no">
              {result.code}
            </span>
          </p>
          <p>
            Verification time
            <br />
            <span className="font-bold text-brand-text">
              {result.checkedAt}
            </span>
          </p>
          {result.publicNotes ? (
            <p className="sm:col-span-2">
              Public notes
              <br />
              <span className="font-bold text-brand-text">
                {result.publicNotes}
              </span>
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          Please contact official ChinaPak ImportHub support before sharing
          business information or making any payment.
        </p>
      )}
      <div className="mt-5 rounded-lg border border-red-200 bg-white p-4 text-sm font-semibold leading-7 text-red-700">
        This verification only confirms that the person/code is registered with
        ChinaPak ImportHub. Do not send money to personal accounts. Official
        payments must follow platform instructions only.
      </div>
    </section>
  );
}

export function RepresentativeVerificationForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] =
    useState<PublicRepresentativeVerificationResult | null>(null);

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await verifyRepresentativeCodeAction(code);

      if (!response.ok) {
        setError(response.message);
        return;
      }

      setResult(response.data);
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Representative verification could not be completed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <form
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={submitVerification}
      >
        <label className="grid gap-2 text-sm font-semibold text-brand-navy">
          Representative code
          <input
            className="min-h-12 rounded-lg border border-slate-300 px-4 py-3 text-base font-bold uppercase tracking-wide text-brand-text"
            onChange={(event) => setCode(event.target.value)}
            placeholder="CPIH-REP-XXXXX"
            required
            translate="no"
            value={code}
          />
        </label>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          Codes are not case-sensitive. You can enter the full code or only the
          final five characters shown by the representative.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-brand-navy bg-brand-navy px-5 py-3 text-center text-base font-semibold text-white transition hover:border-brand-emerald hover:bg-brand-emerald disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Checking..." : "Verify Representative"}
          </button>
          <Button href={ROUTES.contact} variant="outline">
            Contact Support
          </Button>
        </div>
      </form>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {result ? <ResultPanel result={result} /> : null}

      <div className="urdu-text rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm" dir="rtl" lang="ur">
        <h2 className="text-xl font-bold">نمائندہ کوڈ چیک کریں</h2>
        <p className="mt-3 text-sm leading-8">
          اگر کوڈ active نہ ہو یا representative کا status clear نہ ہو تو
          personal account پر payment نہ کریں۔ پہلے ChinaPak ImportHub support
          سے verify کریں۔
        </p>
      </div>
    </div>
  );
}
