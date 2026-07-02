import type { MessageThread } from "@/config/messaging";

type AdminReviewPanelProps = {
  thread: MessageThread;
};

function messageForReview(thread: MessageThread) {
  return (
    thread.messages.find((message) =>
      message.riskFlags.some((flag) => flag !== "None"),
    ) ?? thread.messages[thread.messages.length - 1]
  );
}

export function AdminReviewPanel({ thread }: AdminReviewPanelProps) {
  const message = messageForReview(thread);
  const hasSensitiveInfo = message.riskFlags.some((flag) => flag !== "None");

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">
            Admin Review Panel
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Review, edit, approve, forward, reject, or request clarification
            before any cross-role visibility changes.
          </p>
        </div>
        <span className="rounded-lg bg-brand-background px-3 py-1 text-xs font-bold text-brand-muted">
          Placeholder only
        </span>
      </div>

      {hasSensitiveInfo ? (
        <div className="mt-5 rounded-lg border border-brand-error bg-red-50 p-4 text-sm leading-7 text-brand-error">
          Detected sensitive info warning: contact details, payment terms,
          factory contact data, or direct contact language may need removal
          before forwarding.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        <div>
          <label
            className="block text-sm font-semibold text-brand-navy"
            htmlFor="admin-review-original"
          >
            Original message
          </label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-brand-muted"
            id="admin-review-original"
            readOnly
            rows={4}
            value={message.originalText}
          />
        </div>
        <div>
          <label
            className="block text-sm font-semibold text-brand-navy"
            htmlFor="admin-review-translation"
          >
            AI translated draft
          </label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-brand-muted"
            id="admin-review-translation"
            readOnly
            rows={4}
            value={message.translatedText}
          />
        </div>
        <div>
          <label
            className="block text-sm font-semibold text-brand-navy"
            htmlFor="admin-review-edited"
          >
            Admin edited version textarea
          </label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-brand-text"
            id="admin-review-edited"
            rows={5}
            value={message.adminApprovedText}
            readOnly
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {[
          "Approve & Forward Placeholder",
          "Edit & Forward Placeholder",
          "Reject Placeholder",
          "Mark Needs Translation Placeholder",
          "Request Clarification Placeholder",
        ].map((action) => (
          <button
            className="min-h-11 rounded-lg border border-slate-300 bg-brand-background px-4 py-2 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald"
            key={action}
            type="button"
          >
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}
