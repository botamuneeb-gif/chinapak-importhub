"use server";

import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import {
  ensureInvoiceForProject,
  generateRefundCode,
  mergeMetadata,
} from "@/lib/billing/invoice-helpers";
import { createNotification, createNotifications } from "@/lib/notifications/create-notification";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
type JsonObject = { [key: string]: Json | undefined };
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
type RefundStatus = Database["public"]["Enums"]["refund_status"];

type ActionResult<T> =
  | {
      ok: true;
      data: T;
      message?: string;
    }
  | {
      ok: false;
      message: string;
    };

export type ManualPaymentStatus =
  | "submitted"
  | "under_review"
  | "verified"
  | "rejected"
  | "needs_more_info";

export type BillingInvoiceListItem = {
  amount: string;
  createdAt: string;
  dueAt: string;
  invoiceCode: string;
  invoiceId: string;
  packageName: string;
  projectCode: string;
  status: string;
  statusRaw: InvoiceStatus;
};

export type ManualPaymentItem = {
  amountPaid: string;
  createdAt: string;
  id: string;
  invoiceCode: string;
  method: string;
  notes: string;
  payerName: string;
  paymentDate: string;
  projectCode: string;
  reference: string;
  status: ManualPaymentStatus | string;
};

export type BillingInvoiceDetail = BillingInvoiceListItem & {
  addOns: Array<{
    description: string;
    total: string;
  }>;
  customer: {
    businessType: string;
    city: string;
    name: string;
    phoneWhatsapp: string;
  };
  discount: string;
  documentId: string;
  issuedAt: string;
  lineItems: Array<{
    description: string;
    itemType: string;
    quantity: number;
    total: string;
    unitPrice: string;
  }>;
  manualPaymentInstructions: string[];
  manualPayments: ManualPaymentItem[];
  packageName: string;
  paidAt: string;
  projectStatus: string;
  refundSummary: string;
  subtotal: string;
  tax: string;
  total: string;
  transactionReference: string;
};

export type AdminManualPaymentItem = ManualPaymentItem & {
  city: string;
  importerName: string;
  phoneWhatsapp: string;
  projectId: string;
  totalDue: string;
};

export type RefundListItem = {
  approvedAmount: string;
  createdAt: string;
  fmsAssignedAtRequest: boolean;
  invoiceCode: string;
  milestoneReviewRequired: boolean;
  projectCode: string;
  reason: string;
  reassignmentOffered: boolean;
  refundCode: string;
  refundId: string;
  requestedAmount: string;
  status: string;
  statusRaw: RefundStatus;
  warning: string;
};

export type AdminRefundItem = RefundListItem & {
  activeAssignmentCount: number;
  importerName: string;
  latestDecision: string;
};

export type ManualPaymentSubmissionInput = {
  amountPaid: string;
  invoiceCode: string;
  notes?: string;
  payerName: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
};

export type RefundRequestInput = {
  explanation: string;
  invoiceCode: string;
  preferredFollowUp?: string;
  reason: string;
  requestedAmount?: string;
};

export type AdminPaymentReviewInput = {
  decision: "verify" | "reject" | "needs_more_info" | "under_review";
  importerMessage?: string;
  internalNote?: string;
};

