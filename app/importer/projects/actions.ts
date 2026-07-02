"use server";

import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import {
  getImporterProjectStatusSummary,
  type ImporterProjectStatusSummary,
} from "@/lib/projects/importer-project-status";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
type JsonObject = { [key: string]: Json | undefined };
type AdminReviewStatus = Database["public"]["Enums"]["admin_review_status"];
type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];
type RefundStatus = Database["public"]["Enums"]["refund_status"];

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

export type ImporterProjectListItem = {
  adminReviewStatus: string;
  adminReviewStatusRaw: AdminReviewStatus;
  createdAt: string;
  packageName: string;
  paymentStatus: string;
  paymentStatusRaw: PaymentStatus;
  productCategory: string;
  productTitle: string;
  projectCode: string;
  projectStatus: string;
  projectStatusRaw: ProjectStatus;
  reportStatus: string;
  statusSummary: ImporterProjectStatusSummary;
  updatedAt: string;
};

export type ImporterProjectTimelineItem = {
  body: string;
  createdAt: string;
  eventType: string;
  id: string;
  title: string;
};

export type ImporterProjectInvoiceItem = {
  amount: string;
  dueAt: string;
  invoiceCode: string;
  status: string;
  statusRaw: InvoiceStatus;
};

export type ImporterProjectManualPaymentItem = {
  amountPaid: string;
  createdAt: string;
  id: string;
  method: string;
  paymentDate: string;
  reference: string;
  status: string;
};

export type ImporterProjectRefundItem = {
  approvedAmount: string;
  createdAt: string;
  customerVisibleSummary: string;
  refundCode: string;
  requestedAmount: string;
  status: string;
  statusRaw: RefundStatus;
};

export type ImporterProjectDetail = ImporterProjectListItem & {
  addOns: Array<{
    name: string;
    price: string;
  }>;
  filesNotice: string;
  invoices: ImporterProjectInvoiceItem[];
  manualPayments: ImporterProjectManualPaymentItem[];
  paymentPanelNotice: string;
  refundItems: ImporterProjectRefundItem[];
  report: {
    canView: boolean;
    documentHref: string;
    optionCount: number;
    releasedAt: string;
    status: string;
    viewHref: string;
  };
  requirements: {
    budgetRange: string;
    importExperience: string;
    inputMethods: string;
    productDescription: string;
    productLinks: string;
    quantity: string;
    qualityLevel: string;
    specialNotes: string;
  };
  timeline: ImporterProjectTimelineItem[];
};

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  admin_quality_review: "Factory Options Under Admin Review",
  admin_review: "Admin Review",
  awaiting_payment: "Awaiting Payment",
  cancelled: "Cancelled",
  completed: "Completed",
  disputed: "Disputed",
  draft: "Draft",
  factory_options_submitted: "Factory Options Submitted",
  fms_assigned: "FMS Assigned",
  fms_working: "Factory Research In Progress",
  importer_feedback_requested: "Importer Feedback Requested",
  needs_importer_clarification: "Needs Information",
  partially_refunded: "Partially Refunded",
  payment_received: "Payment Received",
  ready_for_fms_assignment: "Ready for FMS Assignment",
  refunded: "Refunded",
  results_released_to_importer: "Factory Report Ready",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  awaiting_payment: "Awaiting Payment",
  failed: "Payment Issue",
  paid: "Payment Verified",
  partially_refunded: "Partially Refunded",
  refunded: "Refunded",
};

const ADMIN_REVIEW_STATUS_LABELS: Record<AdminReviewStatus, string> = {
  in_review: "In Review",
  needs_information: "Needs Information",
  not_started: "Not Started",
  ready_for_fms_assignment: "Approved for FMS Assignment",
  rejected: "Rejected",
};

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

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(value: Json | null | undefined, fallback = 0) {
  return typeof value === "number" ? value : fallback;
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

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function groupByProject<T extends { project_id: string | null }>(rows: T[]) {
  const grouped = new Map<string, T[]>();

  rows.forEach((row) => {
    if (!row.project_id) {
      return;
    }

    grouped.set(row.project_id, [...(grouped.get(row.project_id) ?? []), row]);
  });

  return grouped;
}

async function requireImporter(accessToken: string) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, [USER_ROLES.importer])) {
    return {
      ok: false as const,
      message: "Only importer accounts can view Import Project tracking.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
    supabase: createAdminSupabaseClient(),
  };
}

