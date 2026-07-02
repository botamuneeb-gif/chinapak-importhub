"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listFmsAssignmentsAction,
  type LiveFmsAssignmentListItem,
} from "@/app/fms/assignments/actions";
import { FmsStatusBadge } from "@/components/fms/fms-status-badge";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

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

export function LiveFmsAssignmentsTable() {
  const [assignments, setAssignments] = useState<LiveFmsAssignmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Please login as an approved FMS to view assignments.");
            setIsLoading(false);
          }
          return;
        }

        const result = await listFmsAssignmentsAction(session.access_token);

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setAssignments(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Live FMS assignments are not configured yet.",
        );
        setIsLoading(false);
      }
    }

    void loadAssignments();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading live assignments from Supabase...
      </div>
    );
  }

  if (message) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        {message}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm leading-7 text-brand-muted shadow-sm">
        No live assignments have been assigned to this FMS yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table
          className="min-w-full border-collapse text-left text-sm"
          aria-label="Live FMS assignments"
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
          <tbody className="divide-y divide-slate-200">
            {assignments.map((assignment) => (
              <tr className="align-top hover:bg-brand-background" key={assignment.assignmentCode}>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {assignment.assignmentCode}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {assignment.projectCode}
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
                    href={`/fms/assignments/${assignment.assignmentCode}`}
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
