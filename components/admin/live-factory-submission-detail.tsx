"use client";

import { useEffect, useState } from "react";
import {
  getFactorySubmissionDetailForAdminAction,
  reviewFactorySubmissionAction,
  type FactorySubmissionDetail,
  type ReviewFactorySubmissionInput,
} from "@/app/admin/factory-submissions/actions";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LiveFactorySubmissionDetailProps = {
  submissionId: string;
};

type DetailMap = Record<string, string>;

function DetailGrid({ items }: { items: DetailMap }) {
  return (
    <dl className="grid gap-3 md:grid-cols-2">
      {Object.entries(items).map(([label, value]) => (
        <div className="rounded-lg border border-slate-200 bg-white p-4" key={label}>
          <dt className="text-sm font-semibold text-brand-navy">{label}</dt>
          <dd className="mt-1 text-sm leading-7 text-brand-muted">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LiveFactorySubmissionDetail({
  submissionId,
}: LiveFactorySubmissionDetailProps) {
  const [submission, setSubmission] = useState<FactorySubmissionDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [message, setMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [existingFactoryCode, setExistingFactoryCode] = useState("");
  const [updateFactoryDatabase, setUpdateFactoryDatabase] = useState(true);

  async function getAccessToken() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      throw new Error("Please login as an admin first.");
    }

    return session.access_token;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSubmission() {
      try {
        const accessToken = await getAccessToken();
        const result = await getFactorySubmissionDetailForAdminAction(
          accessToken,
          submissionId,
        );

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setSubmission(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Factory submission review is not configured yet.",
        );
        setIsLoading(false);
      }
    }

    void loadSubmission();

    return () => {
      isMounted = false;
    };
  }, [submissionId]);

  async function runReviewAction(decision: ReviewFactorySubmissionInput["decision"]) {
    setIsMutating(true);
    setActionError("");
    setActionMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await reviewFactorySubmissionAction(accessToken, submissionId, {
        adminNote,
        decision,
        existingFactoryCode,
        updateFactoryDatabase,
      });

      if (!result.ok) {
        setActionError(result.message);
        return;
      }

      setSubmission(result.data);
      setActionMessage(
        decision === "approve"
          ? "Submission approved. Importer release remains a future workflow."
          : "Submission review updated and kept inside admin/FMS workflow.",
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Factory submission review could not be saved.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading factory submission review...
      </div>
    );
  }

  if (message || !submission) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        {message || "Factory submission was not found."}
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {(actionMessage || actionError) && (
          <div
            className={`rounded-lg border p-4 text-sm font-semibold shadow-sm ${
              actionError
                ? "border-brand-error bg-red-50 text-brand-error"
                : "border-brand-emerald bg-emerald-50 text-brand-emerald"
            }`}
          >
            {actionError || actionMessage}
          </div>
        )}

        <AdminSectionCard title="Submission Header">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-brand-muted">
                {submission.projectCode} · {submission.assignmentCode}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-brand-navy">
                {submission.submissionCode}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <AdminStatusBadge status={submission.submissionStatus} />
              <AdminStatusBadge status={submission.adminReviewStatus} />
            </div>
          </div>
          <DetailGrid
            items={{
              "Factory display name": submission.factoryDisplayName,
              "Product category": submission.productCategory,
              "City/province": submission.cityProvince,
              FMS: `${submission.fmsCode} - ${submission.fmsName}`,
              "Submitted date": submission.createdAt,
              "Converted factory": submission.convertedFactoryCode,
            }}
          />
        </AdminSectionCard>

        <AdminSectionCard title="Importer-Safe Summary">
          <DetailGrid
            items={{
              "Product match summary":
                submission.importerSafeSummary.productMatchSummary,
              "Main products": submission.importerSafeSummary.mainProducts,
              "Estimated unit price":
                submission.importerSafeSummary.estimatedUnitPrice,
              Currency: submission.importerSafeSummary.currency,
              MOQ: submission.importerSafeSummary.moq,
              "Production time": submission.importerSafeSummary.productionTime,
              "Sample availability":
                submission.importerSafeSummary.sampleAvailability,
              "Packaging notes": submission.importerSafeSummary.packagingNotes,
              "Customization/private label":
                submission.importerSafeSummary.customizationAvailability,
              "Quality/reliability notes":
                submission.importerSafeSummary.qualityReliabilityNotes,
              "Evidence notes": submission.evidenceNotes,
            }}
          />
        </AdminSectionCard>

        <AdminSectionCard title="Admin-Only Contact Information">
          <div className="mb-4 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
            Admin-only. Never expose factory contact details to importers unless
            a future approved package workflow explicitly allows it.
          </div>
          <DetailGrid
            items={{
              "Contact person": submission.adminOnlyContact.contactPerson,
              Phone: submission.adminOnlyContact.phone,
              WeChat: submission.adminOnlyContact.wechat,
              Email: submission.adminOnlyContact.email,
              "Website/Alibaba": submission.adminOnlyContact.websiteUrl,
              "Exact address": submission.adminOnlyContact.exactAddress,
              "Payment/bank notes": submission.adminOnlyContact.paymentNotes,
            }}
          />
        </AdminSectionCard>

        <AdminSectionCard title="Internal Review Notes">
          <DetailGrid
            items={{
              "Risk flags":
                submission.riskFlags.length > 0
                  ? submission.riskFlags.join(", ")
                  : "None",
              "FMS risk notes": submission.internalNotes.riskNotes,
              "Negotiation notes": submission.internalNotes.negotiationNotes,
              "Latest admin note": submission.reviewHistoryNote,
            }}
          />
        </AdminSectionCard>
      </div>

      <aside className="space-y-6">
        <AdminSectionCard title="Review Controls">
          <label className="block text-sm font-semibold text-brand-navy" htmlFor="admin-note">
            Internal admin note
          </label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
            id="admin-note"
            onChange={(event) => setAdminNote(event.target.value)}
            placeholder="Add decision note for audit and FMS feedback."
            rows={4}
            value={adminNote}
          />

          <label className="mt-4 flex gap-3 text-sm font-semibold text-brand-navy">
            <input
              checked={updateFactoryDatabase}
              className="mt-1 h-4 w-4"
              onChange={(event) => setUpdateFactoryDatabase(event.target.checked)}
              type="checkbox"
            />
            Create/update private factory database record on approval
          </label>

          <label
            className="mt-4 block text-sm font-semibold text-brand-navy"
            htmlFor="existing-factory-code"
          >
            Existing factory code optional
          </label>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            id="existing-factory-code"
            onChange={(event) => setExistingFactoryCode(event.target.value)}
            placeholder="FACT-..."
            value={existingFactoryCode}
          />

          <div className="mt-5 grid gap-3">
            <button
              className="min-h-12 rounded-lg bg-brand-emerald px-5 py-3 font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
              disabled={isMutating}
              onClick={() => void runReviewAction("approve")}
              type="button"
            >
              Approve Submission
            </button>
            <button
              className="min-h-12 rounded-lg border border-brand-gold bg-amber-50 px-5 py-3 font-bold text-brand-navy transition hover:border-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
              disabled={isMutating}
              onClick={() => void runReviewAction("request_revision")}
              type="button"
            >
              Request Revision
            </button>
            <button
              className="min-h-12 rounded-lg border border-brand-error bg-red-50 px-5 py-3 font-bold text-brand-error transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
              disabled={isMutating}
              onClick={() => void runReviewAction("reject")}
              type="button"
            >
              Reject Submission
            </button>
          </div>
        </AdminSectionCard>
      </aside>
    </div>
  );
}
