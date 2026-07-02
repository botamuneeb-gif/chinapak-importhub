import type { ThreadStatus } from "@/config/messaging";
import { cn } from "@/lib/utils";

type ThreadStatusBadgeProps = {
  status: ThreadStatus;
};

function statusClasses(status: ThreadStatus) {
  if (status === "Open" || status === "Approved for Forwarding") {
    return "border-brand-emerald bg-emerald-50 text-brand-emerald";
  }

  if (
    status === "Pending Admin Review" ||
    status === "Translation Needed" ||
    status === "Waiting for Importer" ||
    status === "Waiting for FMS"
  ) {
    return "border-brand-gold bg-amber-50 text-amber-700";
  }

  return "border-slate-300 bg-slate-50 text-brand-muted";
}

export function ThreadStatusBadge({ status }: ThreadStatusBadgeProps) {
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
