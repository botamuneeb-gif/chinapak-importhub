"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  listForwardedFmsApplicationsAction,
  reviewFmsApplicationBySuperAdminAction,
  type FmsApplicationQueueItem,
  type SuperAdminFmsDecision,
} from "@/app/admin/leads/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type FeedbackState = Record<string, { error?: string; message?: string }>;

const filters = [
  { id: "all", label: "All" },
  { id: "forwarded_to_super_admin", label: "Pending Final Review" },
  { id: "converted", label: "Approved / Converted" },
  { id: "approved_pending_account_setup", label: "Manual Setup Needed" },
  { id: "super_admin_declined", label: "Declined" },
] as const;

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login as Super Admin.");
  }

  return session.access_token;
}

function statusClass(status: FmsApplicationQueueItem["workflowStatus"]) {
  if (status === "converted" || status === "super_admin_approved") {
    return "bg-emerald-50 text-brand-emerald";
  }

  if (status === "approved_pending_account_setup" || status === "pending_more_info") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "super_admin_declined") {
    return "bg-red-50 text-brand-error";
  }

  return "bg-blue-50 text-blue-700";
}

export function LiveFmsApplications() {
  const [applications, setApplications] = useState<FmsApplicationQueueItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [busyLeadId, setBusyLeadId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadApplications = useCallback(async () => {
    const accessToken = await getAccessToken();
    const result = await listForwardedFmsApplicationsAction(accessToken);

    if (!result.ok) {
      throw new Error(result.message);
    }

    setApplications(result.data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        await loadApplications();

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(
            error instanceof Error
              ? error.message
              : "FMS application queue could not be loaded.",
          );
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [loadApplications]);

  const visibleApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return applications.filter((application) => {
      if (activeFilter !== "all" && application.workflowStatus !== activeFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return application.searchableText.includes(normalizedQuery);
    });
  }, [activeFilter, applications, query]);

  function setLeadFeedback(
    leadId: string,
    nextFeedback: { error?: string; message?: string },
  ) {
    setFeedback((current) => ({
      ...current,
      [leadId]: nextFeedback,
    }));
  }

  function runDecision(
    application: FmsApplicationQueueItem,
    decision: SuperAdminFmsDecision,
  ) {
    setBusyLeadId(application.id);
    setLeadFeedback(application.id, {});
    startTransition(async () => {
      try {
        const accessToken = await getAccessToken();
        const result = await reviewFmsApplicationBySuperAdminAction(accessToken, {
          decision,
          leadId: application.id,
          note: notes[application.id] ?? "",
        });

        if (!result.ok) {
          setLeadFeedback(application.id, { error: result.message });
        } else {
          setLeadFeedback(application.id, {
            message: result.message ?? "FMS application updated.",
          });
          await loadApplications();
        }
      } catch (error) {
        setLeadFeedback(application.id, {
          error:
            error instanceof Error
              ? error.message
              : "FMS application decision failed.",
        });
      } finally {
        setBusyLeadId("");
      }
    });
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading forwarded FMS applications...
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-lg border border-brand-error bg-red-50 p-6 text-sm font-semibold text-brand-error shadow-sm">
        {pageError}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="space-y-2 text-sm font-semibold text-brand-navy">
            Search FMS applications
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email, WeChat, phone, city, categories..."
              value={query}
            />
          </label>
          <Button
            onClick={() => void loadApplications()}
            type="button"
            variant="outline"
          >
            Refresh
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              className={`rounded-full border px-3 py-2 text-sm font-bold ${
                activeFilter === filter.id
                  ? "border-brand-emerald bg-brand-emerald text-white"
                  : "border-slate-200 bg-white text-brand-muted hover:border-brand-emerald hover:text-brand-navy"
              }`}
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {visibleApplications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-brand-muted shadow-sm">
          No FMS applications match this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {visibleApplications.map((application) => {
            const isBusy =
              (isPending && busyLeadId === application.id) ||
              busyLeadId === application.id;
            const finalReviewOpen =
              application.workflowStatus === "forwarded_to_super_admin";

            return (
              <article
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                key={application.id}
              >
                <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-brand-navy" translate="no">
                        {application.leadCode}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          application.workflowStatus,
                        )}`}
                      >
                        {application.workflowStatusLabel}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold text-brand-navy">
                      {application.importerName}
                    </h2>
                    <dl className="mt-4 grid gap-3 text-sm leading-7 text-brand-muted md:grid-cols-2">
                      <div>
                        <dt className="font-bold text-brand-navy">City / Province</dt>
                        <dd>{application.provinceCity}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-brand-navy">Languages</dt>
                        <dd>{application.languages}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-brand-navy">WeChat</dt>
                        <dd>{application.wechatId}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-brand-navy">Email / Phone</dt>
                        <dd>
                          {application.email} / {application.phone}
                        </dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="font-bold text-brand-navy">Product categories</dt>
                        <dd>{application.productCategories}</dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="font-bold text-brand-navy">Factory regions</dt>
                        <dd>{application.factoryRegions}</dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="font-bold text-brand-navy">Experience</dt>
                        <dd>{application.experience}</dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="font-bold text-brand-navy">Introduction</dt>
                        <dd>{application.shortIntroduction}</dd>
                      </div>
                    </dl>
                    {application.convertedEntityId ? (
                      <p className="mt-4 rounded-lg border border-brand-emerald bg-emerald-50 p-3 text-sm font-semibold text-brand-emerald">
                        Converted to {application.convertedEntityType}:{" "}
                        <span translate="no">{application.convertedEntityId}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-3 rounded-lg border border-slate-200 bg-brand-background p-4">
                    <label className="block space-y-2 text-sm font-semibold text-brand-navy">
                      Super Admin note
                      <textarea
                        className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
                        onChange={(event) =>
                          setNotes((current) => ({
                            ...current,
                            [application.id]: event.target.value,
                          }))
                        }
                        placeholder="Required context for approval/decline"
                        value={notes[application.id] ?? ""}
                      />
                    </label>
                    <div className="grid gap-2">
                      <Button
                        disabled={isBusy || !finalReviewOpen}
                        onClick={() => runDecision(application, "approve")}
                        type="button"
                        variant="secondary"
                      >
                        Approve FMS Application
                      </Button>
                      <Button
                        disabled={isBusy || !finalReviewOpen}
                        onClick={() =>
                          runDecision(application, "request_more_info")
                        }
                        type="button"
                        variant="gold"
                      >
                        Request More Info
                      </Button>
                      <Button
                        disabled={isBusy || !finalReviewOpen}
                        onClick={() => runDecision(application, "decline")}
                        type="button"
                        variant="outline"
                      >
                        Decline Application
                      </Button>
                    </div>
                    {!finalReviewOpen ? (
                      <p className="text-xs leading-5 text-brand-muted">
                        Final-review actions are available only while the lead is
                        forwarded to Super Admin.
                      </p>
                    ) : null}
                    <p className="rounded-lg border border-brand-gold bg-amber-50 p-3 text-xs leading-5 text-brand-navy">
                      Approval never creates a default password. The secure path
                      uses Supabase invite email when possible; otherwise the lead
                      is marked approved pending manual account setup.
                    </p>
                    <ActionFeedback
                      error={feedback[application.id]?.error}
                      message={feedback[application.id]?.message}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
