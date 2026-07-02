import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthModeNoticeProps = {
  children: ReactNode;
  title: string;
  tone?: "info" | "warning" | "danger";
};

const toneClasses = {
  info: "border-brand-emerald bg-emerald-50 text-brand-navy",
  warning: "border-brand-gold bg-amber-50 text-brand-navy",
  danger: "border-brand-error bg-red-50 text-brand-navy",
};

export function AuthModeNotice({
  children,
  title,
  tone = "info",
}: AuthModeNoticeProps) {
  return (
    <aside className={cn("rounded-lg border p-4 text-sm leading-7", toneClasses[tone])}>
      <p className="font-bold">{title}</p>
      <div className="mt-1">{children}</div>
    </aside>
  );
}
