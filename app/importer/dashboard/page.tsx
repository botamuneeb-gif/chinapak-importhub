import Link from "next/link";
import type { Metadata } from "next";
import { LiveImporterProjectsList } from "@/components/importer/live-importer-projects-list";
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
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-emerald">
            ChinaPak ImportHub
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Importer Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-brand-muted">
            Yahan aap apne Import Projects, approved factory reports, invoices,
            payments, refunds, aur admin-approved updates track kar sakte hain.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
              href={ROUTES.importerStart}
            >
              Start New Project
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-brand-navy bg-white px-5 py-3 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.importerProjects}
            >
              My Projects
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Next action",
              body: "Open My Projects to see the latest payment, admin review, FMS, and report step.",
            },
            {
              title: "After payment",
              body: "Admin verifies payment and reviews the project before any FMS sourcing starts.",
            },
            {
              title: "Report release",
              body: "Factory options appear only after admin review and safe importer-facing release.",
            },
          ].map((item) => (
            <div
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              key={item.title}
            >
              <h2 className="text-base font-bold text-brand-navy">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-brand-muted">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-brand-emerald">
                Recent Projects
              </p>
              <h2 className="text-2xl font-bold text-brand-navy">
                Track submitted Import Projects
              </h2>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.importerProjects}
            >
              View All Projects
            </Link>
          </div>
          <LiveImporterProjectsList compact />
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-bold text-brand-emerald">
              Released Reports
            </p>
            <h2 className="text-2xl font-bold text-brand-navy">
              Admin-approved factory reports
            </h2>
          </div>
          <LiveImporterReportsList compact />
        </section>

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
