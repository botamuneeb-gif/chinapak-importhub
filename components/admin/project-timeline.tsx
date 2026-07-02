import type { AdminProject } from "@/config/admin-projects";
import { cn } from "@/lib/utils";

type ProjectTimelineProps = {
  items: AdminProject["timeline"];
};

function getTimelineItemKey(
  item: AdminProject["timeline"][number],
  index: number,
) {
  return (
    item.id ??
    item.eventId ??
    `${item.label}-${item.date ?? item.createdAt ?? "timeline"}-${index}`
  );
}

export function ProjectTimeline({ items }: ProjectTimelineProps) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li className="flex gap-3" key={getTimelineItemKey(item, index)}>
          <span
            className={cn(
              "mt-1 h-3 w-3 shrink-0 rounded-full border",
              item.state === "done" && "border-brand-emerald bg-brand-emerald",
              item.state === "current" && "border-brand-gold bg-brand-gold",
              item.state === "pending" && "border-slate-300 bg-white",
            )}
          />
          <span>
            <span className="block font-semibold text-brand-navy">
              {item.label}
            </span>
            <span className="mt-1 block text-sm text-brand-muted">
              {item.date}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
