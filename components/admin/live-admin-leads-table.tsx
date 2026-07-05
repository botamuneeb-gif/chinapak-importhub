"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  convertProjectLeadToImportProjectAction,
  listLeadQueueAction,
  updateLeadWorkflowAction,
  type AdminLeadQueueItem,
  type LeadWorkflowAction,
} from "@/app/admin/leads/actions";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LeadFilter =
  | "all"
  | "project"
  | "fms"
  | "pending"
  | "forwarded"
  | "converted"
  | "declined";

type FeedbackState = Record<string, { error?: string; message?: string }>;

const filters: Array<{ id: LeadFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "project", label: "Project Leads" },
  { id: "fms", label: "FMS Applications" },
  { id: "pending", label: "Pending" },
  { id: "forwarded", label: "Forwarded" },
  { id: "converted", label: "Converted" },
  { id: "declined", label: "Declined" },
];

const fmsActions: Array<{ action: LeadWorkflowAction; label: string }> = [
  { action: "fms_in_review", label: "Mark In Review" },
  { action: "fms_pending_more_info", label: "Pending More Info" },
  { action: "fms_forward_super_admin", label: "Forward to Super Admin" },
  { action: "fms_decline_admin", label: "Decline Screening" },
];

const projectActions: Array<{ action: LeadWorkflowAction; label: string }> = [
  { action: "project_contacted", label: "Mark Contacted" },
  { action: "project_qualified", label: "Mark Qualified" },
  { action: "project_pending_more_info", label: "Pending More Info" },
  { action: "project_decline", label: "Decline" },
];

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login as an admin to view leads.");
  }

  return session.access_token;
}

function filterMatches(lead: AdminLeadQueueItem, filter: LeadFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "project") {
    return !lead.isFmsApplication;
  }

  if (filter === "fms") {
    return lead.isFmsApplication;
  }

  if (filter === "pending") {
    return ["new", "in_review", "contacted", "qualified", "pending_more_info"].includes(
      lead.workflowStatus,
    );
  }

  if (filter === "forwarded") {
    return lead.workflowStatus === "forwarded_to_super_admin";
  }

  if (filter === "converted") {
    return lead.workflowStatus === "converted";
  }

  if (filter === "declined") {
    return ["admin_declined", "super_admin_declined"].includes(
      lead.workflowStatus,
    );
  }

  return true;
}

function workflowBadgeClass(status: AdminLeadQueueItem["workflowStatus"]) {
  if (status === "converted" || status === "super_admin_approved") {
    return "bg-emerald-50 text-brand-emerald";
  }

  if (status === "forwarded_to_super_admin" || status === "qualified") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "admin_declined" || status === "super_admin_declined") {
    return "bg-red-50 text-brand-error";
  }

  if (status === "pending_more_info" || status === "approved_pending_account_setup") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-brand-muted";
}

