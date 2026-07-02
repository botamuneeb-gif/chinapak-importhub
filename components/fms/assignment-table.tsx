import Link from "next/link";
import { FmsStatusBadge } from "@/components/fms/fms-status-badge";
import type { FmsAssignment } from "@/config/fms-portal";

type AssignmentTableProps = {
  assignments: FmsAssignment[];
};

const columns = [
  "Assignment ID",
  "Project ID",
  "Product",
  "Category",
  "Package",
  "Deadline",
  "Milestone Status",
  "Submission Status",
  "Admin Feedback",
  "Action",
] as const;

export function AssignmentTable({ assignments }: AssignmentTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm" aria-label="FMS assignments">
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
            {assignments.map((assignment) => (
              <tr className="align-top hover:bg-brand-background" key={assignment.id}>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {assignment.id}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {assignment.projectId}
                </td>
                <td className="min-w-44 px-4 py-4 text-brand-text">
                  {assignment.product}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {assignment.category}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {assignment.packageName}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {assignment.deadline}
                </td>
                <td className="px-4 py-4">
                  <FmsStatusBadge status={assignment.milestoneStatus} />
                </td>
                <td className="px-4 py-4">
                  <FmsStatusBadge status={assignment.submissionStatus} />
                </td>
                <td className="min-w-64 px-4 py-4 text-brand-muted">
                  {assignment.adminFeedback}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <Link
                    className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white no-underline hover:bg-brand-emerald"
                    href={`/fms/assignments/${assignment.id}`}
                  >
                    Open Workspace
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
