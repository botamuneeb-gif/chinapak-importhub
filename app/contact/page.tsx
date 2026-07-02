import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import {
  getPublicPageMetadata,
  publicSeoPages,
} from "@/config/public-site";

export const metadata: Metadata = getPublicPageMetadata("contact");

const contactReasons = [
  "Importer project question",
  "FMS candidate interest",
  "Pakistani local agent partnership",
  "Factory partnership inquiry",
];

export default function ContactPage() {
  const page = publicSeoPages.contact;

  return (
    <main>
      <PageHero
        eyebrow="Admin-controlled contact"
        intro={page.intro}
        title={page.h1}
      />

      <section className="bg-brand-background">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p
              className="urdu-text text-lg font-semibold text-brand-navy"
              dir="rtl"
              lang="ur"
            >
              {page.supportUrdu}
            </p>
            <div className="mt-5 grid gap-4">
              {page.sections.map((section) => (
                <article
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                  key={section.title}
                >
                  <h2 className="text-xl font-bold text-brand-navy">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-brand-muted">
                    {section.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-bold text-brand-navy">
                Choose the right next step
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                ChinaPak ImportHub keeps importer, FMS, and factory
                communication inside approved platform workflows. For launch,
                the fastest route is to start an Import Project or verify a
                representative before sharing payment details.
              </p>
              <div className="mt-5 grid gap-3">
                {contactReasons.map((reason) => (
                  <div
                    className="rounded-lg border border-slate-200 bg-brand-background px-4 py-3 text-sm font-semibold text-brand-navy"
                    key={reason}
                  >
                    {reason}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button href={ROUTES.importerStart}>
                  Start Import Project
                </Button>
                <Button href={ROUTES.verify} variant="outline">
                  Verify first
                </Button>
                <Button href={ROUTES.verifyRepresentative} variant="secondary">
                  Representative Code Check
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