export function LiveAdminLeadsTable() {
  const [leads, setLeads] = useState<AdminLeadQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState<LeadFilter>("all");
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [busyLeadId, setBusyLeadId] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadLeads = useCallback(async () => {
    const accessToken = await getAccessToken();
    const result = await listLeadQueueAction(accessToken);

    if (!result.ok) {
      throw new Error(result.message);
    }

    setLeads(result.data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        await loadLeads();

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setPageMessage(
            error instanceof Error
              ? error.message
              : "Lead queue could not be loaded.",
          );
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [loadLeads]);

  const visibleLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads.filter((lead) => {
      if (!filterMatches(lead, activeFilter)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return lead.searchableText.includes(normalizedQuery);
    });
  }, [activeFilter, leads, query]);

  function setLeadFeedback(
    leadId: string,
    nextFeedback: { error?: string; message?: string },
  ) {
    setFeedback((current) => ({
      ...current,
      [leadId]: nextFeedback,
    }));
  }

  function runWorkflowAction(lead: AdminLeadQueueItem, action: LeadWorkflowAction) {
    setBusyLeadId(lead.id);
    setLeadFeedback(lead.id, {});
    startTransition(async () => {
      try {
        const accessToken = await getAccessToken();
        const result = await updateLeadWorkflowAction(accessToken, {
          action,
          leadId: lead.id,
          note: notes[lead.id] ?? "",
        });

        if (!result.ok) {
          setLeadFeedback(lead.id, { error: result.message });
        } else {
          setLeadFeedback(lead.id, { message: result.message ?? "Lead updated." });
          await loadLeads();
        }
      } catch (error) {
        setLeadFeedback(lead.id, {
          error:
            error instanceof Error ? error.message : "Lead update failed.",
        });
      } finally {
        setBusyLeadId("");
      }
    });
  }

  function convertLead(lead: AdminLeadQueueItem) {
    setBusyLeadId(lead.id);
    setLeadFeedback(lead.id, {});
    startTransition(async () => {
      try {
        const accessToken = await getAccessToken();
        const result = await convertProjectLeadToImportProjectAction(
          accessToken,
          lead.id,
        );

        if (!result.ok) {
          setLeadFeedback(lead.id, { error: result.message });
        } else {
          setLeadFeedback(lead.id, {
            message:
              result.message ??
              `Converted to ${result.data.projectCode}. Payment still required.`,
          });
          await loadLeads();
        }
      } catch (error) {
        setLeadFeedback(lead.id, {
          error:
            error instanceof Error
              ? error.message
              : "Project lead conversion failed.",
        });
      } finally {
        setBusyLeadId("");
      }
    });
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading lead management queue...
      </div>
    );
  }

  if (pageMessage) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        {pageMessage}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="space-y-2 text-sm font-semibold text-brand-navy">
            Search leads
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email, phone, city, lead code, product, WeChat..."
              value={query}
            />
          </label>
          <Button onClick={() => void loadLeads()} type="button" variant="outline">
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

      {visibleLeads.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-brand-muted shadow-sm">
          No leads match this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {visibleLeads.map((lead) => {
            const actionOptions = lead.isFmsApplication
              ? fmsActions
              : projectActions;
            const isBusy = (isPending && busyLeadId === lead.id) || busyLeadId === lead.id;

            return (
              <article
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                key={lead.id}
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-brand-navy" translate="no">
                        {lead.leadCode}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          lead.isFmsApplication
                            ? "bg-emerald-50 text-brand-emerald"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {lead.leadTypeLabel}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${workflowBadgeClass(
                          lead.workflowStatus,
                        )}`}
                      >
                        {lead.workflowStatusLabel}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-brand-navy">
                      {lead.importerName}
                    </h2>
                    <dl className="mt-4 grid gap-3 text-sm leading-7 text-brand-muted md:grid-cols-2">
                      <div>
                        <dt className="font-bold text-brand-navy">City / Province</dt>
                        <dd>{lead.city}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-brand-navy">
                          Contact for admin only
                        </dt>
                        <dd>{lead.contactForAdminOnly}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-brand-navy">
                          Product / Categories
                        </dt>
                        <dd>{lead.product}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-brand-navy">
                          Package / Review track
                        </dt>
                        <dd>{lead.packageSelected}</dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="font-bold text-brand-navy">
                          Reason / Experience notes
                        </dt>
                        <dd>{lead.paymentIssue}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-brand-navy">Created</dt>
                        <dd>{lead.createdDate}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-brand-navy">Lead status</dt>
                        <dd className="mt-1">
                          <AdminStatusBadge status={lead.leadStatus} />
                        </dd>
                      </div>
                    </dl>
                    {lead.convertedEntityId ? (
                      <p className="mt-4 rounded-lg border border-brand-emerald bg-emerald-50 p-3 text-sm font-semibold text-brand-emerald">
                        Converted to {lead.convertedEntityType}:{" "}
                        <span translate="no">{lead.convertedEntityId}</span>
                      </p>
                    ) : null}
                    <p className="mt-4 rounded-lg bg-brand-background p-3 text-sm leading-7 text-brand-muted">
                      {lead.adminReviewNote}
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg border border-slate-200 bg-brand-background p-4">
                    <label className="block space-y-2 text-sm font-semibold text-brand-navy">
                      Internal admin note
                      <textarea
                        className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
                        onChange={(event) =>
                          setNotes((current) => ({
                            ...current,
                            [lead.id]: event.target.value,
                          }))
                        }
                        placeholder="Optional note for this action"
                        value={notes[lead.id] ?? ""}
                      />
                    </label>
                    <div className="grid gap-2">
                      {actionOptions.map((option) => (
                        <Button
                          disabled={isBusy}
                          key={option.action}
                          onClick={() => runWorkflowAction(lead, option.action)}
                          type="button"
                          variant={
                            option.action.includes("decline")
                              ? "outline"
                              : option.action.includes("forward")
                                ? "gold"
                                : "secondary"
                          }
                        >
                          {option.label}
                        </Button>
                      ))}
                      {!lead.isFmsApplication ? (
                        <Button
                          disabled={isBusy || !lead.canConvertProjectLead}
                          onClick={() => convertLead(lead)}
                          type="button"
                          variant="gold"
                        >
                          Convert to Import Project
                        </Button>
                      ) : null}
                      {lead.isFmsApplication &&
                      lead.workflowStatus === "forwarded_to_super_admin" ? (
                        <Button
                          href={ROUTES.superAdminFmsApplications}
                          variant="outline"
                        >
                          Open Super Admin Queue
                        </Button>
                      ) : null}
                    </div>
                    {!lead.canConvertProjectLead && !lead.isFmsApplication ? (
                      <p className="text-xs leading-5 text-brand-muted">
                        Conversion requires importer profile, auth user, and
                        package data from the original lead.
                      </p>
                    ) : null}
                    <ActionFeedback
                      error={feedback[lead.id]?.error}
                      message={feedback[lead.id]?.message}
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
