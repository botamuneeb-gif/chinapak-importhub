import { AgentStatusBadge } from "@/components/agent/agent-status-badge";
import type { TrainingStatus } from "@/config/agents";

type TrainingModuleCardProps = {
  body: string;
  status: TrainingStatus;
  title: string;
};

export function TrainingModuleCard({ body, status, title }: TrainingModuleCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
        <AgentStatusBadge status={status} />
      </div>
      <p className="mt-3 text-sm leading-7 text-brand-muted">{body}</p>
    </article>
  );
}
