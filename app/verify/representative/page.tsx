import type { Metadata } from "next";
import { RepresentativeVerificationForm } from "@/components/verification/representative-verification-form";
import { VerifyHero } from "@/components/verification/verify-hero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Verify Representative | ChinaPak ImportHub",
  description:
    "Enter a ChinaPak ImportHub representative code to verify whether a local representative is active before sharing information or making payment.",
  alternates: {
    canonical: "/verify/representative",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function VerifyRepresentativePage() {
  return (
    <main>
      <VerifyHero
        actions={
          <>
            <Button href={ROUTES.verify} variant="secondary">
              Verify ChinaPak
            </Button>
            <Button href={ROUTES.contact} variant="outline">
              Contact Support
            </Button>
          </>
        }
        englishSupport="Enter the representative code before trusting an offline payment or service request."
        headline="Representative verify کریں"
      />

      <section className="bg-brand-background" dir="ltr" lang="en">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-navy">
              How the code check works
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Ask the person for their ChinaPak ImportHub representative code,
              then enter it here. The result only confirms whether that code is
              registered and active. It is not permission to send money to a
              personal account.
            </p>
            <div className="mt-5 grid gap-3">
              {[
                "Use only official ChinaPak ImportHub payment instructions.",
                "Do not send money to personal accounts or unofficial numbers.",
                "Public lookup shows safe identity fields only.",
                "Contact support if the code is invalid, suspended, or unclear.",
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

          <RepresentativeVerificationForm />
        </div>
      </section>
    </main>
  );
}
