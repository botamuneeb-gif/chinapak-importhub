import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { PaymentMethodCard } from "@/components/payments/payment-method-card";
import { PriceSummary } from "@/components/payments/price-summary";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import { checkoutSummary, paymentMethods } from "@/config/payments";

export const metadata: Metadata = {
  title: "Checkout | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function PaymentCheckoutPage() {
  return (
    <main>
      <PageHero
        eyebrow="Payment review"
        intro="Review your selected package and use manual payment support for launch. Online gateway payment is not active yet."
        title="Complete Payment to Start Admin Review"
      />

      <section className="bg-brand-background">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-brand-navy">
                Payment methods
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard key={method.id} method={method} />
                ))}
              </div>
            </section>

            <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
              <strong>Important:</strong> No FMS work begins until payment is
              completed and admin review is done.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href={ROUTES.paymentsManual} variant="outline">
                Save Project & Get Payment Help
              </Button>
            </div>
          </div>

          <PriceSummary
            estimatedTotal={checkoutSummary.estimatedTotal}
            projectId={checkoutSummary.projectId}
            selectedAddOns={checkoutSummary.selectedAddOns}
            selectedPackage={checkoutSummary.selectedPackage}
            subtotal={checkoutSummary.subtotal}
          />
        </div>
      </section>
    </main>
  );
}
