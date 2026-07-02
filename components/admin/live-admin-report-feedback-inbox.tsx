"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listAdminReportFeedbackAction,
  type AdminReportFeedbackItem,
} from "@/app/admin/report-feedback/actions";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function LiveAdminReportFeedbackInbox() {
  const [feedbackItems, setFeedbackItems] = useState<AdminReportFeedbackItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadFeedback() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Please login as admin to view report feedback.");
            setIsLoading(false);
          }
          return;
        }

        const result = await listAdminReportFeedbackAction(session.access_token);

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setFeedbackItems(result.data);
        setIsLoading(false);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setMessage(
          loadError instanceof Error
            ? loadError.message
            : "Report feedback inbox could not be loaded.",
        );
        setIsLoading(false);
      }
    }

    void loadFeedback();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading report feedback...
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

  if (feedbackItems.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-brand-navy">
          No report feedback yet
        </h2>
        <p className="mt-2 text-sm leading-7 text-brand-muted">
          Importer questions about released reports will appear here after they
          pass the platform contact firewall.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-brand-navy text-white">
            <tr>
              {[
                "Feedback ID",
                "Project ID",
                "Importer",
                "Type",
                "Message",
                "Status",
                "Created",
                "Action",
              ].map((heading) => (
                <th className="px-4 py-3 font-semibold" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {feedbackItems.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-4 font-bold text-brand-navy">
                  {item.feedbackCode}
                </td>
                <td className="px-4 py-4 text-brand-navy">
                  {item.projectCode}
                </td>
                <td className="px-4 py-4 text-brand-muted">
                  {item.importerName}
                </td>
                <td className="px-4 py-4 text-brand-muted">
                  {item.feedbackType}
                </td>
                <td className="max-w-sm px-4 py-4 text-brand-muted">
                  {item.message}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-lg border border-brand-gold bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-brand-muted">{item.createdAt}</td>
                <td className="px-4 py-4">
                  <Link
                    className="inline-flex min-h-10 items-center rounded-lg bg-brand-emerald px-4 py-2 text-xs font-bold text-white no-underline transition hover:bg-brand-navy"
                    href={`${ROUTES.admin}/projects/${encodeURIComponent(
                      item.projectCode,
                    )}#report-feedback`}
                  >
                    Open Project
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
