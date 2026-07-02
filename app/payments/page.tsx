import Link from "next/link";
import type { Metadata } from "next";
import { LiveImporterInvoices } from "@/components/payments/live-billing-panels";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Payments | ChinaPak ImportHub",
  description:
    "Manual payment status and invoice payment references for ChinaPak ImportHub Import Projects.",
  robots: { index: false, follow: false },
};

export default function PaymentsPage() {
  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-emerald">
            Manual Payments
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Payment Status and Help
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
            Real payment gateway integration is not connected yet. For now,
            submit manual payment references for admin verification. FMS work
            remains blocked until payment is verified and admin review approves
            the project.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
              href={ROUTES.paymentsManual}
            >
              Submit payment reference
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.invoices}
            >
              View invoices
            </Link>
          </div>
        </section>

        <LiveImporterInvoices />
      </div>
    </main>
  );
}
