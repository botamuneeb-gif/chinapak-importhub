import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
};

export function AuthCard({ children, className, title }: AuthCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      {title ? (
        <h2 className="mb-5 text-xl font-bold text-brand-navy">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}
