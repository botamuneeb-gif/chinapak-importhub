import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SecurityNoticeProps = {
  children: ReactNode;
  title: string;
  tone?: "info" | "warning" | "danger";
};

const toneClasses = {
  info: "border-brand-emerald bg-emerald-50 text-brand-navy",
  warning: "border-brand-gold bg-amber-50 text-brand-navy",
  danger: "border-brand-error bg-red-50 text-brand-navy",
};

export function SecurityNotice({
  children,
  title,
  tone = "warning",
}: SecurityNoticeProps) {
  return (
    <aside className={cn("rounded-lg border p-5 shadow-sm", toneClasses[tone])}>
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-2 text-sm leading-7">{children}</div>
    </aside>
  );
}
