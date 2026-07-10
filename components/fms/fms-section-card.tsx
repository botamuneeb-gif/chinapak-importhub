import type { ReactNode } from "react";

type FmsSectionCardProps = {
  children: ReactNode;
  id?: string;
  title: string;
};

export function FmsSectionCard({ children, id, title }: FmsSectionCardProps) {
  return (
    <section
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      id={id}
    >
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
