import type { Metadata } from "next";
import { CoreAdvantage } from "@/components/marketing/core-advantage";
import { FinalCta } from "@/components/marketing/final-cta";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { HomeHero } from "@/components/marketing/home-hero";
import { PackageGrid } from "@/components/marketing/package-grid";
import { TrustSection } from "@/components/marketing/trust-section";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { homeContent } from "@/config/home";
import { ROUTES, brand } from "@/config/brand";
import {
  buildFaqJsonLd,
  buildServiceJsonLd,
  homepagePolish,
  publicFaqs,
} from "@/config/public-site";

export const metadata: Metadata = {
  title: "ChinaPak ImportHub | چین جائے بغیر فیکٹری تک رسائی حاصل کریں",
  description:
    "ChinaPak ImportHub helps Pakistani importers access Chinese factories, review factory-side product evidence, reduce unnecessary middlemen, and start an Import Project without traveling to China.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChinaPak ImportHub | Direct China Factory Access",
    description:
      "Admin-reviewed China factory sourcing support for Pakistani importers, shopkeepers, wholesalers, and first-time importers.",
    siteName: brand.name,
    type: "website",
    url: `https://${brand.domain}`,
  },
};

export default function HomePage() {
  const serviceJsonLd = buildServiceJsonLd({
    canonicalPath: "/",
    description: metadata.description as string,
    h1: "ChinaPak ImportHub",
    intro: homeContent.hero.subheadline,
    sections: [],
    title: metadata.title as string,
  });

  return (
    <main>
      <JsonLd data={[serviceJsonLd, buildFaqJsonLd(publicFaqs)]} />
      <HomeHero />
      <section className="bg-white" aria-label="ChinaPak ImportHub trust gates">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-6 sm:px-6 md:grid-cols-4">
          {homepagePolish.trustBanner.map((item) => (
            <article
              className="rounded-lg border border-slate-200 bg-brand-background p-4 shadow-sm"
              key={item.label}
            >
              <h2 className="text-sm font-bold text-brand-navy">
                {item.label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {item.value}
              </p>
            </article>
          ))}
        </div>
      </section>
      <CoreAdvantage />
      <HowItWorks />
      <TrustSection />
      <section className="bg-brand-background">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-2">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-brand-emerald">
              No China travel required
            </p>
            <h2 className="mt-2 text-3xl font-bold text-brand-navy">
              Why not travel to China first?
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-brand-muted">
              {homepagePolish.whyTravel.map((item) => (
                <li className="border-s-4 border-brand-gold ps-3" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-brand-emerald">
              Factory-level visibility
            </p>
            <h2 className="mt-2 text-3xl font-bold text-brand-navy">
              Why direct factory access matters
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-brand-muted">
              {homepagePolish.directFactory.map((item) => (
                <li className="border-s-4 border-brand-emerald ps-3" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-3">
            <article className="rounded-lg border border-slate-200 bg-brand-background p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-brand-navy">
                Who this is for
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-brand-muted">
                {homepagePolish.whoFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-lg border border-slate-200 bg-brand-background p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-brand-navy">
                What you get
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-brand-muted">
                {homepagePolish.whatYouGet.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article
              className="urdu-text rounded-lg border border-brand-gold bg-amber-50 p-6 text-brand-navy shadow-sm"
              dir="rtl"
              lang="ur"
            >
              <h2 className="text-2xl font-bold">What we do not promise</h2>
              <ul className="mt-5 space-y-3 text-sm leading-8">
                {homepagePolish.notPromise.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section
        className="urdu-text bg-brand-background"
        dir="rtl"
        id="packages-preview"
        lang="ur"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionHeading
            eyebrow={homeContent.packages.eyebrow}
            intro={homeContent.packages.intro}
            title={homeContent.packages.heading}
          />
          <div className="mt-8">
            <PackageGrid />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.packages} variant="outline">
              Compare Packages
            </Button>
            <Button href={ROUTES.importerStart} variant="secondary">
              <span className="mixed-language" dir="rtl" lang="ur">
                مدد کے لیے پراجیکٹ محفوظ کریں
              </span>
            </Button>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-brand-emerald">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold text-brand-navy">
              Questions Pakistani importers ask before starting
            </h2>
          </div>
          <div className="mt-6 grid gap-4">
            {publicFaqs.map((item) => (
              <details
                className="rounded-lg border border-slate-200 bg-brand-background p-5"
                key={item.question}
              >
                <summary className="cursor-pointer text-lg font-bold text-brand-navy">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </main>
  );
}
