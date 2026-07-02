type FactoryStatsCardProps = {
  detail: string;
  label: string;
  value: string;
};

export function FactoryStatsCard({ detail, label, value }: FactoryStatsCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-brand-muted">{label}</p>
      <p className="mt-3 text-3xl font-bold text-brand-navy">{value}</p>
      <p className="mt-2 text-sm leading-6 text-brand-muted">{detail}</p>
    </article>
  );
}
