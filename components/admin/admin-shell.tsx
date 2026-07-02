import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
};

export function AdminShell({
  children,
  description,
  eyebrow = "Admin Project Review Center",
  title,
}: AdminShellProps) {
  return (
    <main className="w-full min-w-0 bg-brand-background" dir="ltr" lang="en">
      <section className="border-b border-slate-200 bg-brand-navy text-white">
        <div className="w-full px-0 py-7 sm:py-8">
          <p className="text-sm font-semibold text-brand-gold">{eyebrow}</p>
          <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78 sm:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="w-full min-w-0 py-6 sm:py-8">{children}</div>
    </main>
  );
}
