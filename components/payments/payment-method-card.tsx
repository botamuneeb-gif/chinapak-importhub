import type { PaymentMethod } from "@/config/payments";

type PaymentMethodCardProps = {
  method: PaymentMethod;
};

export function PaymentMethodCard({ method }: PaymentMethodCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-brand-navy">{method.name}</h3>
        <span className="rounded-lg bg-brand-background px-3 py-1 text-xs font-bold text-brand-muted">
          {method.status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-brand-muted">{method.note}</p>
    </article>
  );
}
