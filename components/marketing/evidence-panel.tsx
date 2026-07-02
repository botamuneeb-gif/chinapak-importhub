export function EvidencePanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" dir="ltr" lang="en">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-semibold text-brand-emerald">
            Import Project ID
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-navy">
            CPH-2026-0001
          </p>
        </div>
        <span className="rounded-lg bg-brand-background px-3 py-2 text-sm font-semibold text-brand-navy">
          Admin reviewed
        </span>
      </div>

      <div className="grid gap-4 py-5 sm:grid-cols-3">
        {["Factory options", "Photo evidence", "Video evidence"].map((item, index) => (
          <div key={item} className="border-s-4 border-brand-emerald ps-3">
            <p className="text-2xl font-bold text-brand-navy">{index + 1}</p>
            <p className="mt-1 text-sm leading-6 text-brand-muted">{item}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-brand-navy">
            FMS assignment
          </span>
          <span className="text-sm text-brand-muted">Admin controlled</span>
        </div>
        <div className="h-3 rounded-lg bg-slate-100">
          <div className="h-3 w-2/3 rounded-lg bg-brand-emerald" />
        </div>
        <p className="text-sm leading-6 text-brand-muted">
          Importers and FMSs stay separated. Updates move through the platform.
        </p>
      </div>
    </div>
  );
}
