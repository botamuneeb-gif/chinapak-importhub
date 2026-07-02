import { Button } from "@/components/ui/button";

const preferredResolutions = [
  "Refund",
  "FMS reassignment",
  "More factory options",
  "Admin review",
] as const;

export function RefundRequestForm() {
  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-label="Refund request placeholder form">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-brand-navy" htmlFor="refund-project-id">
            Project ID
          </label>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            id="refund-project-id"
            placeholder="CPH-2026-0007"
            type="text"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-navy" htmlFor="refund-invoice-id">
            Invoice ID
          </label>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            id="refund-invoice-id"
            placeholder="INV-2026-0007"
            type="text"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-navy" htmlFor="refund-reason">
          Reason for refund
        </label>
        <input
          className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
          id="refund-reason"
          placeholder="Brief reason"
          type="text"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-navy" htmlFor="refund-resolution">
          Preferred resolution
        </label>
        <select
          className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
          id="refund-resolution"
        >
          {preferredResolutions.map((resolution) => (
            <option key={resolution}>{resolution}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-navy" htmlFor="refund-explanation">
          Explanation
        </label>
        <textarea
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
          id="refund-explanation"
          placeholder="Explain what happened and what support you need."
          rows={5}
        />
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-brand-background p-4 text-sm font-semibold text-brand-muted">
        Attachment placeholder: payment proof, invoice, screenshots, or project
        documents can be uploaded after storage is implemented.
      </div>

      <Button type="button" variant="secondary">
        Submit request placeholder
      </Button>
    </form>
  );
}
