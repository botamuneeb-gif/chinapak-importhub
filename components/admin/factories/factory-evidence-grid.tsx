import type { FactoryRecord } from "@/config/factory-database";

type FactoryEvidenceGridProps = {
  evidence: FactoryRecord["evidence"];
};

export function FactoryEvidenceGrid({ evidence }: FactoryEvidenceGridProps) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {evidence.map((item) => (
          <article
            className="rounded-lg border border-dashed border-slate-300 bg-brand-background p-4"
            key={item.label}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-brand-navy">{item.label}</h3>
              <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-brand-emerald">
                {item.count}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-brand-muted">{item.note}</p>
          </article>
        ))}
      </div>
      <p className="mt-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
        Actual files will later be stored in object storage and linked to this
        record.
      </p>
    </div>
  );
}
