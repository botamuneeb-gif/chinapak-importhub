import type { ReactNode } from "react";

type FmsShellProps = {
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
};

export function FmsShell({
  children,
  description,
  eyebrow = "FMS Portal",
  title,
}: FmsShellProps) {
  return (
    <main className="bg-brand-background" dir="ltr" lang="en">
      <section className="border-b border-slate-200 bg-brand-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-sm font-semibold text-brand-gold">{eyebrow}</p>
          <div className="mt-3">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78 sm:text-base">
              {description}
            </p>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </main>
  );
}
