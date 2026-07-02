import type { DocumentLineItem } from "@/app/documents/actions";

type DocumentLineItemsTableProps = {
  items: DocumentLineItem[];
};

export function DocumentLineItemsTable({ items }: DocumentLineItemsTableProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm font-semibold text-brand-muted">
        No line items are available for this document.
      </p>
    );
  }

  return (
    <div className="overflow-hidden border border-slate-300">
      <div className="overflow-x-auto">
        <table
          aria-label="Document service line items"
          className="min-w-full border-collapse text-left text-sm"
        >
          <thead className="bg-slate-100 text-brand-navy">
            <tr>
              <th className="px-4 py-3 font-bold" scope="col">
                Service / item
              </th>
              <th className="px-4 py-3 font-bold" scope="col">
                Type
              </th>
              <th className="px-4 py-3 font-bold" scope="col">
                Qty
              </th>
              <th className="px-4 py-3 font-bold" scope="col">
                Unit price
              </th>
              <th className="px-4 py-3 font-bold" scope="col">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, index) => (
              <tr key={`${item.itemType}-${item.description}-${index}`}>
                <td className="min-w-64 px-4 py-4 font-semibold text-brand-text">
                  {item.description}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {item.itemType}
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
