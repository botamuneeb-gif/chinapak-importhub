"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  approveProjectReviewAction,
  createFmsAssignmentAction,
  getAdminImportProjectAction,
  markProjectNeedsInfoAction,
  markProjectPaymentIssueAction,
  markProjectPaymentVerifiedAction,
  rejectProjectReviewAction,
  saveFactoryReportForImporterAction,
  type AdminProjectGateInput,
  type AdminLiveProjectDetail,
  type SaveFactoryReportInput,
} from "@/app/admin/projects/actions";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { LiveProjectReportFeedbackPanel } from "@/components/admin/live-project-report-feedback-panel";
import { ProjectTimeline } from "@/components/admin/project-timeline";
import { ReviewChecklist } from "@/components/admin/review-checklist";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LiveAdminProjectDetailProps = {
  projectCode: string;
};

const tabs = [
  { href: "#summary", label: "Project Summary" },
  { href: "#importer", label: "Importer Profile" },
  { href: "#payment", label: "Payment & Refund" },
  { href: "#checklist", label: "Checklist" },
  { href: "#review", label: "Admin Review" },
  { href: "#assignment", label: "Assignment" },
  { href: "#factory-report", label: "Report" },
  { href: "#report-feedback", label: "Feedback" },
  { href: "#notes", label: "Internal Notes" },
  { href: "#timeline", label: "Timeline" },
];

const reportVisibleFieldOptions = [
  { key: "cityProvince", label: "City/province" },
  { key: "productCategory", label: "Product category" },
  { key: "mainProducts", label: "Main products" },
  { key: "productMatchSummary", label: "Product match summary" },
  { key: "estimatedUnitPrice", label: "Estimated unit price" },
  { key: "moq", label: "MOQ" },
  { key: "sampleAvailability", label: "Sample availability" },
  { key: "productionLeadTime", label: "Production lead time" },
  { key: "packagingNotes", label: "Packaging notes" },
  { key: "customizationAvailability", label: "Customization/private label" },
  { key: "qualityReliabilitySummary", label: "Quality/reliability summary" },
  { key: "riskSummary", label: "Risk summary" },
];

type ProjectGateAction = (
  accessToken: string,
  projectCode: string,
  input: AdminProjectGateInput,
) => Promise<
  | {
      ok: true;
      data: AdminLiveProjectDetail;
    }
  | {
      ok: false;
      message: string;
    }
>;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0">
      <dt className="text-sm font-semibold text-brand-navy">{label}</dt>
      <dd className="mt-1 text-sm leading-7 text-brand-muted">{value}</dd>
    </div>
  );
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function ReportPreviewField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <dt className="text-xs font-bold uppercase text-brand-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-brand-navy">{value}</dd>
    </div>
  );
}

