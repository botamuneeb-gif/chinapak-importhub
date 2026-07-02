"use server";

import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { ensureInvoiceForProject } from "@/lib/billing/invoice-helpers";
import { createNotification } from "@/lib/notifications/create-notification";
import { detectContactRiskInFields } from "@/lib/security/contact-firewall";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type ProjectStatus = Database["public"]["Enums"]["project_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type AdminReviewStatus = Database["public"]["Enums"]["admin_review_status"];
type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];
type JsonObject = { [key: string]: Json | undefined };

type ReadinessStatus =
  | "waiting_payment"
  | "payment_issue"
  | "waiting_admin_review"
  | "needs_information"
  | "rejected"
  | "ready_for_fms_assignment";

type FactoryReportStatus =
  | "draft"
  | "released_to_importer"
  | "updated"
  | "withdrawn";

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

export type AdminLiveProjectListItem = {
  adminReviewStatusRaw: AdminReviewStatus;
  id: string;
  projectCode: string;
  importerName: string;
  city: string;
  product: string;
  packageName: string;
  packagePrice: string;
  paymentStatusRaw: PaymentStatus;
  paymentStatus: string;
  projectStatusRaw: ProjectStatus;
  projectStatus: string;
  adminReviewStatus: string;
  budgetRange: string;
  createdDate: string;
  readinessDescription: string;
  readinessLabel: string;
  readinessStatus: ReadinessStatus;
};

export type AdminLiveLeadListItem = {
  id: string;
  leadCode: string;
  importerName: string;
  city: string;
  contactForAdminOnly: string;
  product: string;
  packageSelected: string;
  paymentIssue: string;
  leadStatus: string;
  createdDate: string;
};

export type AdminLiveProjectDetail = {
  addOns: Array<{
    name: string;
    price: string;
  }>;
  assignment: {
    disabledReason: string;
    fmsTierSuggestion: string;
  };
  checklist: Array<{
    checked: boolean;
    label: string;
  }>;
  importer: {
    businessType: string;
    city: string;
    contactForAdminOnly: string;
    name: string;
    pastProjectCount: string;
    verificationStatus: string;
  };
  fmsAssignment: {
    availableFms: AdminAssignableFms[];
    canAssign: boolean;
    currentAssignment: {
      assignedAt: string;
      assignmentCode: string;
      deadline: string;
      fmsCode: string;
      fmsName: string;
      status: string;
    } | null;
    gateMessage: string;
  };
  factoryReport: {
    availableSubmissions: AdminApprovedFactorySubmission[];
    canRelease: boolean;
    currentReport: AdminImporterFactoryReport | null;
    packageLimitGuidance: string;
    releaseGateMessage: string;
    reportStatus: string;
    reportStatusRaw: FactoryReportStatus | "not_started";
  };
  package: {
    delivery: string;
    name: string;
    price: string;
  };
  project: AdminLiveProjectListItem;
  requirements: {
    budget: string;
    importExperience: string;
    inputMethod: string;
    productDetails: string;
    productLinks: string;
    quantity: string;
    qualityLevel: string;
    specialNotes: string;
  };
  timeline: Array<{
    id?: string;
    eventId?: string;
    createdAt?: string;
    date: string;
    label: string;
    state: "done" | "current" | "pending";
  }>;
  totalServiceFee: string;
};

export type AdminProjectGateInput = {
  note?: string;
  reference?: string;
};

export type AdminAssignableFms = {
  cityProvince: string;
  fmsCode: string;
  fmsProfileId: string;
  label: string;
  qualityScore: string;
  specialties: string;
  tier: string;
};

export type CreateFmsAssignmentInput = {
  deadline?: string;
  fmsProfileId: string;
  internalNotes?: string;
  priority?: string;
};

export type AdminApprovedFactorySubmission = {
  cityProvince: string;
  currency: string;
  customizationAvailability: string;
  estimatedUnitPrice: string;
  factoryLabel: string;
  mainProducts: string;
  moq: string;
  productCategory: string;
  productMatchSummary: string;
  productionLeadTime: string;
  qualityReliabilitySummary: string;
  riskSummary: string;
  sampleAvailability: string;
  submissionCode: string;
  submittedAt: string;
  packagingNotes: string;
};

export type AdminFactoryReportOption = AdminApprovedFactorySubmission & {
  recommended: boolean;
  visibleFields: string[];
};

export type AdminImporterFactoryReport = {
  adminRecommendation: string;
  comparisonNotes: string;
  contactFirewallCheckedAt: string;
  importerSafeSummary: string;
  internalReleaseNotes: string;
  options: AdminFactoryReportOption[];
  releasedAt: string | null;
  status: FactoryReportStatus;
  statusLabel: string;
  updatedAt: string | null;
  version: number;
  withdrawnAt: string | null;
};

export type SaveFactoryReportInput = {
  adminRecommendation?: string;
  comparisonNotes?: string;
  importerSafeSummary?: string;
  intent: "save_draft" | "release" | "withdraw";
  internalReleaseNotes?: string;
  recommendedSubmissionCode?: string;
  selectedSubmissionCodes?: string[];
  visibleFields?: string[];
};

const PROJECT_STATUS_LABELS: Record<
  Database["public"]["Enums"]["project_status"],
  string
> = {
  admin_quality_review: "Admin Quality Review",
  admin_review: "Admin Review",
  awaiting_payment: "Awaiting Payment",
  cancelled: "Cancelled",
  completed: "Completed",
  disputed: "Disputed",
  draft: "Draft",
  factory_options_submitted: "Factory Options Submitted",
  fms_assigned: "FMS Assigned",
  fms_working: "FMS Working",
  importer_feedback_requested: "Importer Feedback Requested",
  needs_importer_clarification: "Needs Importer Clarification",
  partially_refunded: "Partially Refunded",
  payment_received: "Payment Received",
  ready_for_fms_assignment: "Ready for FMS Assignment",
  refunded: "Refunded",
  results_released_to_importer: "Results Released to Importer",
};

const PAYMENT_STATUS_LABELS: Record<
  Database["public"]["Enums"]["payment_status"],
  string
> = {
  awaiting_payment: "Awaiting Payment",
  failed: "Payment Failed / Issue",
  paid: "Payment Verified",
  partially_refunded: "Partially Refunded",
  refunded: "Refunded",
};

const ADMIN_REVIEW_STATUS_LABELS: Record<
  Database["public"]["Enums"]["admin_review_status"],
  string
> = {
  in_review: "In Review",
  needs_information: "Needs Information",
  not_started: "Not Started",
  ready_for_fms_assignment: "Approved for Sourcing",
  rejected: "Rejected",
};

const LEAD_STATUS_LABELS: Record<
  Database["public"]["Enums"]["lead_status"],
  string
> = {
  awaiting_customer: "Awaiting Customer",
  closed: "Closed",
  contact_attempted: "Contact Attempted",
  interested: "Interested",
  new_lead: "New Lead",
  not_interested: "Not Interested",
  payment_completed: "Payment Completed",
  payment_help_needed: "Payment Help Needed",
  payment_link_sent: "Payment Link Sent",
};

const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  approved_by_admin: "Approved by Admin",
  assigned: "Assigned",
  cancelled: "Cancelled",
  changes_requested: "Changes Requested",
  completed_by_admin: "Completed by Admin",
  factory_options_drafted: "Factory Options Drafted",
  factory_researching: "Factory Researching",
  reassigned: "Reassigned",
  requirements_reviewed: "Requirements Reviewed",
  submitted_for_admin_review: "Submitted for Admin Review",
};

const FACTORY_REPORT_STATUS_LABELS: Record<FactoryReportStatus, string> = {
  draft: "Draft",
  released_to_importer: "Released to Importer",
  updated: "Updated and Released",
  withdrawn: "Withdrawn",
};

const FACTORY_REPORT_SAFE_FIELDS = [
  "cityProvince",
  "productCategory",
  "mainProducts",
  "productMatchSummary",
  "estimatedUnitPrice",
  "moq",
  "sampleAvailability",
  "productionLeadTime",
  "packagingNotes",
  "customizationAvailability",
  "qualityReliabilitySummary",
  "riskSummary",
] as const;

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

function formatPrice(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "Not priced";
  }

  return `PKR ${value.toLocaleString("en-PK")}`;
}

function formatDelivery(
  packageRow: Pick<
    TableRow<"packages">,
    "delivery_days_max" | "delivery_days_min"
  > | null,
) {
  if (!packageRow?.delivery_days_min || !packageRow.delivery_days_max) {
    return "Delivery timeframe pending";
  }

  return `${packageRow.delivery_days_min}-${packageRow.delivery_days_max} business days`;
}

