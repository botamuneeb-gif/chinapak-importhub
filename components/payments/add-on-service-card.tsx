import type { AddOnService } from "@/config/pricing";
import { cn } from "@/lib/utils";

type AddOnServiceCardProps = {
  addOn: AddOnService;
};

export function AddOnServiceCard({ addOn }: AddOnServiceCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-5 shadow-sm",
        addOn.highlighted ? "border-brand-gold bg-amber-50" : "border-slate-200",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-brand-navy">{addOn.name}</h3>
        {addOn.highlighted ? (
          <span className="rounded-lg bg-brand-gold px-3 py-1 text-xs font-bold text-brand-navy">
            Highlighted
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-xl font-bold text-brand-emerald">{addOn.price}</p>
      <p className="mt-3 text-sm leading-7 text-brand-muted">{addOn.note}</p>
    </article>
  );
}
