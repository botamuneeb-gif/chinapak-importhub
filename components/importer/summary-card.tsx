import type { ImportAddOn, ImportPackage } from "@/config/import-project";

type SummaryCardProps = {
  addOns: readonly ImportAddOn[];
  budget: string;
  experience: string;
  packagePlan: ImportPackage;
  productDetails: string;
  productLink: string;
  quantity: string;
  qualityLevel: string;
  specialNotes: string;
  usedPhotoPlaceholder: boolean;
  usedVoicePlaceholder: boolean;
};

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0">
      <dt className="text-sm font-semibold text-brand-navy">{label}</dt>
      <dd className="mt-1 text-sm leading-7 text-brand-muted">{value}</dd>
    </div>
  );
}

export function SummaryCard({
  addOns,
  budget,
  experience,
  packagePlan,
  productDetails,
  productLink,
  quantity,
  qualityLevel,
  specialNotes,
  usedPhotoPlaceholder,
  usedVoicePlaceholder,
}: SummaryCardProps) {
  const productSummary = [
    productDetails || "Details not typed",
    productLink ? `Link: ${productLink}` : "",
    usedPhotoPlaceholder ? "Product photo selected" : "",
    usedVoicePlaceholder ? "Voice note selected" : "",
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold text-brand-navy">Order Summary</h2>
      <p className="mt-2 text-sm leading-7 text-brand-muted">
        پہلے ہمیں verify کریں، پھر order دیں۔
      </p>

      <dl className="mt-5">
        <SummaryRow label="Product details summary" value={productSummary} />
        <SummaryRow label="Budget" value={budget} />
        <SummaryRow label="Quantity" value={quantity} />
        <SummaryRow label="Quality level" value={qualityLevel} />
        <SummaryRow label="Experience level" value={experience} />
        <SummaryRow
          label="Selected package"
          value={`${packagePlan.name} — ${packagePlan.price}`}
        />
        <SummaryRow
          label="Selected add-ons"
          value={
            addOns.length > 0
              ? addOns.map((addOn) => `${addOn.name} (${addOn.price})`).join(", ")
              : "No add-ons selected"
          }
        />
        <SummaryRow
          label="Estimated service fee"
          value={`${packagePlan.price} base service fee. Selected add-ons are confirmed during admin payment review.`}
        />
        <SummaryRow label="Delivery timeframe" value={packagePlan.delivery} />
        {specialNotes ? (
          <SummaryRow label="Special notes" value={specialNotes} />
        ) : null}
      </dl>

      <div className="mt-5 rounded-lg border border-brand-gold bg-brand-background p-4 text-sm leading-7 text-brand-navy">
        Full refund is available before FMS assignment. After FMS assignment,
        refund requests are reviewed by admin based on completed milestones.
      </div>
    </div>
  );
}
