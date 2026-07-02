import type { Metadata } from "next";
import { AgentLeadTable } from "@/components/agent/agent-lead-table";
import { AgentShell } from "@/components/agent/agent-shell";
import { agentLeads } from "@/config/agents";

export const metadata: Metadata = {
  title: "Agent Leads | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AgentLeadsPage() {
  return (
    <AgentShell
      description="View assigned unpaid leads and payment-help follow-ups. Leads here are not active sourcing projects until payment and admin review are complete."
      title="Assigned Leads"
    >
      <div className="mb-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Unpaid lead rule</h2>
        <p className="mt-2 text-sm leading-7">
          Agents can be assigned unpaid leads. Unpaid leads must not be assigned
          to FMS until payment is completed and admin review is done.
        </p>
      </div>

      <AgentLeadTable leads={agentLeads} />
    </AgentShell>
  );
}
