import type { SeoArticleSection as SeoArticleSectionType } from "@/config/seo-content";

type ArticleSectionProps = {
  section: SeoArticleSectionType;
};

export function ArticleSection({ section }: ArticleSectionProps) {
  return (
    <section className="border-b border-slate-200 py-7 first:pt-0 last:border-b-0 last:pb-0">
      <h2 className="text-2xl font-bold leading-tight text-brand-navy">
        {section.heading}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-8 text-brand-muted">
        {section.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {section.bullets ? (
        <ul className="mt-5 grid gap-3 text-sm leading-7 text-brand-muted sm:grid-cols-2">
          {section.bullets.map((bullet) => (
            <li
              className="rounded-lg border border-slate-200 bg-brand-background p-3"
              key={bullet}
            >
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
