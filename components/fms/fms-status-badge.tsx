import type {
  AcademyStatus,
  FmsAssignmentStatus,
  FmsSubmissionStatus,
} from "@/config/fms-portal";
import { cn } from "@/lib/utils";

type FmsBadgeStatus = FmsAssignmentStatus | FmsSubmissionStatus | AcademyStatus | string;

type FmsStatusBadgeProps = {
  status: FmsBadgeStatus;
};

function badgeClasses(status: FmsBadgeStatus) {
  if (
    status.includes("Approved") ||
    status.includes("Completed") ||
    status === "Certified" ||
    status === "Available" ||
    status === "Scheduled"
  ) {
    return "border-brand-emerald bg-emerald-50 text-brand-emerald";
  }

  if (
    status.includes("Review") ||
    status.includes("Draft") ||
    status.includes("Researching") ||
    status === "In Progress" ||
    status === "Pending Admin Approval"
  ) {
    return "border-brand-gold bg-amber-50 text-amber-700";
  }

  if (
    status.includes("Changes") ||
    status === "Suspended" ||
    status === "Not Submitted"
  ) {
    return "border-brand-error bg-red-50 text-brand-error";
  }

  return "border-slate-300 bg-slate-50 text-brand-navy";
}

export function FmsStatusBadge({ status }: FmsStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-lg border px-2.5 py-1 text-xs font-bold",
        badgeClasses(status),
      )}
    >
      {status}
    </span>
  );
}
