import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type OptionCardProps = {
  body?: string;
  children?: ReactNode;
  icon?: ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  title: string;
};

export function OptionCard({
  body,
  children,
  icon,
  isSelected,
  onSelect,
  title,
}: OptionCardProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "w-full rounded-lg border bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold",
        isSelected
          ? "border-brand-emerald ring-2 ring-brand-emerald/20"
          : "border-slate-200",
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="flex items-start gap-3">
        {icon ? (
          <span
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              isSelected
                ? "bg-brand-emerald text-white"
                : "bg-brand-background text-brand-navy",
            )}
          >
            {icon}
          </span>
        ) : null}
        <span>
          <span className="block font-bold leading-7 text-brand-navy">
            {title}
          </span>
          {body ? (
            <span className="mt-1 block text-sm leading-6 text-brand-muted">
              {body}
            </span>
          ) : null}
          {children}
        </span>
      </span>
    </button>
  );
}
