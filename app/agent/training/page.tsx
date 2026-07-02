import type { Metadata } from "next";
import { AgentComplianceNotice } from "@/components/agent/agent-compliance-notice";
import { AgentShell } from "@/components/agent/agent-shell";
import { TrainingModuleCard } from "@/components/agent/training-module-card";
import { agentComplianceRules, trainingModules } from "@/config/agents";

export const metadata: Metadata = {
  title: "Agent Training | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AgentTrainingPage() {
  return (
    <AgentShell
      description="Training modules for local representatives who explain ChinaPak ImportHub, follow unpaid leads, and use approved payment workflows."
      title="Agent Training"
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {["Not Started", "In Progress", "Certified", "Suspended"].map((status) => (
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={status}>
            <p className="text-sm font-semibold text-brand-muted">Status</p>
            <p className="mt-2 text-xl font-bold text-brand-navy">{status}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {trainingModules.map((module) => (
          <TrainingModuleCard
            body={module.body}
            key={module.title}
            status={module.status}
            title={module.title}
          />
        ))}
      </div>

      <div className="mt-8">
        <AgentComplianceNotice rules={agentComplianceRules} />
      </div>
    </AgentShell>
  );
}
