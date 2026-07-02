import type { FactoryRecord } from "@/config/factory-database";

type FactoryMatchingPanelProps = {
  factory: FactoryRecord;
};

function BoolValue({ value }: { value: boolean }) {
  return (
    <span className={value ? "font-bold text-brand-emerald" : "font-bold text-brand-error"}>
      {value ? "Yes" : "No"}
    </span>
  );
}

export function FactoryMatchingPanel({ factory }: FactoryMatchingPanelProps) {
  const matching = factory.matching;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg bg-brand-background p-4">
        <p className="text-sm font-semibold text-brand-navy">
          Best-fit product categories
        </p>
        <p className="mt-2 text-sm leading-7 text-brand-muted">
          {matching.bestFitProductCategories.join(", ")}
        </p>
      </div>
      <div className="rounded-lg bg-brand-background p-4">
        <p className="text-sm font-semibold text-brand-navy">Typical MOQ</p>
        <p className="mt-2 text-sm leading-7 text-brand-muted">
          {matching.typicalMoq}
        </p>
      </div>
      <div className="rounded-lg bg-brand-background p-4">
        <p className="text-sm font-semibold text-brand-navy">
          Suitable budget ranges
        </p>
        <p className="mt-2 text-sm leading-7 text-brand-muted">
          {matching.suitableBudgetRanges.join(", ")}
        </p>
      </div>
      <div className="rounded-lg bg-brand-background p-4">
        <p className="text-sm font-semibold text-brand-navy">
          Package eligibility
        </p>
        <p className="mt-2 text-sm leading-7 text-brand-muted">
          {matching.packageEligibility.join(", ")}
        </p>
      </div>
      <div className="rounded-lg bg-brand-background p-4">
        <p className="text-sm font-semibold text-brand-navy">
          Reliability score
        </p>
        <p className="mt-2 text-2xl font-bold text-brand-navy">
          {matching.reliabilityScore}
        </p>
      </div>
      <div className="rounded-lg bg-brand-background p-4">
        <p className="text-sm font-semibold text-brand-navy">
          On-time response score
        </p>
        <p className="mt-2 text-2xl font-bold text-brand-navy">
          {matching.onTimeResponseScore}
        </p>
      </div>
      <div className="rounded-lg bg-brand-background p-4">
        <p className="text-sm font-semibold text-brand-navy">
          Recommended for small importers
        </p>
        <p className="mt-2 text-sm">
          <BoolValue value={matching.recommendedForSmallImporters} />
        </p>
      </div>
      <div className="rounded-lg bg-brand-background p-4">
        <p className="text-sm font-semibold text-brand-navy">
          Recommended for repeat importers
        </p>
        <p className="mt-2 text-sm">
          <BoolValue value={matching.recommendedForRepeatImporters} />
        </p>
      </div>
    </div>
  );
}
