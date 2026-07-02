import type {
  FactoryRiskFlag,
  FactoryStatus,
  FactoryVerificationStatus,
} from "@/config/factory-database";
import { cn } from "@/lib/utils";

type FactoryBadgeStatus = FactoryStatus | FactoryVerificationStatus | FactoryRiskFlag | string;

type FactoryStatusBadgeProps = {
  status: FactoryBadgeStatus;
};

function badgeClasses(status: FactoryBadgeStatus) {
  if (
    status.includes("Trusted") ||
    status.includes("Verified") ||
    status.includes("Active") ||
    status.includes("Reviewed") ||
    status.includes("Document")
  ) {
    return "border-brand-emerald bg-emerald-50 text-brand-emerald";
  }

  if (
    status.includes("Submitted") ||
    status.includes("Draft") ||
    status.includes("Basic") ||
    status.includes("Invited") ||
    status.includes("Incomplete")
  ) {
    return "border-brand-gold bg-amber-50 text-amber-700";
  }

  if (
    status.includes("Risk") ||
    status.includes("Conflicting") ||
    status.includes("Complaint") ||
    status.includes("Blacklist") ||
    status.includes("Suspended") ||
    status.includes("Too Low")
  ) {
    return "border-brand-error bg-red-50 text-brand-error";
  }

  return "border-slate-300 bg-slate-50 text-brand-navy";
}

export function FactoryStatusBadge({ status }: FactoryStatusBadgeProps) {
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
