import type { DocumentStatusTone } from "@/app/documents/actions";
import { cn } from "@/lib/utils";

type DocumentStatusStampProps = {
  label: string;
  tone?: DocumentStatusTone;
};

const toneClasses: Record<DocumentStatusTone, string> = {
  danger: "border-brand-error bg-red-50 text-brand-error",
  neutral: "border-slate-300 bg-slate-50 text-brand-navy",
  success: "border-brand-emerald bg-emerald-50 text-brand-emerald",
  warning: "border-brand-gold bg-amber-50 text-amber-700",
};

export function DocumentStatusStamp({
  label,
  tone = "neutral",
}: DocumentStatusStampProps) {
  return (
    <span
      className={cn(
        "inline-flex rotate-[-2deg] rounded-md border-2 px-4 py-2 text-sm font-black uppercase tracking-[0.18em]",
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  );
}
