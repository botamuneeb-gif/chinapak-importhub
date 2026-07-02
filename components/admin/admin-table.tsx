import type { ReactNode } from "react";

type AdminTableProps = {
  children: ReactNode;
  columns: string[];
  label: string;
};

export function AdminTable({ children, columns, label }: AdminTableProps) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table
          className="min-w-[1120px] border-collapse text-left text-sm"
          aria-label={label}
        >
          <thead className="bg-brand-navy text-white">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap px-4 py-3 font-semibold" key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