function getRequirementCategory(
  requirement: TableRow<"import_project_requirements"> | null | undefined,
) {
  const metadata = toJsonObject(requirement?.metadata);

  return (
    readString(metadata.category_label) ||
    readString(metadata.product_category) ||
    "General sourcing"
  );
}

function parseReleasedReport(project: TableRow<"import_projects">) {
  const metadata = toJsonObject(project.metadata);
  const report = toJsonObject(metadata.phase_7_factory_report);
  const status = readString(report.status);

  if (status !== "released_to_importer" && status !== "updated") {
    return null;
  }

  const options = Array.isArray(report.options) ? report.options : [];

  return {
    optionCount: options.length,
    releasedAt: readString(report.releasedAt, project.updated_at),
    status,
  };
}

function getLatestByCreatedAt<T extends { created_at: string }>(rows: T[]) {
  return [...rows].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
}

function getRefundDecisionSummary(
  refund: TableRow<"refunds">,
  decisions: TableRow<"refund_decisions">[],
) {
  const latest = getLatestByCreatedAt(decisions);

  return (
    latest?.customer_visible_summary ??
    readString(toJsonObject(refund.metadata).customer_visible_summary) ??
    "Admin decision summary will appear when available."
  );
}

function getLatestManualPaymentStatus(
  manualPayments: TableRow<"manual_payment_requests">[],
) {
  return getLatestByCreatedAt(manualPayments)?.status ?? null;
}

function mapListItem(
  project: TableRow<"import_projects">,
  requirement: TableRow<"import_project_requirements"> | null | undefined,
  packageRow: TableRow<"packages"> | null | undefined,
  manualPayments: TableRow<"manual_payment_requests">[],
  refunds: TableRow<"refunds">[],
  hasActiveAssignment: boolean,
): ImporterProjectListItem {
  const releasedReport = parseReleasedReport(project);
  const latestRefund = getLatestByCreatedAt(refunds);
  const statusSummary = getImporterProjectStatusSummary({
    adminReviewStatus: project.admin_review_status,
    hasActiveAssignment,
    hasReleasedReport: Boolean(releasedReport),
    latestManualPaymentStatus: getLatestManualPaymentStatus(manualPayments),
    latestRefundStatus: latestRefund?.refund_status ?? null,
    paymentStatus: project.payment_status,
    projectStatus: project.project_status,
  });

  return {
    adminReviewStatus: ADMIN_REVIEW_STATUS_LABELS[project.admin_review_status],
    adminReviewStatusRaw: project.admin_review_status,
    createdAt: formatDate(project.created_at),
    packageName: packageRow?.name ?? "Package pending",
    paymentStatus: PAYMENT_STATUS_LABELS[project.payment_status],
    paymentStatusRaw: project.payment_status,
    productCategory: getRequirementCategory(requirement),
    productTitle:
      requirement?.product_name ??
      requirement?.product_description?.slice(0, 80) ??
      "Product details pending",
    projectCode: project.project_code,
    projectStatus: PROJECT_STATUS_LABELS[project.project_status],
    projectStatusRaw: project.project_status,
    reportStatus: releasedReport ? "Released" : "Not released yet",
    statusSummary,
    updatedAt: formatDate(project.updated_at),
  };
}

