import type { InvoiceStatus, PaymentStatus } from "@/config/payments";
import { cn } from "@/lib/utils";

type PaymentStatusBadgeProps = {
  status: InvoiceStatus | PaymentStatus;
};

function statusClasses(status: InvoiceStatus | PaymentStatus) {
  if (status === "Paid") {
    return "border-brand-emerald bg-emerald-50 text-brand-emerald";
  }

  if (status === "Pending" || status === "Draft" || status === "Awaiting Payment") {
    return "border-brand-gold bg-amber-50 text-amber-700";
  }

  if (status === "Refunded" || status === "Failed" || status === "Cancelled") {
    return "border-brand-error bg-red-50 text-brand-error";
  }

  return "border-slate-300 bg-slate-50 text-brand-navy";
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-lg border px-2.5 py-1 text-xs font-bold",
        statusClasses(status),
      )}
    >
      {status}
    </span>
  );
}
