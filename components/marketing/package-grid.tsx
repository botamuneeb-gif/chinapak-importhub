import { Button } from "@/components/ui/button";
import { brand, ROUTES, type PackagePlan } from "@/config/brand";

type PackageGridProps = {
  packages?: readonly PackagePlan[];
};

export function PackageGrid({ packages = brand.packages }: PackageGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3" dir="ltr" lang="en">
      {packages.map((plan) => (
        <article
          className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          key={plan.id}
        >
          <p
            className="urdu-text text-sm font-semibold text-brand-emerald"
            dir="rtl"
            lang="ur"
          >
            {plan.urduName}
          </p>
          <h3 className="mt-2 text-xl font-bold text-brand-navy">{plan.name}</h3>
          <p className="mt-3 text-3xl font-bold text-brand-navy">{plan.price}</p>
          <dl className="mt-4 grid gap-2 border-y border-slate-200 py-4 text-sm">
            <div>
              <dt className="font-semibold text-brand-navy">Best for</dt>
              <dd className="mt-1 text-brand-muted">{plan.bestFor}</dd>
            </div>
            <div>
              <dt className="font-semibold text-brand-navy">Factory options</dt>
              <dd className="mt-1 text-brand-muted">{plan.factoryOptions}</dd>
            </div>
            <div>
              <dt className="font-semibold text-brand-navy">Delivery target</dt>
              <dd className="mt-1 text-brand-muted">{plan.deliveryTarget}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            {plan.summary}
          </p>
          <ul className="mt-5 flex-1 space-y-3 text-sm leading-7 text-brand-muted">
            {plan.includes.map((item) => (
              <li className="border-s-4 border-brand-emerald ps-3" key={item}>
                {item}
              </li>
            ))}
          </ul>
          <Button className="mt-6" href={ROUTES.importerStart}>
            <span className="mixed-language" dir="rtl" lang="ur">
              Import Project شروع کریں
            </span>
          </Button>
        </article>
      ))}
    </div>
  );
}

