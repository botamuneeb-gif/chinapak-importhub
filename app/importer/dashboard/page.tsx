import Link from "next/link";
import type { Metadata } from "next";
import { LiveImporterReportsList } from "@/components/importer/live-importer-reports-list";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Importer Dashboard | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function ImporterDashboardPage() {
  return (
    <main
      className="urdu-text min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8"
      dir="rtl"
      lang="ur"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-emerald">
            ChinaPak ImportHub
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Importer Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-brand-muted">
            یہاں آپ اپنے Import Projects، approved factory reports، invoices،
            payments، refunds، اور admin-approved updates دیکھ سکتے ہیں۔
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
              href={ROUTES.importerStart}
            >
              نیا Import Project شروع کریں
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-brand-navy bg-white px-5 py-3 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.importerReports}
            >
              Factory reports دیکھیں
            </Link>
          </div>
        </section>

        <LiveImporterReportsList compact />

        <section className="grid gap-4 md:grid-cols-3">
          {[
            "Secure project tracking",
            "Payment and refund status",
            "Admin-approved communication",
          ].map((item) => (
            <div
              className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold leading-7 text-brand-muted shadow-sm"
              key={item}
            >
              {item}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

