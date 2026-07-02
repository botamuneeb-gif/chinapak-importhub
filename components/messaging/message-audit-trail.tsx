import type { MessageThread } from "@/config/messaging";
import { cn } from "@/lib/utils";

type MessageAuditTrailProps = {
  items: MessageThread["auditTrail"];
};

export function MessageAuditTrail({ items }: MessageAuditTrailProps) {
  return (
    <ol className="space-y-3">
      {items.map((item) => (
        <li className="flex gap-3" key={`${item.label}-${item.timestamp}`}>
          <span
            className={cn(
              "mt-1 h-3 w-3 shrink-0 rounded-full border",
              item.state === "done" && "border-brand-emerald bg-brand-emerald",
              item.state === "current" && "border-brand-gold bg-brand-gold",
              item.state === "risk" && "border-brand-error bg-brand-error",
              item.state === "pending" && "border-slate-300 bg-white",
            )}
          />
          <span>
            <span className="block font-semibold text-brand-navy">
              {item.label}
            </span>
            <span className="mt-1 block text-sm text-brand-muted">
              {item.timestamp}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
