"use server";

import { getAdminImportProjectAction } from "@/app/admin/projects/actions";
import {
  getImporterFactoryReportAction,
  type ImporterReportDetail,
} from "@/app/importer/reports/actions";
import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { getSiteUrl } from "@/config/site-url";
import { detectContactRiskInFields } from "@/lib/security/contact-firewall";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
type UserRole = Database["public"]["Enums"]["user_role"];
type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type RefundStatus = Database["public"]["Enums"]["refund_status"];
type JsonObject = { [key: string]: Json | undefined };

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

export type DocumentStatusTone = "success" | "warning" | "danger" | "neutral";

export type DocumentLineItem = {
  description: string;
  itemType: string;
  quantity: number;
  total: string;
  unitPrice: string;
};

export type DocumentVerification = {
  documentId: string;
  generatedAt: string;
  projectCode: string;
  status: string;
  verificationNote: string;
  verificationUrl: string;
};

export type DocumentPerson = {
  businessType?: string;
  city?: string;
  email?: string;
  name: string;
  phoneWhatsapp?: string;
};

export type InvoiceDocumentData = {
  customer: DocumentPerson;
  discount: string;
  documentId: string;
  dueAt: string;
  invoiceCode: string;
  issuedAt: string;
  lineItems: DocumentLineItem[];
  manualPaymentInstructions: string[];
  paymentMethod: string;
  paymentStatus: string;
  projectCode: string;
  refundStatus: string;
  status: string;
  statusTone: DocumentStatusTone;
  subtotal: string;
  tax: string;
  total: string;
  transactionReference: string;
  verification: DocumentVerification;
};

export type PaymentConfirmationDocumentData = {
  amountPaid: string;
  documentId: string;
  invoiceCode: string;
  method: string;
  note: string;
  payerName: string;
  paymentDate: string;
  paymentRecordId: string;
  projectCode: string;
  reference: string;
  status: string;
  statusTone: DocumentStatusTone;
  verifiedAt: string;
  verifiedBy: string;
  verification: DocumentVerification;
};

export type RefundDecisionDocumentData = {
  adminDecision: string;
  approvedAmount: string;
  customerVisibleSummary: string;
  documentId: string;
  fmsAssignedAtRequest: boolean;
  invoiceCode: string;
  milestoneReviewRequired: boolean;
  processedDate: string;
  projectCode: string;
  reassignmentOffered: boolean;
  reason: string;
  refundCode: string;
  requestedAmount: string;
  requestExplanation: string;
  requestedAt: string;
  status: string;
  statusTone: DocumentStatusTone;
  verification: DocumentVerification;
};

export type ReleasedEvidenceDocumentItem = {
  fileName: string;
  fileSize: string;
  mimeType: string;
  releasedAt: string;
  status: string;
};

export type ImporterReportDocumentData = ImporterReportDetail & {
  documentId: string;
  releasedEvidence: ReleasedEvidenceDocumentItem[];
  statusTone: DocumentStatusTone;
  verification: DocumentVerification;
};

export type AdminProjectSummaryDocumentData = {
  addOns: Array<{ name: string; price: string }>;
  adminReviewStatus: string;
  assignmentStatus: string;
  documentId: string;
  importer: DocumentPerson & {
    contactForAdminOnly: string;
    verificationStatus: string;
  };
  packageName: string;
  packagePrice: string;
  paymentStatus: string;
  projectCode: string;
  projectStatus: string;
  readiness: string;
  reportStatus: string;
  requirements: Array<{ label: string; value: string }>;
  timeline: Array<{ date: string; label: string }>;
  totalServiceFee: string;
  verification: DocumentVerification;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  awaiting_payment: "Awaiting Payment",
  cancelled: "Cancelled",
  draft: "Draft",
  issued: "Issued",
  paid: "Paid",
  partially_refunded: "Partially Refunded",
  pending: "Pending",
  refunded: "Refunded",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  awaiting_payment: "Awaiting Payment",
  failed: "Failed",
  paid: "Paid",
  partially_refunded: "Partially Refunded",
  refunded: "Refunded",
};