function fmsTierForPackage(packageCode: string | null | undefined) {
  if (packageCode === "factory-discovery") {
    return "Bronze for Factory Discovery";
  }

  if (packageCode === "factory-match-plus") {
    return "Silver for Factory Match Plus";
  }

  if (packageCode === "import-partner") {
    return "Gold for Import Partner";
  }

  return "FMS tier pending package review";
}

function formatTier(tier: Database["public"]["Enums"]["fms_tier"]) {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function formatDeadline(value: string | null | undefined) {
  if (!value) {
    return "No deadline set";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

function generateAssignmentCode() {
  const year = new Date().getFullYear();
  const timestampPart = Date.now().toString().slice(-5);
  const randomPart = Math.floor(10 + Math.random() * 90);

  return `FMSA-${year}-${timestampPart}${randomPart}`;
}

function isActiveAssignmentStatus(status: AssignmentStatus) {
  return status !== "cancelled" && status !== "reassigned";
}

function getAssignmentGateMessage(project: TableRow<"import_projects">) {
  if (project.payment_status !== "paid") {
    return "Waiting for payment verification. Assignment is blocked.";
  }

  if (project.admin_review_status !== "ready_for_fms_assignment") {
    return "Waiting for admin review approval. Assignment is blocked.";
  }

  if (
    project.project_status === "cancelled" ||
    project.project_status === "needs_importer_clarification" ||
    project.project_status === "refunded" ||
    project.project_status === "partially_refunded" ||
    project.project_status === "disputed"
  ) {
    return `Project status is ${PROJECT_STATUS_LABELS[project.project_status]}. Assignment is blocked.`;
  }

  return "Eligible for FMS assignment.";
}

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

function readStringArray(value: Json | null | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function trimOptional(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

async function getImporterRecipientProfileId(
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

function normalizeVisibleFields(value: string[] | undefined) {
  const allowed = new Set<string>(FACTORY_REPORT_SAFE_FIELDS);
  const selected = (value ?? []).filter((field) => allowed.has(field));

  return selected.length > 0 ? selected : [...FACTORY_REPORT_SAFE_FIELDS];
}

function getFactoryReportLimit(packageCode: string | null | undefined) {
  if (packageCode === "factory-discovery") {
    return {
      guidance: "Factory Discovery allows up to 3 approved factory options.",
      max: 3,
    };
  }

  if (packageCode === "factory-match-plus") {
    return {
      guidance: "Factory Match Plus allows up to 5 approved factory options.",
      max: 5,
    };
  }

  if (packageCode === "import-partner") {
    return {
      guidance: "Import Partner supports 8-10 approved factory options.",
      max: 10,
    };
  }

  return {
    guidance:
      "Package limit guidance is pending. Admin should release only package-appropriate approved options.",
    max: 3,
  };
}

function getReportReleaseGateMessage(
  project: TableRow<"import_projects">,
  approvedSubmissionCount: number,
) {
  if (project.payment_status !== "paid") {
    return "Payment must be verified before any importer-facing factory report can be released.";
  }

  if (project.admin_review_status !== "ready_for_fms_assignment") {
    return "Admin review must approve the project before report release.";
  }

  if (approvedSubmissionCount === 0) {
    return "No admin-approved FMS factory submissions are available for importer report release yet.";
  }

  if (
    project.project_status === "cancelled" ||
    project.project_status === "refunded" ||
    project.project_status === "partially_refunded" ||
    project.project_status === "disputed"
  ) {
    return `Project status is ${PROJECT_STATUS_LABELS[project.project_status]}. Report release is blocked.`;
  }

  return "Approved FMS submissions are available for a sanitized importer report.";
}

function getReadiness(
  paymentStatus: PaymentStatus,
  adminReviewStatus: AdminReviewStatus,
) {
  if (paymentStatus === "failed") {
    return {
      description:
        "Manual payment has an issue or was rejected. FMS assignment remains blocked.",
      label: "Payment Failed / Issue",
      status: "payment_issue" as const,
    };
  }

  if (adminReviewStatus === "rejected") {
    return {
      description:
        "Admin rejected this project. It cannot move to FMS assignment.",
      label: "Rejected",
      status: "rejected" as const,
    };
  }

  if (adminReviewStatus === "needs_information") {
    return {
      description:
        "Admin needs more importer information before sourcing can proceed.",
      label: "Needs Information",
      status: "needs_information" as const,
    };
  }

  if (paymentStatus !== "paid") {
    return {
      description:
        "Waiting for verified payment. No FMS work can begin yet.",
      label: "Awaiting Payment",
      status: "waiting_payment" as const,
    };
  }

  if (adminReviewStatus !== "ready_for_fms_assignment") {
    return {
      description:
        "Payment is verified. Admin review must approve the project before FMS assignment.",
      label: "Awaiting Admin Review",
      status: "waiting_admin_review" as const,
    };
  }

  return {
    description:
      "Payment is verified and admin review is approved. Admin can assign an active FMS from the project detail page.",
    label: "Ready for FMS Assignment",
    status: "ready_for_fms_assignment" as const,
  };
}

function resolveProjectStatus(
  paymentStatus: PaymentStatus,
  adminReviewStatus: AdminReviewStatus,
): ProjectStatus {
  if (adminReviewStatus === "rejected") {
    return "cancelled";
  }

  if (adminReviewStatus === "needs_information") {
    return "needs_importer_clarification";
  }

  if (
    paymentStatus === "paid" &&
    adminReviewStatus === "ready_for_fms_assignment"
  ) {
    return "ready_for_fms_assignment";
  }

  if (paymentStatus === "paid") {
    return "admin_review";
  }

  return "awaiting_payment";
}

function withPhase4Metadata(
  metadata: Json,
  action: {
    actionType: string;
    actorUserId: string;
    at: string;
    note?: string;
    reference?: string;
  },
) {
  const current = toJsonObject(metadata);
  const previousActions = Array.isArray(current.phase_4_admin_actions)
    ? current.phase_4_admin_actions
    : [];
  const logEntry: JsonObject = {
    action_type: action.actionType,
    actor_user_id: action.actorUserId,
    at: action.at,
    note: action.note,
    reference: action.reference,
  };

  return {
    ...current,
    phase_4_admin_actions: [...previousActions, logEntry],
    phase_4_last_action: logEntry,
  } satisfies JsonObject;
}

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

async function getActiveImporterProfilesByIds(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  importerProfileIds: string[],
): Promise<
  | {
      ok: true;
      rows: TableRow<"importer_profiles">[];
    }
  | {
      ok: false;
      message: string;
    }
> {
  const uniqueIds = Array.from(new Set(importerProfileIds.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return { ok: true, rows: [] };
  }

  const { data: importerRows, error: importerError } = await supabase
    .from("importer_profiles")
    .select("*")
    .in("id", uniqueIds);

  if (importerError) {
    return { ok: false, message: importerError.message };
  }

  const rows = importerRows ?? [];
  const userProfileIds = Array.from(
    new Set(rows.map((row) => row.user_profile_id)),
  );

  if (userProfileIds.length === 0) {
    return { ok: true, rows: [] };
  }

  const { data: activeRoleRows, error: roleError } = await supabase
    .from("role_assignments")
    .select("user_profile_id")
    .in("user_profile_id", userProfileIds)
    .eq("role", USER_ROLES.importer)
    .eq("status", "active");

  if (roleError) {
    return { ok: false, message: roleError.message };
  }

  const activeImporterUserProfileIds = new Set(
    (activeRoleRows ?? []).map((row) => row.user_profile_id),
  );

  return {
    ok: true,
    rows: rows.filter((row) =>
      activeImporterUserProfileIds.has(row.user_profile_id),
    ),
  };
}

async function getAssignableFmsProfiles(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
): Promise<
  | {
      ok: true;
      rows: AdminAssignableFms[];
      rowById: Map<string, TableRow<"fms_profiles">>;
      userByFmsProfileId: Map<string, TableRow<"user_profiles">>;
    }
  | {
      ok: false;
      message: string;
    }
> {
  const { data: fmsRows, error: fmsError } = await supabase
    .from("fms_profiles")
    .select("*")
    .order("fms_code", { ascending: true });

  if (fmsError) {
    return { ok: false, message: fmsError.message };
  }

  const fmsProfiles = fmsRows ?? [];
  const userProfileIds = Array.from(
    new Set(fmsProfiles.map((fms) => fms.user_profile_id)),
  );

  const { data: userProfiles } =
    userProfileIds.length > 0
      ? await supabase.from("user_profiles").select("*").in("id", userProfileIds)
      : { data: [] };

  const { data: roleRows, error: roleError } =
    userProfileIds.length > 0
      ? await supabase
          .from("role_assignments")
          .select("user_profile_id")
          .in("user_profile_id", userProfileIds)
          .eq("role", USER_ROLES.fms)
          .eq("status", "active")
      : { data: [], error: null };

  if (roleError) {
    return { ok: false, message: roleError.message };
  }

  const userProfileMap = byId(userProfiles ?? []);
  const activeFmsRoleUserProfileIds = new Set(
    (roleRows ?? []).map((row) => row.user_profile_id),
  );
  const activeFmsRows = fmsProfiles.filter(
    (fms) =>
      fms.status === "active" &&
      activeFmsRoleUserProfileIds.has(fms.user_profile_id),
  );
  const rowById = byId(activeFmsRows);
  const userByFmsProfileId = new Map<string, TableRow<"user_profiles">>();

  activeFmsRows.forEach((fms) => {
    const userProfile = userProfileMap.get(fms.user_profile_id);

    if (userProfile) {
      userByFmsProfileId.set(fms.id, userProfile);
    }
  });

  return {
    ok: true,
    rowById,
    userByFmsProfileId,
    rows: activeFmsRows.map((fms) => {
      const userProfile = userProfileMap.get(fms.user_profile_id);
      const qualityScore =
        typeof fms.quality_score === "number"
          ? `${fms.quality_score.toFixed(0)}%`
          : "Not scored";
      const tier = formatTier(fms.tier);

      return {
        cityProvince: fms.city_province ?? "Not provided",
        fmsCode: fms.fms_code,
        fmsProfileId: fms.id,
        label: `${fms.fms_code} - ${
          userProfile?.display_name ?? "FMS profile name pending"
        } (${tier})`,
        qualityScore,
        specialties:
          fms.categories.length > 0 ? fms.categories.join(", ") : "Not set",
        tier,
      };
    }),
  };
}

async function getCurrentAssignmentForProject(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  projectId: string,
) {
  const { data: assignments, error } = await supabase
    .from("fms_assignments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  const currentAssignment =
    (assignments ?? []).find((assignment) =>
      isActiveAssignmentStatus(assignment.assignment_status),
    ) ?? null;

  if (!currentAssignment) {
    return {
      ok: true as const,
      assignment: null,
      fms: null,
      userProfile: null,
    };
  }

  const [{ data: fms }, { data: userProfile }] = await Promise.all([
    supabase
      .from("fms_profiles")
      .select("*")
      .eq("id", currentAssignment.fms_profile_id)
      .maybeSingle(),
    supabase
      .from("user_profiles")
      .select("*")
      .eq("auth_user_id", currentAssignment.assigned_fms_user_id)
      .maybeSingle(),
  ]);

  return {
    ok: true as const,
    assignment: currentAssignment,
    fms,
    userProfile,
  };
}

function mapApprovedFactorySubmission(
  submission: TableRow<"fms_factory_submissions">,
): AdminApprovedFactorySubmission {
  const metadata = toJsonObject(submission.metadata);
  const mainProducts =
    submission.main_products.length > 0
      ? submission.main_products.join(", ")
      : "Not provided";
  const estimatedUnitPrice = readString(metadata.estimated_unit_price);
  const currency = readString(metadata.currency, "USD");

  return {
    cityProvince: submission.city_province ?? "Not provided",
    currency,
    customizationAvailability: readString(
      metadata.customization_availability,
      "Not provided",
    ),
    estimatedUnitPrice:
      estimatedUnitPrice ||
      submission.price_range?.replace(` ${currency}`, "") ||
      "Not provided",
    factoryLabel: submission.factory_display_name ?? "Factory option",
    mainProducts,
    moq: submission.moq ?? "Not provided",
    packagingNotes: readString(metadata.packaging_notes, "Not provided"),
    productCategory: submission.product_category ?? "Not provided",
    productMatchSummary: readString(
      metadata.product_match_summary,
      "No product match summary provided.",
    ),
    productionLeadTime: submission.production_time ?? "Not provided",
    qualityReliabilitySummary: readString(
      metadata.quality_reliability_notes,
      "Admin-reviewed reliability summary pending.",
    ),
    riskSummary: readString(
      metadata.risk_notes,
      "No specific risk notes were approved for importer view.",
    ),
    sampleAvailability: readString(metadata.sample_availability, "Not provided"),
    submissionCode: submission.submission_code,
    submittedAt: formatDate(submission.created_at),
  };
}

async function getApprovedFactorySubmissionsForProject(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  projectId: string,
) {
  const { data: assignments, error: assignmentsError } = await supabase
    .from("fms_assignments")
    .select("id")
    .eq("project_id", projectId);

  if (assignmentsError) {
    return { ok: false as const, message: assignmentsError.message };
  }

  const assignmentIds = (assignments ?? []).map((assignment) => assignment.id);

  if (assignmentIds.length === 0) {
    return {
      ok: true as const,
      rows: [] as TableRow<"fms_factory_submissions">[],
      submissions: [] as AdminApprovedFactorySubmission[],
    };
  }

  const { data: submissions, error: submissionsError } = await supabase
    .from("fms_factory_submissions")
    .select("*")
    .in("assignment_id", assignmentIds)
    .eq("submission_status", "approved_by_admin")
    .eq("admin_review_status", "ready_for_fms_assignment")
    .order("created_at", { ascending: true });

  if (submissionsError) {
    return { ok: false as const, message: submissionsError.message };
  }

  const rows = submissions ?? [];

  return {
    ok: true as const,
    rows,
    submissions: rows.map(mapApprovedFactorySubmission),
  };
}

function parseFactoryReportFromProject(
  project: TableRow<"import_projects">,
): AdminImporterFactoryReport | null {
  const metadata = toJsonObject(project.metadata);
  const report = toJsonObject(metadata.phase_7_factory_report);
  const statusValue = readString(report.status);

  if (
    statusValue !== "draft" &&
    statusValue !== "released_to_importer" &&
    statusValue !== "updated" &&
    statusValue !== "withdrawn"
  ) {
    return null;
  }

  const optionsValue = Array.isArray(report.options) ? report.options : [];
  const options = optionsValue
    .map((option): AdminFactoryReportOption | null => {
      const optionData = toJsonObject(option);
      const submissionCode = readString(optionData.submissionCode);

      if (!submissionCode) {
        return null;
      }

      return {
        cityProvince: readString(optionData.cityProvince, "Not provided"),
        currency: readString(optionData.currency, "USD"),
        customizationAvailability: readString(
          optionData.customizationAvailability,
          "Not provided",
        ),
        estimatedUnitPrice: readString(
          optionData.estimatedUnitPrice,
          "Not provided",
        ),
        factoryLabel: readString(optionData.factoryLabel, "Factory option"),
        mainProducts: readString(optionData.mainProducts, "Not provided"),
        moq: readString(optionData.moq, "Not provided"),
        packagingNotes: readString(optionData.packagingNotes, "Not provided"),
        productCategory: readString(optionData.productCategory, "Not provided"),
        productMatchSummary: readString(
          optionData.productMatchSummary,
          "No product match summary provided.",
        ),
        productionLeadTime: readString(
          optionData.productionLeadTime,
          "Not provided",
        ),
        qualityReliabilitySummary: readString(
          optionData.qualityReliabilitySummary,
          "Admin-reviewed reliability summary pending.",
        ),
        recommended: optionData.recommended === true,
        riskSummary: readString(
          optionData.riskSummary,
          "No specific risk notes were approved for importer view.",
        ),
        sampleAvailability: readString(
          optionData.sampleAvailability,
          "Not provided",
        ),
        submissionCode,
        submittedAt: readString(optionData.submittedAt, "Not set"),
        visibleFields: normalizeVisibleFields(
          readStringArray(optionData.visibleFields),
        ),
      };
    })
    .filter((option): option is AdminFactoryReportOption => Boolean(option));

  const status = statusValue as FactoryReportStatus;

  return {
    adminRecommendation: readString(report.adminRecommendation),
    comparisonNotes: readString(report.comparisonNotes),
    contactFirewallCheckedAt: readString(report.contactFirewallCheckedAt),
    importerSafeSummary: readString(report.importerSafeSummary),
    internalReleaseNotes: readString(report.internalReleaseNotes),
    options,
    releasedAt: readString(report.releasedAt) || null,
    status,
    statusLabel: FACTORY_REPORT_STATUS_LABELS[status],
    updatedAt: readString(report.updatedAt) || null,
    version: readNumber(report.version, 1),
    withdrawnAt: readString(report.withdrawnAt) || null,
  };
}

async function requireAdmin(accessToken: string) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (
    !hasAllowedRole(authCheck.profile.roles, [
      USER_ROLES.admin,
      USER_ROLES.superAdmin,
    ])
  ) {
    return {
      ok: false as const,
      message: "Only admin or super admin users can view project queues.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
  };
}

function mapProjectListItem(
  project: TableRow<"import_projects">,
  importers: Map<string, TableRow<"importer_profiles">>,
  requirements: Map<string, TableRow<"import_project_requirements">>,
  packages: Map<string, TableRow<"packages">>,
): AdminLiveProjectListItem {
  const importer = importers.get(project.importer_profile_id);
  const requirement = requirements.get(project.id);
  const packageRow = project.package_id ? packages.get(project.package_id) : null;
  const readiness = getReadiness(
    project.payment_status,
    project.admin_review_status,
  );

  return {
    id: project.id,
    adminReviewStatusRaw: project.admin_review_status,
    adminReviewStatus:
      ADMIN_REVIEW_STATUS_LABELS[project.admin_review_status] ??
      project.admin_review_status,
    budgetRange: requirement?.budget_range ?? "Not provided",
    city: importer?.city ?? "Not provided",
    createdDate: formatDate(project.created_at),
    importerName:
      importer?.full_name ?? "Importer role inactive or profile pending",
    packageName: packageRow?.name ?? "Package pending",
    packagePrice: formatPrice(packageRow?.price_pkr),
    paymentStatusRaw: project.payment_status,
    paymentStatus:
      PAYMENT_STATUS_LABELS[project.payment_status] ?? project.payment_status,
    product:
      requirement?.product_name ??
      requirement?.product_description ??
      "Product details pending",
    projectCode: project.project_code,
    projectStatusRaw: project.project_status,
    projectStatus:
      PROJECT_STATUS_LABELS[project.project_status] ?? project.project_status,
    readinessDescription: readiness.description,
    readinessLabel: readiness.label,
    readinessStatus: readiness.status,
  };
}

async function applyProjectGateMutation(
  accessToken: string,
  projectCode: string,
  input: AdminProjectGateInput,
  mutation: {
    actionType: string;
    adminReviewStatus?: AdminReviewStatus;
    body: string;
    paymentStatus?: PaymentStatus;
    title: string;
  },
): Promise<ActionResult<AdminLiveProjectDetail>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: project, error: projectError } = await supabase
      .from("import_projects")
      .select("*")
      .eq("project_code", decodeURIComponent(projectCode))
      .maybeSingle();

    if (projectError) {
      return { ok: false, message: projectError.message };
    }

    if (!project) {
      return {
        ok: false,
        message: "This live Import Project was not found in Supabase.",
      };
    }

    const now = new Date().toISOString();
    const note = trimOptional(input.note);
    const reference = trimOptional(input.reference);
    const nextPaymentStatus = mutation.paymentStatus ?? project.payment_status;
    const nextAdminReviewStatus =
      mutation.adminReviewStatus ?? project.admin_review_status;
    const nextProjectStatus = resolveProjectStatus(
      nextPaymentStatus,
      nextAdminReviewStatus,
    );
    const becameReadyForFms =
      nextProjectStatus === "ready_for_fms_assignment" &&
      project.project_status !== "ready_for_fms_assignment";
    const updatePayload: Database["public"]["Tables"]["import_projects"]["Update"] =
      {
        admin_review_status: nextAdminReviewStatus,
        metadata: withPhase4Metadata(project.metadata, {
          actionType: mutation.actionType,
          actorUserId: admin.authUserId,
          at: now,
          note,
          reference,
        }),
        payment_status: nextPaymentStatus,
        project_status: nextProjectStatus,
        ready_for_fms_at:
          nextProjectStatus === "ready_for_fms_assignment"
            ? project.ready_for_fms_at ?? now
            : null,
        updated_by: admin.authUserId,
      };

    if (mutation.paymentStatus === "paid") {
      updatePayload.paid_at = project.paid_at ?? now;
    }

    if (mutation.paymentStatus === "failed") {
      updatePayload.paid_at = null;
    }

    if (mutation.adminReviewStatus) {
      updatePayload.admin_reviewed_at = now;
    }

    const { error: updateError } = await supabase
      .from("import_projects")
      .update(updatePayload)
      .eq("id", project.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    let notificationInvoice: TableRow<"invoices"> | null = null;

    if (mutation.paymentStatus) {
      const invoiceResult = await ensureInvoiceForProject(
        supabase,
        project.id,
        admin.authUserId,
      );

      if (!invoiceResult.ok) {
        return { ok: false, message: invoiceResult.message };
      }

      const invoice = invoiceResult.data.invoice;
      notificationInvoice = invoice;

      if (mutation.paymentStatus === "paid") {
        await Promise.all([
          supabase
            .from("invoices")
            .update({
              paid_at: invoice.paid_at ?? now,
              status: "paid",
              transaction_reference: reference ?? invoice.transaction_reference,
              updated_by: admin.authUserId,
            })
            .eq("id", invoice.id),
          supabase
            .from("payments")
            .update({
              payment_status: "paid",
              provider_reference: reference,
              verified_at: now,
              updated_by: admin.authUserId,
            })
            .eq("invoice_id", invoice.id),
        ]);
      }

      if (mutation.paymentStatus === "failed") {
        await Promise.all([
          supabase
            .from("invoices")
            .update({
              status: invoice.status === "paid" ? invoice.status : "awaiting_payment",
              updated_by: admin.authUserId,
            })
            .eq("id", invoice.id),
          supabase
            .from("payments")
            .update({
              payment_status: "failed",
              provider_reference: reference,
              updated_by: admin.authUserId,
            })
            .eq("invoice_id", invoice.id),
        ]);
      }
    }

    const timelineMetadata: JsonObject = {
      action_type: mutation.actionType,
      note,
      payment_reference: reference,
    };
    const timelineEvents: Array<
      Database["public"]["Tables"]["import_project_timeline_events"]["Insert"]
    > = [
      {
        body: mutation.body,
        created_by: admin.authUserId,
        event_type: mutation.actionType,
        metadata: timelineMetadata,
        project_id: project.id,
        title: mutation.title,
        visible_to_agent: false,
        visible_to_fms: false,
        visible_to_importer: true,
      },
    ];

    if (becameReadyForFms) {
      timelineEvents.push({
        body: "Payment verification and admin review gates are complete. FMS assignment remains disabled until the next implementation phase.",
        created_by: admin.authUserId,
        event_type: "ready_for_fms_assignment",
        metadata: {
          action_type: "readiness_gate_completed",
        },
        project_id: project.id,
        title: "Project is ready for FMS assignment",
        visible_to_agent: false,
        visible_to_fms: false,
        visible_to_importer: true,
      });
    }

    const writeOperations: PromiseLike<{ error: { message: string } | null }>[] =
      [
        supabase.from("import_project_timeline_events").insert(timelineEvents),
      ];

    if (project.project_status !== nextProjectStatus) {
      writeOperations.push(
        supabase.from("import_project_status_history").insert({
          changed_by: admin.authUserId,
          from_status: project.project_status,
          metadata: {
            action_type: mutation.actionType,
            admin_review_status: nextAdminReviewStatus,
            payment_status: nextPaymentStatus,
          },
          project_id: project.id,
          reason: mutation.title,
          to_status: nextProjectStatus,
        }),
      );
    }

    const writeResults = await Promise.all(writeOperations);
    const writeError = writeResults.find((result) => result.error)?.error;

    if (writeError) {
      return { ok: false, message: writeError.message };
    }

    const importerRecipientProfileId = await getImporterRecipientProfileId(
      supabase,
      project.importer_profile_id,
    );
    const notificationType =
      mutation.actionType === "payment_verified"
        ? "payment_verified"
        : mutation.actionType === "payment_issue"
          ? "payment_rejected"
          : mutation.actionType === "admin_review_approved"
            ? "project_approved"
            : mutation.actionType === "admin_review_needs_information"
              ? "admin_needs_project_info"
              : mutation.actionType === "admin_review_rejected"
                ? "project_rejected"
                : null;

    if (importerRecipientProfileId && notificationType) {
      await createNotification(
        {
          actionUrl: "/importer/dashboard",
          actorProfileId: admin.profileId,
          invoiceId: notificationInvoice?.id ?? null,
          projectId: project.id,
          recipientProfileId: importerRecipientProfileId,
          templateContext: {
            invoiceCode: notificationInvoice?.invoice_code,
            projectCode: project.project_code,
          },
          type: notificationType,
        },
        supabase,
      );
    }

    return getAdminImportProjectAction(accessToken, project.project_code);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Admin project review action is not configured yet.",
    };
  }
}

export async function markProjectPaymentVerifiedAction(
  accessToken: string,
  projectCode: string,
  input: AdminProjectGateInput = {},
) {
  return applyProjectGateMutation(accessToken, projectCode, input, {
    actionType: "payment_verified",
    body: "Manual payment verification completed. No FMS assignment has been created in this phase.",
    paymentStatus: "paid",
    title: "Admin marked payment as verified",
  });
}

export async function markProjectPaymentIssueAction(
  accessToken: string,
  projectCode: string,
  input: AdminProjectGateInput = {},
) {
  return applyProjectGateMutation(accessToken, projectCode, input, {
    actionType: "payment_issue",
    body: "Manual payment verification found an issue. Sourcing work remains blocked until payment is resolved.",
    paymentStatus: "failed",
    title: "Admin marked payment issue",
  });
}

export async function approveProjectReviewAction(
  accessToken: string,
  projectCode: string,
  input: AdminProjectGateInput = {},
) {
  return applyProjectGateMutation(accessToken, projectCode, input, {
    actionType: "admin_review_approved",
    adminReviewStatus: "ready_for_fms_assignment",
    body: "Admin review approved the project for sourcing preparation. FMS assignment is still not implemented in this phase.",
    title: "Admin approved project for sourcing",
  });
}

export async function markProjectNeedsInfoAction(
  accessToken: string,
  projectCode: string,
  input: AdminProjectGateInput = {},
) {
  return applyProjectGateMutation(accessToken, projectCode, input, {
    actionType: "admin_review_needs_information",
    adminReviewStatus: "needs_information",
    body: "Admin requested more information before the project can proceed.",
    title: "Admin requested more information",
  });
}

export async function rejectProjectReviewAction(
  accessToken: string,
  projectCode: string,
  input: AdminProjectGateInput = {},
) {
  return applyProjectGateMutation(accessToken, projectCode, input, {
    actionType: "admin_review_rejected",
    adminReviewStatus: "rejected",
    body: "Admin rejected this project. FMS assignment is blocked.",
    title: "Admin rejected project",
  });
}

export async function createFmsAssignmentAction(
  accessToken: string,
  projectCode: string,
  input: CreateFmsAssignmentInput,
): Promise<ActionResult<AdminLiveProjectDetail>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const fmsProfileId = trimOptional(input.fmsProfileId);

    if (!fmsProfileId) {
      return { ok: false, message: "Please select an active FMS profile." };
    }

    const supabase = createAdminSupabaseClient();
    const { data: project, error: projectError } = await supabase
      .from("import_projects")
      .select("*")
      .eq("project_code", decodeURIComponent(projectCode))
      .maybeSingle();

    if (projectError) {
      return { ok: false, message: projectError.message };
    }

    if (!project) {
      return {
        ok: false,
        message: "This live Import Project was not found in Supabase.",
      };
    }

    if (
      project.payment_status !== "paid" ||
      project.admin_review_status !== "ready_for_fms_assignment" ||
      project.project_status !== "ready_for_fms_assignment"
    ) {
      return {
        ok: false,
        message:
          "FMS assignment is blocked until payment is verified, admin review is approved, and project status is Ready for FMS Assignment.",
      };
    }

    const currentAssignment = await getCurrentAssignmentForProject(
      supabase,
      project.id,
    );

    if (!currentAssignment.ok) {
      return currentAssignment;
    }

    if (currentAssignment.assignment) {
      return {
        ok: false,
        message:
          "This project already has an active FMS assignment. Reassignment is reserved for a later phase.",
      };
    }

    const fmsLookup = await getAssignableFmsProfiles(supabase);

    if (!fmsLookup.ok) {
      return fmsLookup;
    }

    const selectedFms = fmsLookup.rowById.get(fmsProfileId);
    const selectedFmsUser = fmsLookup.userByFmsProfileId.get(fmsProfileId);

    if (!selectedFms || !selectedFmsUser) {
      return {
        ok: false,
        message:
          "The selected FMS is not active, approved, or assigned an active FMS role.",
      };
    }

    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("user_profile_id", admin.profileId)
      .maybeSingle();

    const now = new Date().toISOString();
    const deadline = trimOptional(input.deadline);
    const deadlineAt = deadline ? new Date(deadline).toISOString() : null;
    const priority = trimOptional(input.priority) ?? "normal";
    const internalNotes = trimOptional(input.internalNotes);
    const assignmentCode = generateAssignmentCode();
    const metadata: JsonObject = {
      admin_assignment_notes: internalNotes,
      assignment_source: "phase_5_admin_project_detail",
      fms_privacy_rule:
        "FMS receives project brief only. Importer contact details remain hidden.",
      priority,
    };

    const { data: assignment, error: assignmentError } = await supabase
      .from("fms_assignments")
      .insert({
        assigned_by_admin_profile_id: adminProfile?.id ?? null,
        assigned_fms_user_id: selectedFmsUser.auth_user_id,
        assignment_code: assignmentCode,
        assignment_status: "assigned",
        created_by: admin.authUserId,
        deadline_at: deadlineAt,
        fms_profile_id: selectedFms.id,
        metadata,
        project_id: project.id,
        tier_snapshot: selectedFms.tier,
      })
      .select("*")
      .single();

    if (assignmentError || !assignment) {
      return {
        ok: false,
        message:
          assignmentError?.message ??
          "The FMS assignment could not be created in Supabase.",
      };
    }

    const milestoneKeys = [
      "requirements_reviewed",
      "factory_research_started",
      "minimum_factory_options_identified",
      "factory_details_collected",
      "quotations_collected",
      "evidence_uploaded",
      "submitted_to_admin_review",
    ];

    const [{ error: milestoneError }, { error: projectUpdateError }] =
      await Promise.all([
        supabase.from("fms_assignment_milestones").insert(
          milestoneKeys.map((milestoneKey) => ({
            assignment_id: assignment.id,
            created_by: admin.authUserId,
            metadata: {
              phase: "phase_5_fms_assignment_workflow",
            },
            milestone_key: milestoneKey,
            status: "pending",
          })),
        ),
        supabase
          .from("import_projects")
          .update({
            metadata: {
              ...toJsonObject(project.metadata),
              phase_5_last_assignment: {
                assignment_code: assignment.assignment_code,
                assigned_at: now,
                fms_code: selectedFms.fms_code,
              },
            },
            project_status: "fms_assigned",
            updated_by: admin.authUserId,
          })
          .eq("id", project.id),
      ]);

    if (milestoneError || projectUpdateError) {
      return {
        ok: false,
        message:
          milestoneError?.message ??
          projectUpdateError?.message ??
          "The assignment was created, but project workflow records could not be completed.",
      };
    }

    const [{ error: historyError }, { error: timelineError }] =
      await Promise.all([
        supabase.from("import_project_status_history").insert({
          changed_by: admin.authUserId,
          from_status: project.project_status,
          metadata: {
            assignment_code: assignment.assignment_code,
            fms_profile_id: selectedFms.id,
          },
          project_id: project.id,
          reason: "Project assigned to FMS",
          to_status: "fms_assigned",
        }),
        supabase.from("import_project_timeline_events").insert({
          body: "Admin assigned this project to a Factory Match Specialist. Importer contact details remain hidden from the FMS.",
          created_by: admin.authUserId,
          event_type: "fms_assigned",
          metadata: {
            assignment_code: assignment.assignment_code,
            fms_code: selectedFms.fms_code,
          },
          project_id: project.id,
          title: "Project assigned to FMS",
          visible_to_agent: false,
          visible_to_fms: true,
          visible_to_importer: true,
        }),
      ]);

    if (historyError || timelineError) {
      return {
        ok: false,
        message:
          historyError?.message ??
          timelineError?.message ??
          "Assignment was created, but timeline records could not be completed.",
      };
    }

    await createNotification(
      {
        actionUrl: `/fms/assignments/${assignment.assignment_code}`,
        actorProfileId: admin.profileId,
        assignmentId: assignment.id,
        projectId: project.id,
        recipientProfileId: selectedFms.user_profile_id,
        templateContext: {
          assignmentCode: assignment.assignment_code,
          fmsCode: selectedFms.fms_code,
          projectCode: project.project_code,
        },
        type: "fms_assignment_created",
      },
      supabase,
    );

    return getAdminImportProjectAction(accessToken, project.project_code);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "FMS assignment creation is not configured yet.",
    };
  }
}

export async function saveFactoryReportForImporterAction(
  accessToken: string,
  projectCode: string,
  input: SaveFactoryReportInput,
): Promise<ActionResult<AdminLiveProjectDetail>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: project, error: projectError } = await supabase
      .from("import_projects")
      .select("*")
      .eq("project_code", decodeURIComponent(projectCode))
      .maybeSingle();

    if (projectError) {
      return { ok: false, message: projectError.message };
    }

    if (!project) {
      return {
        ok: false,
        message: "This live Import Project was not found in Supabase.",
      };
    }

    const { data: packageRow, error: packageError } = project.package_id
      ? await supabase
          .from("packages")
          .select("*")
          .eq("id", project.package_id)
          .maybeSingle()
      : { data: null, error: null };

    if (packageError) {
      return { ok: false, message: packageError.message };
    }

    const approvedSubmissionsResult =
      await getApprovedFactorySubmissionsForProject(supabase, project.id);

    if (!approvedSubmissionsResult.ok) {
      return approvedSubmissionsResult;
    }

    const existingReport = parseFactoryReportFromProject(project);
    const now = new Date().toISOString();
    const reportLimit = getFactoryReportLimit(packageRow?.package_code);
    const currentMetadata = toJsonObject(project.metadata);
    const intent = input.intent;

    if (intent === "withdraw") {
      if (
        !existingReport ||
        (existingReport.status !== "released_to_importer" &&
          existingReport.status !== "updated")
      ) {
        return {
          ok: false,
          message: "Only a released importer factory report can be withdrawn.",
        };
      }

      const withdrawnReport: AdminImporterFactoryReport = {
        ...existingReport,
        status: "withdrawn",
        statusLabel: FACTORY_REPORT_STATUS_LABELS.withdrawn,
        updatedAt: now,
        version: existingReport.version + 1,
        withdrawnAt: now,
      };
      const nextProjectStatus: ProjectStatus =
        project.project_status === "results_released_to_importer"
          ? "admin_quality_review"
          : project.project_status;
      const nextMetadata: JsonObject = {
        ...currentMetadata,
        phase_7_factory_report: withdrawnReport as unknown as Json,
      };

      const { error: updateError } = await supabase
        .from("import_projects")
        .update({
          metadata: nextMetadata,
          project_status: nextProjectStatus,
          updated_by: admin.authUserId,
        })
        .eq("id", project.id);

      if (updateError) {
        return { ok: false, message: updateError.message };
      }

      const writes: PromiseLike<{ error: { message: string } | null }>[] = [
        supabase.from("import_project_timeline_events").insert({
          body: "Admin withdrew the previously released factory report. Importer access to the report is disabled until a sanitized report is released again.",
          created_by: admin.authUserId,
          event_type: "factory_report_withdrawn",
          metadata: {
            phase: "phase_7_importer_approved_factory_report",
            report_version: withdrawnReport.version,
          },
          project_id: project.id,
          title: "Admin withdrew importer factory report",
          visible_to_agent: false,
          visible_to_fms: false,
          visible_to_importer: true,
        }),
      ];

      if (nextProjectStatus !== project.project_status) {
        writes.push(
          supabase.from("import_project_status_history").insert({
            changed_by: admin.authUserId,
            from_status: project.project_status,
            metadata: {
              phase: "phase_7_importer_approved_factory_report",
              report_status: "withdrawn",
            },
            project_id: project.id,
            reason: "Admin withdrew importer factory report",
            to_status: nextProjectStatus,
          }),
        );
      }

      const writeResults = await Promise.all(writes);
      const writeError = writeResults.find((result) => result.error)?.error;

      if (writeError) {
        return { ok: false, message: writeError.message };
      }

      const importerRecipientProfileId = await getImporterRecipientProfileId(
        supabase,
        project.importer_profile_id,
      );

      if (importerRecipientProfileId) {
        await createNotification(
          {
            actionUrl: `/importer/reports/${project.project_code}`,
            actorProfileId: admin.profileId,
            projectId: project.id,
            recipientProfileId: importerRecipientProfileId,
            templateContext: {
              projectCode: project.project_code,
            },
            type: "factory_report_withdrawn",
          },
          supabase,
        );
      }

      return getAdminImportProjectAction(accessToken, project.project_code);
    }

    const releaseGateMessage = getReportReleaseGateMessage(
      project,
      approvedSubmissionsResult.submissions.length,
    );

    if (
      intent === "release" &&
      releaseGateMessage !==
        "Approved FMS submissions are available for a sanitized importer report."
    ) {
      return { ok: false, message: releaseGateMessage };
    }

    const selectedSubmissionCodes = Array.from(
      new Set(input.selectedSubmissionCodes ?? []),
    ).filter(Boolean);

    if (selectedSubmissionCodes.length === 0) {
      return {
        ok: false,
        message: "Select at least one admin-approved factory submission.",
      };
    }

    if (selectedSubmissionCodes.length > reportLimit.max) {
      return {
        ok: false,
        message: `${reportLimit.guidance} You selected ${selectedSubmissionCodes.length}.`,
      };
    }

    const approvedMap = new Map(
      approvedSubmissionsResult.submissions.map((submission) => [
        submission.submissionCode,
        submission,
      ]),
    );
    const missingCodes = selectedSubmissionCodes.filter(
      (submissionCode) => !approvedMap.has(submissionCode),
    );

    if (missingCodes.length > 0) {
      return {
        ok: false,
        message:
          "Only admin-approved FMS submissions for this project can be released to the importer.",
      };
    }

    const visibleFields = normalizeVisibleFields(input.visibleFields);
    const recommendedSubmissionCode =
      input.recommendedSubmissionCode &&
      selectedSubmissionCodes.includes(input.recommendedSubmissionCode)
        ? input.recommendedSubmissionCode
        : "";
    const importerSafeSummary = trimOptional(input.importerSafeSummary) ?? "";
    const adminRecommendation = trimOptional(input.adminRecommendation) ?? "";
    const comparisonNotes = trimOptional(input.comparisonNotes) ?? "";
    const internalReleaseNotes = trimOptional(input.internalReleaseNotes) ?? "";
    const options = selectedSubmissionCodes.map((submissionCode) => {
      const submission = approvedMap.get(submissionCode);

      if (!submission) {
        throw new Error("Approved submission lookup failed.");
      }

      return {
        ...submission,
        recommended: submission.submissionCode === recommendedSubmissionCode,
        visibleFields,
      };
    });

    const firewallFields = [
      { label: "Importer-safe summary", value: importerSafeSummary },
      { label: "Admin recommendation", value: adminRecommendation },
      { label: "Comparison notes", value: comparisonNotes },
      ...options.flatMap((option) => [
        { label: `${option.submissionCode} factory label`, value: option.factoryLabel },
        { label: `${option.submissionCode} city/province`, value: option.cityProvince },
        {
          label: `${option.submissionCode} product match summary`,
          value: visibleFields.includes("productMatchSummary")
            ? option.productMatchSummary
            : "",
        },
        {
          label: `${option.submissionCode} product category`,
          value: visibleFields.includes("productCategory")
            ? option.productCategory
            : "",
        },
        {
          label: `${option.submissionCode} main products`,
          value: visibleFields.includes("mainProducts") ? option.mainProducts : "",
        },
        {
          label: `${option.submissionCode} estimated unit price`,
          value: visibleFields.includes("estimatedUnitPrice")
            ? option.estimatedUnitPrice
            : "",
        },
        { label: `${option.submissionCode} MOQ`, value: visibleFields.includes("moq") ? option.moq : "" },
        {
          label: `${option.submissionCode} sample availability`,
          value: visibleFields.includes("sampleAvailability")
            ? option.sampleAvailability
            : "",
        },
        {
          label: `${option.submissionCode} production lead time`,
          value: visibleFields.includes("productionLeadTime")
            ? option.productionLeadTime
            : "",
        },
        {
          label: `${option.submissionCode} packaging notes`,
          value: visibleFields.includes("packagingNotes")
            ? option.packagingNotes
            : "",
        },
        {
          label: `${option.submissionCode} customization availability`,
          value: visibleFields.includes("customizationAvailability")
            ? option.customizationAvailability
            : "",
        },
        {
          label: `${option.submissionCode} quality/reliability summary`,
          value: visibleFields.includes("qualityReliabilitySummary")
            ? option.qualityReliabilitySummary
            : "",
        },
        {
          label: `${option.submissionCode} risk summary`,
          value: visibleFields.includes("riskSummary") ? option.riskSummary : "",
        },
      ]),
    ];
    const firewall = detectContactRiskInFields(firewallFields);

    if (firewall.flags.length > 0) {
      return {
        ok: false,
        message: `Report release blocked. Remove contact/payment details from importer-facing fields: ${firewall.messages.join(" ")}`,
      };
    }

    const wasReleased =
      existingReport?.status === "released_to_importer" ||
      existingReport?.status === "updated";
    const nextStatus: FactoryReportStatus =
      intent === "save_draft" ? "draft" : wasReleased ? "updated" : "released_to_importer";
    const nextReport: AdminImporterFactoryReport = {
      adminRecommendation,
      comparisonNotes,
      contactFirewallCheckedAt: now,
      importerSafeSummary,
      internalReleaseNotes,
      options,
      releasedAt:
        intent === "release"
          ? existingReport?.releasedAt ?? now
          : existingReport?.releasedAt ?? null,
      status: nextStatus,
      statusLabel: FACTORY_REPORT_STATUS_LABELS[nextStatus],
      updatedAt: existingReport ? now : null,
      version: (existingReport?.version ?? 0) + 1,
      withdrawnAt: null,
    };
    const nextProjectStatus: ProjectStatus =
      intent === "release" ? "results_released_to_importer" : project.project_status;
    const nextMetadata: JsonObject = {
      ...currentMetadata,
      phase_7_factory_report: nextReport as unknown as Json,
    };

    const { error: updateError } = await supabase
      .from("import_projects")
      .update({
        metadata: nextMetadata,
        project_status: nextProjectStatus,
        updated_by: admin.authUserId,
      })
      .eq("id", project.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    const writes: PromiseLike<{ error: { message: string } | null }>[] = [
      supabase.from("import_project_timeline_events").insert({
        body:
          intent === "release"
            ? "Admin released a sanitized, approved factory report to the importer. Raw FMS notes and factory contact details remain hidden."
            : "Admin saved a draft importer-facing factory report. It is not visible to the importer yet.",
        created_by: admin.authUserId,
        event_type:
          intent === "release" ? "factory_report_released" : "factory_report_draft",
        metadata: {
          included_submission_codes: selectedSubmissionCodes,
          phase: "phase_7_importer_approved_factory_report",
          report_status: nextStatus,
          report_version: nextReport.version,
        },
        project_id: project.id,
        title:
          intent === "release"
            ? "Admin released approved factory report to importer"
            : "Admin saved factory report draft",
        visible_to_agent: false,
        visible_to_fms: false,
        visible_to_importer: intent === "release",
      }),
    ];

    if (nextProjectStatus !== project.project_status) {
      writes.push(
        supabase.from("import_project_status_history").insert({
          changed_by: admin.authUserId,
          from_status: project.project_status,
          metadata: {
            included_submission_codes: selectedSubmissionCodes,
            phase: "phase_7_importer_approved_factory_report",
            report_status: nextStatus,
          },
          project_id: project.id,
          reason: "Admin released approved factory report to importer",
          to_status: nextProjectStatus,
        }),
      );
    }

    const writeResults = await Promise.all(writes);
    const writeError = writeResults.find((result) => result.error)?.error;

    if (writeError) {
      return { ok: false, message: writeError.message };
    }

    if (intent === "release") {
      const importerRecipientProfileId = await getImporterRecipientProfileId(
        supabase,
        project.importer_profile_id,
      );

      if (importerRecipientProfileId) {
        await createNotification(
          {
            actionUrl: `/importer/reports/${project.project_code}`,
            actorProfileId: admin.profileId,
            priority: "high",
            projectId: project.id,
            recipientProfileId: importerRecipientProfileId,
            templateContext: {
              projectCode: project.project_code,
            },
            type: "factory_report_released",
          },
          supabase,
        );
      }
    }

    return getAdminImportProjectAction(accessToken, project.project_code);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Importer factory report release action is not configured yet.",
    };
  }
}

