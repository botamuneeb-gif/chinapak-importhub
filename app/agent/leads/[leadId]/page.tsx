import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AgentComplianceNotice } from "@/components/agent/agent-compliance-notice";
import { AgentShell } from "@/components/agent/agent-shell";
import { AgentStatusBadge } from "@/components/agent/agent-status-badge";
import {
  agentLeads,
  agentRestrictions,
  approvedTalkingPoints,
  getAgentLeadById,
} from "@/config/agents";

type AgentLeadDetailPageProps = {
  params: Promise<{ leadId: string }>;
};

export function generateStaticParams() {
  return agentLeads.map((lead) => ({ leadId: lead.id }));
}

export async function generateMetadata({
  params,
}: AgentLeadDetailPageProps): Promise<Metadata> {
  const { leadId } = await params;
  return {
    title: `${leadId} Agent Lead | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0">
      <dt className="text-sm font-semibold text-brand-navy">{label}</dt>
      <dd className="mt-1 text-sm leading-7 text-brand-muted">{value}</dd>
    </div>
  );
}

export default async function AgentLeadDetailPage({
  params,
}: AgentLeadDetailPageProps) {
  const { leadId } = await params;
  const lead = getAgentLeadById(leadId);

  if (!lead) {
    notFound();
  }

  return (
    <AgentShell
      description="Review lead details, plan approved follow-up, and keep all payment support inside official ChinaPak ImportHub workflow."
      title={`Lead Detail: ${lead.id}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-brand-navy">
                1. Lead Summary
              </h2>
              <AgentStatusBadge status={lead.leadStatus} />
            </div>
            <dl className="mt-5">
              <DetailRow label="Lead ID" value={lead.id} />
              <DetailRow label="Importer name" value={lead.importerName} />
              <DetailRow label="City" value={lead.city} />
              <DetailRow label="Product" value={lead.product} />
              <DetailRow label="Budget range" value={lead.budgetRange} />
              <DetailRow label="Package selected" value={lead.packageSelected} />
              <DetailRow
                label="Payment problem reason"
                value={lead.paymentProblemReason}
              />
              <DetailRow label="Created date" value={lead.createdDate} />
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-brand-navy">2. Contact Plan</h2>
            <div className="mt-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              Use the approved ChinaPak ImportHub follow-up script and official
              payment instructions only. Lead status updates remain controlled
              by admin operations for launch.
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                "Confirm the importer understands package terms.",
                "Explain payment must be verified before FMS assignment.",
                "Do not collect unofficial payments.",
                "Request admin help for payment or refund questions.",
              ].map((item) => (
                <div
                  className="rounded-lg border border-slate-200 bg-brand-background p-4 text-sm font-semibold leading-7 text-brand-muted"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-brand-navy">
              3. Approved Talking Points
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-muted">
              {approvedTalkingPoints.map((point) => (
                <li className="border-s-4 border-brand-emerald ps-3" key={point}>
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <AgentComplianceNotice rules={agentRestrictions} title="4. Restrictions" />

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-brand-navy">
              5. Conversion Guidance
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Guide importer to official payment support.",
                "Ask admin before promising any timeline or outcome.",
                "Keep lead separate from FMS sourcing until payment is verified.",
                "Commission credit follows verified payment and admin rules.",
              ].map((action) => (
                <div
                  className="rounded-lg border border-slate-200 bg-brand-background p-4 text-sm font-semibold leading-7 text-brand-muted"
                  key={action}
                >
                  {action}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-brand-muted">
              Lead conversion is completed only after verified payment and
              admin review. Agents must never create unofficial payment paths.
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-brand-navy">Lead notes</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-muted">
              {lead.notes.map((note) => (
                <li className="border-s-4 border-brand-gold ps-3" key={note}>
                  {note}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
            <h2 className="text-xl font-bold">Payment rule</h2>
            <p className="mt-3 text-sm leading-7">
              Payment must be verified and accepted for admin review before
              commission credit or FMS assignment.
            </p>
          </section>
        </aside>
      </div>
    </AgentShell>
  );
}
