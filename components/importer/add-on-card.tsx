import { FlowIcon } from "@/components/importer/flow-icon";
import type { ImportAddOn } from "@/config/import-project";
import { cn } from "@/lib/utils";

type AddOnCardProps = {
  addOn: ImportAddOn;
  isSelected: boolean;
  onToggle: () => void;
};

export function AddOnCard({ addOn, isSelected, onToggle }: AddOnCardProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold",
        isSelected
          ? "border-brand-emerald ring-2 ring-brand-emerald/20"
          : "border-slate-200",
      )}
      onClick={onToggle}
      type="button"
    >
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isSelected
            ? "bg-brand-emerald text-white"
            : "bg-brand-background text-brand-navy",
        )}
      >
        <FlowIcon name={isSelected ? "check" : "box"} />
      </span>
      <span>
        <span className="block font-bold text-brand-navy">{addOn.name}</span>
        <span className="mt-1 block text-sm text-brand-muted">
          {addOn.price}
        </span>
      </span>
    </button>
  );
}
