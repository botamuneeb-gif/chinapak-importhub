import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Payment Success Placeholder | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return (
    <main>
      <PageHero
        eyebrow="Payment status"
        intro="This is a frontend-only success state prepared for future payment gateway callbacks."
        title="Payment Successful"
      />

      <section className="bg-brand-background">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <article className="rounded-lg border border-brand-emerald bg-white p-6 shadow-sm">
            <PaymentStatusBadge status="Paid" />
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-brand-navy">Project ID</dt>
                <dd className="mt-1 text-brand-muted">CPH-2026-0010</dd>
              </div>
              <div>
                <dt className="font-bold text-brand-navy">Payment reference placeholder</dt>
                <dd className="mt-1 text-brand-muted">PAY-PLACEHOLDER-0010</dd>
              </div>
            </dl>

            <h2 className="mt-8 text-2xl font-bold text-brand-navy">Next steps</h2>
            <ol className="mt-4 grid gap-3 text-sm leading-7 text-brand-muted">
              <li>1. Admin review will verify the paid Import Project.</li>
              <li>2. FMS assignment happens after admin review.</li>
              <li>3. Project tracking will show future milestones and updates.</li>
            </ol>

            <div className="mt-6">
              <Button href={ROUTES.importerDashboard} variant="secondary">
                View Project Placeholder
              </Button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
