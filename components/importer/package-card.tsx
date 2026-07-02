import { FlowIcon } from "@/components/importer/flow-icon";
import type { ImportPackage } from "@/config/import-project";
import { cn } from "@/lib/utils";

type PackageCardProps = {
  isSelected: boolean;
  onSelect: () => void;
  plan: ImportPackage;
};

export function PackageCard({ isSelected, onSelect, plan }: PackageCardProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "relative flex h-full w-full flex-col rounded-lg border bg-white p-5 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold",
        plan.recommended && "border-brand-gold",
        isSelected && "border-brand-emerald ring-2 ring-brand-emerald/20",
      )}
      onClick={onSelect}
      type="button"
    >
      {plan.recommended ? (
        <span className="mb-4 inline-flex w-fit rounded-lg bg-brand-gold px-3 py-1 text-xs font-bold text-brand-navy">
          Recommended
        </span>
      ) : null}
      <span className="text-xl font-bold text-brand-navy">{plan.name}</span>
      <span className="mt-2 text-3xl font-bold text-brand-navy">
        {plan.price}
      </span>
      <span className="mt-3 text-sm leading-7 text-brand-muted">
        {plan.bestFor}
      </span>
      <span className="mt-4 font-semibold text-brand-navy">Includes</span>
      <span className="mt-3 grid gap-2 text-sm leading-6 text-brand-muted">
        {plan.includes.map((item) => (
          <span className="flex items-start gap-2" key={item}>
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
              <FlowIcon name="check" />
            </span>
            <span>{item}</span>
          </span>
        ))}
      </span>
      <span className="mt-4 rounded-lg bg-brand-background px-3 py-2 text-sm font-semibold text-brand-navy">
        Delivery: {plan.delivery}
      </span>
    </button>
  );
}
