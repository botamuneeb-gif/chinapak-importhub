import type { FmsAssignment } from "@/config/fms-portal";
import { cn } from "@/lib/utils";

type MilestoneChecklistProps = {
  milestones: FmsAssignment["milestones"];
};

export function MilestoneChecklist({ milestones }: MilestoneChecklistProps) {
  return (
    <ul className="grid gap-3">
      {milestones.map((milestone) => (
        <li
          className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
          key={milestone.label}
        >
          <span
            className={cn(
              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-sm font-bold",
              milestone.completed
                ? "border-brand-emerald bg-brand-emerald text-white"
                : "border-slate-300 bg-brand-background text-brand-muted",
            )}
          >
            {milestone.completed ? "✓" : "–"}
          </span>
          <span className="text-sm leading-7 text-brand-navy">
            {milestone.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
