import { SectionHeading } from "@/components/ui/section-heading";
import { homeContent } from "@/config/home";

export function CoreAdvantage() {
  const { coreAdvantage } = homeContent;

  return (
    <section
      className="urdu-text bg-white"
      dir="rtl"
      id="core-advantage"
      lang="ur"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading
          eyebrow={coreAdvantage.eyebrow}
          intro={coreAdvantage.intro}
          title={coreAdvantage.heading}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" dir="ltr" lang="en">
          {coreAdvantage.cards.map((card) => (
            <article
              className="rounded-lg border border-slate-200 bg-brand-background p-5 shadow-sm"
              key={card.title}
            >
              <div className="mb-4 h-1.5 w-14 rounded-lg bg-brand-gold" />
              <h3 className="text-lg font-bold leading-7 text-brand-navy">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
