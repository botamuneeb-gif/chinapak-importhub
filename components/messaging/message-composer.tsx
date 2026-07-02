type MessageComposerProps = {
  actions: string[];
  dir?: "ltr" | "rtl";
  helperText: string;
  lang?: string;
  placeholder: string;
  title: string;
};

export function MessageComposer({
  actions,
  dir = "ltr",
  helperText,
  lang = "en",
  placeholder,
  title,
}: MessageComposerProps) {
  const composerId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "message"}-composer`;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" dir={dir} lang={lang}>
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-brand-muted">{helperText}</p>
      <label className="mt-5 block text-sm font-semibold text-brand-navy" htmlFor={composerId}>
        Message draft
      </label>
      <textarea
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-brand-text"
        id={composerId}
        placeholder={placeholder}
        rows={5}
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {actions.map((action) => (
          <button
            className="min-h-11 rounded-lg border border-slate-300 bg-brand-background px-4 py-2 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald"
            key={action}
            type="button"
          >
            {action}
          </button>
        ))}
      </div>
      <p className="mt-4 rounded-lg bg-brand-background p-3 text-xs font-semibold leading-6 text-brand-muted">
        Placeholder only: this composer does not send messages, upload files, or
        trigger notifications yet.
      </p>
    </section>
  );
}
