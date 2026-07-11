import { Button } from "@/components/ui/button";
import { getImporterPackageDetail } from "@/config/importer-packages";
import type { PricingPackage } from "@/config/pricing";
import { cn } from "@/lib/utils";

type PackageCardProps = {
  plan: PricingPackage;
};

export function PackageCard({ plan }: PackageCardProps) {
  const detail = getImporterPackageDetail(plan.id);

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

      <div className="mt-4 rounded-lg border border-slate-200 bg-brand-background p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
          Recommended use
        </p>
        <p className="mt-1 text-sm font-semibold leading-6 text-brand-navy">
          {detail.recommendedUseCase}
        </p>
      </div>

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

      <div className="mt-4 grid gap-4 text-sm">
        <div>
          <p className="font-bold text-brand-navy">What importer gets</p>
          <ul className="mt-2 grid gap-2 leading-6 text-brand-muted">
            {detail.whatImporterGets.map((item) => (
              <li className="border-s-4 border-brand-emerald ps-3" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-bold text-brand-navy">Not included</p>
          <ul className="mt-2 grid gap-2 leading-6 text-brand-muted">
            {detail.notIncluded.map((item) => (
              <li className="border-s-4 border-brand-gold ps-3" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-brand-gold bg-amber-50 p-3 text-sm font-semibold leading-6 text-brand-navy">
        Next step: {detail.expectedNextStep}
      </div>

      <Button className="mt-5" href={detail.startHref} variant={plan.recommended ? "secondary" : "primary"}>
        Start with this package
      </Button>
    </article>
  );
}