const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  approved: "Approved",
  cancelled: "Cancelled",
  paid: "Paid / Legacy Processed",
  partially_approved: "Partially Approved",
  processed: "Processed",
  reassignment_offered: "Reassignment Offered",
  rejected: "Rejected",
  requested: "Requested",
  under_admin_review: "Under Admin Review",
};

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(value: Json | null | undefined) {
  return typeof value === "number" ? value : null;
}

function readStringArray(value: Json | null | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "PKR 0";
  }

  return new Intl.NumberFormat("en-PK", {
    currency: "PKR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function invoiceTone(status: InvoiceStatus): DocumentStatusTone {
  if (status === "paid") {
    return "success";
  }

  if (status === "refunded" || status === "cancelled") {
    return "danger";
  }

  if (status === "partially_refunded") {
    return "warning";
  }

  return "warning";
}

function paymentTone(status: PaymentStatus | string): DocumentStatusTone {
  if (status === "paid" || status === "verified") {
    return "success";
  }

  if (status === "failed" || status === "rejected") {
    return "danger";
  }

  return "warning";
}

function refundTone(status: RefundStatus): DocumentStatusTone {
  if (status === "approved" || status === "processed") {
    return "success";
  }

  if (status === "rejected" || status === "cancelled") {
    return "danger";
  }

  if (status === "partially_approved" || status === "reassignment_offered") {
    return "warning";
  }

  return "neutral";
}

function documentVerification(input: {
  documentId: string;
  projectCode: string;
  status: string;
}): DocumentVerification {
  const siteUrl = getSiteUrl();
  const reference = encodeURIComponent(input.documentId);

  return {
    documentId: input.documentId,
    generatedAt: formatDate(new Date().toISOString()),
    projectCode: input.projectCode,
    status: input.status,
    verificationNote:
      "Scan or open this reference link to contact ChinaPak ImportHub for document verification. The public page does not expose private document data.",
    verificationUrl: `${siteUrl}/verify?ref=${reference}`,
  };
}

async function requireDocumentUser(
  accessToken: string,
  roles: UserRole[],
) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, roles)) {
    return {
      ok: false as const,
      message: "This account does not have permission to view this document.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    displayName: authCheck.profile.displayName,
    profileId: authCheck.profile.profileId,
    roles: authCheck.profile.roles,
    supabase: createAdminSupabaseClient(),
  };
}

function isAdminRole(roles: UserRole[]) {
  return hasAllowedRole(roles, [USER_ROLES.admin, USER_ROLES.superAdmin]);
}

async function getInvoiceByCodeOrId(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  invoiceCodeOrId: string,
) {
  const decoded = decodeURIComponent(invoiceCodeOrId);
  const query = supabase.from("invoices").select("*");

  return UUID_PATTERN.test(decoded)
    ? query.eq("id", decoded).maybeSingle()
    : query.eq("invoice_code", decoded).maybeSingle();
}

async function getRefundByCodeOrId(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  refundCodeOrId: string,
) {
  const decoded = decodeURIComponent(refundCodeOrId);
  const query = supabase.from("refunds").select("*");

  return UUID_PATTERN.test(decoded)
    ? query.eq("id", decoded).maybeSingle()
    : query.eq("refund_code", decoded).maybeSingle();
}

async function assertProjectOwnership(
  project: TableRow<"import_projects"> | null,
  user: {
    authUserId: string;
    roles: UserRole[];
  },
) {
  if (!project) {
    return {
      ok: false as const,
      message: "The linked Import Project could not be found.",
    };
  }

  if (isAdminRole(user.roles) || project.importer_user_id === user.authUserId) {
    return { ok: true as const };
  }

  return {
    ok: false as const,
    message: "This document is not available to your account.",
  };
}

async function getImporterProfile(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  project: TableRow<"import_projects">,
) {
  const { data } = await supabase
    .from("importer_profiles")
    .select("*")
    .eq("id", project.importer_profile_id)
    .maybeSingle();

  return data;
}

function mapCustomer(
  importer: TableRow<"importer_profiles"> | null,
  fallbackName = "Importer",
): DocumentPerson {
  return {
    businessType: importer?.business_type ?? "Not provided",
    city: importer?.city ?? "Not provided",
    name: importer?.full_name ?? fallbackName,
    phoneWhatsapp: importer?.phone_whatsapp ?? "Not provided",
  };
}

