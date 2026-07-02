import type { Metadata } from "next";
import { LiveImporterReportsList } from "@/components/importer/live-importer-reports-list";

export const metadata: Metadata = {
  title: "Factory Reports | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function ImporterReportsPage() {
  return (
    <main
      className="urdu-text min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8"
      dir="rtl"
      lang="ur"
    >
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-emerald">
            Importer Factory Reports
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Approved factory reports
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-brand-muted">
            یہاں صرف ChinaPak ImportHub admin کی approved اور sanitized factory
            reports دکھائی جاتی ہیں۔ Raw FMS submissions، admin-only notes، اور
            factory contact details importer کو نہیں دکھائے جاتے۔
          </p>
        </section>

        <LiveImporterReportsList />
      </div>
    </main>
  );
}

