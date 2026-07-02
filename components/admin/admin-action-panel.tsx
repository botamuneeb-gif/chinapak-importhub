type AdminActionPanelProps = {
  actions: string[];
  note: string;
  title: string;
};

export function AdminActionPanel({
  actions,
  note,
  title,
}: AdminActionPanelProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-brand-muted">{note}</p>
      <div className="mt-5 grid gap-3">
        {actions.map((action) => (
          <button
            className="min-h-11 rounded-lg border border-slate-300 bg-brand-background px-4 py-2 text-sm font-semibold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
            key={action}
            type="button"
          >
            {action}
          </button>
        ))}
      </div>
    </aside>
  );
}
