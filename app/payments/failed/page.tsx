import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import { failedPaymentReasons } from "@/config/payments";

export const metadata: Metadata = {
  title: "Payment Failed | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function PaymentFailedPage() {
  return (
    <main>
      <PageHero
        eyebrow="Payment status"
        intro="If a manual payment record cannot be verified, admin will keep the project awaiting payment and may request more information."
        title="Payment Failed"
      />

      <section className="bg-brand-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="rounded-lg border border-brand-error bg-white p-6 shadow-sm">
            <PaymentStatusBadge status="Failed" />
            <h2 className="mt-6 text-2xl font-bold text-brand-navy">
              Common reasons
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {failedPaymentReasons.map((reason) => (
                <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-brand-error" key={reason}>
                  {reason}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={ROUTES.paymentsCheckout} variant="secondary">
                Try Again
              </Button>
              <Button href={ROUTES.paymentsManual} variant="outline">
                Save Project & Get Assistance
              </Button>
              <Button href={ROUTES.contact} variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
