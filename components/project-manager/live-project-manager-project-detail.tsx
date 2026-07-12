"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  addProjectManagerNoteAction,
  escalateProjectToAdminAction,
  getProjectManagerProjectDetailAction,
  updateProjectManagerWorkflowAction,
  type ProjectManagerProjectDetail,
  type ProjectManagerWorkflowState,
} from "@/app/project-manager/projects/actions";
import { ProjectManagerStatus } from "@/components/project-manager/project-manager-status";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Feedback = {
  message: string;
  tone: "error" | "success" | "warning";
};

const workflowOptions: Array<{
  label: string;
  value: ProjectManagerWorkflowState;
}> = [
  { label: "Manager Reviewing", value: "manager_reviewing" },
  { label: "Needs Importer Info", value: "needs_importer_info" },
  { label: "Ready for Admin Review", value: "ready_for_admin_review" },
  { label: "Waiting Internal Action", value: "waiting_internal_action" },
];

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login as a Project Manager to view this project.");
  }

  return session.access_token;
}

function ActionFeedback({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) {
    return null;
  }

  const toneClass =
    feedback.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : feedback.tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <p
      aria-live="polite"
      className={`mt-3 rounded-lg border p-3 text-sm font-semibold ${toneClass}`}
    >
      {feedback.message}
    </p>
  );
}

function DetailCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DefinitionGrid({
  rows,
}: {
  rows: Array<[string, string | React.ReactNode]>;
}) {
  return (
    <dl className="grid gap-4 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={label}>
          <dt className="text-xs font-bold uppercase tracking-wide text-brand-muted">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-brand-navy">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LiveProjectManagerProjectDetail({
  projectCode,
}: {
  projectCode: string;
}) {
  const [detail, setDetail] = useState<ProjectManagerProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");
  const [noteText, setNoteText] = useState("");
  const [workflowState, setWorkflowState] =
    useState<ProjectManagerWorkflowState>("manager_reviewing");
  const [workflowNote, setWorkflowNote] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationNote, setEscalationNote] = useState("");
  const [escalationUrgency, setEscalationUrgency] =
    useState<"normal" | "high" | "urgent">("normal");
  const [noteFeedback, setNoteFeedback] = useState<Feedback | null>(null);
  const [workflowFeedback, setWorkflowFeedback] = useState<Feedback | null>(null);
  const [escalationFeedback, setEscalationFeedback] =
    useState<Feedback | null>(null);
  const [busyAction, setBusyAction] = useState("");

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setPageMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await getProjectManagerProjectDetailAction(
        accessToken,
        projectCode,
      );

      if (!result.ok) {
        throw new Error(result.message);
      }

      setDetail(result.data);
      if (result.data.managerWorkflow.state !== "not_set") {
        setWorkflowState(result.data.managerWorkflow.state);
      }
    } catch (error) {
      setPageMessage(
        error instanceof Error
          ? error.message
          : "Project detail could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectCode]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  async function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("note");
    setNoteFeedback(null);

    try {
      const accessToken = await getAccessToken();
      const result = await addProjectManagerNoteAction(
        accessToken,
        projectCode,
        noteText,
      );

      if (!result.ok) {
        throw new Error(result.message);
      }

      setDetail(result.data);
      setNoteText("");
      setNoteFeedback({
        message: result.message ?? "Internal note saved.",
        tone: "success",
      });
    } catch (error) {
      setNoteFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Internal note could not be saved.",
        tone: "error",
      });
    } finally {
      setBusyAction("");
    }
  }

  async function updateWorkflow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("workflow");
    setWorkflowFeedback(null);

    try {
      const accessToken = await getAccessToken();
      const result = await updateProjectManagerWorkflowAction(
        accessToken,
        projectCode,
        {
          note: workflowNote,
          state: workflowState,
        },
      );

      if (!result.ok) {
        throw new Error(result.message);
      }

      setDetail(result.data);
      setWorkflowNote("");
      setWorkflowFeedback({
        message: result.message ?? "Project Manager marker updated.",
        tone: "success",
      });
    } catch (error) {
      setWorkflowFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Project Manager marker could not be updated.",
        tone: "error",
      });
    } finally {
      setBusyAction("");
    }
  }

  async function escalate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("escalation");
    setEscalationFeedback(null);

    try {
      const accessToken = await getAccessToken();
      const result = await escalateProjectToAdminAction(accessToken, projectCode, {
        note: escalationNote,
        reason: escalationReason,
        urgency: escalationUrgency,
      });

      if (!result.ok) {
        throw new Error(result.message);
      }

      setDetail(result.data);
      setEscalationReason("");
      setEscalationNote("");
      setEscalationFeedback({
        message: result.message ?? "Project escalated to Admin.",
        tone: "success",
      });
    } catch (error) {
      setEscalationFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Project escalation could not be saved.",
        tone: "error",
      });
    } finally {
      setBusyAction("");
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading Project Manager project detail...
      </div>
    );
  }

  if (pageMessage || !detail) {
    return (
      <main className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        {pageMessage || "Project detail is unavailable."}
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              className="text-sm font-bold text-brand-emerald no-underline hover:text-brand-navy"
              href={ROUTES.projectManagerProjects}
            >
              Back to Projects
            </Link>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand-gold">
              Project Manager Project Detail
            </p>
            <h1 className="mt-2 text-3xl font-bold text-brand-navy" translate="no">
              {detail.project.projectCode}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-brand-muted">
              Limited operational view for project-flow tracking, internal notes,
              safe workflow markers, and admin escalation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProjectManagerStatus value={detail.project.paymentStatus} />
            <ProjectManagerStatus value={detail.project.projectStatus} />
            <ProjectManagerStatus value={detail.managerWorkflow.label} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-brand-emerald bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
            Current PM marker
          </p>
          <p className="mt-2 text-base font-bold text-brand-navy">
            {detail.managerWorkflow.label}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
            Escalation status
          </p>
          <p className="mt-2 text-base font-bold text-brand-navy">
            {detail.managerWorkflow.escalationStatus}
          </p>
        </div>
        <div className="rounded-lg border border-brand-gold bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
            Next safe action
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-brand-navy">
            Add an internal note, update the PM marker, or escalate to Admin
            when a restricted decision is needed.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <DetailCard title="Project Summary">
            <DefinitionGrid
              rows={[
                ["Product", detail.project.product],
                ["Package", `${detail.package.name} (${detail.package.price})`],
                ["Importer", detail.importer.name],
                ["City", detail.importer.city],
                ["Business Type", detail.importer.businessType],
                ["Created", detail.project.createdAt],
                ["Updated", detail.project.updatedAt],
                ["Admin Review", <ProjectManagerStatus key="review" value={detail.project.adminReviewStatus} />],
              ]}
            />
          </DetailCard>

          <DetailCard title="Importer Requirements">
            <DefinitionGrid
              rows={[
                ["Product Details", detail.requirements.productDetails],
                ["Product Links", detail.requirements.productLinks],
                ["Budget", detail.requirements.budget],
                ["Quantity", detail.requirements.quantity],
                ["Quality Level", detail.requirements.qualityLevel],
                ["Input Method", detail.requirements.inputMethod],
                ["Import Experience", detail.requirements.importExperience],
                ["Special Notes", detail.requirements.specialNotes],
              ]}
            />
          </DetailCard>

          <DetailCard title="Factory Report Progress">
            <DefinitionGrid
              rows={[
                ["Report status", detail.reportReadiness.statusLabel],
                ["Release readiness", detail.reportReadiness.readinessLabel],
                ["Reviewed options", String(detail.reportReadiness.optionCount)],
              ]}
            />
            <p className="mt-4 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm font-semibold leading-6 text-brand-navy">
              Project Managers can monitor report progress and escalate blockers.
              FMS submission approval and importer report release remain
              Admin/Super Admin-only actions.
            </p>
          </DetailCard>

          <DetailCard title="Operational Timeline">
            {detail.timeline.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-brand-muted">
                No timeline events are recorded yet.
              </p>
            ) : (
              <ol className="space-y-3">
                {detail.timeline.map((event) => (
                  <li
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    key={event.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-brand-navy">
                          {event.label}
                        </p>
                        {event.body ? (
                          <p className="mt-1 text-sm leading-6 text-brand-muted">
                            {event.body}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-xs font-bold text-brand-muted">
                        {event.createdAt}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </DetailCard>

          <DetailCard title="Internal Notes">
            {detail.notes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-brand-muted">
                No internal Project Manager notes are recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {detail.notes.map((note) => (
                  <article
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    key={note.id}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-bold text-brand-navy">
                        {note.authorLabel}
                      </p>
                      <span className="text-xs font-bold text-brand-muted">
                        {note.createdAt}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-brand-text">
                      {note.body}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </DetailCard>
        </div>

        <aside className="space-y-6">
          <DetailCard title="Safe PM Actions">
            <p className="text-sm leading-7 text-brand-muted">
              Project Managers can add internal notes, set safe workflow markers,
              and escalate restricted decisions to Admin. Payment verification,
              FMS assignment, final approval, factory submission approval, report
              release, refunds, and user management are not available here.
            </p>
          </DetailCard>

          <DetailCard title="Workflow Marker">
            <form onSubmit={(event) => void updateWorkflow(event)}>
              <label className="grid gap-2 text-sm font-semibold text-brand-navy">
                Project Manager marker
                <select
                  className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-text"
                  onChange={(event) =>
                    setWorkflowState(event.target.value as ProjectManagerWorkflowState)
                  }
                  value={workflowState}
                >
                  {workflowOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 grid gap-2 text-sm font-semibold text-brand-navy">
                Marker note
                <textarea
                  className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-brand-text"
                  onChange={(event) => setWorkflowNote(event.target.value)}
                  placeholder="Optional internal context for this workflow marker."
                  value={workflowNote}
                />
              </label>
              <button
                className="mt-3 min-h-11 w-full rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busyAction === "workflow"}
                type="submit"
              >
                {busyAction === "workflow" ? "Saving..." : "Save Marker"}
              </button>
              <ActionFeedback feedback={workflowFeedback} />
            </form>
          </DetailCard>

          <DetailCard title="Add Internal Note">
            <form onSubmit={(event) => void addNote(event)}>
              <label className="grid gap-2 text-sm font-semibold text-brand-navy">
                Internal note
                <textarea
                  className="min-h-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-brand-text"
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="Visible only to Admin, Super Admin, and Project Manager operations."
                  value={noteText}
                />
              </label>
              <button
                className="mt-3 min-h-11 w-full rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busyAction === "note"}
                type="submit"
              >
                {busyAction === "note" ? "Saving..." : "Save Internal Note"}
              </button>
              <ActionFeedback feedback={noteFeedback} />
            </form>
          </DetailCard>

          <DetailCard title="Escalate to Admin">
            <form onSubmit={(event) => void escalate(event)}>
              <label className="grid gap-2 text-sm font-semibold text-brand-navy">
                Urgency
                <select
                  className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-text"
                  onChange={(event) =>
                    setEscalationUrgency(
                      event.target.value as "normal" | "high" | "urgent",
                    )
                  }
                  value={escalationUrgency}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
              <label className="mt-3 grid gap-2 text-sm font-semibold text-brand-navy">
                Reason
                <textarea
                  className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-brand-text"
                  onChange={(event) => setEscalationReason(event.target.value)}
                  placeholder="Explain the restricted admin decision or unblock needed."
                  value={escalationReason}
                />
              </label>
              <label className="mt-3 grid gap-2 text-sm font-semibold text-brand-navy">
                Internal note
                <textarea
                  className="min-h-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-brand-text"
                  onChange={(event) => setEscalationNote(event.target.value)}
                  placeholder="Optional context for Admin."
                  value={escalationNote}
                />
              </label>
              <button
                className="mt-3 min-h-11 w-full rounded-lg bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy transition hover:bg-brand-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busyAction === "escalation"}
                type="submit"
              >
                {busyAction === "escalation" ? "Escalating..." : "Escalate to Admin"}
              </button>
              <ActionFeedback feedback={escalationFeedback} />
            </form>
          </DetailCard>
        </aside>
      </div>
    </main>
  );
}
