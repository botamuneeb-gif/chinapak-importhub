import type { AddOnService, PricingPackage } from "@/config/pricing";

type PriceSummaryProps = {
  estimatedTotal: string;
  projectId: string;
  selectedAddOns: AddOnService[];
  selectedPackage: PricingPackage;
  subtotal: string;
};

export function PriceSummary({
  estimatedTotal,
  projectId,
  selectedAddOns,
  selectedPackage,
  subtotal,
}: PriceSummaryProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-brand-navy">Price Summary</h2>
      <dl className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <dt className="font-semibold text-brand-navy">Project ID</dt>
          <dd className="text-brand-muted">{projectId}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <dt className="font-semibold text-brand-navy">Selected package</dt>
          <dd className="text-right text-brand-muted">
            {selectedPackage.name} · {selectedPackage.price}
          </dd>
        </div>
        <div className="border-b border-slate-200 pb-3">
          <dt className="font-semibold text-brand-navy">Selected add-ons</dt>
          <dd className="mt-2 text-brand-muted">
            {selectedAddOns.length > 0
              ? selectedAddOns
                  .map((addOn) => `${addOn.name} (${addOn.price})`)
                  .join(", ")
              : "No add-ons selected yet"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <dt className="font-semibold text-brand-navy">Subtotal</dt>
          <dd className="text-brand-muted">{subtotal}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-base font-bold text-brand-navy">Estimated total</dt>
          <dd className="text-xl font-bold text-brand-emerald">
            {estimatedTotal}
          </dd>
        </div>
      </dl>
    </section>
  );
}
