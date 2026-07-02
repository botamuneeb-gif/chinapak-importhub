"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listImporterFactoryReportsAction,
  type ImporterReportListItem,
} from "@/app/importer/reports/actions";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LiveImporterReportsListProps = {
  compact?: boolean;
};

export function LiveImporterReportsList({
  compact = false,
}: LiveImporterReportsListProps) {
  const [reports, setReports] = useState<ImporterReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Report دیکھنے کے لیے importer account میں login کریں۔");
            setIsLoading(false);
          }
          return;
        }

        const result = await listImporterFactoryReportsAction(
          session.access_token,
        );

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setReports(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Factory reports load نہیں ہو سکیں۔",
        );
        setIsLoading(false);
      }
    }

    void loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-brand-muted shadow-sm">
        Approved factory reports load ہو رہی ہیں...
      </div>
    );
  }

  if (message) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
        {message}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-brand-navy">
          ابھی کوئی factory report release نہیں ہوئی
        </h2>
        <p className="mt-2 text-sm leading-7 text-brand-muted">
          Admin approval کے بعد approved factory report یہاں نظر آئے گی۔ Raw
          FMS submissions یا factory contact details importer کو نہیں دکھائی
          جاتیں۔
        </p>
      </div>
    );
  }

  const visibleReports = compact ? reports.slice(0, 3) : reports;

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-brand-emerald bg-emerald-50 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-brand-emerald">
          Your factory report is ready for review.
        </h2>
        <p className="mt-2 text-sm leading-7 text-brand-navy" dir="rtl">
          آپ کی approved factory report account میں available ہے۔ Factory
          contact details اس stage پر share نہیں کی جاتیں۔
        </p>
      </div>

      <div className="grid gap-4">
        {visibleReports.map((report) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={report.projectCode}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-muted">
                  Project ID
                </p>
                <h3 className="mt-1 text-xl font-bold text-brand-navy">
                  {report.projectCode}
                </h3>
              </div>
              <span className="w-fit rounded-lg border border-brand-emerald bg-emerald-50 px-3 py-1 text-xs font-bold text-brand-emerald">
                {report.reportStatus}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Package
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {report.packageName}
                </dd>
              </div>
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Options
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {report.optionCount} approved option(s)
                </dd>
              </div>
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Released
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {report.releaseDate}
                </dd>
              </div>
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Status
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {report.projectStatus}
                </dd>
              </div>
            </dl>
            <Link
              className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
              href={`${ROUTES.importerReports}/${encodeURIComponent(
                report.projectCode,
              )}`}
            >
              Report دیکھیں
            </Link>
          </article>
        ))}
      </div>

      {compact && reports.length > visibleReports.length ? (
        <Link
          className="inline-flex min-h-12 items-center rounded-lg border border-brand-navy bg-white px-5 py-3 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
          href={ROUTES.importerReports}
        >
          All reports دیکھیں
        </Link>
      ) : null}
    </section>
  );
}
