import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { ROUTES } from "@/config/brand";
import {
  buildFaqJsonLd,
  buildServiceJsonLd,
  publicCtas,
  type PublicSeoPage,
} from "@/config/public-site";

type PublicSeoPageViewProps = {
  page: PublicSeoPage;
};

export function PublicSeoPageView({ page }: PublicSeoPageViewProps) {
  const jsonLd = page.faq
    ? [buildServiceJsonLd(page), buildFaqJsonLd(page.faq)]
    : buildServiceJsonLd(page);

  return (
    <main>
      <JsonLd data={jsonLd} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-emerald">
              ChinaPak ImportHub
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-brand-navy sm:text-5xl">
              {page.h1}
            </h1>
            {page.supportUrdu ? (
              <p
                className="urdu-text mt-5 text-lg font-semibold text-brand-navy"
                dir="rtl"
                lang="ur"
              >
                {page.supportUrdu}
              </p>
            ) : null}
            <p className="mt-5 max-w-3xl text-base leading-8 text-brand-muted sm:text-lg">
              {page.intro}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href={ROUTES.importerStart} variant="secondary">
                {page.ctaLabel ?? publicCtas.startProject}
              </Button>
              <Button href={ROUTES.packages} variant="outline">
                {publicCtas.comparePackages}
              </Button>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-brand-background p-5 shadow-sm">
            <h2 className="text-xl font-bold text-brand-navy">
              Platform-safe sourcing
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-muted">
              <li>Every request is tracked as an Import Project ID.</li>
              <li>Admin reviews payment, requirements, FMS work, and reports.</li>
              <li>No direct importer-FMS contact is built into the platform.</li>
              <li>Factory contacts and raw submissions remain protected.</li>
            </ul>
            <Link
              className="mt-5 inline-flex font-semibold text-brand-emerald hover:text-brand-navy"
              href="/trust-safety"
            >
              View trust and safety rules
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-brand-background">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-3">
          {page.sections.map((section) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={section.title}
            >
              <div className="mb-4 h-1.5 w-14 rounded-lg bg-brand-gold" />
              <h2 className="text-xl font-bold leading-8 text-brand-navy">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {page.faq ? (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-sm font-bold text-brand-emerald">FAQ</p>
              <h2 className="mt-2 text-3xl font-bold text-brand-navy">
                Common questions before starting
              </h2>
            </div>
            <div className="mt-6 grid gap-4">
              {page.faq.map((item) => (
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
      ) : null}

      <section className="bg-brand-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold text-brand-gold">
              Ready to move from idea to Import Project?
            </p>
            <h2
              className="urdu-text mt-3 text-3xl font-bold leading-tight sm:text-4xl"
              dir="rtl"
              lang="ur"
            >
              اپنا امپورٹ پراجیکٹ شروع کریں
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">
              Submit product details, choose a package, and keep the workflow
              under ChinaPak ImportHub admin review.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.importerStart} variant="gold">
              {publicCtas.startProject}
            </Button>
            <Button href={ROUTES.contact} variant="lightOutline">
              {publicCtas.localSupport}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
