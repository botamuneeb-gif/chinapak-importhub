import type { Metadata } from "next";
import Link from "next/link";
import { AgentComplianceNotice } from "@/components/agent/agent-compliance-notice";
import { AgentShell } from "@/components/agent/agent-shell";
import { AgentStatCard } from "@/components/agent/agent-stat-card";
import { AgentStatusBadge } from "@/components/agent/agent-status-badge";
import {
  agentComplianceRules,
  agentLeads,
  agentStats,
  conversionActivity,
} from "@/config/agents";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Agent Dashboard | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AgentDashboardPage() {
  const followUpLeads = agentLeads.filter(
    (lead) =>
      lead.leadStatus === "Payment Help Needed" ||
      lead.leadStatus === "Interested" ||
      lead.leadStatus === "Payment Link Sent",
  );

  return (
    <AgentShell
      description="Track assigned unpaid leads, payment help requests, conversion activity, and compliance reminders."
      title="Agent Dashboard"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {agentStats.map((stat) => (
          <AgentStatCard
            detail={stat.detail}
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            Leads needing follow-up
          </h2>
          <div className="mt-4 grid gap-3">
            {followUpLeads.map((lead) => (
              <Link
                className="rounded-lg border border-slate-200 bg-brand-background p-4 no-underline transition hover:border-brand-emerald"
                href={`${ROUTES.agentLeads}/${lead.id}`}
                key={lead.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-brand-navy">{lead.id}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {lead.importerName} · {lead.product}
                    </p>
                  </div>
                  <AgentStatusBadge status={lead.leadStatus} />
                </div>
                <p className="mt-3 text-sm text-brand-muted">
                  Follow-up due: {lead.followUpDue}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            Recent conversion activity
          </h2>
          <ol className="mt-4 space-y-4">
            {conversionActivity.map((activity) => (
              <li className="flex gap-3" key={activity}>
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-brand-emerald" />
                <p className="text-sm leading-7 text-brand-muted">{activity}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-8">
        <AgentComplianceNotice rules={agentComplianceRules} title="Important compliance rules" />
      </div>
    </AgentShell>
  );
}
