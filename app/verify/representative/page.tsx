import type { Metadata } from "next";
import { VerifyHero } from "@/components/verification/verify-hero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Verify Representative | ChinaPak ImportHub",
  description:
    "Verify a ChinaPak ImportHub local representative before sharing information or making payment.",
};

export default function VerifyRepresentativePage() {
  return (
    <main>
      <VerifyHero
        actions={
          <Button href={ROUTES.contact} variant="outline">
            Contact Support
          </Button>
        }
        englishSupport="Check a Representative ID or Agent Code before trusting a payment or service request."
        headline="Representative verify کریں"
      />

      <section className="bg-brand-background" dir="ltr" lang="en">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-navy">
              How to verify a representative
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Before sharing payment details, ask the representative for their
              ChinaPak ImportHub Agent Code and confirm it through official
              support. Do not pay personal accounts or unofficial numbers.
            </p>
            <div className="mt-5 grid gap-3">
              {[
                "Ask for Representative ID / Agent Code.",
                "Confirm the city or market they claim to serve.",
                "Use official ChinaPak ImportHub payment routes only.",
                "Contact support if status is inactive or unclear.",
              ].map((item) => (
                <div
                  className="rounded-lg border border-slate-200 bg-brand-background p-4 text-sm font-semibold text-brand-navy"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
            <h2 className="text-2xl font-bold">Launch verification route</h2>
            <p className="mt-3 text-sm leading-7">
              Automated representative lookup is not active for MVP launch.
              Use Contact Support with the Agent Code, phone number, and city
              shown by the representative.
            </p>
            <div className="mt-5">
              <Button href={ROUTES.contact} variant="secondary">
                Contact Support
              </Button>
            </div>
          </section>
        </div>
      </section>

      <section className="bg-white" dir="rtl" lang="ur">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
            <h2 className="text-xl font-bold">Verification warning</h2>
            <p className="mt-3 text-sm leading-7">
              اگر representative نہ ملے یا status inactive ہو، information share
              کرنے یا payment کرنے سے پہلے ChinaPak ImportHub support سے contact
              کریں۔
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
