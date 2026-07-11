import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Payment Success | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return (
    <main>
      <PageHero
        eyebrow="Payment status"
        intro="Payment success is shown after admin-verified payment records. Online gateway callbacks are not active for launch."
        title="Payment Verified by Admin"
      />

      <section className="bg-brand-background">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <article className="rounded-lg border border-brand-emerald bg-white p-6 shadow-sm">
            <PaymentStatusBadge status="Paid" />
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-brand-navy">Project ID</dt>
                <dd className="mt-1 text-brand-muted">
                  Check your importer dashboard or invoice detail for the linked
                  Project ID.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-brand-navy">Payment reference</dt>
                <dd className="mt-1 text-brand-muted">Manual reference recorded by admin</dd>
              </div>
            </dl>

            <h2 className="mt-8 text-2xl font-bold text-brand-navy">Next steps</h2>
            <ol className="mt-4 grid gap-3 text-sm leading-7 text-brand-muted">
              <li>1. Admin confirms the project review gate after payment.</li>
              <li>2. FMS assignment happens only after Admin approval.</li>
              <li>3. Project tracking shows payment, FMS, and report milestones.</li>
            </ol>

            <div className="mt-6">
              <Button href={ROUTES.importerDashboard} variant="secondary">
                View Dashboard
              </Button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