export function LiveAdminProjectDetail({
  projectCode,
}: LiveAdminProjectDetailProps) {
  const [project, setProject] = useState<AdminLiveProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [message, setMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [selectedFmsProfileId, setSelectedFmsProfileId] = useState("");
  const [assignmentDeadline, setAssignmentDeadline] = useState("");
  const [assignmentPriority, setAssignmentPriority] = useState("normal");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [selectedReportSubmissionCodes, setSelectedReportSubmissionCodes] =
    useState<string[]>([]);
  const [recommendedReportSubmissionCode, setRecommendedReportSubmissionCode] =
    useState("");
  const [reportVisibleFields, setReportVisibleFields] = useState<string[]>(
    reportVisibleFieldOptions.map((field) => field.key),
  );
  const [reportSummary, setReportSummary] = useState("");
  const [reportRecommendation, setReportRecommendation] = useState("");
  const [reportComparisonNotes, setReportComparisonNotes] = useState("");
  const [reportInternalNotes, setReportInternalNotes] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Please login as an admin to review live projects.");
            setIsLoading(false);
          }
          return;
        }

        const result = await getAdminImportProjectAction(
          session.access_token,
          projectCode,
        );

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setProject(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Live project detail loading is not configured yet.",
        );
        setIsLoading(false);
      }
    }

    void loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectCode]);

  useEffect(() => {
    if (!project) {
      return;
    }

    const currentReport = project.factoryReport.currentReport;

    if (!currentReport) {
      setSelectedReportSubmissionCodes([]);
      setRecommendedReportSubmissionCode("");
      setReportVisibleFields(reportVisibleFieldOptions.map((field) => field.key));
      setReportSummary("");
      setReportRecommendation("");
      setReportComparisonNotes("");
      setReportInternalNotes("");
      return;
    }

    setSelectedReportSubmissionCodes(
      currentReport.options.map((option) => option.submissionCode),
    );
    setRecommendedReportSubmissionCode(
      currentReport.options.find((option) => option.recommended)
        ?.submissionCode ?? "",
    );
    setReportVisibleFields(
      currentReport.options[0]?.visibleFields ??
        reportVisibleFieldOptions.map((field) => field.key),
    );
    setReportSummary(currentReport.importerSafeSummary);
    setReportRecommendation(currentReport.adminRecommendation);
    setReportComparisonNotes(currentReport.comparisonNotes);
    setReportInternalNotes(currentReport.internalReleaseNotes);
  }, [project]);

  async function getAdminAccessToken() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      throw new Error("Please login as an admin to update live projects.");
    }

    return session.access_token;
  }

  async function runProjectGateAction(
    action: ProjectGateAction,
    input: AdminProjectGateInput,
    successMessage: string,
  ) {
    setIsMutating(true);
    setActionError("");
    setActionMessage("");

    try {
      const accessToken = await getAdminAccessToken();
      const result = await action(accessToken, projectCode, input);

      if (!result.ok) {
        setActionError(result.message);
        return;
      }

      setProject(result.data);
      setActionMessage(successMessage);
      setPaymentNote("");
      setPaymentReference("");
      setReviewNote("");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Admin project update could not be completed.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function assignSelectedFms() {
    setIsMutating(true);
    setActionError("");
    setActionMessage("");

    try {
      const accessToken = await getAdminAccessToken();
      const result = await createFmsAssignmentAction(accessToken, projectCode, {
        deadline: assignmentDeadline,
        fmsProfileId: selectedFmsProfileId,
        internalNotes: assignmentNotes,
        priority: assignmentPriority,
      });

      if (!result.ok) {
        setActionError(result.message);
        return;
      }

      setProject(result.data);
      setActionMessage("Project assigned to FMS. Importer contact details remain hidden from FMS.");
      setSelectedFmsProfileId("");
      setAssignmentDeadline("");
      setAssignmentPriority("normal");
      setAssignmentNotes("");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "FMS assignment could not be completed.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function runFactoryReportAction(
    intent: SaveFactoryReportInput["intent"],
    successMessage: string,
  ) {
    setIsMutating(true);
    setActionError("");
    setActionMessage("");

    try {
      const accessToken = await getAdminAccessToken();
      const result = await saveFactoryReportForImporterAction(
        accessToken,
        projectCode,
        {
          adminRecommendation: reportRecommendation,
          comparisonNotes: reportComparisonNotes,
          importerSafeSummary: reportSummary,
          intent,
          internalReleaseNotes: reportInternalNotes,
          recommendedSubmissionCode: recommendedReportSubmissionCode,
          selectedSubmissionCodes: selectedReportSubmissionCodes,
          visibleFields: reportVisibleFields,
        },
      );

      if (!result.ok) {
        setActionError(result.message);
        return;
      }

      setProject(result.data);
      setActionMessage(successMessage);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Factory report action could not be completed.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  if (isLoading) {
    return (
      <AdminShell
        description="Loading live project detail from Supabase."
        title={`Project Review: ${projectCode}`}
      >
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
          Loading live Import Project...
        </div>
      </AdminShell>
    );
  }

  if (message || !project) {
    return (
      <AdminShell
        description="This project could not be loaded from Supabase."
        title={`Project Review: ${projectCode}`}
      >
        <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
          {message || "Project detail was not found."}
        </div>
      </AdminShell>
    );
  }

  const isReadyForFms =
    project.project.readinessStatus === "ready_for_fms_assignment";
  const assignmentIsAvailable =
    project.fmsAssignment.canAssign && !project.fmsAssignment.currentAssignment;
  const reportCanWithdraw =
    project.factoryReport.currentReport?.status === "released_to_importer" ||
    project.factoryReport.currentReport?.status === "updated";

  return (
    <AdminShell
      description="Review live project details, payment status, importer profile, checklist, assignment preparation, internal notes, and timeline."
      title={`Project Review: ${project.project.projectCode}`}
    >
      <div className="print-hide mb-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
          href={`/admin/projects/${encodeURIComponent(project.project.projectCode)}/document`}
        >
          Print admin summary
        </Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Payment</p>
          <div className="mt-2">
            <AdminStatusBadge status={project.project.paymentStatus} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Project Status</p>
          <div className="mt-2">
            <AdminStatusBadge status={project.project.projectStatus} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Admin Review</p>
          <div className="mt-2">
            <AdminStatusBadge status={project.project.adminReviewStatus} />
          </div>
        </div>
        <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Readiness Gate</p>
          <div className="mt-2">
            <AdminStatusBadge status={project.project.readinessLabel} />
          </div>
          <p className="mt-2 text-xs font-semibold leading-6 text-brand-navy">
            {project.project.readinessDescription}
          </p>
        </div>
      </div>

      {(actionMessage || actionError) && (
        <div
          className={`mb-6 rounded-lg border p-4 text-sm font-semibold shadow-sm ${
            actionError
              ? "border-brand-error bg-red-50 text-brand-error"
              : "border-brand-emerald bg-emerald-50 text-brand-emerald"
          }`}
        >
          {actionError || actionMessage}
        </div>
      )}

      <AdminTabs tabs={tabs} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <AdminSectionCard id="summary" title="1. Project Summary">
            <dl>
              <DetailRow label="Project ID" value={project.project.projectCode} />
              <DetailRow
                label="Product details"
                value={project.requirements.productDetails}
              />
              <DetailRow
                label="Product links"
                value={project.requirements.productLinks}
              />
              <DetailRow
                label="Input method"
                value={project.requirements.inputMethod}
              />
              <DetailRow label="Import budget" value={project.requirements.budget} />
              <DetailRow label="Quantity" value={project.requirements.quantity} />
              <DetailRow
                label="Quality level"
                value={project.requirements.qualityLevel}
              />
              <DetailRow
                label="Importer experience"
                value={project.requirements.importExperience}
              />
              <DetailRow
                label="Selected package"
                value={`${project.package.name} - ${project.package.price}`}
              />
              <DetailRow
                label="Selected add-ons"
                value={
                  project.addOns.length > 0
                    ? project.addOns
                        .map((addOn) => `${addOn.name} (${addOn.price})`)
                        .join(", ")
                    : "No add-ons selected"
                }
              />
              <DetailRow
                label="Estimated delivery timeframe"
                value={project.package.delivery}
              />
            </dl>
          </AdminSectionCard>

          <AdminSectionCard id="importer" title="2. Importer Profile">
            <dl>
              <DetailRow label="Importer name" value={project.importer.name} />
              <DetailRow label="City" value={project.importer.city} />
              <DetailRow
                label="Business type"
                value={project.importer.businessType}
              />
              <DetailRow
                label="Contact shown to admin only"
                value={project.importer.contactForAdminOnly}
              />
              <DetailRow
                label="Verification status"
                value={project.importer.verificationStatus}
              />
              <DetailRow
                label="Past project count"
                value={project.importer.pastProjectCount}
              />
            </dl>
            <div className="mt-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              Contact details shown here are for admin operations only and must
              never be exposed to FMS users.
            </div>
          </AdminSectionCard>

          <AdminSectionCard id="payment" title="3. Payment & Refund">
            <dl>
              <DetailRow
                label="Payment status"
                value={project.project.paymentStatus}
              />
              <DetailRow label="Package price" value={project.package.price} />
              <DetailRow
                label="Add-ons"
                value={
                  project.addOns.length > 0
                    ? project.addOns
                        .map((addOn) => `${addOn.name} (${addOn.price})`)
                        .join(", ")
                    : "No add-ons selected"
                }
              />
              <DetailRow
                label="Total service fee"
                value={project.totalServiceFee}
              />
              <DetailRow
                label="Refund eligibility note"
                value="Full refund before FMS assignment. After FMS assignment, refund requests are admin-reviewed based on completed milestones."
              />
            </dl>
            <div className="mt-6 rounded-lg border border-slate-200 bg-brand-background p-4">
              <h3 className="text-base font-bold text-brand-navy">
                Payment Verification Panel
              </h3>
              <p className="mt-2 text-sm leading-7 text-brand-muted">
                Use this only after checking approved company payment records.
                This does not connect a payment gateway and does not assign an FMS.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="block text-sm font-semibold text-brand-navy"
                    htmlFor="payment-reference"
                  >
                    Internal payment note/reference
                  </label>
                  <input
                    className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
                    disabled={isMutating}
                    id="payment-reference"
                    onChange={(event) =>
                      setPaymentReference(event.target.value)
                    }
                    placeholder="Bank/JazzCash/Easypaisa reference"
                    type="text"
                    value={paymentReference}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-brand-navy"
                    htmlFor="payment-note"
                  >
                    Internal payment note
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                    disabled={isMutating}
                    id="payment-note"
                    onChange={(event) => setPaymentNote(event.target.value)}
                    placeholder="Admin-only note for manual verification"
                    rows={3}
                    value={paymentNote}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  className="min-h-12 rounded-lg bg-brand-emerald px-5 py-3 font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isMutating}
                  onClick={() =>
                    void runProjectGateAction(
                      markProjectPaymentVerifiedAction,
                      {
                        note: paymentNote,
                        reference: paymentReference,
                      },
                      "Payment marked as verified. Readiness was recalculated.",
                    )
                  }
                  type="button"
                >
                  Mark Payment Verified
                </button>
                <button
                  className="min-h-12 rounded-lg border border-brand-error bg-white px-5 py-3 font-bold text-brand-error transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isMutating}
                  onClick={() =>
                    void runProjectGateAction(
                      markProjectPaymentIssueAction,
                      {
                        note: paymentNote,
                        reference: paymentReference,
                      },
                      "Payment issue recorded. FMS assignment remains blocked.",
                    )
                  }
                  type="button"
                >
                  Mark Payment Issue / Rejected
                </button>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard id="checklist" title="4. Admin Review Checklist">
            <ReviewChecklist items={project.checklist} />
          </AdminSectionCard>

          <AdminSectionCard id="review" title="5. Admin Review Panel">
            <div className="rounded-lg border border-slate-200 bg-brand-background p-4">
              <p className="text-sm font-semibold text-brand-muted">
                Current admin review status
              </p>
              <div className="mt-2">
                <AdminStatusBadge status={project.project.adminReviewStatus} />
              </div>
              <label
                className="mt-5 block text-sm font-semibold text-brand-navy"
                htmlFor="review-note"
              >
                Internal review notes
              </label>
              <textarea
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                disabled={isMutating}
                id="review-note"
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="Admin-only project review note"
                rows={4}
                value={reviewNote}
              />
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <button
                  className="min-h-12 rounded-lg bg-brand-emerald px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isMutating}
                  onClick={() =>
                    void runProjectGateAction(
                      approveProjectReviewAction,
                      { note: reviewNote },
                      "Admin review approved. Readiness was recalculated.",
                    )
                  }
                  type="button"
                >
                  Approve Project
                </button>
                <button
                  className="min-h-12 rounded-lg border border-brand-gold bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isMutating}
                  onClick={() =>
                    void runProjectGateAction(
                      markProjectNeedsInfoAction,
                      { note: reviewNote },
                      "Project marked as needing more information.",
                    )
                  }
                  type="button"
                >
                  Mark Needs Information
                </button>
                <button
                  className="min-h-12 rounded-lg border border-brand-error bg-white px-4 py-3 text-sm font-bold text-brand-error transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isMutating}
                  onClick={() =>
                    void runProjectGateAction(
                      rejectProjectReviewAction,
                      { note: reviewNote },
                      "Project rejected. FMS assignment is blocked.",
                    )
                  }
                  type="button"
                >
                  Reject Project
                </button>
              </div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard id="assignment" title="6. Assignment Preparation">
            <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              <strong>{project.project.readinessLabel}:</strong>{" "}
              {project.fmsAssignment.gateMessage}
            </div>

            {project.fmsAssignment.currentAssignment ? (
              <div className="mt-5 rounded-lg border border-brand-emerald bg-emerald-50 p-4 text-sm leading-7 text-brand-navy">
                <h3 className="text-base font-bold text-brand-emerald">
                  Assigned FMS
                </h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold">Assignment ID</dt>
                    <dd>{project.fmsAssignment.currentAssignment.assignmentCode}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Status</dt>
                    <dd>{project.fmsAssignment.currentAssignment.status}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">FMS</dt>
                    <dd>
                      {project.fmsAssignment.currentAssignment.fmsCode} -{" "}
                      {project.fmsAssignment.currentAssignment.fmsName}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Deadline</dt>
                    <dd>{project.fmsAssignment.currentAssignment.deadline}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Assigned at</dt>
                    <dd>{project.fmsAssignment.currentAssignment.assignedAt}</dd>
                  </div>
                </dl>
                <button
                  className="mt-4 min-h-12 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-brand-muted opacity-70"
                  disabled
                  type="button"
                >
                  Reassignment available in later phase
                </button>
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="fms-assignment"
                >
                  FMS assignment
                </label>
                <select
                  className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text disabled:bg-slate-50 disabled:text-brand-muted"
                  disabled={!assignmentIsAvailable || isMutating}
                  id="fms-assignment"
                  onChange={(event) => setSelectedFmsProfileId(event.target.value)}
                  value={selectedFmsProfileId}
                >
                  <option>
                    {assignmentIsAvailable
                      ? "Select active FMS"
                      : "Disabled until eligible and unassigned"}
                  </option>
                  {project.fmsAssignment.availableFms.map((fms) => (
                    <option key={fms.fmsProfileId} value={fms.fmsProfileId}>
                      {fms.label}
                    </option>
                  ))}
                </select>
                {project.fmsAssignment.availableFms.length === 0 ? (
                  <p className="mt-2 text-xs leading-5 text-brand-muted">
                    No active FMS profiles are available. Create an invited FMS
                    account and active FMS profile first.
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-navy">
                  FMS tier suggestion
                </p>
                <p className="mt-2 rounded-lg bg-brand-background px-4 py-3 text-sm font-bold text-brand-navy">
                  {project.assignment.fmsTierSuggestion}
                </p>
              </div>
            </div>
            {assignmentIsAvailable ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="block text-sm font-semibold text-brand-navy"
                    htmlFor="assignment-deadline"
                  >
                    Deadline
                  </label>
                  <input
                    className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
                    disabled={isMutating}
                    id="assignment-deadline"
                    onChange={(event) => setAssignmentDeadline(event.target.value)}
                    type="date"
                    value={assignmentDeadline}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-brand-navy"
                    htmlFor="assignment-priority"
                  >
                    Priority
                  </label>
                  <select
                    className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
                    disabled={isMutating}
                    id="assignment-priority"
                    onChange={(event) => setAssignmentPriority(event.target.value)}
                    value={assignmentPriority}
                  >
                    <option value="normal">Normal</option>
                    <option value="priority">Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-semibold text-brand-navy"
                    htmlFor="assignment-notes"
                  >
                    Internal assignment notes for FMS
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                    disabled={isMutating}
                    id="assignment-notes"
                    onChange={(event) => setAssignmentNotes(event.target.value)}
                    placeholder="Brief sourcing instructions. Do not include importer contact details."
                    rows={4}
                    value={assignmentNotes}
                  />
                </div>
              </div>
            ) : null}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                className="min-h-12 rounded-lg border border-brand-navy bg-white px-5 py-3 font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:opacity-55"
                disabled={!assignmentIsAvailable || !selectedFmsProfileId || isMutating}
                onClick={() => void assignSelectedFms()}
                type="button"
              >
                Assign FMS
              </button>
              <button
                className="min-h-12 rounded-lg border border-slate-300 bg-slate-50 px-5 py-3 font-bold text-brand-muted opacity-80"
                disabled
                type="button"
              >
                {isReadyForFms
                  ? "Importer report release depends on admin-approved submissions"
                  : "Ready status is derived from payment + admin review"}
              </button>
            </div>
          </AdminSectionCard>

          <div className="scroll-mt-24" id="report-release" />
          <AdminSectionCard id="factory-report" title="7. Importer Factory Report">
            <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              <strong>{project.factoryReport.reportStatus}:</strong>{" "}
              {project.factoryReport.releaseGateMessage}
              <p className="mt-2 font-semibold">
                Factory contact details, raw FMS notes, WeChat, WhatsApp,
                phone, email, bank details, and admin-only notes must never be
                included in this importer-facing report.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-brand-background p-4">
                <p className="text-sm font-semibold text-brand-muted">
                  Report status
                </p>
                <div className="mt-2">
                  <AdminStatusBadge status={project.factoryReport.reportStatus} />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-brand-background p-4 md:col-span-2">
                <p className="text-sm font-semibold text-brand-muted">
                  Package visibility guidance
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-brand-navy">
                  {project.factoryReport.packageLimitGuidance}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-base font-bold text-brand-navy">
                Approved FMS submissions
              </h3>
              {project.factoryReport.availableSubmissions.length > 0 ? (
                <div className="mt-3 grid gap-3">
                  {project.factoryReport.availableSubmissions.map(
                    (submission) => {
                      const isSelected =
                        selectedReportSubmissionCodes.includes(
                          submission.submissionCode,
                        );

                      return (
                        <div
                          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                          key={submission.submissionCode}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <label className="flex gap-3 text-sm font-bold text-brand-navy">
                              <input
                                checked={isSelected}
                                className="mt-1 h-4 w-4 accent-brand-emerald"
                                disabled={isMutating}
                                onChange={() => {
                                  const nextValues = toggleValue(
                                    selectedReportSubmissionCodes,
                                    submission.submissionCode,
                                  );

                                  setSelectedReportSubmissionCodes(nextValues);

                                  if (
                                    recommendedReportSubmissionCode ===
                                      submission.submissionCode &&
                                    !nextValues.includes(submission.submissionCode)
                                  ) {
                                    setRecommendedReportSubmissionCode("");
                                  }
                                }}
                                type="checkbox"
                              />
                              <span>
                                {submission.factoryLabel}{" "}
                                <span className="text-brand-muted">
                                  ({submission.submissionCode})
                                </span>
                              </span>
                            </label>
                            <label className="flex gap-2 text-sm font-semibold text-brand-muted">
                              <input
                                checked={
                                  recommendedReportSubmissionCode ===
                                  submission.submissionCode
                                }
                                className="mt-1 h-4 w-4 accent-brand-emerald"
                                disabled={!isSelected || isMutating}
                                name="recommended-factory-option"
                                onChange={() =>
                                  setRecommendedReportSubmissionCode(
                                    submission.submissionCode,
                                  )
                                }
                                type="radio"
                              />
                              Recommended option
                            </label>
                          </div>
                          <dl className="mt-4 grid gap-3 md:grid-cols-2">
                            <ReportPreviewField
                              label="City/province"
                              value={submission.cityProvince}
                            />
                            <ReportPreviewField
                              label="Category"
                              value={submission.productCategory}
                            />
                            <ReportPreviewField
                              label="Product match"
                              value={submission.productMatchSummary}
                            />
                            <ReportPreviewField
                              label="Price/MOQ"
                              value={`${submission.estimatedUnitPrice} ${submission.currency} / ${submission.moq}`}
                            />
                          </dl>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-brand-muted">
                  No approved FMS factory submissions are available yet. The
                  importer report cannot be released until admin approves at
                  least one FMS submission.
                </div>
              )}
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-brand-background p-4">
              <h3 className="text-base font-bold text-brand-navy">
                Safe fields visible to importer
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {reportVisibleFieldOptions.map((field) => (
                  <label
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-brand-navy"
                    key={field.key}
                  >
                    <input
                      checked={reportVisibleFields.includes(field.key)}
                      className="h-4 w-4 accent-brand-emerald"
                      disabled={isMutating}
                      onChange={() =>
                        setReportVisibleFields(
                          toggleValue(reportVisibleFields, field.key),
                        )
                      }
                      type="checkbox"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="report-summary"
                >
                  Importer-safe summary
                </label>
                <textarea
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                  disabled={isMutating}
                  id="report-summary"
                  onChange={(event) => setReportSummary(event.target.value)}
                  placeholder="Summarize approved options in importer-safe language. Do not include direct contact details."
                  rows={4}
                  value={reportSummary}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="report-recommendation"
                >
                  Admin recommendation
                </label>
                <textarea
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                  disabled={isMutating}
                  id="report-recommendation"
                  onChange={(event) =>
                    setReportRecommendation(event.target.value)
                  }
                  placeholder="Recommendation for importer decision-making."
                  rows={3}
                  value={reportRecommendation}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="report-comparison"
                >
                  Comparison notes
                </label>
                <textarea
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                  disabled={isMutating}
                  id="report-comparison"
                  onChange={(event) =>
                    setReportComparisonNotes(event.target.value)
                  }
                  placeholder="Optional importer-safe comparison notes."
                  rows={3}
                  value={reportComparisonNotes}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="report-internal-notes"
                >
                  Internal release notes
                </label>
                <textarea
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                  disabled={isMutating}
                  id="report-internal-notes"
                  onChange={(event) => setReportInternalNotes(event.target.value)}
                  placeholder="Admin-only notes. These are not shown to importers."
                  rows={3}
                  value={reportInternalNotes}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                className="min-h-12 rounded-lg border border-brand-navy bg-white px-5 py-3 font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:opacity-55"
                disabled={
                  isMutating || selectedReportSubmissionCodes.length === 0
                }
                onClick={() =>
                  void runFactoryReportAction(
                    "save_draft",
                    "Importer factory report draft saved. It is not visible to the importer.",
                  )
                }
                type="button"
              >
                Save Draft
              </button>
              <button
                className="min-h-12 rounded-lg bg-brand-emerald px-5 py-3 font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
                disabled={
                  isMutating ||
                  !project.factoryReport.canRelease ||
                  selectedReportSubmissionCodes.length === 0
                }
                onClick={() =>
                  void runFactoryReportAction(
                    "release",
                    "Sanitized factory report released to importer.",
                  )
                }
                type="button"
              >
                Release to Importer
              </button>
              <button
                className="min-h-12 rounded-lg border border-brand-error bg-white px-5 py-3 font-bold text-brand-error transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isMutating || !reportCanWithdraw}
                onClick={() =>
                  void runFactoryReportAction(
                    "withdraw",
                    "Importer factory report withdrawn.",
                  )
                }
                type="button"
              >
                Withdraw Report
              </button>
            </div>

            {project.factoryReport.currentReport ? (
              <div className="mt-6 rounded-lg border border-brand-emerald bg-emerald-50 p-4">
                <h3 className="text-base font-bold text-brand-emerald">
                  Current report preview
                </h3>
                <p className="mt-2 text-sm leading-7 text-brand-navy">
                  Status: {project.factoryReport.currentReport.statusLabel}.
                  Version {project.factoryReport.currentReport.version}.
                </p>
                <div className="mt-4 grid gap-3">
                  {project.factoryReport.currentReport.options.map((option) => (
                    <div
                      className="rounded-lg border border-emerald-200 bg-white p-4"
                      key={option.submissionCode}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="font-bold text-brand-navy">
                          {option.factoryLabel}
                        </h4>
                        {option.recommended ? (
                          <AdminStatusBadge status="Recommended" />
                        ) : null}
                      </div>
                      <dl className="mt-3 grid gap-3 md:grid-cols-2">
                        {option.visibleFields.includes("cityProvince") ? (
                          <ReportPreviewField
                            label="City/province"
                            value={option.cityProvince}
                          />
                        ) : null}
                        {option.visibleFields.includes("productMatchSummary") ? (
                          <ReportPreviewField
                            label="Product match"
                            value={option.productMatchSummary}
                          />
                        ) : null}
                        {option.visibleFields.includes("estimatedUnitPrice") ? (
                          <ReportPreviewField
                            label="Estimated price"
                            value={`${option.estimatedUnitPrice} ${option.currency}`}
                          />
                        ) : null}
                        {option.visibleFields.includes("moq") ? (
                          <ReportPreviewField label="MOQ" value={option.moq} />
                        ) : null}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </AdminSectionCard>

          <AdminSectionCard
            id="report-feedback"
            title="8. Report Feedback & Clarifications"
          >
            <div className="mb-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              Importer feedback is reviewed by admin first. Do not paste raw
              importer contact details into FMS clarification requests. FMS can
              receive only sanitized sourcing questions from admin.
            </div>
            <LiveProjectReportFeedbackPanel
              projectCode={project.project.projectCode}
            />
          </AdminSectionCard>

          <AdminSectionCard id="notes" title="9. Internal Notes">
            <div className="rounded-lg border border-slate-200 bg-brand-background p-4 text-sm leading-7 text-brand-muted">
              Admin notes are recorded through payment verification, project
              review, FMS assignment, report release, feedback, evidence, and
              refund actions. Keep sensitive importer contact details out of
              FMS-facing notes.
            </div>
          </AdminSectionCard>

          <AdminSectionCard id="timeline" title="10. Project Timeline">
            <ProjectTimeline items={project.timeline} />
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
            <h2 className="text-lg font-bold">Confidentiality rule</h2>
            <p className="mt-2">
              FMS users must not see importer contact details. Importers must
              not see FMS contact details. Admin controls all communication and
              assignment.
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
