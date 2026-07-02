import type { RiskFlag } from "@/config/messaging";
import { cn } from "@/lib/utils";

type RiskFlagBadgeProps = {
  flag: RiskFlag;
};

function flagClasses(flag: RiskFlag) {
  if (flag === "None") {
    return "border-slate-300 bg-slate-50 text-brand-muted";
  }

  if (
    flag === "Contact Info Detected" ||
    flag === "Factory Contact Detected" ||
    flag === "Unapproved Direct Contact Attempt"
  ) {
    return "border-brand-error bg-red-50 text-brand-error";
  }

  return "border-brand-gold bg-amber-50 text-amber-700";
}

export function RiskFlagBadge({ flag }: RiskFlagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-lg border px-2.5 py-1 text-xs font-bold",
        flagClasses(flag),
      )}
    >
      {flag}
    </span>
  );
}
