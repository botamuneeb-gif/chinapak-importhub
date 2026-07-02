import type {
  LeadStatus,
  PaymentStatus,
  ProjectStatus,
} from "@/config/admin-projects";
import { cn } from "@/lib/utils";

type BadgeStatus = ProjectStatus | PaymentStatus | LeadStatus | string;

type AdminStatusBadgeProps = {
  status: BadgeStatus;
};

function getBadgeClasses(status: BadgeStatus) {
  if (
    status.includes("Paid") ||
    status.includes("Ready") ||
    status.includes("Active") ||
    status.includes("Assignable") ||
    status === "Payment Completed" ||
    status === "Completed"
  ) {
    return "border-brand-emerald bg-emerald-50 text-brand-emerald";
  }

  if (
    status.includes("Awaiting") ||
    status.includes("Review") ||
    status.includes("Contact") ||
    status.includes("Needs")
  ) {
    return "border-brand-gold bg-amber-50 text-amber-700";
  }

  if (
    status.includes("Refund") ||
    status.includes("Cancelled") ||
    status.includes("Failed") ||
    status.includes("Issue") ||
    status.includes("Rejected") ||
    status.includes("Closed") ||
    status.includes("Not Interested")
  ) {
    return "border-brand-error bg-red-50 text-brand-error";
  }

  return "border-slate-300 bg-slate-50 text-brand-navy";
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-lg border px-2.5 py-1 text-xs font-bold",
        getBadgeClasses(status),
      )}
    >
      {status}
    </span>
  );
}
