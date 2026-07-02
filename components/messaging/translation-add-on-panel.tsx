import { translationAddOns } from "@/config/messaging";

type TranslationAddOnPanelProps = {
  active: boolean;
};

export function TranslationAddOnPanel({ active }: TranslationAddOnPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">
            Translation Add-on Panel
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Planned support for Urdu ↔ Chinese, English ↔ Chinese, voice notes,
            documents, and live factory call translation.
          </p>
        </div>
        <span className="rounded-lg bg-brand-background px-3 py-1 text-xs font-bold text-brand-navy">
          {active ? "AI Trade Translation Active" : "Translation add-on inactive"}
        </span>
      </div>

      {!active ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {translationAddOns.map((addOn) => (
            <article
              className="rounded-lg border border-slate-200 bg-brand-background p-4"
              key={addOn.name}
            >
              <h3 className="font-bold text-brand-navy">{addOn.name}</h3>
              <p className="mt-2 text-sm font-semibold text-brand-emerald">
                {addOn.price}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-brand-emerald bg-emerald-50 p-4 text-sm font-semibold text-brand-emerald">
          Translation support is marked active for this placeholder project
          thread.
        </div>
      )}

      <p className="mt-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
        AI translations support communication. Legal contracts, technical
        specifications, certifications, and payment terms may require admin or
        human review.
      </p>
    </section>
  );
}
