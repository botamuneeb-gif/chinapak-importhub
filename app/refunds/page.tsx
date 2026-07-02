import type { Metadata } from "next";
import { LiveRefundsOverview } from "@/components/payments/live-billing-panels";

export const metadata: Metadata = {
  title: "Refunds | ChinaPak ImportHub",
  description:
    "Refund policy and live refund request status for ChinaPak ImportHub Import Projects.",
  robots: { index: false, follow: false },
};

export default function RefundsPage() {
  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-emerald">
            Refund protection
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Refund Requests
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
            Track refund requests for your paid Import Projects. Refunds remain
            manual/offline and admin-reviewed in this phase.
          </p>
        </section>

        <LiveRefundsOverview />
      </div>
    </main>
  );
}
