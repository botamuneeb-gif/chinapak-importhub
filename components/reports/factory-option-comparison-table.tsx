type FactoryOptionComparisonItem = {
  cityProvince: string;
  currency: string;
  estimatedUnitPrice: string;
  evidenceSummary?: string;
  factoryLabel: string;
  moq: string;
  overallScore?: number;
  overallScoreLabel?: string;
  productMatchSummary: string;
  productionLeadTime: string;
  recommendationStatusLabel?: string;
  recommended?: boolean;
  riskLevelLabel?: string;
  riskSummary?: string;
  visibleFields?: string[];
};

type FactoryOptionComparisonTableProps = {
  caption?: string;
  options: FactoryOptionComparisonItem[];
};

function visible(option: FactoryOptionComparisonItem, field: string) {
  return !option.visibleFields || option.visibleFields.includes(field);
}

function scoreLabel(option: FactoryOptionComparisonItem) {
  if (typeof option.overallScore !== "number") {
    return "Review pending";
  }

  return `${option.overallScore}/100${
    option.overallScoreLabel ? ` · ${option.overallScoreLabel}` : ""
  }`;
}

export function FactoryOptionComparisonTable({
  caption = "Factory option comparison",
  options,
}: FactoryOptionComparisonTableProps) {
  if (options.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-brand-muted">
        No factory options are available for comparison yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white lg:block">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-brand-background text-xs uppercase text-brand-muted">
            <tr>
              <th className="px-4 py-3 font-black">Factory option</th>
              <th className="px-4 py-3 font-black">Location</th>
              <th className="px-4 py-3 font-black">Product match</th>
              <th className="px-4 py-3 font-black">Price</th>
              <th className="px-4 py-3 font-black">MOQ</th>
              <th className="px-4 py-3 font-black">Lead time</th>
              <th className="px-4 py-3 font-black">Evidence</th>
              <th className="px-4 py-3 font-black">Risk</th>
              <th className="px-4 py-3 font-black">Score</th>
              <th className="px-4 py-3 font-black">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {options.map((option, index) => (
              <tr className="align-top" key={`${option.factoryLabel}-${index}`}>
                <td className="px-4 py-4 font-bold text-brand-navy">
                  {option.factoryLabel}
                  {option.recommended ? (
                    <span className="mt-2 block w-fit rounded-lg border border-brand-emerald bg-emerald-50 px-2 py-1 text-xs font-black text-brand-emerald">
                      Recommended
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-4 text-brand-text">
                  {visible(option, "cityProvince") ? option.cityProvince : "Hidden"}
                </td>
                <td className="px-4 py-4 leading-6 text-brand-text">
                  {visible(option, "productMatchSummary")
                    ? option.productMatchSummary
                    : "Hidden"}
                </td>
                <td className="px-4 py-4 font-semibold text-brand-text">
                  {visible(option, "estimatedUnitPrice")
                    ? `${option.estimatedUnitPrice} ${option.currency}`
                    : "Hidden"}
                </td>
                <td className="px-4 py-4 text-brand-text">
                  {visible(option, "moq") ? option.moq : "Hidden"}
                </td>
                <td className="px-4 py-4 text-brand-text">
                  {visible(option, "productionLeadTime")
                    ? option.productionLeadTime
                    : "Hidden"}
                </td>
                <td className="px-4 py-4 leading-6 text-brand-text">
                  {option.evidenceSummary ?? "Evidence review pending"}
                </td>
                <td className="px-4 py-4 leading-6 text-brand-text">
                  <span className="font-bold">
                    {option.riskLevelLabel ?? "Needs review"}
                  </span>
                  {visible(option, "riskSummary") && option.riskSummary ? (
                    <span className="mt-1 block text-brand-muted">
                      {option.riskSummary}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-4 font-bold text-brand-navy">
                  {scoreLabel(option)}
                </td>
                <td className="px-4 py-4 font-bold text-brand-navy">
                  {option.recommendationStatusLabel ?? "Review pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {options.map((option, index) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={`${option.factoryLabel}-mobile-${index}`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-base font-black text-brand-navy">
                {option.factoryLabel}
              </h3>
              <span className="w-fit rounded-lg border border-brand-emerald bg-emerald-50 px-3 py-1 text-xs font-black text-brand-emerald">
                {option.recommendationStatusLabel ?? "Review pending"}
              </span>
            </div>
            <dl className="mt-4 grid gap-3">
              {[
                ["Location", visible(option, "cityProvince") ? option.cityProvince : "Hidden"],
                [
                  "Product match",
                  visible(option, "productMatchSummary")
                    ? option.productMatchSummary
                    : "Hidden",
                ],
                [
                  "Price",
                  visible(option, "estimatedUnitPrice")
                    ? `${option.estimatedUnitPrice} ${option.currency}`
                    : "Hidden",
                ],
                ["MOQ", visible(option, "moq") ? option.moq : "Hidden"],
                [
                  "Lead time",
                  visible(option, "productionLeadTime")
                    ? option.productionLeadTime
                    : "Hidden",
                ],
                ["Evidence", option.evidenceSummary ?? "Evidence review pending"],
                ["Risk", option.riskLevelLabel ?? "Needs review"],
                ["Score", scoreLabel(option)],
              ].map(([label, value]) => (
                <div className="rounded-lg bg-brand-background p-3" key={label}>
                  <dt className="text-xs font-bold uppercase text-brand-muted">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-brand-navy">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
