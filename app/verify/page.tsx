import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrustCard } from "@/components/verification/trust-card";
import { VerifyHero } from "@/components/verification/verify-hero";
import { trustCards, verificationOptions } from "@/config/agents";
import { ROUTES } from "@/config/brand";
import { getSiteUrl } from "@/config/site-url";

const siteUrl = getSiteUrl();

type VerifyPageProps = {
  searchParams?: Promise<{
    ref?: string | string[];
  }>;
};

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export const metadata: Metadata = {
  title: "Verify ChinaPak ImportHub | ChinaPak ImportHub",
  description:
    "Verify ChinaPak ImportHub or a local representative before starting your Import Project.",
  alternates: {
    canonical: "/verify",
  },
  openGraph: {
    description:
      "Verify the platform or a local representative before submitting an Import Project or payment.",
    title: "Verify ChinaPak ImportHub",
    type: "website",
    url: `${siteUrl}/verify`,
  },
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = searchParams ? await searchParams : {};
  const reference = getSingleParam(params.ref).trim();

  return (
    <main>
      <VerifyHero
        actions={
          <>
            <Button href={ROUTES.verifyRepresentative} variant="secondary">
              Verify Representative
            </Button>
            <Button href={ROUTES.importerStart} variant="outline">
              Start Import Project
            </Button>
          </>
        }
        englishSupport="Verify ChinaPak ImportHub before starting your Import Project."
        headline="پہلے ہمیں verify کریں، پھر order دیں"
      />

      {reference ? (
        <section className="bg-white" dir="ltr" lang="en">
          <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
            <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-emerald">
                Document reference received
              </p>
              <h2
                className="mt-2 break-all text-2xl font-bold text-brand-navy"
                translate="no"
              >
                {reference}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
                This public page confirms only that you scanned a ChinaPak
                ImportHub verification reference. It does not reveal private
                invoice, project, payment, refund, or report data. Contact
                official support with this reference if you need verification.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-brand-background" dir="ltr" lang="en">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trustCards.map((card) => (
              <TrustCard body={card.body} key={card.title} title={card.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" dir="ltr" lang="en">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-brand-emerald">
              Verification options
            </p>
            <h2 className="mt-2 text-3xl font-bold text-brand-navy">
              Confirm before payment or project submission
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {verificationOptions.map((option) => (
              <Link
                className="rounded-lg border border-slate-200 bg-brand-background p-5 no-underline shadow-sm transition hover:border-brand-emerald"
                href={option.href}
                key={option.title}
              >
                <h3 className="text-xl font-bold text-brand-navy">
                  {option.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {option.body}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-background" dir="rtl" lang="ur">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-lg border border-brand-error bg-red-50 p-5 text-brand-navy shadow-sm">
            <h2 className="urdu-text text-2xl font-bold text-brand-error">
              حفاظتی نوٹس
            </h2>
            <p className="urdu-text mt-3 text-sm leading-8">
              صرف approved ChinaPak ImportHub payment methods کے ذریعے payment
              کریں۔ Unofficial accounts یا personal numbers پر payment نہ کریں۔
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
