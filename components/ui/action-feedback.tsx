type ActionFeedbackProps = {
  error?: string;
  message?: string;
};

export function ActionFeedback({ error = "", message = "" }: ActionFeedbackProps) {
  const text = error || message;

  if (!text) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={`rounded-lg border p-3 text-sm font-semibold leading-6 ${
        error
          ? "border-brand-error bg-red-50 text-brand-error"
          : "border-brand-emerald bg-emerald-50 text-brand-emerald"
      }`}
      role={error ? "alert" : "status"}
    >
      {text}
    </div>
  );
}
