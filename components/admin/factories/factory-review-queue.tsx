import { FactoryStatusBadge } from "@/components/admin/factories/factory-status-badge";
import type { FactorySubmission } from "@/config/factory-database";

type FactoryReviewQueueProps = {
  submissions: FactorySubmission[];
};

const columns = [
  "Submission ID",
  "Assignment ID",
  "Project ID",
  "Submitted by FMS",
  "Product Category",
  "Factory Display Name",
  "Evidence Count",
  "Contact Info Present",
  "Possible Duplicate Warning",
  "Risk Warning",
  "Submitted Date",
  "Action",
] as const;

export function FactoryReviewQueue({ submissions }: FactoryReviewQueueProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm" aria-label="Factory submissions review queue">
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
            {submissions.map((submission) => (
              <tr className="align-top hover:bg-brand-background" key={submission.id}>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {submission.id}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {submission.assignmentId}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {submission.projectId}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {submission.submittedByFms}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {submission.productCategory}
                </td>
                <td className="min-w-56 px-4 py-4 text-brand-text">
                  {submission.factoryDisplayName}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {submission.evidenceCount}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {submission.contactInfoPresent ? "Yes" : "No"}
                </td>
                <td className="min-w-56 px-4 py-4 text-brand-muted">
                  {submission.possibleDuplicateWarning}
                </td>
                <td className="px-4 py-4">
                  <FactoryStatusBadge status={submission.riskWarning} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {submission.submittedDate}
                </td>
                <td className="min-w-64 px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {submission.actions.map((action) => (
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
