import type { Metadata } from "next";
import { RepresentativeCard } from "@/components/verification/representative-card";
import { VerifyHero } from "@/components/verification/verify-hero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import { exampleRepresentative } from "@/config/agents";

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
          <form
            aria-label="Representative verification placeholder"
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-brand-navy">
              Verify Representative Placeholder
            </h2>
            <div className="mt-5 grid gap-4">
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="agent-code"
                >
                  Representative ID / Agent Code
                </label>
                <input
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
                  id="agent-code"
                  placeholder="CPH-LHR-014"
                  type="text"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="representative-phone"
                >
                  Phone number optional
                </label>
                <input
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
                  id="representative-phone"
                  placeholder="+92 3XX XXXXXXX"
                  type="tel"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="representative-city"
                >
                  City optional
                </label>
                <input
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
                  id="representative-city"
                  placeholder="Lahore"
                  type="text"
                />
              </div>
              <Button type="button" variant="secondary">
                Verify Representative Placeholder
              </Button>
            </div>
          </form>

          <RepresentativeCard representative={exampleRepresentative} />
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
