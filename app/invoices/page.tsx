import type { Metadata } from "next";
import { LiveImporterInvoices } from "@/components/payments/live-billing-panels";

export const metadata: Metadata = {
  title: "My Invoices | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function InvoicesPage() {
  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-emerald">
            Importer Billing
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Project Invoices
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
            Live invoice records for your Import Projects. Manual payment is
            reviewed by ChinaPak ImportHub admin before any FMS sourcing work can
            begin.
          </p>
        </section>

        <LiveImporterInvoices />
      </div>
    </main>
  );
}

