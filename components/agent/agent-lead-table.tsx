import Link from "next/link";
import { AgentStatusBadge } from "@/components/agent/agent-status-badge";
import type { AgentLead } from "@/config/agents";
import { ROUTES } from "@/config/brand";

type AgentLeadTableProps = {
  leads: AgentLead[];
};

const columns = [
  "Lead ID",
  "Importer Name",
  "City",
  "Product",
  "Package Selected",
  "Payment Issue",
  "Lead Status",
  "Last Contact",
  "Follow-up Due",
  "Action",
] as const;

export function AgentLeadTable({ leads }: AgentLeadTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm" aria-label="Assigned agent leads">
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
            {leads.map((lead) => (
              <tr className="align-top hover:bg-brand-background" key={lead.id}>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {lead.id}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-text">
                  {lead.importerName}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {lead.city}
                </td>
                <td className="min-w-48 px-4 py-4 text-brand-text">
                  {lead.product}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {lead.packageSelected}
                </td>
                <td className="min-w-56 px-4 py-4 text-brand-muted">
                  {lead.paymentIssue}
                </td>
                <td className="px-4 py-4">
                  <AgentStatusBadge status={lead.leadStatus} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {lead.lastContact}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {lead.followUpDue}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <Link
                    className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white no-underline hover:bg-brand-emerald"
                    href={`${ROUTES.agentLeads}/${lead.id}`}
                  >
                    View Lead
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
