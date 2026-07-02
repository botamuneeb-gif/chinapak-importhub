import type { Metadata } from "next";
import { AgentShell } from "@/components/agent/agent-shell";
import { CommissionSummary } from "@/components/agent/commission-summary";

export const metadata: Metadata = {
  title: "Agent Commissions | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AgentCommissionsPage() {
  return (
    <AgentShell
      description="Review commission status and package-based examples. Commission rules remain configurable by admin policy."
      title="Agent Commissions"
    >
      <CommissionSummary />
    </AgentShell>
  );
}
