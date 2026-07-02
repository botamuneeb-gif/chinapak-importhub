import type { Metadata } from "next";
import Link from "next/link";
import { LiveImporterProjectsList } from "@/components/importer/live-importer-projects-list";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "My Import Projects | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function ImporterProjectsPage() {
  return (
    <main
      className="urdu-text min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8"
      dir="rtl"
      lang="ur"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold text-brand-emerald">
                Import Project Tracking
              </p>
              <h1 className="mt-2 text-3xl font-bold text-brand-navy">
                My Import Projects
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-brand-muted">
                Yahan aap apne submitted projects, payment status, admin review,
                FMS progress, reports, invoices, refunds, aur next steps track
                kar sakte hain.
              </p>
            </div>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
              href={ROUTES.importerStart}
            >
              Start New Project
            </Link>
          </div>
        </section>

        <LiveImporterProjectsList />
      </div>
    </main>
  );
}