export async function listAdminImportProjectsAction(
  accessToken: string,
): Promise<ActionResult<AdminLiveProjectListItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: projects, error: projectsError } = await supabase
      .from("import_projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (projectsError) {
      return { ok: false, message: projectsError.message };
    }

    const projectRows = projects ?? [];
    const projectIds = projectRows.map((project) => project.id);
    const importerIds = Array.from(
      new Set(projectRows.map((project) => project.importer_profile_id)),
    );
    const packageIds = Array.from(
      new Set(projectRows.map((project) => project.package_id).filter(Boolean)),
    ) as string[];

    const importerResult = await getActiveImporterProfilesByIds(
      supabase,
      importerIds,
    );

    if (!importerResult.ok) {
      return importerResult;
    }

    const { data: requirementRows } =
      projectIds.length > 0
        ? await supabase
            .from("import_project_requirements")
            .select("*")
            .in("project_id", projectIds)
        : { data: [] };

    const { data: packageRows } =
      packageIds.length > 0
        ? await supabase.from("packages").select("*").in("id", packageIds)
        : { data: [] };

    const importerMap = byId(importerResult.rows);
    const requirementMap = new Map(
      (requirementRows ?? []).map((row) => [row.project_id, row]),
    );
    const packageMap = byId(packageRows ?? []);

    return {
      ok: true,
      data: projectRows.map((project) =>
        mapProjectListItem(project, importerMap, requirementMap, packageMap),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Supabase admin project list is not configured yet.",
    };
  }
}

