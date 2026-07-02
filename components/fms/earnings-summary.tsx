import { FmsStatusBadge } from "@/components/fms/fms-status-badge";
import {
  compensationRanges,
  earningRecords,
  earningsSummary,
} from "@/config/fms-portal";

export function EarningsSummary() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy">Earnings Summary</h2>
        <dl className="mt-5 grid gap-3">
          {Object.entries(earningsSummary).map(([key, value]) => (
            <div
              className="rounded-lg bg-brand-background p-4"
              key={key}
            >
              <dt className="text-sm font-semibold capitalize text-brand-muted">
                {key.replace(/([A-Z])/g, " $1")}
              </dt>
              <dd className="mt-2 text-xl font-bold text-brand-navy">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy">Compensation Ranges</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {compensationRanges.map((range) => (
            <article className="rounded-lg border border-slate-200 bg-brand-background p-4" key={range.tier}>
              <h3 className="text-lg font-bold text-brand-navy">{range.tier}</h3>
              <p className="mt-2 text-sm font-semibold text-brand-emerald">
                {range.pkr}
              </p>
              <p className="mt-1 text-sm text-brand-muted">{range.cny}</p>
              <p className="mt-3 text-sm leading-6 text-brand-muted">
                {range.useCase}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full text-left text-sm" aria-label="Earning records">
            <thead className="bg-brand-navy text-white">
              <tr>
                <th className="px-4 py-3" scope="col">Assignment</th>
                <th className="px-4 py-3" scope="col">Tier</th>
                <th className="px-4 py-3" scope="col">Status</th>
                <th className="px-4 py-3" scope="col">PKR</th>
                <th className="px-4 py-3" scope="col">CNY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {earningRecords.map((record) => (
                <tr key={record.assignmentId}>
                  <td className="px-4 py-3 font-semibold text-brand-navy">
                    {record.assignmentId}
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{record.tier}</td>
                  <td className="px-4 py-3">
                    <FmsStatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{record.amountPkr}</td>
                  <td className="px-4 py-3 text-brand-muted">{record.amountCny}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
