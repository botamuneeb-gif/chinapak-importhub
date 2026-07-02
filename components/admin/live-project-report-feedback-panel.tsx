"use client";

import { useEffect, useState } from "react";
import {
  getAdminProjectReportFeedbackAction,
  requestFmsClarificationForFeedbackAction,
  respondToReportFeedbackAction,
  type AdminReportFeedbackItem,
} from "@/app/admin/report-feedback/actions";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LiveProjectReportFeedbackPanelProps = {
  projectCode: string;
};

export function LiveProjectReportFeedbackPanel({
  projectCode,
}: LiveProjectReportFeedbackPanelProps) {
  const [feedbackItems, setFeedbackItems] = useState<AdminReportFeedbackItem[]>(
    [],
  );
  const [selectedFeedbackId, setSelectedFeedbackId] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [clarificationRequest, setClarificationRequest] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function getAdminAccessToken() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Please login as admin to manage report feedback.");
    }

    return session.access_token;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadFeedback() {
      try {
        const accessToken = await getAdminAccessToken();
        const result = await getAdminProjectReportFeedbackAction(
          accessToken,
          projectCode,
        );

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setError(result.message);
          setIsLoading(false);
          return;
        }

        setFeedbackItems(result.data);
        setSelectedFeedbackId(result.data[0]?.id ?? "");
        setIsLoading(false);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Project report feedback could not be loaded.",
        );
        setIsLoading(false);
      }
    }

    void loadFeedback();

    return () => {
      isMounted = false;
    };
  }, [projectCode]);

  const selectedFeedback =
    feedbackItems.find((item) => item.id === selectedFeedbackId) ?? null;

  async function runResponseAction(
    nextStatus:
      | "answered"
      | "closed"
      | "in_review"
      | "rejected_or_not_applicable",
    successMessage: string,
  ) {
    if (!selectedFeedback) {
      setError("Select a feedback item first.");
      return;
    }

    setIsMutating(true);
    setNotice("");
    setError("");

    try {
      const accessToken = await getAdminAccessToken();
      const result = await respondToReportFeedbackAction(
        accessToken,
        selectedFeedback.id,
        {
          adminResponse,
          internalNotes,
          nextStatus,
        },
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setFeedbackItems(result.data);
      setNotice(successMessage);
      setAdminResponse("");
      setInternalNotes("");
    } catch (responseError) {
      setError(
        responseError instanceof Error
          ? responseError.message
          : "Feedback response could not be saved.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function routeToFms() {
    if (!selectedFeedback) {
      setError("Select a feedback item first.");
      return;
    }

    setIsMutating(true);
    setNotice("");
    setError("");

    try {
      const accessToken = await getAdminAccessToken();
      const result = await requestFmsClarificationForFeedbackAction(
        accessToken,
        selectedFeedback.id,
        {
          clarificationRequest,
          internalNotes,
        },
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setFeedbackItems(result.data);
      setNotice(
        "Sanitized FMS clarification request recorded. FMS contact/importer details remain hidden.",
      );
      setClarificationRequest("");
      setInternalNotes("");
    } catch (routeError) {
      setError(
        routeError instanceof Error
          ? routeError.message
          : "FMS clarification request could not be recorded.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-brand-background p-4 text-sm font-semibold text-brand-muted">
        Loading project report feedback...
      </div>
    );
  }

  if (error && feedbackItems.length === 0) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
        {error}
      </div>
    );
  }

  if (feedbackItems.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-brand-background p-4 text-sm leading-7 text-brand-muted">
        No importer feedback has been submitted for this released report yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {(notice || error) && (
        <div
          className={`rounded-lg border p-4 text-sm font-semibold ${
            error
              ? "border-brand-error bg-red-50 text-brand-error"
              : "border-brand-emerald bg-emerald-50 text-brand-emerald"
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {feedbackItems.map((item) => (
            <button
              className={`w-full rounded-lg border p-4 text-left transition ${
                selectedFeedbackId === item.id
                  ? "border-brand-emerald bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-brand-gold"
              }`}
              key={item.id}
              onClick={() => {
                setSelectedFeedbackId(item.id);
                setAdminResponse("");
                setInternalNotes("");
                setClarificationRequest("");
                setError("");
                setNotice("");
              }}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-brand-muted">
                    {item.feedbackCode}
                  </p>
                  <p className="mt-1 text-sm font-bold text-brand-navy">
                    {item.feedbackType}
                  </p>
                </div>
                <AdminStatusBadge status={item.status} />
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-brand-muted">
                {item.message}
              </p>
            </button>
          ))}
        </div>

        {selectedFeedback ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-brand-muted">
                  {selectedFeedback.feedbackCode} • {selectedFeedback.createdAt}
                </p>
                <h3 className="mt-1 text-lg font-bold text-brand-navy">
                  {selectedFeedback.feedbackType}
                </h3>
              </div>
              <AdminStatusBadge status={selectedFeedback.status} />
            </div>
            <dl className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Importer
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {selectedFeedback.importerName}
                </dd>
              </div>
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Factory option
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {selectedFeedback.selectedOptionLabel}
                </dd>
              </div>
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Urgency
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {selectedFeedback.urgencyLevel}
                </dd>
              </div>
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Report status
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {selectedFeedback.reportStatus}
                </dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg border border-slate-200 bg-brand-background p-4">
              <p className="text-xs font-bold uppercase text-brand-muted">
                Importer message
              </p>
              <p className="mt-2 text-sm leading-7 text-brand-navy">
                {selectedFeedback.message}
              </p>
            </div>

            {selectedFeedback.adminResponse ? (
              <div className="mt-4 rounded-lg border border-brand-emerald bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase text-brand-emerald">
                  Current importer-visible response
                </p>
                <p className="mt-2 text-sm leading-7 text-brand-navy">
                  {selectedFeedback.adminResponse}
                </p>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4">
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="admin-feedback-response"
                >
                  Importer-safe admin response
                </label>
                <textarea
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                  disabled={isMutating}
                  id="admin-feedback-response"
                  onChange={(event) => setAdminResponse(event.target.value)}
                  placeholder="Write only admin-approved response text. Do not include FMS/factory contact details."
                  rows={4}
                  value={adminResponse}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="admin-feedback-internal"
                >
                  Internal notes
                </label>
                <textarea
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                  disabled={isMutating}
                  id="admin-feedback-internal"
                  onChange={(event) => setInternalNotes(event.target.value)}
                  placeholder="Admin-only note. Not shown to importer or FMS."
                  rows={3}
                  value={internalNotes}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="fms-clarification-request"
                >
                  Sanitized FMS clarification request
                </label>
                <textarea
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                  disabled={isMutating}
                  id="fms-clarification-request"
                  onChange={(event) =>
                    setClarificationRequest(event.target.value)
                  }
                  placeholder="Ask FMS for sourcing clarification only. Do not paste importer contact details or raw sensitive content."
                  rows={3}
                  value={clarificationRequest}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                className="min-h-12 rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isMutating || !adminResponse.trim()}
                onClick={() =>
                  void runResponseAction(
                    "answered",
                    "Importer-safe response saved and visible to importer.",
                  )
                }
                type="button"
              >
                Respond & Mark Answered
              </button>
              <button
                className="min-h-12 rounded-lg border border-brand-gold bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isMutating}
                onClick={() =>
                  void runResponseAction(
                    "in_review",
                    "Feedback marked in review.",
                  )
                }
                type="button"
              >
                Mark In Review
              </button>
              <button
                className="min-h-12 rounded-lg border border-brand-navy bg-white px-5 py-3 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isMutating || !clarificationRequest.trim()}
                onClick={() => void routeToFms()}
                type="button"
              >
                Request FMS Clarification
              </button>
              <button
                className="min-h-12 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-brand-muted transition hover:border-brand-navy hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isMutating}
                onClick={() =>
                  void runResponseAction("closed", "Feedback closed.")
                }
                type="button"
              >
                Close
              </button>
              <button
                className="min-h-12 rounded-lg border border-brand-error bg-white px-5 py-3 text-sm font-bold text-brand-error transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isMutating}
                onClick={() =>
                  void runResponseAction(
                    "rejected_or_not_applicable",
                    "Feedback marked not applicable.",
                  )
                }
                type="button"
              >
                Reject / Not Applicable
              </button>
            </div>

            {selectedFeedback.responses.length > 0 ? (
              <div className="mt-6">
                <h4 className="font-bold text-brand-navy">Response history</h4>
                <div className="mt-3 grid gap-2">
                  {selectedFeedback.responses.map((response) => (
                    <div
                      className="rounded-lg border border-slate-200 bg-brand-background p-3 text-sm leading-6 text-brand-muted"
                      key={`${selectedFeedback.id}-${response.createdAt}-${response.responseType}`}
                    >
                      <p className="font-semibold text-brand-navy">
                        {response.responseType} • {response.createdAt}
                      </p>
                      <p className="mt-1">{response.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
