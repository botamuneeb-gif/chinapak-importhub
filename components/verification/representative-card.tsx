import { AgentStatusBadge } from "@/components/agent/agent-status-badge";
import type { Representative } from "@/config/agents";

type RepresentativeCardProps = {
  representative: Representative;
};

export function RepresentativeCard({ representative }: RepresentativeCardProps) {
  return (
    <article className="rounded-lg border border-brand-emerald bg-white p-5 shadow-sm" dir="ltr" lang="en">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-emerald">
            Verified representative example
          </p>
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">
            {representative.name}
          </h2>
        </div>
        <AgentStatusBadge status={representative.status} />
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-brand-background p-3">
          <dt className="font-semibold text-brand-navy">Agent code</dt>
          <dd className="mt-1 text-brand-muted">{representative.agentCode}</dd>
        </div>
        <div className="rounded-lg bg-brand-background p-3">
          <dt className="font-semibold text-brand-navy">City/market</dt>
          <dd className="mt-1 text-brand-muted">{representative.cityMarket}</dd>
        </div>
        <div className="rounded-lg bg-brand-background p-3">
          <dt className="font-semibold text-brand-navy">Role</dt>
          <dd className="mt-1 text-brand-muted">{representative.role}</dd>
        </div>
        <div className="rounded-lg bg-brand-background p-3">
          <dt className="font-semibold text-brand-navy">Verified by</dt>
          <dd className="mt-1 text-brand-muted">{representative.verifiedBy}</dd>
        </div>
        <div className="rounded-lg bg-brand-background p-3 sm:col-span-2">
          <dt className="font-semibold text-brand-navy">Last verification date</dt>
          <dd className="mt-1 text-brand-muted">
            {representative.lastVerificationDate}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-bold text-brand-navy">Allowed activities</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-brand-muted">
            {representative.allowedActivities.map((activity) => (
              <li className="border-s-4 border-brand-emerald ps-3" key={activity}>
                {activity}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-brand-error">Not allowed</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-brand-muted">
            {representative.notAllowed.map((activity) => (
              <li className="border-s-4 border-brand-error ps-3" key={activity}>
                {activity}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
