import { AgentStatusBadge } from "@/components/agent/agent-status-badge";
import { commissionSummary } from "@/config/agents";

export function CommissionSummary() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Pending commission</p>
          <p className="mt-3 text-3xl font-bold text-brand-navy">
            {commissionSummary.pending}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Approved commission</p>
          <p className="mt-3 text-3xl font-bold text-brand-emerald">
            {commissionSummary.approved}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Paid commission</p>
          <p className="mt-3 text-3xl font-bold text-brand-navy">
            {commissionSummary.paid}
          </p>
        </article>
      </div>

      <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Commission rule</h2>
        <p className="mt-2 text-sm leading-7">{commissionSummary.rule}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            Package-based examples
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-muted">
            {commissionSummary.packageExamples.map((example) => (
              <li className="border-s-4 border-brand-emerald ps-3" key={example}>
                {example}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            Commission history
          </h2>
          <div className="mt-4 grid gap-3">
            {commissionSummary.history.map((item) => (
              <div
                className="rounded-lg border border-slate-200 bg-brand-background p-4"
                key={item.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-brand-navy">{item.id}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {item.leadId} · {item.packageName}
                    </p>
                  </div>
                  <AgentStatusBadge status={item.status} />
                </div>
                <p className="mt-3 text-sm font-semibold text-brand-muted">
                  {item.amount} · {item.date}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
