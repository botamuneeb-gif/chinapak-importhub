"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  getFmsAssignmentDetailAction,
  submitFactoryOptionForAdminReviewAction,
  updateFmsAssignmentProgressAction,
  type FactoryOptionSubmissionInput,
  type LiveFmsAssignmentDetail as LiveFmsAssignmentDetailData,
} from "@/app/fms/assignments/actions";
import { FmsEvidenceUploadPanel } from "@/components/files/file-panels";
import { FmsSectionCard } from "@/components/fms/fms-section-card";
import { FmsStatusBadge } from "@/components/fms/fms-status-badge";
import { MilestoneChecklist } from "@/components/fms/milestone-checklist";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LiveFmsAssignmentDetailProps = {
  assignmentCode: string;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0">
      <dt className="text-sm font-semibold text-brand-navy">{label}</dt>
      <dd className="mt-1 text-sm leading-7 text-brand-muted">{value}</dd>
    </div>
  );
}

const initialSubmissionForm: FactoryOptionSubmissionInput = {
  cityProvince: "",
  contactPersonAdminOnly: "",
  currency: "CNY",
  customizationAvailability: "",
  estimatedUnitPrice: "",
  evidenceNotes: "",
  exactAddressAdminOnly: "",
  factoryContactEmailAdminOnly: "",
  factoryContactPhoneAdminOnly: "",
  factoryDisplayName: "",
  factoryWebsiteAdminOnly: "",
  mainProducts: "",
  moq: "",
  negotiationNotesForAdmin: "",
  packagingNotes: "",
  paymentNotesAdminOnly: "",
  productCategory: "",
  productMatchSummary: "",
  productionLeadTime: "",
  qualityReliabilityNotes: "",
  riskNotes: "",
  sampleAvailability: "",
  wechatAdminOnly: "",
};

const publicSubmissionFields: Array<{
  key: keyof FactoryOptionSubmissionInput;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: "input" | "textarea";
}> = [
  {
    key: "factoryDisplayName",
    label: "Factory/company name",
    placeholder: "Yiwu packaging supplier A",
    required: true,
  },
  {
    key: "productCategory",
    label: "Product category",
    placeholder: "Packaging / consumer products",
    required: true,
  },
  {
    key: "cityProvince",
    label: "City/province",
    placeholder: "Yiwu, Zhejiang",
  },
  {
    key: "mainProducts",
    label: "Main products",
    placeholder: "Boxes, bags, retail packaging",
  },
  {
    key: "estimatedUnitPrice",
    label: "Estimated unit price",
    placeholder: "1.20 - 1.80",
  },
  {
    key: "currency",
    label: "Currency",
    placeholder: "CNY",
  },
  {
    key: "moq",
    label: "MOQ",
    placeholder: "1,000 pieces",
  },
  {
    key: "productionLeadTime",
    label: "Production lead time",
    placeholder: "12-18 days after deposit",
  },
  {
    key: "sampleAvailability",
    label: "Sample availability",
    placeholder: "Sample available in 3-5 days",
  },
  {
    key: "productMatchSummary",
    label: "Product match summary",
    placeholder: "Explain why this factory matches the project requirements.",
    required: true,
    type: "textarea",
  },
  {
    key: "packagingNotes",
    label: "Packaging notes",
    placeholder: "Packaging options, carton notes, logo packaging limits.",
    type: "textarea",
  },
  {
    key: "customizationAvailability",
    label: "Customization/private label availability",
    placeholder: "Private label available above MOQ, color options limited.",
    type: "textarea",
  },
  {
    key: "qualityReliabilityNotes",
    label: "Quality/reliability notes",
    placeholder: "Production consistency, evidence quality, response reliability.",
    type: "textarea",
  },
  {
    key: "evidenceNotes",
    label: "Evidence notes",
    placeholder: "Summarize photos, quotation, certificates, or video evidence.",
    type: "textarea",
  },
];

const adminOnlySubmissionFields: Array<{
  key: keyof FactoryOptionSubmissionInput;
  label: string;
  placeholder: string;
  type?: "input" | "textarea";
}> = [
  {
    key: "contactPersonAdminOnly",
    label: "Contact person admin-only",
    placeholder: "Factory sales/contact person",
  },
  {
    key: "factoryContactPhoneAdminOnly",
    label: "Phone admin-only",
    placeholder: "+86...",
  },
  {
    key: "wechatAdminOnly",
    label: "WeChat admin-only",
    placeholder: "WeChat ID",
  },
  {
    key: "factoryContactEmailAdminOnly",
    label: "Email admin-only",
    placeholder: "factory@example.cn",
  },
  {
    key: "factoryWebsiteAdminOnly",
    label: "Website/Alibaba link admin-only",
    placeholder: "https://...",
  },
  {
    key: "exactAddressAdminOnly",
    label: "Exact address admin-only",
    placeholder: "Factory address for admin review",
    type: "textarea",
  },
  {
    key: "paymentNotesAdminOnly",
    label: "Payment/bank notes admin-only",
    placeholder: "Admin review only. Never importer-facing.",
    type: "textarea",
  },
  {
    key: "riskNotes",
    label: "Risk notes for admin",
    placeholder: "Mention low-price risk, inconsistent info, or reliability concerns.",
    type: "textarea",
  },
  {
    key: "negotiationNotesForAdmin",
    label: "Negotiation notes for admin",
    placeholder: "Negotiation angle, price assumptions, what admin should verify.",
    type: "textarea",
  },
];

