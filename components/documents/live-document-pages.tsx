"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminProjectSummaryDocumentAction,
  getImporterReportDocumentAction,
  getInvoiceDocumentAction,
  getPaymentConfirmationDocumentAction,
  getRefundDecisionDocumentAction,
  type AdminProjectSummaryDocumentData,
  type ImporterReportDocumentData,
  type InvoiceDocumentData,
  type PaymentConfirmationDocumentData,
  type RefundDecisionDocumentData,
} from "@/app/documents/actions";
import { DocumentLineItemsTable } from "@/components/documents/document-line-items-table";
import { DocumentShell } from "@/components/documents/document-shell";
import { DocumentVerificationBlock } from "@/components/documents/document-verification-block";
import { PrintActions } from "@/components/documents/print-actions";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LoadState = "loading" | "ready" | "error";

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login again before opening this document.");
  }

  return session.access_token;
}

function LoadingNotice() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-brand-muted shadow-sm">
      Loading document...
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-brand-error bg-red-50 p-5 text-sm font-semibold leading-6 text-brand-error shadow-sm">
      {message}
    </div>
  );
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="document-avoid-break">
      <h2 className="text-sm font-black uppercase tracking-[0.16em] text-brand-navy">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DefinitionGrid({
  items,
}: {
  items: Array<{ label: string; noTranslate?: boolean; value: string }>;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={item.label}>
          <dt className="text-xs font-bold uppercase tracking-wide text-brand-muted">
            {item.label}
          </dt>
          <dd
            className="mt-1 text-sm font-semibold leading-6 text-brand-text"
            translate={item.noTranslate ? "no" : undefined}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TotalsBox({
  items,
}: {
  items: Array<{ label: string; strong?: boolean; value: string }>;
}) {
  return (
    <dl className="document-avoid-break ml-auto max-w-sm space-y-3 border border-slate-200 bg-slate-50 p-4 text-sm">
      {items.map((item) => (
        <div
          className={`flex justify-between gap-4 ${
            item.strong ? "border-t border-slate-300 pt-3 text-lg font-black text-brand-navy" : ""
          }`}
          key={item.label}
        >
          <dt className="font-bold text-brand-muted">{item.label}</dt>
          <dd className="font-bold text-brand-text">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function useDocumentLoader<T>(
  loader: (accessToken: string) => Promise<
    | {
        ok: true;
        data: T;
      }
    | {
        ok: false;
        message: string;
      }
  >,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(async () => {
    setState("loading");
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await loader(accessToken);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setData(result.data);
      setState("ready");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Document could not be loaded.",
      );
      setState("error");
    }
  }, [loader]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, state };
}

export function LiveInvoiceDocument({
  backHref,
  backLabel = "Back to invoice",
  invoiceId,
}: {
  backHref?: string;
  backLabel?: string;
  invoiceId: string;
}) {
  const loader = useCallback(
    (accessToken: string) => getInvoiceDocumentAction(accessToken, invoiceId),
    [invoiceId],
  );
  const { data, error, state } = useDocumentLoader<InvoiceDocumentData>(loader);

  if (state === "loading") {
    return <LoadingNotice />;
  }

  if (state === "error" || !data) {
    return <ErrorNotice message={error || "Invoice document was not found."} />;
  }

  return (
    <div className="space-y-5">
      <PrintActions
        backHref={
          backHref ?? `${ROUTES.invoices}/${encodeURIComponent(data.invoiceCode)}`
        }
        backLabel={backLabel}
      />
      <DocumentShell
        documentId={data.documentId}
        eyebrow="Official invoice document"
        projectCode={data.projectCode}
        status={data.status}
        statusTone={data.statusTone}
        title={`Invoice ${data.invoiceCode}`}
      >
        <Section title="Customer and invoice details">
          <DefinitionGrid
            items={[
              { label: "Customer", value: data.customer.name },
              { label: "Business type", value: data.customer.businessType ?? "" },
              { label: "City", value: data.customer.city ?? "" },
              { label: "Phone / WhatsApp", value: data.customer.phoneWhatsapp ?? "" },
              { label: "Issue date", value: data.issuedAt },
              { label: "Due date", value: data.dueAt },
              { label: "Payment status", value: data.paymentStatus },
              {
                label: "Transaction reference",
                noTranslate: true,
                value: data.transactionReference,
              },
              { label: "Refund status", value: data.refundStatus },
            ]}
          />
        </Section>

        <Section title="Service line items">
          <DocumentLineItemsTable items={data.lineItems} />
        </Section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Section title="Manual payment instructions">
            <ul className="grid gap-2 text-sm leading-6 text-brand-muted">
              {data.manualPaymentInstructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </Section>
          <TotalsBox
            items={[
              { label: "Subtotal", value: data.subtotal },
              { label: "Discount", value: data.discount },
              { label: "Tax", value: data.tax },
              { label: "Total", strong: true, value: data.total },
            ]}
          />
        </div>

        <DocumentVerificationBlock verification={data.verification} />
      </DocumentShell>
    </div>
  );
}

export function LivePaymentConfirmationDocument({
  backHref = ROUTES.payments,
  backLabel = "Back to payments",
  paymentId,
}: {
  backHref?: string;
  backLabel?: string;
  paymentId: string;
}) {
  const loader = useCallback(
    (accessToken: string) =>
      getPaymentConfirmationDocumentAction(accessToken, paymentId),
    [paymentId],
  );
  const { data, error, state } =
    useDocumentLoader<PaymentConfirmationDocumentData>(loader);

  if (state === "loading") {
    return <LoadingNotice />;
  }

  if (state === "error" || !data) {
    return (
      <ErrorNotice message={error || "Payment confirmation was not found."} />
    );
  }

  return (
    <div className="space-y-5">
      <PrintActions backHref={backHref} backLabel={backLabel} />
      <DocumentShell
        disclaimer="This payment confirmation reflects manual/offline payment verification recorded by ChinaPak ImportHub admin. It is not gateway settlement proof or bank-issued confirmation."
        documentId={data.documentId}
        eyebrow="Manual payment confirmation"
        projectCode={data.projectCode}
        status={data.status}
        statusTone={data.statusTone}
        title="Payment Confirmation"
      >
        <Section title="Payment record">
          <DefinitionGrid
            items={[
              { label: "Payment record ID", noTranslate: true, value: data.paymentRecordId },
              { label: "Invoice", noTranslate: true, value: data.invoiceCode },
              { label: "Amount paid", value: data.amountPaid },
              { label: "Method", value: data.method },
              { label: "Reference", noTranslate: true, value: data.reference },
              { label: "Payer name", value: data.payerName },
              { label: "Payment date", value: data.paymentDate },
              { label: "Verified at", value: data.verifiedAt },
              { label: "Verified by", value: data.verifiedBy },
            ]}
          />
        </Section>
        <Section title="Important note">
          <p className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm font-semibold leading-6 text-brand-navy">
            {data.note}
          </p>
        </Section>
        <DocumentVerificationBlock verification={data.verification} />
      </DocumentShell>
    </div>
  );
}

export function LiveRefundDecisionDocument({
  backHref = ROUTES.refunds,
  backLabel = "Back to refunds",
  refundId,
}: {
  backHref?: string;
  backLabel?: string;
  refundId: string;
}) {
  const loader = useCallback(
    (accessToken: string) => getRefundDecisionDocumentAction(accessToken, refundId),
    [refundId],
  );
  const { data, error, state } =
    useDocumentLoader<RefundDecisionDocumentData>(loader);

  if (state === "loading") {
    return <LoadingNotice />;
  }

  if (state === "error" || !data) {
    return <ErrorNotice message={error || "Refund document was not found."} />;
  }

  return (
    <div className="space-y-5">
      <PrintActions backHref={backHref} backLabel={backLabel} />
      <DocumentShell
        disclaimer="Refund decisions are manual/offline tracking records. Actual money movement is handled outside this document until a payment gateway or bank integration is connected."
        documentId={data.documentId}
        eyebrow="Refund request and decision"
        projectCode={data.projectCode}
        status={data.status}
        statusTone={data.statusTone}
        title={`Refund ${data.refundCode}`}
      >
        <Section title="Refund summary">
          <DefinitionGrid
            items={[
              { label: "Refund request ID", noTranslate: true, value: data.refundCode },
              { label: "Invoice", noTranslate: true, value: data.invoiceCode },
              { label: "Requested amount", value: data.requestedAmount },
              { label: "Approved amount", value: data.approvedAmount },
              { label: "Request date", value: data.requestedAt },
              { label: "Processed date", value: data.processedDate },
              {
                label: "FMS assigned at request",
                value: data.fmsAssignedAtRequest ? "Yes" : "No",
              },
              {
                label: "Milestone review",
                value: data.milestoneReviewRequired ? "Required" : "Not required",
              },
              {
                label: "Reassignment offered",
                value: data.reassignmentOffered ? "Yes" : "No",
              },
            ]}
          />
        </Section>
        <Section title="Importer request">
          <div className="grid gap-3">
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-brand-text">
              <strong>Reason:</strong> {data.reason}
            </p>
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-brand-text">
              <strong>Explanation:</strong> {data.requestExplanation}
            </p>
          </div>
        </Section>
        <Section title="Admin decision">
          <div className="grid gap-3">
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-brand-text">
              <strong>Decision:</strong> {data.adminDecision}
            </p>
            <p className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm font-semibold leading-6 text-brand-navy">
              {data.customerVisibleSummary}
            </p>
          </div>
        </Section>
        <DocumentVerificationBlock verification={data.verification} />
      </DocumentShell>
    </div>
  );
}

function ReportOptionFields({
  option,
}: {
  option: ImporterReportDocumentData["report"]["options"][number];
}) {
  const rows = [
    ["City/province", option.cityProvince, "cityProvince"],
    ["Category", option.productCategory, "productCategory"],
    ["Main products", option.mainProducts, "mainProducts"],
    ["Product match", option.productMatchSummary, "productMatchSummary"],
    [
      "Estimated unit price",
      `${option.estimatedUnitPrice} ${option.currency}`,
      "estimatedUnitPrice",
    ],
    ["MOQ", option.moq, "moq"],
    ["Sample availability", option.sampleAvailability, "sampleAvailability"],
    ["Production lead time", option.productionLeadTime, "productionLeadTime"],
    ["Packaging", option.packagingNotes, "packagingNotes"],
    [
      "Customization/private label",
      option.customizationAvailability,
      "customizationAvailability",
    ],
    [
      "Quality/reliability",
      option.qualityReliabilitySummary,
      "qualityReliabilitySummary",
    ],
    ["Risk summary", option.riskSummary, "riskSummary"],
  ].filter(([, , key]) => option.visibleFields.includes(key));

  return (
    <DefinitionGrid
      items={rows.map(([label, value]) => ({
        label,
        value,
      }))}
    />
  );
}

export function LiveImporterReportDocument({
  projectCode,
}: {
  projectCode: string;
}) {
  const loader = useCallback(
    (accessToken: string) =>
      getImporterReportDocumentAction(accessToken, projectCode),
    [projectCode],
  );
  const { data, error, state } =
    useDocumentLoader<ImporterReportDocumentData>(loader);

  if (state === "loading") {
    return <LoadingNotice />;
  }

  if (state === "error" || !data) {
    return <ErrorNotice message={error || "Report document was not found."} />;
  }

  return (
    <div className="space-y-5">
      <PrintActions
        backHref={`${ROUTES.importerReports}/${encodeURIComponent(data.projectCode)}`}
        backLabel="Back to report"
      />
      <DocumentShell
        disclaimer="This importer-facing report includes only admin-approved, sanitized factory option summaries. Factory contact details, raw FMS submissions, private notes, payment details, and internal IDs are excluded."
        documentId={data.documentId}
        eyebrow="Approved factory report"
        projectCode={data.projectCode}
        status={data.report.statusLabel}
        statusTone={data.statusTone}
        title="Approved Factory Report"
      >
        <Section title="Report summary">
          <DefinitionGrid
            items={[
              { label: "Package", value: data.packageName },
              { label: "Options", value: String(data.optionCount) },
              { label: "Released", value: data.releaseDate },
              { label: "Project status", value: data.projectStatus },
            ]}
          />
          {data.report.importerSafeSummary ? (
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-brand-text">
              {data.report.importerSafeSummary}
            </p>
          ) : null}
        </Section>
        {data.report.adminRecommendation ? (
          <Section title="Admin recommendation">
            <p className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm font-semibold leading-6 text-brand-navy">
              {data.report.adminRecommendation}
            </p>
          </Section>
        ) : null}
        <Section title="Approved factory options">
          <div className="grid gap-4">
            {data.report.options.map((option, index) => (
              <article
                className="document-avoid-break rounded-lg border border-slate-200 bg-white p-4"
                key={`${option.factoryLabel}-${index}`}
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-black text-brand-navy">
                    {option.factoryLabel}
                  </h3>
                  {option.recommended ? (
                    <span className="w-fit rounded-lg border border-brand-emerald bg-emerald-50 px-3 py-1 text-xs font-black text-brand-emerald">
                      Recommended
                    </span>
                  ) : null}
                </div>
                <ReportOptionFields option={option} />
              </article>
            ))}
          </div>
        </Section>
        {data.report.comparisonNotes ? (
          <Section title="Comparison notes">
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-brand-text">
              {data.report.comparisonNotes}
            </p>
          </Section>
        ) : null}
        <Section title="Released evidence references">
          {data.releasedEvidence.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm font-semibold text-brand-muted">
              No evidence files have been released into this report document yet.
              Safe released files remain available through the importer report
              page when admin approves them.
            </p>
          ) : (
            <DefinitionGrid
              items={data.releasedEvidence.map((file) => ({
                label: file.fileName,
                value: `${file.mimeType} | ${file.fileSize} | ${file.status}`,
              }))}
            />
          )}
        </Section>
        <Section title="Next steps">
          <ul className="grid gap-2 text-sm leading-6 text-brand-muted">
            {data.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </Section>
        <DocumentVerificationBlock verification={data.verification} />
      </DocumentShell>
    </div>
  );
}

export function LiveAdminProjectSummaryDocument({
  projectCode,
}: {
  projectCode: string;
}) {
  const loader = useCallback(
    (accessToken: string) =>
      getAdminProjectSummaryDocumentAction(accessToken, projectCode),
    [projectCode],
  );
  const { data, error, state } =
    useDocumentLoader<AdminProjectSummaryDocumentData>(loader);

  if (state === "loading") {
    return <LoadingNotice />;
  }

  if (state === "error" || !data) {
    return (
      <ErrorNotice message={error || "Admin project document was not found."} />
    );
  }

  return (
    <div className="space-y-5">
      <PrintActions
        backHref={`${ROUTES.admin}/projects/${encodeURIComponent(data.projectCode)}`}
        backLabel="Back to project"
      />
      <DocumentShell
        disclaimer="This is an internal admin operations summary. It may include admin-only importer contact and operational status, but it excludes passwords, tokens, raw private storage paths, factory sensitive contact records, and system secrets."
        documentId={data.documentId}
        eyebrow="Internal admin project summary"
        projectCode={data.projectCode}
        status={data.projectStatus}
        statusTone="neutral"
        title="Admin Project Summary"
      >
        <Section title="Project and package">
          <DefinitionGrid
            items={[
              { label: "Project ID", noTranslate: true, value: data.projectCode },
              { label: "Project status", value: data.projectStatus },
              { label: "Payment status", value: data.paymentStatus },
              { label: "Admin review", value: data.adminReviewStatus },
              { label: "Package", value: data.packageName },
              { label: "Package price", value: data.packagePrice },
              { label: "Assignment", value: data.assignmentStatus },
              { label: "Report status", value: data.reportStatus },
              { label: "Total service fee", value: data.totalServiceFee },
            ]}
          />
        </Section>
        <Section title="Importer profile">
          <DefinitionGrid
            items={[
              { label: "Importer", value: data.importer.name },
              { label: "City", value: data.importer.city ?? "" },
              { label: "Business type", value: data.importer.businessType ?? "" },
              {
                label: "Admin-only contact",
                noTranslate: true,
                value: data.importer.contactForAdminOnly,
              },
              {
                label: "Verification",
                value: data.importer.verificationStatus,
              },
            ]}
          />
        </Section>
        <Section title="Project requirements">
          <DefinitionGrid items={data.requirements} />
        </Section>
        <Section title="Selected add-ons">
          {data.addOns.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm font-semibold text-brand-muted">
              No add-ons selected.
            </p>
          ) : (
            <DefinitionGrid
              items={data.addOns.map((addon) => ({
                label: addon.name,
                value: addon.price,
              }))}
            />
          )}
        </Section>
        <Section title="Readiness and timeline">
          <p className="mb-4 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm font-semibold leading-6 text-brand-navy">
            {data.readiness}
          </p>
          <ol className="grid gap-3">
            {data.timeline.map((item, index) => (
              <li
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6"
                key={`${item.label}-${item.date}-${index}`}
              >
                <span className="font-bold text-brand-navy">{item.date}</span>
                <span className="mx-2 text-brand-muted">|</span>
                <span className="text-brand-text">{item.label}</span>
              </li>
            ))}
          </ol>
        </Section>
        <DocumentVerificationBlock verification={data.verification} />
      </DocumentShell>
    </div>
  );
}
