import type { AdminProject } from "@/config/admin-projects";
import { cn } from "@/lib/utils";

type ReviewChecklistProps = {
  items: AdminProject["checklist"];
};

export function ReviewChecklist({ items }: ReviewChecklistProps) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li
          className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
          key={item.label}
        >
          <span
            className={cn(
              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-sm font-bold",
              item.checked
                ? "border-brand-emerald bg-brand-emerald text-white"
                : "border-slate-300 bg-brand-background text-brand-muted",
            )}
          >
            {item.checked ? "✓" : "–"}
          </span>
          <span className="text-sm leading-7 text-brand-navy">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
