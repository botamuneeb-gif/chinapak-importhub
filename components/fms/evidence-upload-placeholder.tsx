type EvidenceUploadPlaceholderProps = {
  label: string;
};

export function EvidenceUploadPlaceholder({ label }: EvidenceUploadPlaceholderProps) {
  return (
    <article className="rounded-lg border border-dashed border-slate-300 bg-brand-background p-4">
      <h3 className="font-bold text-brand-navy">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-brand-muted">
        Upload placeholder only. Future file storage should use object storage
        and admin review before importer access.
      </p>
      <button
        className="mt-4 min-h-10 rounded-lg border border-brand-navy bg-white px-3 py-2 text-sm font-semibold text-brand-navy"
        type="button"
      >
        Add files placeholder
      </button>
    </article>
  );
}
