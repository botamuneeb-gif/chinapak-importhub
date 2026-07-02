import type { Metadata } from "next";
import { LiveManualPaymentPage } from "@/components/payments/live-billing-panels";

export const metadata: Metadata = {
  title: "Manual Payment Reference | ChinaPak ImportHub",
  description:
    "Submit manual payment details for ChinaPak ImportHub admin verification.",
  robots: { index: false, follow: false },
};

export default function ManualPaymentPage() {
  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-brand-emerald">
            Manual payment review
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy">
            Submit Payment Reference
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
            Share your bank transfer, Easypaisa, JazzCash, or approved manual
            payment reference. Admin verification is required before sourcing
            starts.
          </p>
        </section>

        <LiveManualPaymentPage />
      </div>
    </main>
  );
}
