import type { SeoFaqItem } from "@/config/seo-content";

type SeoFaqProps = {
  items: SeoFaqItem[];
  title?: string;
};

export function SeoFaq({ items, title = "Common questions" }: SeoFaqProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 rounded-lg border border-slate-200 bg-brand-background p-5">
      <h2 className="text-2xl font-bold text-brand-navy">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
            key={item.question}
          >
            <h3 className="text-lg font-bold text-brand-navy">
              {item.question}
            </h3>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