function getManualPaymentMetadata(row: TableRow<"manual_payment_requests">) {
  return toJsonObject(row.metadata);
}

export async function getInvoiceDocumentAction(
  accessToken: string,
  invoiceCodeOrId: string,
): Promise<ActionResult<InvoiceDocumentData>> {
  try {
    const user = await requireDocumentUser(accessToken, [
      USER_ROLES.importer,
      USER_ROLES.admin,
      USER_ROLES.superAdmin,
    ]);

    if (!user.ok) {
      return user;
    }

    const { data: invoice, error: invoiceError } = await getInvoiceByCodeOrId(
      user.supabase,
      invoiceCodeOrId,
    );

    if (invoiceError || !invoice) {
      return {
        ok: false,
        message: invoiceError?.message ?? "Invoice document was not found.",
      };
    }

    const [{ data: project }, { data: lineItems }, { data: refunds }] =
      await Promise.all([
        user.supabase
          .from("import_projects")
          .select("*")
          .eq("id", invoice.project_id)
          .maybeSingle(),
        user.supabase
          .from("invoice_line_items")
          .select("*")
          .eq("invoice_id", invoice.id)
          .order("created_at", { ascending: true }),
        user.supabase
          .from("refunds")
          .select("*")
          .eq("invoice_id", invoice.id)
          .order("created_at", { ascending: false }),
      ]);
    const ownership = await assertProjectOwnership(project, user);

    if (!ownership.ok) {
      return ownership;
    }

    const importer = project
      ? await getImporterProfile(user.supabase, project)
      : null;
    const metadata = toJsonObject(invoice.metadata);
    const instructions = readStringArray(metadata.instructions);
    const statusLabel = INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status;
    const latestRefund = refunds?.[0];

    return {
      ok: true,
      data: {
        customer: mapCustomer(importer, user.displayName ?? "Importer"),
        discount: formatMoney(invoice.discount_pkr),
        documentId: invoice.document_id,
        dueAt: formatDate(invoice.due_at),
        invoiceCode: invoice.invoice_code,
        issuedAt: formatDate(invoice.issued_at ?? invoice.created_at),
        lineItems: (lineItems ?? []).map((item) => ({
          description: item.description,
          itemType: item.item_type,
          quantity: item.quantity,
          total: formatMoney(item.total_pkr),
          unitPrice: formatMoney(item.unit_price_pkr),
        })),
        manualPaymentInstructions:
          instructions.length > 0
            ? instructions
            : [
                "Manual payment references are reviewed by ChinaPak ImportHub admin.",
                "No FMS sourcing starts until payment is verified and admin review is approved.",
              ],
        paymentMethod: invoice.payment_method ?? "Manual/offline payment",
        paymentStatus: PAYMENT_STATUS_LABELS[project?.payment_status ?? "awaiting_payment"],
        projectCode: project?.project_code ?? "Project pending",
        refundStatus: latestRefund
          ? `${latestRefund.refund_code}: ${REFUND_STATUS_LABELS[latestRefund.refund_status]}`
          : "No refund request",
        status: statusLabel,
        statusTone: invoiceTone(invoice.status),
        subtotal: formatMoney(invoice.subtotal_pkr),
        tax: formatMoney(invoice.tax_pkr),
        total: formatMoney(invoice.total_pkr),
        transactionReference:
          invoice.transaction_reference ?? "No verified transaction yet",
        verification: documentVerification({
          documentId: invoice.document_id,
          projectCode: project?.project_code ?? "Project pending",
          status: statusLabel,
        }),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Invoice document could not be loaded.",
    };
  }
}

async function resolveManualPaymentRequest(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  paymentIdOrRequestId: string,
) {
  const decoded = decodeURIComponent(paymentIdOrRequestId);
  const { data: requestById } = await supabase
    .from("manual_payment_requests")
    .select("*")
    .eq("id", decoded)
    .maybeSingle();

  if (requestById) {
    return {
      payment: null as TableRow<"payments"> | null,
      request: requestById,
    };
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("id", decoded)
    .maybeSingle();

  if (!payment) {
    return {
      payment: null as TableRow<"payments"> | null,
      request: null as TableRow<"manual_payment_requests"> | null,
    };
  }

  const { data: request } = await supabase
    .from("manual_payment_requests")
    .select("*")
    .filter("metadata->>payment_id", "eq", payment.id)
    .maybeSingle();

  return { payment, request };
}

export async function getPaymentConfirmationDocumentAction(
  accessToken: string,
  paymentIdOrRequestId: string,
): Promise<ActionResult<PaymentConfirmationDocumentData>> {
  try {
    const user = await requireDocumentUser(accessToken, [
      USER_ROLES.importer,
      USER_ROLES.admin,
      USER_ROLES.superAdmin,
    ]);

    if (!user.ok) {
      return user;
    }

    const { payment: paymentFromLookup, request } =
      await resolveManualPaymentRequest(user.supabase, paymentIdOrRequestId);

    if (!request && !paymentFromLookup) {
      return {
        ok: false,
        message: "Payment confirmation record was not found.",
      };
    }

    const metadata = request ? getManualPaymentMetadata(request) : {};
    const paymentId = readString(metadata.payment_id, paymentFromLookup?.id ?? "");
    const { data: payment } = paymentId
      ? await user.supabase
          .from("payments")
          .select("*")
          .eq("id", paymentId)
          .maybeSingle()
      : { data: paymentFromLookup };
    const invoiceId = readString(metadata.invoice_id, payment?.invoice_id ?? "");
    const [{ data: invoice }, { data: project }] = await Promise.all([
      invoiceId
        ? user.supabase
            .from("invoices")
            .select("*")
            .eq("id", invoiceId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      (request?.project_id ?? payment?.project_id)
        ? user.supabase
            .from("import_projects")
            .select("*")
            .eq("id", request?.project_id ?? payment?.project_id ?? "")
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const ownership = await assertProjectOwnership(project, user);

    if (!ownership.ok) {
      return ownership;
    }

    const verified =
      request?.status === "verified" || payment?.payment_status === "paid";

    if (!verified) {
      return {
        ok: false,
        message:
          "Payment confirmation documents are available only after admin verification.",
      };
    }

    const status = request?.status ?? payment?.payment_status ?? "verified";
    const reviewedAt = readString(metadata.reviewed_at, payment?.verified_at ?? "");
    const reviewedBy = readString(metadata.reviewed_by);

    return {
      ok: true,
      data: {
        amountPaid: formatMoney(
          readNumber(metadata.amount_paid_pkr) ?? payment?.amount_pkr ?? null,
        ),
        documentId: `PAY-DOC-${(request?.id ?? payment?.id ?? "payment")
          .slice(0, 8)
          .toUpperCase()}`,
        invoiceCode: invoice?.invoice_code ?? readString(metadata.invoice_code),
        method:
          request?.preferred_method ??
          payment?.method ??
          readString(metadata.payment_method, "Manual/offline payment"),
        note:
          "This is a ChinaPak ImportHub manual/offline payment tracking confirmation. It is not a bank or gateway settlement certificate.",
        payerName:
          request?.requester_name ?? readString(metadata.payer_name, "Importer"),
        paymentDate: readString(metadata.payment_date, formatDate(payment?.created_at)),
        paymentRecordId: request?.id ?? payment?.id ?? paymentIdOrRequestId,
        projectCode: project?.project_code ?? "Project pending",
        reference:
          payment?.provider_reference ??
          readString(metadata.transaction_reference, "Reference not provided"),
        status: status === "verified" ? "Verified" : PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status,
        statusTone: paymentTone(status),
        verifiedAt: formatDate(reviewedAt || payment?.verified_at),
        verifiedBy: reviewedBy ? "ChinaPak ImportHub admin" : "ChinaPak ImportHub admin",
        verification: documentVerification({
          documentId: `PAY-DOC-${(request?.id ?? payment?.id ?? "payment")
            .slice(0, 8)
            .toUpperCase()}`,
          projectCode: project?.project_code ?? "Project pending",
          status: "Verified",
        }),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Payment confirmation document could not be loaded.",
    };
  }
}

export async function getRefundDecisionDocumentAction(
  accessToken: string,
  refundCodeOrId: string,
): Promise<ActionResult<RefundDecisionDocumentData>> {
  try {
    const user = await requireDocumentUser(accessToken, [
      USER_ROLES.importer,
      USER_ROLES.admin,
      USER_ROLES.superAdmin,
    ]);

    if (!user.ok) {
      return user;
    }

    const { data: refund, error: refundError } = await getRefundByCodeOrId(
      user.supabase,
      refundCodeOrId,
    );

    if (refundError || !refund) {
      return {
        ok: false,
        message: refundError?.message ?? "Refund document was not found.",
      };
    }

    const [{ data: project }, { data: invoice }, { data: decisions }] =
      await Promise.all([
        user.supabase
          .from("import_projects")
          .select("*")
          .eq("id", refund.project_id)
          .maybeSingle(),
        refund.invoice_id
          ? user.supabase
              .from("invoices")
              .select("*")
              .eq("id", refund.invoice_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        user.supabase
          .from("refund_decisions")
          .select("*")
          .eq("refund_id", refund.id)
          .order("decided_at", { ascending: false }),
      ]);
    const ownership = await assertProjectOwnership(project, user);

    if (!ownership.ok) {
      return ownership;
    }

    const metadata = toJsonObject(refund.metadata);
    const latestDecision = decisions?.[0] ?? null;
    const statusLabel =
      REFUND_STATUS_LABELS[refund.refund_status] ?? refund.refund_status;

    return {
      ok: true,
      data: {
        adminDecision: latestDecision?.decision ?? "No admin decision yet",
        approvedAmount: formatMoney(refund.approved_amount_pkr),
        customerVisibleSummary:
          latestDecision?.customer_visible_summary ??
          readString(metadata.last_customer_visible_summary, "Admin decision pending."),
        documentId: `REF-DOC-${refund.refund_code}`,
        fmsAssignedAtRequest: refund.fms_assigned_at_request,
        invoiceCode: invoice?.invoice_code ?? "Invoice pending",
        milestoneReviewRequired: refund.milestone_review_required,
        processedDate:
          refund.refund_status === "processed"
            ? formatDate(refund.updated_at)
            : "Not processed yet",
        projectCode: project?.project_code ?? "Project pending",
        reassignmentOffered: refund.reassignment_offered,
        reason: refund.reason,
        refundCode: refund.refund_code,
        requestedAmount: formatMoney(refund.requested_amount_pkr),
        requestExplanation: readString(metadata.explanation, "Not provided"),
        requestedAt: formatDate(refund.created_at),
        status: statusLabel,
        statusTone: refundTone(refund.refund_status),
        verification: documentVerification({
          documentId: `REF-DOC-${refund.refund_code}`,
          projectCode: project?.project_code ?? "Project pending",
          status: statusLabel,
        }),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Refund document could not be loaded.",
    };
  }
}

function collectReportFields(report: ImporterReportDetail) {
  return [
    { label: "Importer-safe summary", value: report.report.importerSafeSummary },
    { label: "Admin recommendation", value: report.report.adminRecommendation },
    { label: "Comparison notes", value: report.report.comparisonNotes },
    ...report.report.options.flatMap((option) => [
      { label: `${option.factoryLabel} city`, value: option.cityProvince },
      { label: `${option.factoryLabel} category`, value: option.productCategory },
      {
        label: `${option.factoryLabel} products`,
        value: option.mainProducts,
      },
      {
        label: `${option.factoryLabel} match`,
        value: option.productMatchSummary,
      },
      {
        label: `${option.factoryLabel} price`,
        value: option.estimatedUnitPrice,
      },
      { label: `${option.factoryLabel} MOQ`, value: option.moq },
      {
        label: `${option.factoryLabel} samples`,
        value: option.sampleAvailability,
      },
      {
        label: `${option.factoryLabel} lead time`,
        value: option.productionLeadTime,
      },
      {
        label: `${option.factoryLabel} packaging`,
        value: option.packagingNotes,
      },
      {
        label: `${option.factoryLabel} customization`,
        value: option.customizationAvailability,
      },
      {
        label: `${option.factoryLabel} reliability`,
        value: option.qualityReliabilitySummary,
      },
      { label: `${option.factoryLabel} risk`, value: option.riskSummary },
    ]),
  ];
}

export async function getImporterReportDocumentAction(
  accessToken: string,
  projectCode: string,
): Promise<ActionResult<ImporterReportDocumentData>> {
  try {
    const reportResult = await getImporterFactoryReportAction(
      accessToken,
      projectCode,
    );

    if (!reportResult.ok) {
      return reportResult;
    }

    const firewall = detectContactRiskInFields(
      collectReportFields(reportResult.data),
    );

    if (firewall.flags.length > 0) {
      return {
        ok: false,
        message: `Report document blocked by contact firewall: ${firewall.messages.join(" ")}`,
      };
    }

    const user = await requireDocumentUser(accessToken, [USER_ROLES.importer]);

    if (!user.ok) {
      return user;
    }

    const { data: project } = await user.supabase
      .from("import_projects")
      .select("*")
      .eq("project_code", decodeURIComponent(projectCode))
      .eq("importer_user_id", user.authUserId)
      .maybeSingle();

    if (!project) {
      return {
        ok: false,
        message: "The linked Import Project could not be found.",
      };
    }

    const { data: fileRows } = await user.supabase
      .from("file_assets")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });
    const releasedEvidence = (fileRows ?? [])
      .filter((file) => {
        const metadata = toJsonObject(file.metadata);
        return (
          file.review_status === "approved_importer_visible" ||
          readString(metadata.visibility_scope) === "released_to_importer"
        );
      })
      .map((file) => ({
        fileName: file.original_filename,
        fileSize: formatFileSize(file.size_bytes),
        mimeType: file.mime_type ?? "Unknown",
        releasedAt: formatDate(file.updated_at),
        status: "Released to importer",
      }));
    const documentId = `RPT-${project.project_code}-V${reportResult.data.report.version}`;

    return {
      ok: true,
      data: {
        ...reportResult.data,
        documentId,
        releasedEvidence,
        statusTone: "success",
        verification: documentVerification({
          documentId,
          projectCode: project.project_code,
          status: reportResult.data.report.statusLabel,
        }),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Importer report document could not be loaded.",
    };
  }
}

export async function getAdminProjectSummaryDocumentAction(
  accessToken: string,
  projectCode: string,
): Promise<ActionResult<AdminProjectSummaryDocumentData>> {
  try {
    const projectResult = await getAdminImportProjectAction(
      accessToken,
      projectCode,
    );

    if (!projectResult.ok) {
      return projectResult;
    }

    const project = projectResult.data;
    const documentId = `ADM-${project.project.projectCode}`;

    return {
      ok: true,
      data: {
        addOns: project.addOns,
        adminReviewStatus: project.project.adminReviewStatus,
        assignmentStatus:
          project.fmsAssignment.currentAssignment?.status ?? "No active assignment",
        documentId,
        importer: {
          businessType: project.importer.businessType,
          city: project.importer.city,
          contactForAdminOnly: project.importer.contactForAdminOnly,
          name: project.importer.name,
          verificationStatus: project.importer.verificationStatus,
        },
        packageName: project.package.name,
        packagePrice: project.package.price,
        paymentStatus: project.project.paymentStatus,
        projectCode: project.project.projectCode,
        projectStatus: project.project.projectStatus,
        readiness: project.project.readinessDescription,
        reportStatus: project.factoryReport.reportStatus,
        requirements: [
          { label: "Budget", value: project.requirements.budget },
          {
            label: "Import experience",
            value: project.requirements.importExperience,
          },
          { label: "Input method", value: project.requirements.inputMethod },
          {
            label: "Product details",
            value: project.requirements.productDetails,
          },
          { label: "Product links", value: project.requirements.productLinks },
          { label: "Quantity", value: project.requirements.quantity },
          { label: "Quality level", value: project.requirements.qualityLevel },
          { label: "Special notes", value: project.requirements.specialNotes },
        ],
        timeline: project.timeline.map((item) => ({
          date: item.date,
          label: item.label,
        })),
        totalServiceFee: project.totalServiceFee,
        verification: documentVerification({
          documentId,
          projectCode: project.project.projectCode,
          status: project.project.projectStatus,
        }),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Admin project document could not be loaded.",
    };
  }
}
