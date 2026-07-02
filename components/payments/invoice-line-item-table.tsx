import type { InvoiceLineItem } from "@/config/payments";

type InvoiceLineItemTableProps = {
  items: InvoiceLineItem[];
};

export function InvoiceLineItemTable({ items }: InvoiceLineItemTableProps) {
  return (
    <div className="overflow-hidden border border-slate-300">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm" aria-label="Invoice service details">
          <thead className="bg-slate-100 text-brand-navy">
            <tr>
              <th className="px-4 py-3 font-bold" scope="col">Service details</th>
              <th className="px-4 py-3 font-bold" scope="col">Quantity</th>
              <th className="px-4 py-3 font-bold" scope="col">Unit price</th>
              <th className="px-4 py-3 font-bold" scope="col">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => (
              <tr key={item.description}>
                <td className="min-w-64 px-4 py-4 text-brand-text">
                  {item.description}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {item.quantity}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {item.unitPrice}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {item.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
