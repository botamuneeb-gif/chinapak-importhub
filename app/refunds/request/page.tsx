import type { Metadata } from "next";
import { LiveRefundRequestForm } from "@/components/payments/live-billing-panels";

export const metadata: Metadata = {
  title: "Request Refund | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function RefundRequestPage() {
  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-emerald">
            Admin-reviewed refund
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Request Refund or Admin Review
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
            Before FMS assignment/work starts, full refund may apply. After FMS
            assignment/work, admin reviews milestones and may offer reassignment
            before a refund decision.
          </p>
        </section>

        <LiveRefundRequestForm />
      </div>
    </main>
  );
}

