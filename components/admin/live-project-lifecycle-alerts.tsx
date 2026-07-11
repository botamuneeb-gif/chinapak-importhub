"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listProjectLifecycleAlertsAction,
  runProjectLifecycleAlertScanAction,
  sendDailyOperationsDigestNowAction,
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
    throw new Error("Please login as Admin to view lifecycle alerts.");
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

export function LiveProjectLifecycleAlerts() {
  const [alerts, setAlerts] = useState<ProjectLifecycleAlertView[]>([]);
  const [isDigestSending, setIsDigestSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAlerts() {
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await listProjectLifecycleAlertsAction(
        accessToken,
        USER_ROLES.admin,
      );

      if (!result.ok) {
        throw new Error(result.message);
      }

      setAlerts(result.data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Lifecycle alerts could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function runScan() {
    setIsScanning(true);
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await runProjectLifecycleAlertScanAction(accessToken);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setMessage(result.message ?? "Lifecycle alert scan completed.");
      await loadAlerts();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Lifecycle alert scan could not be completed.",
      );
    } finally {
      setIsScanning(false);
    }
  }

  async function sendDigest() {
    setIsDigestSending(true);
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await sendDailyOperationsDigestNowAction(accessToken);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setMessage(result.message ?? "Daily operations digest sent.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Daily operations digest could not be sent.",
      );
    } finally {
      setIsDigestSending(false);
    }
  }

  useEffect(() => {
    void loadAlerts();
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-emerald">
            Lifecycle automation
          </p>
          <h2 className="mt-1 text-2xl font-bold text-brand-navy">
            Projects Needing Attention
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Stuck-stage alerts are advisory only. They never approve payments,
            assign FMS, or release reports automatically.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          <button
            className="min-h-11 rounded-lg border border-brand-emerald px-4 py-2 text-sm font-bold text-brand-emerald transition hover:bg-brand-emerald hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-brand-muted"
            disabled={isScanning}
            onClick={() => void runScan()}
            type="button"
          >
            {isScanning ? "Scanning..." : "Run lifecycle alert scan"}
          </button>
          <button
            className="min-h-11 rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isDigestSending}
            onClick={() => void sendDigest()}
            type="button"
          >
            {isDigestSending
              ? "Sending digest..."
              : "Send daily operations digest now"}
          </button>
        </div>
      </div>

      {message ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg border border-brand-gold bg-amber-50 p-3 text-sm font-semibold text-brand-navy"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-brand-muted">
            Loading lifecycle alerts...
          </p>
        ) : null}

        {!isLoading && alerts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-brand-muted">
            No stuck-stage alerts are active right now.
          </p>
        ) : null}

        {alerts.map((alert) => (
          <article
            className="rounded-lg border border-slate-200 bg-brand-background p-4"
            key={`${alert.projectId}-${alert.alertType}`}
          >
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
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
                Open project
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