export type AdminRefundReviewInput = {
  approvedAmount?: string;
  customerVisibleSummary?: string;
  decision:
    | "start_review"
    | "offer_reassignment"
    | "approve_full"
    | "approve_partial"
    | "reject"
    | "mark_processed"
    | "cancel";
  internalNote?: string;
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

const OPEN_REFUND_STATUSES: RefundStatus[] = [
  "requested",
  "under_admin_review",
  "reassignment_offered",
  "approved",
  "partially_approved",
];

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | undefined, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(value: Json | undefined) {
  return typeof value === "number" ? value : null;
}

function cleanText(value: string | undefined) {
  return value?.trim() ?? "";
}

function parseMoney(value: string | undefined) {
  const normalized = cleanText(value).replace(/,/g, "");
  const amount = Number(normalized);

  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null;
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

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

async function getImporterProfileUserProfileId(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  importerProfileId: string | null | undefined,
) {
  if (!importerProfileId) {
    return null;
  }

  const { data } = await supabase
    .from("importer_profiles")
    .select("user_profile_id")
    .eq("id", importerProfileId)
    .maybeSingle();

  return data?.user_profile_id ?? null;
}

function resolveProjectStatus(
  paymentStatus: PaymentStatus,
  adminReviewStatus: Database["public"]["Enums"]["admin_review_status"],
) {
  if (paymentStatus === "refunded") {
    return "refunded" as const;
  }

  if (paymentStatus === "partially_refunded") {
    return "partially_refunded" as const;
  }

  if (paymentStatus !== "paid") {
    return "awaiting_payment" as const;
  }

  if (adminReviewStatus === "ready_for_fms_assignment") {
    return "ready_for_fms_assignment" as const;
  }

  if (adminReviewStatus === "needs_information") {
    return "needs_importer_clarification" as const;
  }

  if (adminReviewStatus === "rejected") {
    return "cancelled" as const;
  }

  return "admin_review" as const;
}

async function requireRole(
  accessToken: string,
  roles: Database["public"]["Enums"]["user_role"][],
) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, roles)) {
    return {
      ok: false as const,
      message: "This account does not have permission for this billing action.",
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

async function getImporterContext(accessToken: string) {
  const user = await requireRole(accessToken, [USER_ROLES.importer]);

  if (!user.ok) {
    return user;
  }

  const { data: importerProfile, error } = await user.supabase
    .from("importer_profiles")
    .select("*")
    .eq("user_profile_id", user.profileId)
    .maybeSingle();

  if (error || !importerProfile) {
    return {
      ok: false as const,
      message: "Your importer profile could not be found.",
    };
  }

  return { ...user, importerProfile };
}

async function getAdminContext(accessToken: string) {
  const user = await requireRole(accessToken, [
    USER_ROLES.admin,
    USER_ROLES.superAdmin,
  ]);

  if (!user.ok) {
    return user;
  }

  const { data: adminProfile } = await user.supabase
    .from("admin_profiles")
    .select("id")
    .eq("user_profile_id", user.profileId)
    .maybeSingle();

  return { ...user, adminProfileId: adminProfile?.id ?? null };
}

function getManualPaymentMetadata(row: TableRow<"manual_payment_requests">) {
  return toJsonObject(row.metadata);
}

function mapManualPayment(
  row: TableRow<"manual_payment_requests">,
  invoiceCode: string,
  projectCode: string,
): ManualPaymentItem {
  const metadata = getManualPaymentMetadata(row);

  return {
    amountPaid: formatMoney(readNumber(metadata.amount_paid_pkr)),
    createdAt: formatDate(row.created_at),
    id: row.id,
    invoiceCode,
    method: row.preferred_method ?? readString(metadata.payment_method, "Manual"),
    notes: row.problem_description ?? "",
    payerName: row.requester_name ?? readString(metadata.payer_name, ""),
    paymentDate: readString(metadata.payment_date, "Not set"),
    projectCode,
    reference: readString(metadata.transaction_reference, "Not provided"),
    status: row.status,
  };
}

function mapInvoiceListItem(
  invoice: TableRow<"invoices">,
  project: TableRow<"import_projects"> | null,
  packageRow: TableRow<"packages"> | null,
): BillingInvoiceListItem {
  return {
    amount: formatMoney(invoice.total_pkr),
    createdAt: formatDate(invoice.created_at),
    dueAt: formatDate(invoice.due_at),
    invoiceCode: invoice.invoice_code,
    invoiceId: invoice.id,
    packageName: packageRow?.name ?? "Package pending",
    projectCode: project?.project_code ?? "Project pending",
    status: INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status,
    statusRaw: invoice.status,
  };
}

async function getInvoiceForImporter(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  authUserId: string,
  invoiceCodeOrId: string,
) {
  const decoded = decodeURIComponent(invoiceCodeOrId);
  let query = supabase
    .from("invoices")
    .select("*")
    .eq("customer_user_id", authUserId);

  query = UUID_PATTERN.test(decoded)
    ? query.eq("id", decoded)
    : query.eq("invoice_code", decoded);

  const { data, error } = await query.maybeSingle();

  return { data, error };
}

async function getOrCreatePaymentForInvoice(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  invoice: TableRow<"invoices">,
  actorUserId: string | null,
) {
  const ensureResult = await ensureInvoiceForProject(
    supabase,
    invoice.project_id,
    actorUserId,
  );

  if (!ensureResult.ok) {
    return ensureResult;
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoice.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !payment) {
    return {
      ok: false as const,
      message: error?.message ?? "Payment tracking row was not found.",
    };
  }

  return { ok: true as const, data: payment };
}

export async function listImporterInvoicesAction(
  accessToken: string,
): Promise<ActionResult<BillingInvoiceListItem[]>> {
  try {
    const importer = await getImporterContext(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const { data: projects, error: projectsError } = await importer.supabase
      .from("import_projects")
      .select("*")
      .eq("importer_user_id", importer.authUserId)
      .order("created_at", { ascending: false });

    if (projectsError) {
      return { ok: false, message: projectsError.message };
    }

    for (const project of projects ?? []) {
      await ensureInvoiceForProject(
        importer.supabase,
        project.id,
        importer.authUserId,
      );
    }

    const projectIds = (projects ?? []).map((project) => project.id);

    if (projectIds.length === 0) {
      return { ok: true, data: [] };
    }

    const [{ data: invoices }, { data: packageRows }] = await Promise.all([
      importer.supabase
        .from("invoices")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false }),
      importer.supabase
        .from("packages")
        .select("*")
        .in(
          "id",
          unique((projects ?? []).map((project) => project.package_id)),
        ),
    ]);

    const projectMap = byId(projects ?? []);
    const packageMap = byId(packageRows ?? []);

    return {
      ok: true,
      data: (invoices ?? []).map((invoice) => {
        const project = projectMap.get(invoice.project_id) ?? null;

        return mapInvoiceListItem(
          invoice,
          project,
          project?.package_id ? packageMap.get(project.package_id) ?? null : null,
        );
      }),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Invoices could not be loaded.",
    };
  }
}

export async function getImporterInvoiceAction(
  accessToken: string,
  invoiceCodeOrId: string,
): Promise<ActionResult<BillingInvoiceDetail>> {
  try {
    const importer = await getImporterContext(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const { data: invoice, error: invoiceError } = await getInvoiceForImporter(
      importer.supabase,
      importer.authUserId,
      invoiceCodeOrId,
    );

    if (invoiceError || !invoice) {
      return {
        ok: false,
        message: invoiceError?.message ?? "Invoice was not found.",
      };
    }

    const [projectResult, lineItemsResult, manualPaymentsResult, refundsResult] =
      await Promise.all([
        importer.supabase
          .from("import_projects")
          .select("*")
          .eq("id", invoice.project_id)
          .maybeSingle(),
        importer.supabase
          .from("invoice_line_items")
          .select("*")
          .eq("invoice_id", invoice.id)
          .order("created_at", { ascending: true }),
        importer.supabase
          .from("manual_payment_requests")
          .select("*")
          .eq("project_id", invoice.project_id)
          .order("created_at", { ascending: false }),
        importer.supabase
          .from("refunds")
          .select("*")
          .eq("invoice_id", invoice.id)
          .order("created_at", { ascending: false }),
      ]);

    if (projectResult.error || lineItemsResult.error) {
      return {
        ok: false,
        message:
          projectResult.error?.message ??
          lineItemsResult.error?.message ??
          "Invoice detail could not be loaded.",
      };
    }

    const project = projectResult.data;
    const packageItem =
      (lineItemsResult.data ?? []).find((item) => item.item_type === "package") ??
      null;
    const manualPayments = (manualPaymentsResult.data ?? []).filter((row) => {
      const metadata = getManualPaymentMetadata(row);

      return (
        readString(metadata.invoice_id) === invoice.id ||
        readString(metadata.invoice_code) === invoice.invoice_code
      );
    });
    const latestRefund = refundsResult.data?.[0];
    const metadata = toJsonObject(invoice.metadata);
    const rawInstructions = metadata.instructions;
    const manualPaymentInstructions = Array.isArray(rawInstructions)
      ? rawInstructions.filter(
          (item): item is string => typeof item === "string",
        )
      : [
          "Manual payment references are reviewed by ChinaPak ImportHub admin.",
          "No FMS sourcing starts until payment is verified and admin review is approved.",
        ];

    return {
      ok: true,
      data: {
        ...mapInvoiceListItem(invoice, project, null),
        addOns: (lineItemsResult.data ?? [])
          .filter((item) => item.item_type === "addon")
          .map((item) => ({
            description: item.description,
            total: formatMoney(item.total_pkr),
          })),
        customer: {
          businessType: importer.importerProfile.business_type ?? "Not provided",
          city: importer.importerProfile.city ?? "Not provided",
          name:
            importer.importerProfile.full_name ??
            importer.displayName ??
            "Importer",
          phoneWhatsapp:
            importer.importerProfile.phone_whatsapp ?? "Not provided",
        },
        discount: formatMoney(invoice.discount_pkr),
        documentId: invoice.document_id,
        issuedAt: formatDate(invoice.issued_at),
        lineItems: (lineItemsResult.data ?? []).map((item) => ({
          description: item.description,
          itemType: item.item_type,
          quantity: item.quantity,
          total: formatMoney(item.total_pkr),
          unitPrice: formatMoney(item.unit_price_pkr),
        })),
        manualPaymentInstructions,
        manualPayments: manualPayments.map((row) =>
          mapManualPayment(
            row,
            invoice.invoice_code,
            project?.project_code ?? "Project pending",
          ),
        ),
        packageName: packageItem?.description ?? "Package pending",
        paidAt: formatDate(invoice.paid_at),
        projectStatus: project?.project_status ?? "Project pending",
        refundSummary: latestRefund
          ? `${latestRefund.refund_code}: ${
              REFUND_STATUS_LABELS[latestRefund.refund_status]
            }`
          : "No refund request",
        subtotal: formatMoney(invoice.subtotal_pkr),
        tax: formatMoney(invoice.tax_pkr),
        total: formatMoney(invoice.total_pkr),
        transactionReference:
          invoice.transaction_reference ?? "No verified transaction yet",
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Invoice detail could not be loaded.",
    };
  }
}

export async function submitManualPaymentRecordAction(
  accessToken: string,
  input: ManualPaymentSubmissionInput,
): Promise<ActionResult<BillingInvoiceDetail>> {
  try {
    const importer = await getImporterContext(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const amountPaid = parseMoney(input.amountPaid);
    const referenceNumber = cleanText(input.referenceNumber);
    const paymentMethod = cleanText(input.paymentMethod);
    const payerName = cleanText(input.payerName);

    if (!amountPaid || !referenceNumber || !paymentMethod || !payerName) {
      return {
        ok: false,
        message:
          "Please provide amount, payment method, payer name, and transaction/reference number.",
      };
    }

    const { data: invoice, error: invoiceError } = await getInvoiceForImporter(
      importer.supabase,
      importer.authUserId,
      input.invoiceCode,
    );

    if (invoiceError || !invoice) {
      return {
        ok: false,
        message: invoiceError?.message ?? "Invoice was not found.",
      };
    }

    const paymentResult = await getOrCreatePaymentForInvoice(
      importer.supabase,
      invoice,
      importer.authUserId,
    );

    if (!paymentResult.ok) {
      return paymentResult;
    }

    const { error: insertError } = await importer.supabase
      .from("manual_payment_requests")
      .insert({
        city: importer.importerProfile.city,
        created_by: importer.authUserId,
        metadata: {
          amount_paid_pkr: amountPaid,
          invoice_code: invoice.invoice_code,
          invoice_id: invoice.id,
          manual_payment_status: "submitted",
          payer_name: payerName,
          payment_date: cleanText(input.paymentDate) || new Date().toISOString(),
          payment_id: paymentResult.data.id,
          payment_method: paymentMethod,
          phase: "phase_10_invoice_payment_refund_workflow",
          transaction_reference: referenceNumber,
        },
        phone_whatsapp: importer.importerProfile.phone_whatsapp,
        preferred_method: paymentMethod,
        problem_description: cleanText(input.notes) || null,
        project_id: invoice.project_id,
        requester_name:
          importer.importerProfile.full_name ?? importer.displayName,
        status: "submitted",
      });

    if (insertError) {
      return { ok: false, message: insertError.message };
    }

    await Promise.all([
      importer.supabase.from("payment_attempts").insert({
        attempt_status: "awaiting_payment",
        metadata: {
          amount_paid_pkr: amountPaid,
          invoice_id: invoice.id,
          submitted_by: importer.authUserId,
          transaction_reference: referenceNumber,
        },
        payment_id: paymentResult.data.id,
      }),
      importer.supabase.from("import_project_timeline_events").insert({
        body: "Importer submitted manual payment reference for admin verification.",
        created_by: importer.authUserId,
        event_type: "manual_payment_submitted",
        metadata: {
          invoice_code: invoice.invoice_code,
          payment_method: paymentMethod,
        },
        project_id: invoice.project_id,
        title: "Manual payment reference submitted",
        visible_to_agent: false,
        visible_to_fms: false,
        visible_to_importer: true,
      }),
    ]);

    await createNotifications(
      [
        {
          actionUrl: "/admin/payments",
          actorProfileId: importer.profileId,
          invoiceId: invoice.id,
          paymentId: paymentResult.data.id,
          priority: "high",
          projectId: invoice.project_id,
          recipientRole: USER_ROLES.admin,
          templateContext: {
            amount: formatMoney(amountPaid),
            invoiceCode: invoice.invoice_code,
          },
          type: "manual_payment_submitted",
        },
        {
          actionUrl: `/invoices/${invoice.invoice_code}`,
          actorProfileId: importer.profileId,
          invoiceId: invoice.id,
          paymentId: paymentResult.data.id,
          projectId: invoice.project_id,
          recipientProfileId: importer.profileId,
          templateContext: {
            amount: formatMoney(amountPaid),
            invoiceCode: invoice.invoice_code,
          },
          type: "importer_payment_proof_received",
        },
      ],
      importer.supabase,
    );

    return getImporterInvoiceAction(accessToken, invoice.invoice_code);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Manual payment reference could not be submitted.",
    };
  }
}

export async function listAdminManualPaymentsAction(
  accessToken: string,
): Promise<ActionResult<AdminManualPaymentItem[]>> {
  try {
    const admin = await getAdminContext(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const { data: rows, error } = await admin.supabase
      .from("manual_payment_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { ok: false, message: error.message };
    }

    const projectIds = unique((rows ?? []).map((row) => row.project_id));
    const invoiceIds = unique(
      (rows ?? []).map((row) => readString(toJsonObject(row.metadata).invoice_id)),
    );
    const [{ data: projects }, { data: invoices }] = await Promise.all([
      projectIds.length > 0
        ? admin.supabase
            .from("import_projects")
            .select("*")
            .in("id", projectIds)
        : Promise.resolve({ data: [] }),
      invoiceIds.length > 0
        ? admin.supabase.from("invoices").select("*").in("id", invoiceIds)
        : Promise.resolve({ data: [] }),
    ]);
    const importerIds = unique(
      (projects ?? []).map((project) => project.importer_profile_id),
    );
    const { data: importers } =
      importerIds.length > 0
        ? await admin.supabase
            .from("importer_profiles")
            .select("*")
            .in("id", importerIds)
        : { data: [] };
    const projectMap = byId(projects ?? []);
    const invoiceMap = byId(invoices ?? []);
    const importerMap = byId(importers ?? []);

    return {
      ok: true,
      data: (rows ?? []).map((row) => {
        const metadata = getManualPaymentMetadata(row);
        const invoice = invoiceMap.get(readString(metadata.invoice_id)) ?? null;
        const project = row.project_id ? projectMap.get(row.project_id) : null;
        const importer = project
          ? importerMap.get(project.importer_profile_id) ?? null
          : null;

        return {
          ...mapManualPayment(
            row,
            invoice?.invoice_code ?? readString(metadata.invoice_code, "Invoice pending"),
            project?.project_code ?? "Project pending",
          ),
          city: row.city ?? importer?.city ?? "Not provided",
          importerName:
            importer?.full_name ?? row.requester_name ?? "Importer pending",
          phoneWhatsapp:
            row.phone_whatsapp ?? importer?.phone_whatsapp ?? "Not provided",
          projectId: project?.id ?? row.project_id ?? "",
          totalDue: formatMoney(invoice?.total_pkr),
        };
      }),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Manual payment queue could not be loaded.",
    };
  }
}

export async function reviewManualPaymentAction(
  accessToken: string,
  requestId: string,
  input: AdminPaymentReviewInput,
): Promise<ActionResult<AdminManualPaymentItem[]>> {
  try {
    const admin = await getAdminContext(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const { data: request, error: requestError } = await admin.supabase
      .from("manual_payment_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    if (requestError || !request) {
      return {
        ok: false,
        message: requestError?.message ?? "Manual payment request was not found.",
      };
    }

    const metadata = getManualPaymentMetadata(request);
    const invoiceId = readString(metadata.invoice_id);
    const paymentId = readString(metadata.payment_id);
    const { data: invoice } = invoiceId
      ? await admin.supabase
          .from("invoices")
          .select("*")
          .eq("id", invoiceId)
          .maybeSingle()
      : { data: null };
    const { data: project } = request.project_id
      ? await admin.supabase
          .from("import_projects")
          .select("*")
          .eq("id", request.project_id)
          .maybeSingle()
      : { data: null };

    const statusByDecision: Record<AdminPaymentReviewInput["decision"], string> =
      {
        needs_more_info: "needs_more_info",
        reject: "rejected",
        under_review: "under_review",
        verify: "verified",
      };
    const now = new Date().toISOString();

    const { error: requestUpdateError } = await admin.supabase
      .from("manual_payment_requests")
      .update({
        metadata: mergeMetadata(request.metadata, {
          admin_note: cleanText(input.internalNote) || null,
          importer_message: cleanText(input.importerMessage) || null,
          reviewed_at: now,
          reviewed_by: admin.authUserId,
        }),
        status: statusByDecision[input.decision],
        updated_by: admin.authUserId,
      })
      .eq("id", request.id);

    if (requestUpdateError) {
      return { ok: false, message: requestUpdateError.message };
    }

    if (invoice && project && input.decision === "verify") {
      const nextProjectStatus = resolveProjectStatus(
        "paid",
        project.admin_review_status,
      );

      await Promise.all([
        admin.supabase
          .from("invoices")
          .update({
            paid_at: invoice.paid_at ?? now,
            payment_method: request.preferred_method,
            status: "paid",
            transaction_reference: readString(metadata.transaction_reference),
            updated_by: admin.authUserId,
          })
          .eq("id", invoice.id),
        paymentId
          ? admin.supabase
              .from("payments")
              .update({
                payment_status: "paid",
                provider_reference: readString(metadata.transaction_reference),
                verified_at: now,
                updated_by: admin.authUserId,
              })
              .eq("id", paymentId)
          : admin.supabase.from("payments").insert({
              amount_pkr: invoice.total_pkr,
              created_by: admin.authUserId,
              invoice_id: invoice.id,
              method: request.preferred_method,
              payment_status: "paid",
              project_id: project.id,
              provider: "manual_offline",
              provider_reference: readString(metadata.transaction_reference),
              verified_at: now,
            }),
        admin.supabase
          .from("import_projects")
          .update({
            paid_at: project.paid_at ?? now,
            payment_status: "paid",
            project_status: nextProjectStatus,
            ready_for_fms_at:
              nextProjectStatus === "ready_for_fms_assignment"
                ? project.ready_for_fms_at ?? now
                : project.ready_for_fms_at,
            updated_by: admin.authUserId,
          })
          .eq("id", project.id),
      ]);

      if (project.project_status !== nextProjectStatus) {
        await admin.supabase.from("import_project_status_history").insert({
          changed_by: admin.authUserId,
          from_status: project.project_status,
          metadata: {
            invoice_code: invoice.invoice_code,
            manual_payment_request_id: request.id,
          },
          project_id: project.id,
          reason: "Admin verified manual payment",
          to_status: nextProjectStatus,
        });
      }

      await admin.supabase.from("import_project_timeline_events").insert({
        body: "Manual payment was verified by admin. FMS work still requires admin review readiness if not already complete.",
        created_by: admin.authUserId,
        event_type: "manual_payment_verified",
        metadata: {
          invoice_code: invoice.invoice_code,
          manual_payment_request_id: request.id,
        },
        project_id: project.id,
        title: "Admin verified manual payment",
        visible_to_agent: false,
        visible_to_fms: false,
        visible_to_importer: true,
      });
    }

    if (invoice && project && input.decision === "reject") {
      await Promise.all([
        admin.supabase
          .from("invoices")
          .update({
            status: invoice.status === "paid" ? invoice.status : "awaiting_payment",
            updated_by: admin.authUserId,
          })
          .eq("id", invoice.id),
        paymentId
          ? admin.supabase
              .from("payments")
              .update({
                payment_status: "failed",
                updated_by: admin.authUserId,
              })
              .eq("id", paymentId)
          : Promise.resolve({ error: null }),
        admin.supabase.from("import_project_timeline_events").insert({
          body: cleanText(input.importerMessage)
            ? cleanText(input.importerMessage)
            : "Manual payment reference was not verified. Please submit a corrected payment reference.",
          created_by: admin.authUserId,
          event_type: "manual_payment_rejected",
          metadata: {
            invoice_code: invoice.invoice_code,
            manual_payment_request_id: request.id,
          },
          project_id: project.id,
          title: "Manual payment needs correction",
          visible_to_agent: false,
          visible_to_fms: false,
          visible_to_importer: true,
        }),
      ]);
    }

    if (invoice && project && input.decision !== "under_review") {
      const recipientProfileId = await getImporterProfileUserProfileId(
        admin.supabase,
        project.importer_profile_id,
      );
      const notificationType =
        input.decision === "verify"
          ? "importer_payment_verified"
          : "importer_payment_needs_correction";

      if (recipientProfileId) {
        await createNotification(
          {
            actionUrl: `/invoices/${invoice.invoice_code}`,
            actorProfileId: admin.profileId,
            invoiceId: invoice.id,
            message: cleanText(input.importerMessage) || undefined,
            paymentId: paymentId || null,
            projectId: project.id,
            recipientProfileId,
            templateContext: {
              invoiceCode: invoice.invoice_code,
              projectCode: project.project_code,
            },
            type: notificationType,
          },
          admin.supabase,
        );
      }
    }

    return listAdminManualPaymentsAction(accessToken);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Manual payment review failed.",
    };
  }
}

export async function listImporterRefundsAction(
  accessToken: string,
): Promise<ActionResult<RefundListItem[]>> {
  try {
    const importer = await getImporterContext(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const { data: projects } = await importer.supabase
      .from("import_projects")
      .select("*")
      .eq("importer_user_id", importer.authUserId);
    const projectIds = (projects ?? []).map((project) => project.id);

    if (projectIds.length === 0) {
      return { ok: true, data: [] };
    }

    const [{ data: refunds }, { data: invoices }] = await Promise.all([
      importer.supabase
        .from("refunds")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false }),
      importer.supabase.from("invoices").select("*").in("project_id", projectIds),
    ]);
    const invoiceMap = byId(invoices ?? []);
    const projectMap = byId(projects ?? []);

    return {
      ok: true,
      data: (refunds ?? []).map((refund) =>
        mapRefundItem(
          refund,
          invoiceMap.get(refund.invoice_id ?? "") ?? null,
          projectMap.get(refund.project_id) ?? null,
          0,
          "",
        ),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Refunds could not be loaded.",
    };
  }
}

function mapRefundItem(
  refund: TableRow<"refunds">,
  invoice: TableRow<"invoices"> | null,
  project: TableRow<"import_projects"> | null,
  activeAssignmentCount: number,
  latestDecision: string,
): RefundListItem & {
  activeAssignmentCount: number;
  latestDecision: string;
} {
  return {
    activeAssignmentCount,
    approvedAmount: formatMoney(refund.approved_amount_pkr),
    createdAt: formatDate(refund.created_at),
    fmsAssignedAtRequest: refund.fms_assigned_at_request,
    invoiceCode: invoice?.invoice_code ?? "Invoice pending",
    latestDecision,
    milestoneReviewRequired: refund.milestone_review_required,
    projectCode: project?.project_code ?? "Project pending",
    reason: refund.reason,
    reassignmentOffered: refund.reassignment_offered,
    refundCode: refund.refund_code,
    refundId: refund.id,
    requestedAmount: formatMoney(refund.requested_amount_pkr),
    status: REFUND_STATUS_LABELS[refund.refund_status] ?? refund.refund_status,
    statusRaw: refund.refund_status,
    warning: refund.fms_assigned_at_request
      ? "FMS work exists. Refund requires milestone/admin review."
      : "No FMS assignment at request time. Full refund policy may apply.",
  };
}

export async function submitRefundRequestAction(
  accessToken: string,
  input: RefundRequestInput,
): Promise<ActionResult<RefundListItem[]>> {
  try {
    const importer = await getImporterContext(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const reason = cleanText(input.reason);
    const explanation = cleanText(input.explanation);

    if (!reason || !explanation) {
      return {
        ok: false,
        message: "Please provide refund reason and explanation.",
      };
    }

    const { data: invoice, error: invoiceError } = await getInvoiceForImporter(
      importer.supabase,
      importer.authUserId,
      input.invoiceCode,
    );

    if (invoiceError || !invoice) {
      return {
        ok: false,
        message: invoiceError?.message ?? "Invoice was not found.",
      };
    }

    if (invoice.status !== "paid" && invoice.status !== "partially_refunded") {
      return {
        ok: false,
        message: "Refund requests are available after payment is verified.",
      };
    }

    const [{ data: project }, { data: existingOpenRefunds }, assignmentResult] =
      await Promise.all([
        importer.supabase
          .from("import_projects")
          .select("*")
          .eq("id", invoice.project_id)
          .maybeSingle(),
        importer.supabase
          .from("refunds")
          .select("*")
          .eq("invoice_id", invoice.id)
          .in("refund_status", OPEN_REFUND_STATUSES),
        importer.supabase
          .from("fms_assignments")
          .select("id, assignment_status")
          .eq("project_id", invoice.project_id)
          .not("assignment_status", "in", "(cancelled,reassigned)"),
      ]);

    if (!project) {
      return { ok: false, message: "Project was not found for this invoice." };
    }

    if ((existingOpenRefunds ?? []).length > 0) {
      return {
        ok: false,
        message: "This invoice already has an open refund request.",
      };
    }

    const requestedAmount = parseMoney(input.requestedAmount) ?? invoice.total_pkr;
    const activeAssignmentCount = assignmentResult.data?.length ?? 0;
    const fmsAssigned = activeAssignmentCount > 0;
    const refundCode = generateRefundCode();

    const { data: refund, error: insertError } = await importer.supabase
      .from("refunds")
      .insert({
        created_by: importer.authUserId,
        fms_assigned_at_request: fmsAssigned,
        invoice_id: invoice.id,
        metadata: {
          explanation,
          invoice_code: invoice.invoice_code,
          phase: "phase_10_invoice_payment_refund_workflow",
          preferred_follow_up: cleanText(input.preferredFollowUp) || null,
        },
        milestone_review_required: fmsAssigned,
        project_id: project.id,
        reason,
        refund_code: refundCode,
        refund_status: "requested",
        requested_amount_pkr: requestedAmount,
        requested_by: importer.authUserId,
      })
      .select("id, refund_code")
      .single();

    if (insertError || !refund) {
      return {
        ok: false,
        message: insertError?.message ?? "Refund request could not be saved.",
      };
    }

    await importer.supabase.from("import_project_timeline_events").insert({
      body: fmsAssigned
        ? "Importer requested refund after FMS assignment/work. Admin milestone review is required."
        : "Importer requested refund before FMS assignment/work. Full refund policy may apply.",
      created_by: importer.authUserId,
      event_type: "refund_requested",
      metadata: {
        invoice_code: invoice.invoice_code,
        refund_code: refundCode,
      },
      project_id: project.id,
      title: "Importer requested refund",
      visible_to_agent: false,
      visible_to_fms: false,
      visible_to_importer: true,
    });

    await createNotifications(
      [
        {
          actionUrl: "/refunds",
          actorProfileId: importer.profileId,
          invoiceId: invoice.id,
          projectId: project.id,
          recipientProfileId: importer.profileId,
          refundId: refund.id,
          templateContext: {
            invoiceCode: invoice.invoice_code,
            projectCode: project.project_code,
            refundCode: refund.refund_code,
          },
          type: "refund_requested",
        },
        {
          actionUrl: "/admin/refunds",
          actorProfileId: importer.profileId,
          invoiceId: invoice.id,
          priority: "high",
          projectId: project.id,
          recipientRole: USER_ROLES.admin,
          refundId: refund.id,
          templateContext: {
            invoiceCode: invoice.invoice_code,
            projectCode: project.project_code,
            refundCode: refund.refund_code,
          },
          type: "refund_requested",
        },
      ],
      importer.supabase,
    );

    return listImporterRefundsAction(accessToken);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Refund request could not be submitted.",
    };
  }
}

export async function listAdminRefundsAction(
  accessToken: string,
): Promise<ActionResult<AdminRefundItem[]>> {
  try {
    const admin = await getAdminContext(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const { data: refunds, error } = await admin.supabase
      .from("refunds")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { ok: false, message: error.message };
    }

    const projectIds = unique((refunds ?? []).map((refund) => refund.project_id));
    const invoiceIds = unique((refunds ?? []).map((refund) => refund.invoice_id));
    const refundIds = unique((refunds ?? []).map((refund) => refund.id));
    const [
      { data: projects },
      { data: invoices },
      { data: assignments },
      { data: decisions },
    ] = await Promise.all([
      projectIds.length > 0
        ? admin.supabase
            .from("import_projects")
            .select("*")
            .in("id", projectIds)
        : Promise.resolve({ data: [] }),
      invoiceIds.length > 0
        ? admin.supabase.from("invoices").select("*").in("id", invoiceIds)
        : Promise.resolve({ data: [] }),
      projectIds.length > 0
        ? admin.supabase
            .from("fms_assignments")
            .select("*")
            .in("project_id", projectIds)
        : Promise.resolve({ data: [] }),
      refundIds.length > 0
        ? admin.supabase
            .from("refund_decisions")
            .select("*")
            .in("refund_id", refundIds)
            .order("decided_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);
    const importerIds = unique(
      (projects ?? []).map((project) => project.importer_profile_id),
    );
    const { data: importers } =
      importerIds.length > 0
        ? await admin.supabase
            .from("importer_profiles")
            .select("*")
            .in("id", importerIds)
        : { data: [] };
    const projectMap = byId(projects ?? []);
    const invoiceMap = byId(invoices ?? []);
    const importerMap = byId(importers ?? []);
    const assignmentCounts = new Map<string, number>();
    for (const assignment of assignments ?? []) {
      if (
        assignment.assignment_status !== "cancelled" &&
        assignment.assignment_status !== "reassigned"
      ) {
        assignmentCounts.set(
          assignment.project_id,
          (assignmentCounts.get(assignment.project_id) ?? 0) + 1,
        );
      }
    }
    const latestDecisionMap = new Map<string, string>();
    for (const decision of decisions ?? []) {
      if (!latestDecisionMap.has(decision.refund_id)) {
        latestDecisionMap.set(
          decision.refund_id,
          decision.customer_visible_summary ?? decision.decision,
        );
      }
    }

    return {
      ok: true,
      data: (refunds ?? []).map((refund) => {
        const project = projectMap.get(refund.project_id) ?? null;
        const importer = project
          ? importerMap.get(project.importer_profile_id) ?? null
          : null;
        const base = mapRefundItem(
          refund,
          invoiceMap.get(refund.invoice_id ?? "") ?? null,
          project,
          assignmentCounts.get(refund.project_id) ?? 0,
          latestDecisionMap.get(refund.id) ?? "",
        );

        return {
          ...base,
          importerName: importer?.full_name ?? "Importer pending",
        };
      }),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Refund queue could not be loaded.",
    };
  }
}

export async function reviewRefundAction(
  accessToken: string,
  refundId: string,
  input: AdminRefundReviewInput,
): Promise<ActionResult<AdminRefundItem[]>> {
  try {
    const admin = await getAdminContext(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const { data: refund, error: refundError } = await admin.supabase
      .from("refunds")
      .select("*")
      .eq("id", refundId)
      .maybeSingle();

    if (refundError || !refund) {
      return {
        ok: false,
        message: refundError?.message ?? "Refund request was not found.",
      };
    }

    const [{ data: invoice }, { data: project }] = await Promise.all([
      refund.invoice_id
        ? admin.supabase
            .from("invoices")
            .select("*")
            .eq("id", refund.invoice_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      admin.supabase
        .from("import_projects")
        .select("*")
        .eq("id", refund.project_id)
        .maybeSingle(),
    ]);

    const approvedAmount =
      input.decision === "approve_full"
        ? invoice?.total_pkr ?? refund.requested_amount_pkr
        : parseMoney(input.approvedAmount) ?? refund.approved_amount_pkr;
    const statusByDecision: Record<
      AdminRefundReviewInput["decision"],
      RefundStatus
    > = {
      approve_full: "approved",
      approve_partial: "partially_approved",
      cancel: "cancelled",
      mark_processed: "processed",
      offer_reassignment: "reassignment_offered",
      reject: "rejected",
      start_review: "under_admin_review",
    };
    const nextStatus = statusByDecision[input.decision];
    const now = new Date().toISOString();
    const updatePayload: Database["public"]["Tables"]["refunds"]["Update"] = {
      metadata: mergeMetadata(refund.metadata, {
        last_admin_note: cleanText(input.internalNote) || null,
        last_customer_visible_summary:
          cleanText(input.customerVisibleSummary) || null,
        reviewed_at: now,
        reviewed_by: admin.authUserId,
      }),
      reassignment_offered:
        input.decision === "offer_reassignment" || refund.reassignment_offered,
      refund_status: nextStatus,
      updated_by: admin.authUserId,
    };

    if (approvedAmount !== null) {
      updatePayload.approved_amount_pkr = approvedAmount;
    }

    const { error: updateError } = await admin.supabase
      .from("refunds")
      .update(updatePayload)
      .eq("id", refund.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    await admin.supabase.from("refund_decisions").insert({
      created_by: admin.authUserId,
      customer_visible_summary: cleanText(input.customerVisibleSummary) || null,
      decision: input.decision,
      decision_by_admin_profile_id: admin.adminProfileId,
      metadata: {
        approved_amount_pkr: approvedAmount,
        phase: "phase_10_invoice_payment_refund_workflow",
      },
      milestone_review_summary: cleanText(input.internalNote) || null,
      reassignment_offered: input.decision === "offer_reassignment",
      refund_id: refund.id,
    });

    if (project && invoice && input.decision === "mark_processed") {
      const finalAmount =
        approvedAmount ??
        refund.approved_amount_pkr ??
        refund.requested_amount_pkr ??
        0;
      const isFullRefund = finalAmount >= invoice.total_pkr;
      const invoiceStatus: InvoiceStatus = isFullRefund
        ? "refunded"
        : "partially_refunded";
      const paymentStatus: PaymentStatus = isFullRefund
        ? "refunded"
        : "partially_refunded";
      const nextProjectStatus = resolveProjectStatus(
        paymentStatus,
        project.admin_review_status,
      );

      await Promise.all([
        admin.supabase
          .from("invoices")
          .update({
            status: invoiceStatus,
            updated_by: admin.authUserId,
          })
          .eq("id", invoice.id),
        admin.supabase
          .from("payments")
          .update({
            payment_status: paymentStatus,
            updated_by: admin.authUserId,
          })
          .eq("invoice_id", invoice.id),
        admin.supabase
          .from("import_projects")
          .update({
            payment_status: paymentStatus,
            project_status: nextProjectStatus,
            updated_by: admin.authUserId,
          })
          .eq("id", project.id),
      ]);

      if (project.project_status !== nextProjectStatus) {
        await admin.supabase.from("import_project_status_history").insert({
          changed_by: admin.authUserId,
          from_status: project.project_status,
          metadata: {
            invoice_code: invoice.invoice_code,
            refund_code: refund.refund_code,
          },
          project_id: project.id,
          reason: "Admin marked manual refund processed",
          to_status: nextProjectStatus,
        });
      }
    }

    if (project) {
      await admin.supabase.from("import_project_timeline_events").insert({
        body:
          cleanText(input.customerVisibleSummary) ||
          "Admin updated the refund request status.",
        created_by: admin.authUserId,
        event_type: "refund_review_updated",
        metadata: {
          decision: input.decision,
          refund_code: refund.refund_code,
          refund_status: nextStatus,
        },
        project_id: project.id,
        title:
          input.decision === "mark_processed"
            ? "Admin marked refund processed"
            : "Admin updated refund review",
        visible_to_agent: false,
        visible_to_fms: false,
        visible_to_importer: true,
      });
    }

    if (project && invoice) {
      const recipientProfileId = await getImporterProfileUserProfileId(
        admin.supabase,
        project.importer_profile_id,
      );
      const notificationType =
        input.decision === "mark_processed"
          ? "refund_processed"
          : input.decision === "reject"
            ? "refund_rejected"
            : input.decision === "approve_full" ||
                input.decision === "approve_partial"
              ? "refund_approved"
              : null;

      if (recipientProfileId && notificationType) {
        await createNotification(
          {
            actionUrl: "/refunds",
            actorProfileId: admin.profileId,
            invoiceId: invoice.id,
            message: cleanText(input.customerVisibleSummary) || undefined,
            projectId: project.id,
            recipientProfileId,
            refundId: refund.id,
            templateContext: {
              decision: REFUND_STATUS_LABELS[nextStatus] ?? nextStatus,
              invoiceCode: invoice.invoice_code,
              projectCode: project.project_code,
              refundCode: refund.refund_code,
            },
            type: notificationType,
          },
          admin.supabase,
        );
      }
    }

    return listAdminRefundsAction(accessToken);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Refund review action failed.",
    };
  }
}
