"use client";

import Link from "next/link";

type PrintActionsProps = {
  backHref?: string;
  backLabel?: string;
};

export function PrintActions({
  backHref,
  backLabel = "Back",
}: PrintActionsProps) {
  return (
    <div className="print-hide flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold text-brand-emerald">
          Print-ready document
        </p>
        <p className="mt-1 text-sm leading-6 text-brand-muted">
          Use your browser print dialog and choose Save as PDF.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {backHref ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
            href={backHref}
          >
            {backLabel}
          </Link>
        ) : null}
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-navy"
          onClick={() => window.print()}
          type="button"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