export async function searchAdminImportProjectsAction(
  accessToken: string,
  query: string,
): Promise<ActionResult<AdminLiveProjectListItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return { ok: true, data: [] };
    }

    const supabase = createAdminSupabaseClient();
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const projectMap = new Map<string, TableRow<"import_projects">>();

    if (uuidPattern.test(normalizedQuery)) {
      const { data: projectById, error: idError } = await supabase
        .from("import_projects")
        .select("*")
        .eq("id", normalizedQuery)
        .maybeSingle();

      if (idError) {
        return { ok: false, message: idError.message };
      }

      if (projectById) {
        projectMap.set(projectById.id, projectById);
      }
    }

    const { data: codeProjects, error: codeError } = await supabase
      .from("import_projects")
      .select("*")
      .ilike("project_code", `%${normalizedQuery}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (codeError) {
      return { ok: false, message: codeError.message };
    }

    (codeProjects ?? []).forEach((project) => {
      projectMap.set(project.id, project);
    });

    const projectRows = Array.from(projectMap.values()).slice(0, 20);

    if (projectRows.length === 0) {
      return { ok: true, data: [] };
    }

    const projectIds = projectRows.map((project) => project.id);
    const importerIds = Array.from(
      new Set(projectRows.map((project) => project.importer_profile_id)),
    );
    const packageIds = Array.from(
      new Set(projectRows.map((project) => project.package_id).filter(Boolean)),
    ) as string[];

    const importerResult = await getActiveImporterProfilesByIds(
      supabase,
      importerIds,
    );

    if (!importerResult.ok) {
      return importerResult;
    }

    const { data: requirementRows } =
      projectIds.length > 0
        ? await supabase
            .from("import_project_requirements")
            .select("*")
            .in("project_id", projectIds)
        : { data: [] };

    const { data: packageRows } =
      packageIds.length > 0
        ? await supabase.from("packages").select("*").in("id", packageIds)
        : { data: [] };

    const importerMap = byId(importerResult.rows);
    const requirementMap = new Map(
      (requirementRows ?? []).map((row) => [row.project_id, row]),
    );
    const packageMap = byId(packageRows ?? []);

    return {
      ok: true,
      data: projectRows.map((project) =>
        mapProjectListItem(project, importerMap, requirementMap, packageMap),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Admin project search could not be completed.",
    };
  }
}

export async function getAdminImportProjectAction(
  accessToken: string,
  projectCode: string,
): Promise<ActionResult<AdminLiveProjectDetail>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: project, error: projectError } = await supabase
      .from("import_projects")
      .select("*")
      .eq("project_code", decodeURIComponent(projectCode))
      .maybeSingle();

    if (projectError) {
      return { ok: false, message: projectError.message };
    }

    if (!project) {
      return {
        ok: false,
        message: "This live Import Project was not found in Supabase.",
      };
    }

    const [
      requirementResult,
      packageResult,
      projectAddonsResult,
      timelineResult,
      projectCountResult,
    ] = await Promise.all([
      supabase
        .from("import_project_requirements")
        .select("*")
        .eq("project_id", project.id)
        .maybeSingle(),
      project.package_id
        ? supabase
            .from("packages")
            .select("*")
            .eq("id", project.package_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("import_project_addons")
        .select("*")
        .eq("project_id", project.id),
      supabase
        .from("import_project_timeline_events")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("import_projects")
        .select("id")
        .eq("importer_profile_id", project.importer_profile_id),
    ]);

    if (requirementResult.error || packageResult.error) {
      return {
        ok: false,
        message:
          requirementResult.error?.message ??
          packageResult.error?.message ??
          "Project detail data could not be loaded.",
      };
    }

    const activeImporterResult = await getActiveImporterProfilesByIds(
      supabase,
      [project.importer_profile_id],
    );

    if (!activeImporterResult.ok) {
      return activeImporterResult;
    }

    const activeImporter = activeImporterResult.rows[0] ?? null;
    const [
      assignableFmsResult,
      currentAssignmentResult,
      approvedSubmissionsResult,
    ] = await Promise.all([
      getAssignableFmsProfiles(supabase),
      getCurrentAssignmentForProject(supabase, project.id),
      getApprovedFactorySubmissionsForProject(supabase, project.id),
    ]);

    if (!assignableFmsResult.ok) {
      return assignableFmsResult;
    }

    if (!currentAssignmentResult.ok) {
      return currentAssignmentResult;
    }

    if (!approvedSubmissionsResult.ok) {
      return approvedSubmissionsResult;
    }

    const assignmentGateMessage = currentAssignmentResult.assignment
      ? "This project already has an active FMS assignment. Reassignment is reserved for a later phase."
      : getAssignmentGateMessage(project);
    const canAssign =
      !currentAssignmentResult.assignment &&
      assignmentGateMessage === "Eligible for FMS assignment." &&
      assignableFmsResult.rows.length > 0;

    const projectAddons = projectAddonsResult.data ?? [];
    const addonIds = projectAddons.map((row) => row.addon_id);
    const { data: addonRows } =
      addonIds.length > 0
        ? await supabase.from("addons").select("*").in("id", addonIds)
        : { data: [] };

    const importerMap = byId(activeImporter ? [activeImporter] : []);
    const requirementMap = requirementResult.data
      ? new Map([[project.id, requirementResult.data]])
      : new Map<string, TableRow<"import_project_requirements">>();
    const packageMap = byId(packageResult.data ? [packageResult.data] : []);
    const projectListItem = mapProjectListItem(
      project,
      importerMap,
      requirementMap,
      packageMap,
    );
    const importer = activeImporter;
    const requirement = requirementResult.data;
    const packageRow = packageResult.data;
    const addonMap = byId(addonRows ?? []);
    const addOns = projectAddons.map((selected) => {
      const addon = addonMap.get(selected.addon_id);

      return {
        name: addon?.name ?? "Selected add-on",
        price:
          selected.price_snapshot_pkr !== null
            ? formatPrice(selected.price_snapshot_pkr)
            : "Pricing review required",
      };
    });
    const addOnTotal = projectAddons.reduce(
      (total, selected) => total + (selected.price_snapshot_pkr ?? 0),
      0,
    );
    const totalServiceFee =
      packageRow?.price_pkr !== undefined
        ? formatPrice(packageRow.price_pkr + addOnTotal)
        : "Pending package price";
    const timelineRows = timelineResult.data ?? [];
    const factoryReport = parseFactoryReportFromProject(project);
    const reportLimit = getFactoryReportLimit(packageRow?.package_code);
    const reportGateMessage = getReportReleaseGateMessage(
      project,
      approvedSubmissionsResult.submissions.length,
    );

    return {
      ok: true,
      data: {
        addOns,
        assignment: {
          disabledReason:
            "FMS assignment disabled until payment is completed and admin review marks the project ready.",
          fmsTierSuggestion: fmsTierForPackage(packageRow?.package_code),
        },
        checklist: [
          {
            checked: Boolean(
              requirement?.product_description ||
                requirement?.product_name ||
                requirement?.product_links.length,
            ),
            label: "Product details are understandable",
          },
          {
            checked: Boolean(requirement?.budget_range),
            label: "Budget range selected",
          },
          {
            checked: Boolean(requirement?.quantity),
            label: "Quantity provided",
          },
          {
            checked: Boolean(packageRow),
            label: "Package selected",
          },
          {
            checked: true,
            label: "Add-ons reviewed",
          },
          {
            checked: false,
            label: "Risk or missing information checked",
          },
          {
            checked:
              project.payment_status === "paid" &&
              project.admin_review_status === "ready_for_fms_assignment",
            label: "Ready for FMS assignment",
          },
        ],
        importer: {
          businessType: importer?.business_type ?? "Not provided",
          city: importer?.city ?? "Not provided",
          contactForAdminOnly:
            importer?.phone_whatsapp ??
            "Hidden because active importer role was not found",
          name: importer?.full_name ?? "Importer role inactive or profile pending",
          pastProjectCount: importer
            ? String(projectCountResult.data?.length ?? 1)
            : "Not counted without active importer role",
          verificationStatus: importer?.verification_status ?? "role inactive",
        },
        fmsAssignment: {
          availableFms: assignableFmsResult.rows,
          canAssign,
          currentAssignment: currentAssignmentResult.assignment
            ? {
                assignedAt: formatDate(
                  currentAssignmentResult.assignment.created_at,
                ),
                assignmentCode:
                  currentAssignmentResult.assignment.assignment_code,
                deadline: formatDeadline(
                  currentAssignmentResult.assignment.deadline_at,
                ),
                fmsCode:
                  currentAssignmentResult.fms?.fms_code ??
                  "FMS code unavailable",
                fmsName:
                  currentAssignmentResult.userProfile?.display_name ??
                  "FMS profile name unavailable",
                status:
                  ASSIGNMENT_STATUS_LABELS[
                    currentAssignmentResult.assignment.assignment_status
                  ] ?? currentAssignmentResult.assignment.assignment_status,
              }
            : null,
          gateMessage:
            assignableFmsResult.rows.length === 0 &&
            assignmentGateMessage === "Eligible for FMS assignment."
              ? "Eligible for FMS assignment, but no active FMS profiles are available."
              : assignmentGateMessage,
        },
        factoryReport: {
          availableSubmissions: approvedSubmissionsResult.submissions,
          canRelease:
            reportGateMessage ===
            "Approved FMS submissions are available for a sanitized importer report.",
          currentReport: factoryReport,
          packageLimitGuidance: reportLimit.guidance,
          releaseGateMessage: reportGateMessage,
          reportStatus: factoryReport?.statusLabel ?? "Not Started",
          reportStatusRaw: factoryReport?.status ?? "not_started",
        },
        package: {
          delivery: formatDelivery(packageRow),
          name: packageRow?.name ?? "Package pending",
          price: formatPrice(packageRow?.price_pkr),
        },
        project: projectListItem,
        requirements: {
          budget: requirement?.budget_range ?? "Not provided",
          importExperience: requirement?.import_experience ?? "Not provided",
          inputMethod:
            requirement?.input_methods.join(", ") || "Input method pending",
          productDetails:
            requirement?.product_description ?? "Product details pending",
          productLinks:
            requirement?.product_links.join(", ") || "No product link provided",
          quantity: requirement?.quantity ?? "Not provided",
          qualityLevel: requirement?.quality_level ?? "Not provided",
          specialNotes: requirement?.special_notes ?? "No special notes",
        },
        timeline:
          timelineRows.length > 0
            ? timelineRows.map((event, index) => ({
                id: event.id,
                eventId: event.id,
                createdAt: event.created_at,
                date: formatDate(event.created_at),
                label: event.title,
                state:
                  index === timelineRows.length - 1
                    ? ("current" as const)
                    : ("done" as const),
              }))
            : [
                {
                  date: formatDate(project.created_at),
                  label: "Project Created",
                  state: "current" as const,
                },
              ],
        totalServiceFee,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Supabase admin project detail is not configured yet.",
    };
  }
}

export async function listAdminUnpaidLeadsAction(
  accessToken: string,
): Promise<ActionResult<AdminLiveLeadListItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: leads, error: leadsError } = await supabase
      .from("unpaid_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (leadsError) {
      return { ok: false, message: leadsError.message };
    }

    const leadRows = leads ?? [];
    const importerIds = Array.from(
      new Set(
        leadRows
          .map((lead) => lead.importer_profile_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const packageIds = Array.from(
      new Set(
        leadRows
          .map((lead) => lead.package_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const importerResult = await getActiveImporterProfilesByIds(
      supabase,
      importerIds,
    );

    if (!importerResult.ok) {
      return importerResult;
    }

    const { data: packageRows } =
      packageIds.length > 0
        ? await supabase.from("packages").select("*").in("id", packageIds)
        : { data: [] };

    const importerMap = byId(importerResult.rows);
    const packageMap = byId(packageRows ?? []);

    return {
      ok: true,
      data: leadRows.map((lead) => {
        const importer = lead.importer_profile_id
          ? importerMap.get(lead.importer_profile_id)
          : null;
        const packageRow = lead.package_id
          ? packageMap.get(lead.package_id)
          : null;

        return {
          id: lead.id,
          city: importer?.city ?? "Not provided",
          contactForAdminOnly:
            importer?.phone_whatsapp ??
            "Hidden because active importer role was not found",
          createdDate: formatDate(lead.created_at),
          importerName:
            importer?.full_name ?? "Importer role inactive or profile pending",
          leadCode: lead.lead_code,
          leadStatus: LEAD_STATUS_LABELS[lead.lead_status] ?? lead.lead_status,
          packageSelected: packageRow?.name ?? "Package pending",
          paymentIssue:
            lead.payment_problem_reason ?? "Payment issue not provided",
          product: lead.product_summary,
        };
      }),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Supabase admin unpaid lead list is not configured yet.",
    };
  }
}