export async function listImporterProjectsAction(
  accessToken: string,
): Promise<ActionResult<ImporterProjectListItem[]>> {
  try {
    const importer = await requireImporter(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const { data: projects, error: projectsError } = await importer.supabase
      .from("import_projects")
      .select("*")
      .eq("importer_user_id", importer.authUserId)
      .order("updated_at", { ascending: false });

    if (projectsError) {
      return { ok: false, message: projectsError.message };
    }

    const projectRows = projects ?? [];

    if (projectRows.length === 0) {
      return { ok: true, data: [] };
    }

    const projectIds = projectRows.map((project) => project.id);
    const packageIds = [
      ...new Set(
        projectRows
          .map((project) => project.package_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const [
      requirementsResult,
      packagesResult,
      manualPaymentsResult,
      refundsResult,
      assignmentsResult,
    ] = await Promise.all([
      importer.supabase
        .from("import_project_requirements")
        .select("*")
        .in("project_id", projectIds),
      packageIds.length > 0
        ? importer.supabase.from("packages").select("*").in("id", packageIds)
        : Promise.resolve({ data: [], error: null }),
      importer.supabase
        .from("manual_payment_requests")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false }),
      importer.supabase
        .from("refunds")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false }),
      importer.supabase
        .from("fms_assignments")
        .select("id, project_id, assignment_status")
        .in("project_id", projectIds),
    ]);

    if (requirementsResult.error || packagesResult.error) {
      return {
        ok: false,
        message:
          requirementsResult.error?.message ??
          packagesResult.error?.message ??
          "Project tracking data could not be loaded.",
      };
    }

    const requirementMap = new Map(
      (requirementsResult.data ?? []).map((row) => [row.project_id, row]),
    );
    const packageMap = byId(packagesResult.data ?? []);
    const manualPaymentMap = groupByProject(manualPaymentsResult.data ?? []);
    const refundMap = groupByProject(refundsResult.data ?? []);
    const assignmentProjectIds = new Set(
      (assignmentsResult.data ?? [])
        .filter(
          (assignment) =>
            assignment.assignment_status !== "cancelled" &&
            assignment.assignment_status !== "completed_by_admin",
        )
        .map((assignment) => assignment.project_id),
    );

    return {
      ok: true,
      data: projectRows.map((project) =>
        mapListItem(
          project,
          requirementMap.get(project.id),
          project.package_id ? packageMap.get(project.package_id) : null,
          manualPaymentMap.get(project.id) ?? [],
          refundMap.get(project.id) ?? [],
          assignmentProjectIds.has(project.id),
        ),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Importer projects could not be loaded.",
    };
  }
}

export async function getImporterProjectDetailAction(
  accessToken: string,
  projectCode: string,
): Promise<ActionResult<ImporterProjectDetail>> {
  try {
    const importer = await requireImporter(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const decodedProjectCode = decodeURIComponent(projectCode);
    const { data: project, error: projectError } = await importer.supabase
      .from("import_projects")
      .select("*")
      .eq("project_code", decodedProjectCode)
      .eq("importer_user_id", importer.authUserId)
      .maybeSingle();

    if (projectError) {
      return { ok: false, message: projectError.message };
    }

    if (!project) {
      return {
        ok: false,
        message: "This Import Project was not found for your account.",
      };
    }

    const [
      requirementResult,
      packageResult,
      selectedAddonsResult,
      timelineResult,
      invoicesResult,
      manualPaymentsResult,
      refundsResult,
      assignmentsResult,
    ] = await Promise.all([
      importer.supabase
        .from("import_project_requirements")
        .select("*")
        .eq("project_id", project.id)
        .maybeSingle(),
      project.package_id
        ? importer.supabase
            .from("packages")
            .select("*")
            .eq("id", project.package_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      importer.supabase
        .from("import_project_addons")
        .select("*")
        .eq("project_id", project.id),
      importer.supabase
        .from("import_project_timeline_events")
        .select("*")
        .eq("project_id", project.id)
        .eq("visible_to_importer", true)
        .order("created_at", { ascending: true }),
      importer.supabase
        .from("invoices")
        .select("*")
        .eq("project_id", project.id)
        .eq("customer_user_id", importer.authUserId)
        .order("created_at", { ascending: false }),
      importer.supabase
        .from("manual_payment_requests")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false }),
      importer.supabase
        .from("refunds")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false }),
      importer.supabase
        .from("fms_assignments")
        .select("id, project_id, assignment_status")
        .eq("project_id", project.id),
    ]);

    if (requirementResult.error || packageResult.error) {
      return {
        ok: false,
        message:
          requirementResult.error?.message ??
          packageResult.error?.message ??
          "Project detail could not be loaded.",
      };
    }

    const requirement = requirementResult.data;
    const packageRow = packageResult.data;
    const selectedAddons = selectedAddonsResult.data ?? [];
    const addonIds = selectedAddons.map((selected) => selected.addon_id);
    const { data: addonRows } =
      addonIds.length > 0
        ? await importer.supabase.from("addons").select("*").in("id", addonIds)
        : { data: [] };
    const addonMap = byId(addonRows ?? []);
    const manualPayments = manualPaymentsResult.data ?? [];
    const refunds = refundsResult.data ?? [];
    const activeAssignments = (assignmentsResult.data ?? []).filter(
      (assignment) =>
        assignment.assignment_status !== "cancelled" &&
        assignment.assignment_status !== "completed_by_admin",
    );
    const listItem = mapListItem(
      project,
      requirement,
      packageRow,
      manualPayments,
      refunds,
      activeAssignments.length > 0,
    );
    const releasedReport = parseReleasedReport(project);
    const refundIds = refunds.map((refund) => refund.id);
    const { data: refundDecisionRows } =
      refundIds.length > 0
        ? await importer.supabase
            .from("refund_decisions")
            .select("*")
            .in("refund_id", refundIds)
            .order("created_at", { ascending: false })
        : { data: [] };
    const decisionsByRefund = new Map<
      string,
      TableRow<"refund_decisions">[]
    >();

    (refundDecisionRows ?? []).forEach((decision) => {
      decisionsByRefund.set(decision.refund_id, [
        ...(decisionsByRefund.get(decision.refund_id) ?? []),
        decision,
      ]);
    });

    return {
      ok: true,
      data: {
        ...listItem,
        addOns: selectedAddons.map((selected) => {
          const addon = addonMap.get(selected.addon_id);

          return {
            name: addon?.name ?? "Selected add-on",
            price:
              selected.price_snapshot_pkr !== null
                ? formatMoney(selected.price_snapshot_pkr)
                : "Pricing review required",
          };
        }),
        filesNotice:
          "This panel shows your own uploaded files and admin-released files only. Raw FMS evidence and private factory files remain hidden.",
        invoices: (invoicesResult.data ?? []).map((invoice) => ({
          amount: formatMoney(invoice.total_pkr),
          dueAt: formatDate(invoice.due_at),
          invoiceCode: invoice.invoice_code,
          status: INVOICE_STATUS_LABELS[invoice.status],
          statusRaw: invoice.status,
        })),
        manualPayments: manualPayments.map((row) => {
          const metadata = toJsonObject(row.metadata);

          return {
            amountPaid: formatMoney(readNumber(metadata.amount_paid_pkr)),
            createdAt: formatDate(row.created_at),
            id: row.id,
            method:
              row.preferred_method ??
              readString(metadata.payment_method, "Manual"),
            paymentDate: readString(metadata.payment_date, "Not set"),
            reference: readString(
              metadata.transaction_reference,
              "Not provided",
            ),
            status: row.status,
          };
        }),
        paymentPanelNotice:
          "Manual payment records are reviewed by admin. FMS work starts only after payment verification and admin approval.",
        refundItems: refunds.map((refund) => ({
          approvedAmount: formatMoney(refund.approved_amount_pkr),
          createdAt: formatDate(refund.created_at),
          customerVisibleSummary: getRefundDecisionSummary(
            refund,
            decisionsByRefund.get(refund.id) ?? [],
          ),
          refundCode: refund.refund_code,
          requestedAmount: formatMoney(refund.requested_amount_pkr),
          status: REFUND_STATUS_LABELS[refund.refund_status],
          statusRaw: refund.refund_status,
        })),
        report: releasedReport
          ? {
              canView: true,
              documentHref: `/importer/reports/${encodeURIComponent(
                project.project_code,
              )}/document`,
              optionCount: releasedReport.optionCount,
              releasedAt: formatDate(releasedReport.releasedAt),
              status:
                releasedReport.status === "updated"
                  ? "Released report updated"
                  : "Released to importer",
              viewHref: `/importer/reports/${encodeURIComponent(
                project.project_code,
              )}`,
            }
          : {
              canView: false,
              documentHref: "",
              optionCount: 0,
              releasedAt: "Not released yet",
              status: "Your factory report will appear here after admin review.",
              viewHref: "",
            },
        requirements: {
          budgetRange: requirement?.budget_range ?? "Not provided",
          importExperience: requirement?.import_experience ?? "Not provided",
          inputMethods:
            requirement?.input_methods.join(", ") || "Input method pending",
          productDescription:
            requirement?.product_description ?? "Product details pending",
          productLinks:
            requirement?.product_links.join(", ") || "No product link provided",
          quantity: requirement?.quantity ?? "Not provided",
          qualityLevel: requirement?.quality_level ?? "Not provided",
          specialNotes: requirement?.special_notes ?? "No special notes",
        },
        timeline:
          (timelineResult.data ?? []).length > 0
            ? (timelineResult.data ?? []).map((event) => ({
                body: event.body ?? "",
                createdAt: formatDate(event.created_at),
                eventType: event.event_type,
                id: event.id,
                title: event.title,
              }))
            : [
                {
                  body:
                    "Your Import Project was created and is now tracked by ChinaPak ImportHub.",
                  createdAt: formatDate(project.created_at),
                  eventType: "project_created",
                  id: project.id,
                  title: "Project submitted",
                },
              ],
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Importer project detail could not be loaded.",
    };
  }
}