export function LiveFmsAssignmentDetail({
  assignmentCode,
}: LiveFmsAssignmentDetailProps) {
  const [assignment, setAssignment] =
    useState<LiveFmsAssignmentDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [message, setMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [submissionForm, setSubmissionForm] =
    useState<FactoryOptionSubmissionInput>(initialSubmissionForm);

  async function getAccessToken() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      throw new Error("Please login as an approved FMS first.");
    }

    return session.access_token;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadAssignment() {
      try {
        const accessToken = await getAccessToken();
        const result = await getFmsAssignmentDetailAction(
          accessToken,
          assignmentCode,
        );

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setAssignment(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Live assignment detail is not configured yet.",
        );
        setIsLoading(false);
      }
    }

    void loadAssignment();

    return () => {
      isMounted = false;
    };
  }, [assignmentCode]);

  async function updateProgress(intent: "accept" | "start_research") {
    setIsMutating(true);
    setActionError("");
    setActionMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await updateFmsAssignmentProgressAction(
        accessToken,
        assignmentCode,
        intent,
      );

      if (!result.ok) {
        setActionError(result.message);
        return;
      }

      setAssignment(result.data);
      setActionMessage(
        intent === "accept"
          ? "Assignment accepted. Admin timeline was updated."
          : "Factory research started. Project timeline was updated.",
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Assignment progress could not be updated.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  function updateSubmissionField(
    key: keyof FactoryOptionSubmissionInput,
    value: string,
  ) {
    setSubmissionForm((current) => ({ ...current, [key]: value }));
  }

  async function submitFactoryOption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsMutating(true);
    setActionError("");
    setActionMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await submitFactoryOptionForAdminReviewAction(
        accessToken,
        assignmentCode,
        submissionForm,
      );

      if (!result.ok) {
        setActionError(result.message);
        return;
      }

      setAssignment(result.data);
      setSubmissionForm(initialSubmissionForm);
      setActionMessage(
        "Factory option submitted to admin review. It is not visible to the importer.",
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Factory option submission could not be saved.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading live assignment workspace...
      </div>
    );
  }

  if (message || !assignment) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        {message || "Assignment was not found for this FMS."}
      </div>
    );
  }

  const canAccept = assignment.statusRaw === "assigned";
  const canStartResearch =
    assignment.statusRaw === "assigned" ||
    assignment.statusRaw === "requirements_reviewed";

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Project ID</p>
          <p className="mt-2 text-xl font-bold text-brand-navy">
            {assignment.projectCode}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Milestone</p>
          <div className="mt-2">
            <FmsStatusBadge status={assignment.milestoneStatus} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Submission</p>
          <div className="mt-2">
            <FmsStatusBadge status={assignment.submissionStatus} />
          </div>
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

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <FmsSectionCard id="brief" title="1. Assignment Brief">
            <dl>
              <DetailRow label="Assignment ID" value={assignment.assignmentCode} />
              <DetailRow label="Project ID" value={assignment.projectCode} />
              <DetailRow
                label="Product description"
                value={assignment.brief.productDescription}
              />
              <DetailRow
                label="Product reference images"
                value={assignment.brief.productImagesPlaceholder}
              />
              <DetailRow label="Budget range" value={assignment.brief.budgetRange} />
              <DetailRow label="Quantity" value={assignment.brief.quantity} />
              <DetailRow
                label="Quality level"
                value={assignment.brief.qualityLevel}
              />
              <DetailRow label="Package" value={assignment.packageName} />
              <DetailRow
                label="Add-ons"
                value={
                  assignment.addOns.length > 0
                    ? assignment.addOns.join(", ")
                    : "No add-ons"
                }
              />
              <DetailRow
                label="Product links"
                value={assignment.brief.productLinks}
              />
              <DetailRow label="Deadline" value={assignment.deadline} />
              <DetailRow label="Priority" value={assignment.priority} />
            </dl>
            <div className="mt-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              Important note: importer name, phone, WhatsApp, email, address,
              and personal contact details are hidden by platform policy.
            </div>
          </FmsSectionCard>

          <FmsSectionCard id="milestones" title="2. Milestones">
            <MilestoneChecklist milestones={assignment.milestones} />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                className="min-h-12 rounded-lg border border-brand-navy bg-white px-5 py-3 font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:opacity-55"
                disabled={!canAccept || isMutating}
                onClick={() => void updateProgress("accept")}
                type="button"
              >
                Accept Assignment
              </button>
              <button
                className="min-h-12 rounded-lg bg-brand-emerald px-5 py-3 font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
                disabled={!canStartResearch || isMutating}
                onClick={() => void updateProgress("start_research")}
                type="button"
              >
                Start Factory Research
              </button>
            </div>
          </FmsSectionCard>

          <FmsSectionCard id="factory-option" title="3. Factory Option Submission">
            <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              Submissions go to ChinaPak ImportHub admin review first, not
              directly to the importer. 请不要在买家可见字段中填写电话、邮箱、微信或付款信息。
            </div>

            <form className="mt-5 space-y-6" onSubmit={submitFactoryOption}>
              <div>
                <h3 className="text-base font-bold text-brand-navy">
                  Importer-safe factory summary
                </h3>
                <p className="mt-1 text-sm leading-6 text-brand-muted">
                  Do not include phone, email, WeChat, WhatsApp, Telegram, bank
                  details, or direct-contact language in these fields.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {publicSubmissionFields.map((field) => {
                    const fieldId = `submission-${field.key}`;
                    const value = submissionForm[field.key] ?? "";

                    return (
                      <div
                        className={field.type === "textarea" ? "md:col-span-2" : ""}
                        key={field.key}
                      >
                        <label
                          className="block text-sm font-semibold text-brand-navy"
                          htmlFor={fieldId}
                        >
                          {field.label}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                            id={fieldId}
                            onChange={(event) =>
                              updateSubmissionField(field.key, event.target.value)
                            }
                            placeholder={field.placeholder}
                            required={field.required}
                            rows={3}
                            value={value}
                          />
                        ) : (
                          <input
                            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
                            id={fieldId}
                            onChange={(event) =>
                              updateSubmissionField(field.key, event.target.value)
                            }
                            placeholder={field.placeholder}
                            required={field.required}
                            value={value}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-brand-gold bg-amber-50 p-4">
                <h3 className="text-base font-bold text-brand-navy">
                  Admin-only factory contact and notes
                </h3>
                <p className="mt-1 text-sm leading-6 text-brand-muted">
                  Factory contact details stay private to admin review and are
                  not released to the importer in this phase.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {adminOnlySubmissionFields.map((field) => {
                    const fieldId = `submission-${field.key}`;
                    const value = submissionForm[field.key] ?? "";

                    return (
                      <div
                        className={field.type === "textarea" ? "md:col-span-2" : ""}
                        key={field.key}
                      >
                        <label
                          className="block text-sm font-semibold text-brand-navy"
                          htmlFor={fieldId}
                        >
                          {field.label}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
                            id={fieldId}
                            onChange={(event) =>
                              updateSubmissionField(field.key, event.target.value)
                            }
                            placeholder={field.placeholder}
                            rows={3}
                            value={value}
                          />
                        ) : (
                          <input
                            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
                            id={fieldId}
                            onChange={(event) =>
                              updateSubmissionField(field.key, event.target.value)
                            }
                            placeholder={field.placeholder}
                            value={value}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                className="min-h-12 rounded-lg bg-brand-emerald px-5 py-3 font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isMutating}
                type="submit"
              >
                Submit to Admin Review
              </button>
            </form>

            {assignment.factorySubmissions.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-base font-bold text-brand-navy">
                  Submitted options
                </h3>
                <div className="mt-3 grid gap-3">
                  {assignment.factorySubmissions.map((submission) => (
                    <div
                      className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 shadow-sm"
                      key={submission.submissionCode}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-bold text-brand-navy">
                          {submission.submissionCode} -{" "}
                          {submission.factoryDisplayName}
                        </p>
                        <FmsStatusBadge status={submission.submissionStatus} />
                      </div>
                      <p className="mt-2 text-brand-muted">
                        {submission.productCategory} · {submission.cityProvince}
                      </p>
                      <p className="mt-2 text-brand-muted">
                        {submission.productMatchSummary}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-brand-muted">
                        Admin review: {submission.adminReviewStatus} · Submitted{" "}
                        {submission.createdAt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </FmsSectionCard>

          <FmsSectionCard id="evidence" title="4. Quotation & Evidence">
            <FmsEvidenceUploadPanel
              assignmentCode={assignment.assignmentCode}
              submissions={assignment.factorySubmissions.map((submission) => ({
                factoryDisplayName: submission.factoryDisplayName,
                submissionCode: submission.submissionCode,
              }))}
            />
          </FmsSectionCard>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
            <h2 className="text-lg font-bold">Platform Boundary</h2>
            <p className="mt-2">
              FMS cannot contact importers directly, cannot request importer
              contact details, and cannot release factory contact details to
              importers. Admin controls review, release, and completion.
            </p>
          </div>
          <FmsSectionCard title="Admin Notes For FMS">
            <p className="text-sm leading-7 text-brand-muted">
              {assignment.adminFeedback}
            </p>
          </FmsSectionCard>
        </aside>
      </div>
    </>
  );
}
