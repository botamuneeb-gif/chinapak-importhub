import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { PlaceholderNotice } from "@/components/ui/placeholder-notice";
import {
  getPublicPageMetadata,
  publicSeoPages,
} from "@/config/public-site";

export const metadata: Metadata = getPublicPageMetadata("contact");

const contactReasons = [
  "Importer project question",
  "FMS candidate interest",
  "Pakistani local agent partnership",
  "Factory onboarding for future activation",
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
            <PlaceholderNotice
              title="Contact form placeholder"
              body="No message is submitted from this page yet. A future backend should route inquiries to admin queues without exposing private role contact details."
            />
            <form
              aria-label="Contact placeholder form"
              className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <label
                className="block text-sm font-semibold text-brand-navy"
                htmlFor="contact-reason"
              >
                Inquiry type
              </label>
              <select
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-brand-muted"
                disabled
                id="contact-reason"
              >
                {contactReasons.map((reason) => (
                  <option key={reason}>{reason}</option>
                ))}
              </select>
              <Button className="mt-4 w-full" disabled type="submit">
                Contact routing will connect later
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
