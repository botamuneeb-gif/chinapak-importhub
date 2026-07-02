import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import type { PricingPackage } from "@/config/pricing";
import { cn } from "@/lib/utils";

type PackageCardProps = {
  plan: PricingPackage;
};

export function PackageCard({ plan }: PackageCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border bg-white p-5 shadow-sm",
        plan.recommended ? "border-brand-emerald ring-2 ring-brand-emerald/15" : "border-slate-200",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">{plan.name}</h2>
          <p className="mt-2 text-sm font-semibold text-brand-muted">
            {plan.bestForBudget}
          </p>
        </div>
        {plan.recommended ? (
          <span className="rounded-lg bg-brand-emerald px-3 py-1 text-xs font-bold text-white">
            Recommended
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-3xl font-bold text-brand-navy">{plan.price}</p>
      <p className="mt-3 text-sm leading-7 text-brand-muted">
        {plan.bestForSummary}
      </p>

      <ul className="mt-5 flex-1 space-y-3 text-sm leading-7 text-brand-muted">
        {plan.deliverables.map((item) => (
          <li className="border-s-4 border-brand-emerald ps-3" key={item}>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-lg bg-brand-background p-3 text-sm font-semibold text-brand-navy">
        Delivery timeframe: {plan.deliveryTimeframe}
      </div>

      <Button className="mt-5" href={ROUTES.importerStart} variant={plan.recommended ? "secondary" : "primary"}>
        Start Import Project
      </Button>
    </article>
  );
}
