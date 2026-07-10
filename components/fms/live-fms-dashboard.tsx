"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getFmsDashboardAction,
  type LiveFmsDashboard as LiveFmsDashboardData,
} from "@/app/fms/assignments/actions";
import { FmsSectionCard } from "@/components/fms/fms-section-card";
import { FmsStatCard } from "@/components/fms/fms-stat-card";
import { FmsStatusBadge } from "@/components/fms/fms-status-badge";
import { fmsRules } from "@/config/fms-portal";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function LiveFmsDashboard() {
  const [dashboard, setDashboard] = useState<LiveFmsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
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

        const result = await getFmsDashboardAction(session.access_token);

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setDashboard(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Live FMS dashboard is not configured yet.",
        );
        setIsLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading live FMS dashboard from Supabase...
      </div>
    );
  }

  if (message || !dashboard) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        {message || "Live FMS dashboard could not be loaded."}
      </div>
    );
  }

  const needsAction = dashboard.assignments.filter(
    (assignment) =>
      assignment.statusRaw === "assigned" ||
      assignment.statusRaw === "changes_requested",
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <FmsStatCard
            detail={stat.detail}
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <FmsSectionCard title="Assigned Projects Needing Action">
          <div className="grid gap-3">
            {needsAction.length > 0 ? (
              needsAction.map((assignment) => (
                <Link
                  className="rounded-lg border border-slate-200 bg-brand-background p-4 no-underline transition hover:border-brand-emerald"
                  href={`/fms/assignments/${assignment.assignmentCode}`}
                  key={assignment.assignmentCode}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-brand-navy">
                        {assignment.assignmentCode}
                      </p>
                      <p className="mt-1 text-sm text-brand-muted">
                        {assignment.product} - {assignment.projectCode}
                      </p>
                    </div>
                    <FmsStatusBadge status={assignment.milestoneStatus} />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-brand-muted">
                    {assignment.adminFeedback}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-lg bg-brand-background p-4 text-sm text-brand-muted">
                No assigned projects need immediate action.
              </p>
            )}
          </div>
        </FmsSectionCard>

        <FmsSectionCard title="Mobile Field Workflow">
          <div className="grid gap-3">
            {[
              "Open an assignment before contacting or researching suppliers.",
              "Enter quotation, MOQ, lead time, match notes, and risk notes from the assignment workspace.",
              "Upload evidence only through the approved file panel when available.",
              "Submit factory options to Admin review first. Importers never receive FMS contact details.",
            ].map((item) => (
              <div
                className="rounded-lg border border-slate-200 bg-brand-background p-3 text-sm font-semibold leading-6 text-brand-muted"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </FmsSectionCard>
      </div>

      <div className="mt-8 rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Important Platform Rules</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {fmsRules.map((rule) => (
            <li className="rounded-lg bg-white p-3 text-sm font-semibold" key={rule}>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
