import Link from "next/link";
import { FactoryStatusBadge } from "@/components/admin/factories/factory-status-badge";
import type { FactoryRecord } from "@/config/factory-database";

type FactoryTableProps = {
  factories: FactoryRecord[];
};

const columns = [
  "Factory Code",
  "Display Name",
  "Category",
  "City/Province",
  "Verification Status",
  "Trust Score",
  "Submitted By FMS",
  "Last Verified",
  "Risk",
  "Status",
  "Action",
] as const;

export function FactoryTable({ factories }: FactoryTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm" aria-label="Factory database records">
          <thead className="bg-brand-navy text-white">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap px-4 py-3 font-semibold" key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {factories.map((factory) => (
              <tr className="align-top hover:bg-brand-background" key={factory.id}>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {factory.factoryCode}
                </td>
                <td className="min-w-56 px-4 py-4 text-brand-text">
                  <span className="font-semibold">{factory.displayName}</span>
                  <span className="mt-1 block text-xs text-brand-muted" lang="zh-CN">
                    {factory.chineseLegalName}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {factory.category}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {factory.cityProvince}
                </td>
                <td className="px-4 py-4">
                  <FactoryStatusBadge status={factory.verificationStatus} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {factory.trustScore}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {factory.submittedByFms}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {factory.lastVerifiedDate}
                </td>
                <td className="px-4 py-4">
                  <FactoryStatusBadge status={factory.riskFlag} />
                </td>
                <td className="px-4 py-4">
                  <FactoryStatusBadge status={factory.status} />
                </td>
                <td className="min-w-64 px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white no-underline hover:bg-brand-emerald"
                      href={`/admin/factories/${factory.id}`}
                    >
                      View Record
                    </Link>
                    {["Review Evidence", "Mark Needs Verification Placeholder", "Suspend Placeholder"].map((action) => (
                      <button
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-brand-navy hover:border-brand-emerald hover:text-brand-emerald"
                        key={action}
                        type="button"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
