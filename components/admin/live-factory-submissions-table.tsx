"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listFactorySubmissionsForAdminAction,
  type FactorySubmissionQueueItem,
} from "@/app/admin/factory-submissions/actions";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminTable } from "@/components/admin/admin-table";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const columns = [
  "Submission ID",
  "Project",
  "Assignment",
  "FMS",
  "Factory",
  "Category",
  "Status",
  "Risk",
  "Submitted",
  "Action",
] as const;

export function LiveFactorySubmissionsTable() {
  const [items, setItems] = useState<FactorySubmissionQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSubmissions() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Please login as an admin to view FMS submissions.");
            setIsLoading(false);
          }
          return;
        }

        const result = await listFactorySubmissionsForAdminAction(
          session.access_token,
        );

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setItems(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Factory submissions are not configured yet.",
        );
        setIsLoading(false);
      }
    }

    void loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading FMS factory submissions from Supabase...
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

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        No FMS factory submissions are waiting in the review queue yet.
      </div>
    );
  }

  return (
    <AdminTable columns={[...columns]} label="FMS factory submissions">
      {items.map((item) => (
        <tr className="align-top hover:bg-brand-background" key={item.submissionCode}>
          <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
            {item.submissionCode}
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
            {item.projectCode}
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
            {item.assignmentCode}
          </td>
          <td className="min-w-44 px-4 py-4 text-brand-muted">
            {item.fmsCode} · {item.fmsName}
          </td>
          <td className="min-w-52 px-4 py-4 text-brand-text">
            {item.factoryDisplayName}
          </td>
          <td className="min-w-44 px-4 py-4 text-brand-muted">
            {item.productCategory}
          </td>
          <td className="px-4 py-4">
            <AdminStatusBadge status={item.submissionStatus} />
            <p className="mt-2 text-xs text-brand-muted">
              {item.adminReviewStatus}
            </p>
          </td>
          <td className="min-w-36 px-4 py-4 text-brand-muted">
            {item.riskFlags.length > 0 ? item.riskFlags.join(", ") : "None"}
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
            {item.createdAt}
          </td>
          <td className="px-4 py-4">
            <Link
              className="inline-flex min-h-10 items-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-emerald"
              href={`${ROUTES.adminFactorySubmissions}/${item.submissionCode}`}
            >
              Open Review
            </Link>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
