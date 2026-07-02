import type { AgentLeadStatus, AgentStatus, TrainingStatus } from "@/config/agents";
import { cn } from "@/lib/utils";

type AgentStatusBadgeProps = {
  status: AgentLeadStatus | AgentStatus | TrainingStatus | string;
};

function statusClasses(status: string) {
  if (
    status === "Active" ||
    status === "Payment Completed" ||
    status === "Certified" ||
    status === "Approved" ||
    status === "Paid"
  ) {
    return "border-brand-emerald bg-emerald-50 text-brand-emerald";
  }

  if (
    status === "New Lead" ||
    status === "Contact Attempted" ||
    status === "Interested" ||
    status === "Payment Help Needed" ||
    status === "Payment Link Sent" ||
    status === "In Progress" ||
    status === "Pending"
  ) {
    return "border-brand-gold bg-amber-50 text-amber-700";
  }

  if (
    status === "Inactive" ||
    status === "Suspended" ||
    status === "Not Interested" ||
    status === "Closed"
  ) {
    return "border-brand-error bg-red-50 text-brand-error";
  }

  return "border-slate-300 bg-slate-50 text-brand-muted";
}

export function AgentStatusBadge({ status }: AgentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-lg border px-2.5 py-1 text-xs font-bold",
        statusClasses(status),
      )}
    >
      {status}
    </span>
  );
}
