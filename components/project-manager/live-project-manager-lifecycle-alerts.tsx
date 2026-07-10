"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listProjectLifecycleAlertsAction,
  type ProjectLifecycleAlertView,
} from "@/app/project-lifecycle-alerts/actions";
import { USER_ROLES } from "@/lib/auth/roles";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login as a Project Manager to view follow-up alerts.");
  }

  return session.access_token;
}

function severityClasses(severity: ProjectLifecycleAlertView["severity"]) {
  if (severity === "high") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (severity === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-brand-muted";
}

export function LiveProjectManagerLifecycleAlerts() {
  const [alerts, setAlerts] = useState<ProjectLifecycleAlertView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadAlerts() {
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await listProjectLifecycleAlertsAction(
        accessToken,
        USER_ROLES.projectManager,
      );

      if (!result.ok) {
        throw new Error(result.message);
      }

      setAlerts(result.data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Project Manager lifecycle alerts could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAlerts();
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-emerald">
            Workflow follow-up
          </p>
          <h2 className="mt-1 text-xl font-bold text-brand-navy">
            Projects Needing Follow-up
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            These alerts show stuck operational stages. Use PM notes and
            escalation when the next step requires Admin authority.
          </p>
        </div>
        <button
          className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald"
          onClick={() => void loadAlerts()}
          type="button"
        >
          Refresh
        </button>
      </div>

      {message ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg border border-brand-gold bg-amber-50 p-3 text-sm font-semibold text-brand-navy"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-brand-muted">
            Loading follow-up alerts...
          </p>
        ) : null}

        {!isLoading && alerts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-brand-muted">
            No lifecycle follow-up alerts are active right now.
          </p>
        ) : null}

        {alerts.map((alert) => (
          <article
            className="rounded-lg border border-slate-200 bg-brand-background p-4"
            key={`${alert.projectId}-${alert.alertType}`}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-brand-gold" translate="no">
                    {alert.projectCode}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-bold ${severityClasses(
                      alert.severity,
                    )}`}
                  >
                    {alert.severityLabel}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-brand-muted">
                    {alert.ageLabel}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-brand-navy">
                  {alert.alertLabel}
                </h3>
                <p className="mt-1 text-sm font-semibold text-brand-muted">
                  {alert.productTitle} | {alert.currentStage}
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-text">
                  {alert.recommendedAction}
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-emerald"
                href={alert.relatedRoute}
              >
                Open PM project
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
