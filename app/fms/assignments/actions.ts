"use server";

import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications/create-notification";
import { detectContactRiskInFields } from "@/lib/security/contact-firewall";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];
type AssignmentSubmissionStatus =
  Database["public"]["Enums"]["assignment_submission_status"];
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

export type LiveFmsAssignmentListItem = {
  adminFeedback: string;
  assignmentCode: string;
  category: string;
  deadline: string;
  milestoneStatus: string;
  packageName: string;
  product: string;
  projectCode: string;
  statusRaw: AssignmentStatus;
  submissionStatus: string;
};

export type LiveFmsAssignmentDetail = LiveFmsAssignmentListItem & {
  addOns: string[];
  brief: {
    budgetRange: string;
    importExperience: string;
    inputMethods: string;
    productDescription: string;
    productImagesPlaceholder: string;
    productLinks: string;
    qualityLevel: string;
    quantity: string;
    specialNotes: string;
  };
  canSubmitFactoryOption: boolean;
  factorySubmissions: LiveFmsFactorySubmission[];
  milestones: Array<{ completed: boolean; label: string }>;
  priority: string;
  submissionClosedReason: string;
};

export type LiveFmsFactorySubmission = {
  adminReviewStatus: string;
  cityProvince: string;
  createdAt: string;
  factoryDisplayName: string;
  productCategory: string;
  productMatchSummary: string;
  riskFlags: string[];
  submissionCode: string;
  submissionStatus: string;
};

export type FactoryOptionSubmissionInput = {
  cityProvince: string;
  contactPersonAdminOnly?: string;
  currency: string;
  customizationAvailability: string;
  estimatedUnitPrice: string;
  evidenceNotes: string;
  exactAddressAdminOnly?: string;
  factoryContactEmailAdminOnly?: string;
  factoryContactPhoneAdminOnly?: string;
  factoryDisplayName: string;
  factoryWebsiteAdminOnly?: string;
  mainProducts: string;
  moq: string;
  negotiationNotesForAdmin: string;
  packagingNotes: string;
  paymentNotesAdminOnly?: string;
  productCategory: string;
  productMatchSummary: string;
  productionLeadTime: string;
  qualityReliabilityNotes: string;
  riskNotes: string;
  sampleAvailability: string;
  wechatAdminOnly?: string;
};

export type LiveFmsDashboard = {
  assignments: LiveFmsAssignmentListItem[];
  stats: Array<{ detail: string; label: string; value: string }>;
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

const SUBMISSION_STATUS_LABELS: Record<AssignmentSubmissionStatus, string> = {
  approved_by_admin: "Approved by Admin",
  changes_requested: "Changes Requested",
  draft: "Draft",
  rejected: "Rejected",
  submitted_for_admin_review: "Submitted for Admin Review",
};

const ADMIN_REVIEW_STATUS_LABELS: Record<
  Database["public"]["Enums"]["admin_review_status"],
  string
> = {
  in_review: "In Review",
  needs_information: "Needs Information",
  not_started: "Not Started",
  ready_for_fms_assignment: "Approved",
  rejected: "Rejected",
};

const milestoneLabels: Record<string, string> = {
  evidence_uploaded: "Evidence uploaded",
  factory_details_collected: "Factory details collected",
  factory_research_started: "Factory research started",
  minimum_factory_options_identified: "Minimum factory options identified",
  quotations_collected: "Quotations collected",
  requirements_reviewed: "Requirements reviewed",
  submitted_to_admin_review: "Submitted to admin review",
};

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | undefined, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function trimOptional(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function splitList(value: string) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No deadline set";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function generateSubmissionCode() {
  const year = new Date().getFullYear();
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(10 + Math.random() * 90);

  return `FMSS-${year}-${timestampPart}${randomPart}`;
}

function isAssignmentOpenForFactorySubmission(status: AssignmentStatus) {
  return [
    "assigned",
    "requirements_reviewed",
    "factory_researching",
    "changes_requested",
  ].includes(status);
}

function getSubmissionClosedReason(status: AssignmentStatus) {
  if (status === "submitted_for_admin_review") {
    return "This assignment is under admin review. New factory submissions are paused until admin requests changes or reopens the work.";
  }

  if (status === "approved_by_admin" || status === "completed_by_admin") {
    return "This assignment is closed for new submissions because it has already been approved or completed by admin.";
  }

  if (status === "cancelled") {
    return "This assignment is cancelled and cannot accept new factory submissions.";
  }

  return "";
}

function mapFactorySubmission(
  submission: TableRow<"fms_factory_submissions">,
): LiveFmsFactorySubmission {
  const metadata = toJsonObject(submission.metadata);
  const riskFlags = Array.isArray(metadata.risk_flags)
    ? metadata.risk_flags.filter((item): item is string => typeof item === "string")
    : [];

  return {
    adminReviewStatus:
      ADMIN_REVIEW_STATUS_LABELS[submission.admin_review_status] ??
      submission.admin_review_status,
    cityProvince: submission.city_province ?? "Not provided",
    createdAt: formatDate(submission.created_at),
    factoryDisplayName:
      submission.factory_display_name ?? "Factory name pending",
    productCategory: submission.product_category ?? "Category pending",
    productMatchSummary: readString(
      metadata.product_match_summary,
      "No product match summary provided.",
    ),
    riskFlags,
    submissionCode: submission.submission_code,
    submissionStatus:
      SUBMISSION_STATUS_LABELS[submission.submission_status] ??
      submission.submission_status,
  };
}

async function requireFms(accessToken: string) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, [USER_ROLES.fms])) {
    return {
      ok: false as const,
      message: "Only active FMS users can view assigned sourcing work.",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data: fmsProfile, error: fmsError } = await supabase
    .from("fms_profiles")
    .select("*")
    .eq("user_profile_id", authCheck.profile.profileId)
    .eq("status", "active")
    .maybeSingle();

  if (fmsError || !fmsProfile) {
    return {
      ok: false as const,
      message:
        "Your FMS role is active, but your FMS profile is not active yet. Please contact admin.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    fmsProfile,
    profileId: authCheck.profile.profileId,
    supabase,
  };
}

function mapAssignmentListItem(
  assignment: TableRow<"fms_assignments">,
  project: TableRow<"import_projects"> | undefined,
  requirement: TableRow<"import_project_requirements"> | undefined,
  packageRow: TableRow<"packages"> | undefined,
): LiveFmsAssignmentListItem {
  const metadata = toJsonObject(assignment.metadata);
  const requirementMetadata = toJsonObject(requirement?.metadata);
  const product =
    requirement?.product_name ??
    requirement?.product_description ??
    "Product details pending";

  return {
    adminFeedback: readString(
      metadata.admin_assignment_notes,
      "No admin assignment note provided yet.",
    ),
    assignmentCode: assignment.assignment_code,
    category: readString(requirementMetadata.product_category, "Category pending"),
    deadline: formatDate(assignment.deadline_at),
    milestoneStatus:
      ASSIGNMENT_STATUS_LABELS[assignment.assignment_status] ??
      assignment.assignment_status,
    packageName: packageRow?.name ?? "Package pending",
    product,
    projectCode: project?.project_code ?? "Project code pending",
    statusRaw: assignment.assignment_status,
    submissionStatus:
      assignment.assignment_status === "approved_by_admin"
        ? "Approved by Admin"
        : assignment.assignment_status === "submitted_for_admin_review"
          ? "Pending Admin Review"
          : "Not Submitted",
  };
}

async function getAssignmentsForFms(
  accessToken: string,
): Promise<
  ActionResult<{
    assignments: TableRow<"fms_assignments">[];
    listItems: LiveFmsAssignmentListItem[];
    packageMap: Map<string, TableRow<"packages">>;
    projectMap: Map<string, TableRow<"import_projects">>;
    requirementMap: Map<string, TableRow<"import_project_requirements">>;
    supabase: ReturnType<typeof createAdminSupabaseClient>;
  }>
> {
  const fms = await requireFms(accessToken);

  if (!fms.ok) {
    return fms;
  }

  const { data: assignmentRows, error: assignmentError } = await fms.supabase
    .from("fms_assignments")
    .select("*")
    .eq("assigned_fms_user_id", fms.authUserId)
    .order("created_at", { ascending: false });

  if (assignmentError) {
    return { ok: false, message: assignmentError.message };
  }

  const assignments = assignmentRows ?? [];
  const projectIds = Array.from(
    new Set(assignments.map((assignment) => assignment.project_id)),
  );

  const { data: projectRows } =
    projectIds.length > 0
      ? await fms.supabase
          .from("import_projects")
          .select("id, project_code, package_id, payment_status, project_status, admin_review_status, created_at, updated_at, metadata")
          .in("id", projectIds)
      : { data: [] };

  const { data: requirementRows } =
    projectIds.length > 0
      ? await fms.supabase
          .from("import_project_requirements")
          .select("*")
          .in("project_id", projectIds)
      : { data: [] };

  const packageIds = Array.from(
    new Set(
      (projectRows ?? [])
        .map((project) => project.package_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const { data: packageRows } =
    packageIds.length > 0
      ? await fms.supabase.from("packages").select("*").in("id", packageIds)
      : { data: [] };

  const projectMap = byId((projectRows ?? []) as TableRow<"import_projects">[]);
  const requirementMap = new Map(
    (requirementRows ?? []).map((row) => [row.project_id, row]),
  );
  const packageMap = byId(packageRows ?? []);

  return {
    ok: true,
    data: {
      assignments,
      listItems: assignments.map((assignment) => {
        const project = projectMap.get(assignment.project_id);
        const packageRow = project?.package_id
          ? packageMap.get(project.package_id)
          : undefined;

        return mapAssignmentListItem(
          assignment,
          project,
          requirementMap.get(assignment.project_id),
          packageRow,
        );
      }),
      packageMap,
      projectMap,
      requirementMap,
      supabase: fms.supabase,
    },
  };
}

export async function listFmsAssignmentsAction(
  accessToken: string,
): Promise<ActionResult<LiveFmsAssignmentListItem[]>> {
  const result = await getAssignmentsForFms(accessToken);

  if (!result.ok) {
    return result;
  }

  return { ok: true, data: result.data.listItems };
}

export async function getFmsDashboardAction(
  accessToken: string,
): Promise<ActionResult<LiveFmsDashboard>> {
  const result = await getAssignmentsForFms(accessToken);

  if (!result.ok) {
    return result;
  }

  const assignments = result.data.listItems;
  const dueSoon = assignments.filter((assignment) => {
    const deadlineTime = Date.parse(assignment.deadline);

    return Number.isFinite(deadlineTime)
      ? deadlineTime - Date.now() < 1000 * 60 * 60 * 24 * 3
      : false;
  }).length;

  return {
    ok: true,
    data: {
      assignments,
      stats: [
        {
          detail: "Live Supabase assignments scoped to this FMS",
          label: "Active Assignments",
          value: String(
            assignments.filter(
              (assignment) =>
                assignment.statusRaw !== "cancelled" &&
                assignment.statusRaw !== "completed_by_admin",
            ).length,
          ),
        },
        {
          detail: "Deadlines within 72 hours when set",
          label: "Due Soon",
          value: String(dueSoon),
        },
        {
          detail: "Submitted factory options awaiting admin review",
          label: "Pending Admin Review",
          value: String(
            assignments.filter(
              (assignment) =>
                assignment.statusRaw === "submitted_for_admin_review",
            ).length,
          ),
        },
        {
          detail: "No payout workflow connected yet",
          label: "Completed This Month",
          value: String(
            assignments.filter(
              (assignment) => assignment.statusRaw === "completed_by_admin",
            ).length,
          ),
        },
      ],
    },
  };
}

export async function getFmsAssignmentDetailAction(
  accessToken: string,
  assignmentCode: string,
): Promise<ActionResult<LiveFmsAssignmentDetail>> {
  const result = await getAssignmentsForFms(accessToken);

  if (!result.ok) {
    return result;
  }

  const assignment = result.data.assignments.find(
    (row) => row.assignment_code === decodeURIComponent(assignmentCode),
  );

  if (!assignment) {
    return {
      ok: false,
      message: "This assignment was not found for the logged-in FMS.",
    };
  }

  const listItem = result.data.listItems.find(
    (item) => item.assignmentCode === assignment.assignment_code,
  );
  const project = result.data.projectMap.get(assignment.project_id);
  const requirement = result.data.requirementMap.get(assignment.project_id);
  const assignmentMetadata = toJsonObject(assignment.metadata);
  const projectAddonsResult = await result.data.supabase
    .from("import_project_addons")
    .select("*")
    .eq("project_id", assignment.project_id);
  const projectAddons = projectAddonsResult.data ?? [];
  const addonIds = projectAddons.map((addon) => addon.addon_id);
  const { data: addonRows } =
    addonIds.length > 0
      ? await result.data.supabase.from("addons").select("*").in("id", addonIds)
      : { data: [] };
  const addonMap = byId(addonRows ?? []);
  const { data: milestoneRows } = await result.data.supabase
    .from("fms_assignment_milestones")
    .select("*")
    .eq("assignment_id", assignment.id)
    .order("created_at", { ascending: true });
  const { data: submissionRows } = await result.data.supabase
    .from("fms_factory_submissions")
    .select("*")
    .eq("assignment_id", assignment.id)
    .order("created_at", { ascending: false });

  const milestones =
    milestoneRows && milestoneRows.length > 0
      ? milestoneRows.map((milestone) => ({
          completed: milestone.status === "completed",
          label: milestoneLabels[milestone.milestone_key] ?? milestone.milestone_key,
        }))
      : Object.entries(milestoneLabels).map(([key, label]) => ({
          completed:
            (key === "requirements_reviewed" &&
              assignment.assignment_status !== "assigned") ||
            (key === "factory_research_started" &&
              assignment.assignment_status === "factory_researching"),
          label,
        }));

  const mappedSubmissions = (submissionRows ?? []).map(mapFactorySubmission);
  const submissionStatus =
    mappedSubmissions.some(
      (submission) => submission.submissionStatus === "Approved by Admin",
    )
      ? "Approved by Admin"
      : mappedSubmissions.some(
            (submission) =>
              submission.submissionStatus === "Submitted for Admin Review",
          )
        ? "Pending Admin Review"
        : mappedSubmissions.length > 0
          ? "Submitted"
          : listItem?.submissionStatus ?? "Not Submitted";

  return {
    ok: true,
    data: {
      ...(listItem ??
        mapAssignmentListItem(
          assignment,
          project,
          requirement,
          project?.package_id
            ? result.data.packageMap.get(project.package_id)
            : undefined,
        )),
      submissionStatus,
      addOns:
        projectAddons.length > 0
          ? projectAddons.map((selected) => {
              const addon = addonMap.get(selected.addon_id);
              return addon?.name ?? "Selected add-on";
            })
          : [],
      brief: {
        budgetRange: requirement?.budget_range ?? "Not provided",
        importExperience: requirement?.import_experience ?? "Not provided",
        inputMethods:
          requirement?.input_methods.join(", ") || "Input method pending",
        productDescription:
          requirement?.product_description ??
          requirement?.product_name ??
          "Product details pending",
        productImagesPlaceholder:
          "FMS sees only admin-approved product reference files and text requirements.",
        productLinks:
          requirement?.product_links.join(", ") || "No product link provided",
        qualityLevel: requirement?.quality_level ?? "Not provided",
        quantity: requirement?.quantity ?? "Not provided",
        specialNotes: requirement?.special_notes ?? "No special notes",
      },
      canSubmitFactoryOption: isAssignmentOpenForFactorySubmission(
        assignment.assignment_status,
      ),
      factorySubmissions: mappedSubmissions,
      milestones,
      priority: readString(assignmentMetadata.priority, "normal"),
      submissionClosedReason: getSubmissionClosedReason(
        assignment.assignment_status,
      ),
    },
  };
}

export async function submitFactoryOptionForAdminReviewAction(
  accessToken: string,
  assignmentCode: string,
  input: FactoryOptionSubmissionInput,
): Promise<ActionResult<LiveFmsAssignmentDetail>> {
  const fms = await requireFms(accessToken);

  if (!fms.ok) {
    return fms;
  }

  const { data: assignment, error: assignmentError } = await fms.supabase
    .from("fms_assignments")
    .select("*")
    .eq("assignment_code", decodeURIComponent(assignmentCode))
    .eq("assigned_fms_user_id", fms.authUserId)
    .maybeSingle();

  if (assignmentError || !assignment) {
    return {
      ok: false,
      message:
        assignmentError?.message ??
        "This assignment was not found for the logged-in FMS.",
    };
  }

  if (!isAssignmentOpenForFactorySubmission(assignment.assignment_status)) {
    return {
      ok: false,
      message:
        getSubmissionClosedReason(assignment.assignment_status) ||
        "This assignment is not open for new factory submissions.",
    };
  }

  const factoryDisplayName = trimOptional(input.factoryDisplayName);
  const productMatchSummary = trimOptional(input.productMatchSummary);
  const productCategory = trimOptional(input.productCategory);

  if (!factoryDisplayName || !productMatchSummary || !productCategory) {
    return {
      ok: false,
      message:
        "Factory/company name, product match summary, and product category are required.",
    };
  }

  const cityProvince = trimOptional(input.cityProvince);
  const estimatedUnitPrice = trimOptional(input.estimatedUnitPrice);
  const currency = trimOptional(input.currency) ?? "CNY";
  const moq = trimOptional(input.moq);
  const productionLeadTime = trimOptional(input.productionLeadTime);
  const sampleAvailability = trimOptional(input.sampleAvailability);
  const packagingNotes = trimOptional(input.packagingNotes);
  const customizationAvailability = trimOptional(input.customizationAvailability);
  const qualityReliabilityNotes = trimOptional(input.qualityReliabilityNotes);
  const evidenceNotes = trimOptional(input.evidenceNotes);
  const mainProducts = splitList(input.mainProducts);

  const firewall = detectContactRiskInFields([
    { label: "Factory/company name", value: factoryDisplayName },
    { label: "Product match summary", value: productMatchSummary },
    { label: "Product category", value: productCategory },
    { label: "City/province", value: cityProvince },
    { label: "Estimated unit price", value: estimatedUnitPrice },
    { label: "MOQ", value: moq },
    { label: "Sample availability", value: sampleAvailability },
    { label: "Production lead time", value: productionLeadTime },
    { label: "Packaging notes", value: packagingNotes },
    {
      label: "Customization/private label availability",
      value: customizationAvailability,
    },
    { label: "Quality/reliability notes", value: qualityReliabilityNotes },
    { label: "Evidence notes", value: evidenceNotes },
  ]);

  if (firewall.flags.length > 0) {
    return {
      ok: false,
      message: `Remove contact/payment details from importer-facing fields before submission: ${firewall.messages.join(" ")}`,
    };
  }

  const now = new Date().toISOString();
  const priceRange = estimatedUnitPrice
    ? `${estimatedUnitPrice} ${currency}`
    : null;
  const submissionCode = generateSubmissionCode();
  const metadata: JsonObject = {
    admin_only_contact: {
      contact_person: trimOptional(input.contactPersonAdminOnly),
      email: trimOptional(input.factoryContactEmailAdminOnly),
      exact_address: trimOptional(input.exactAddressAdminOnly),
      payment_notes: trimOptional(input.paymentNotesAdminOnly),
      phone: trimOptional(input.factoryContactPhoneAdminOnly),
      website_url: trimOptional(input.factoryWebsiteAdminOnly),
      wechat: trimOptional(input.wechatAdminOnly),
    },
    contact_firewall_checked_at: now,
    contact_firewall_policy:
      "Importer-facing fields are blocked if contact or payment details are detected. Admin-only contact fields are private.",
    currency,
    customization_availability: customizationAvailability,
    evidence_notes: evidenceNotes,
    estimated_unit_price: estimatedUnitPrice,
    negotiation_notes_for_admin: trimOptional(input.negotiationNotesForAdmin),
    packaging_notes: packagingNotes,
    product_match_summary: productMatchSummary,
    quality_reliability_notes: qualityReliabilityNotes,
    risk_flags: firewall.flags,
    risk_notes: trimOptional(input.riskNotes),
    sample_availability: sampleAvailability,
    submitted_to_admin_only: true,
  };

  const { data: submission, error: submissionError } = await fms.supabase
    .from("fms_factory_submissions")
    .insert({
      assignment_id: assignment.id,
      city_province: cityProvince,
      created_by: fms.authUserId,
      factory_display_name: factoryDisplayName,
      main_products: mainProducts,
      metadata,
      moq,
      price_range: priceRange,
      product_category: productCategory,
      production_time: productionLeadTime,
      submission_code: submissionCode,
      submission_status: "submitted_for_admin_review",
      admin_review_status: "in_review",
    })
    .select("*")
    .single();

  if (submissionError || !submission) {
    return {
      ok: false,
      message:
        submissionError?.message ??
        "Factory option submission could not be saved.",
    };
  }

  const milestoneKeys = [
    "minimum_factory_options_identified",
    "factory_details_collected",
    "quotations_collected",
    "submitted_to_admin_review",
  ];

  if (evidenceNotes) {
    milestoneKeys.push("evidence_uploaded");
  }

  const writes: PromiseLike<{ error: { message: string } | null }>[] = [
    fms.supabase
      .from("fms_assignments")
      .update({
        assignment_status: "submitted_for_admin_review",
        submitted_for_admin_review_at: now,
        updated_by: fms.authUserId,
      })
      .eq("id", assignment.id),
    fms.supabase.from("fms_assignment_milestones").upsert(
      milestoneKeys.map((milestoneKey) => ({
        assignment_id: assignment.id,
        completed_at: now,
        created_by: fms.authUserId,
        metadata: {
          phase: "phase_6_factory_option_submission",
          submission_code: submission.submission_code,
        },
        milestone_key: milestoneKey,
        status: "completed",
        updated_by: fms.authUserId,
      })),
      { onConflict: "assignment_id,milestone_key" },
    ),
    fms.supabase.from("import_project_timeline_events").insert({
      body:
        "FMS submitted factory option details for admin review. Raw submission remains hidden from importer.",
      created_by: fms.authUserId,
      event_type: "fms_factory_options_submitted",
      metadata: {
        assignment_code: assignment.assignment_code,
        submission_code: submission.submission_code,
      },
      project_id: assignment.project_id,
      title: "FMS submitted factory options for admin review",
      visible_to_agent: false,
      visible_to_fms: true,
      visible_to_importer: false,
    }),
  ];

  if (evidenceNotes) {
    writes.push(
      fms.supabase.from("fms_submission_evidence").insert({
        created_by: fms.authUserId,
        evidence_type: "fms_evidence_notes",
        metadata: {
          evidence_notes: evidenceNotes,
          file_upload_status: "placeholder_not_connected",
          submission_code: submission.submission_code,
        },
        review_status: "pending_review",
        submission_id: submission.id,
      }),
    );
  }

  const { data: project } = await fms.supabase
    .from("import_projects")
    .select("project_status")
    .eq("id", assignment.project_id)
    .maybeSingle();

  if (project?.project_status !== "factory_options_submitted") {
    writes.push(
      fms.supabase.from("import_project_status_history").insert({
        changed_by: fms.authUserId,
        from_status: project?.project_status ?? "fms_working",
        metadata: {
          assignment_code: assignment.assignment_code,
          submission_code: submission.submission_code,
          visibility: "admin_only_review",
        },
        project_id: assignment.project_id,
        reason: "FMS submitted factory options for admin review",
        to_status: "factory_options_submitted",
      }),
      fms.supabase
        .from("import_projects")
        .update({
          project_status: "factory_options_submitted",
          updated_by: fms.authUserId,
        })
        .eq("id", assignment.project_id),
    );
  }

  const writeResults = await Promise.all(writes);
  const writeError = writeResults.find((result) => result.error)?.error;

  if (writeError) {
    return { ok: false, message: writeError.message };
  }

  await createNotification(
    {
      actionUrl: `/admin/factory-submissions/${submission.submission_code}`,
      actorProfileId: fms.profileId,
      assignmentId: assignment.id,
      priority: "high",
      projectId: assignment.project_id,
      recipientRole: USER_ROLES.admin,
      submissionId: submission.id,
      templateContext: {
        assignmentCode: assignment.assignment_code,
        submissionCode: submission.submission_code,
      },
      type: "fms_factory_submission_received",
    },
    fms.supabase,
  );

  return getFmsAssignmentDetailAction(accessToken, assignment.assignment_code);
}

export async function updateFmsAssignmentProgressAction(
  accessToken: string,
  assignmentCode: string,
  intent: "accept" | "start_research",
): Promise<ActionResult<LiveFmsAssignmentDetail>> {
  const fms = await requireFms(accessToken);

  if (!fms.ok) {
    return fms;
  }

  const { data: assignment, error: assignmentError } = await fms.supabase
    .from("fms_assignments")
    .select("*")
    .eq("assignment_code", decodeURIComponent(assignmentCode))
    .eq("assigned_fms_user_id", fms.authUserId)
    .maybeSingle();

  if (assignmentError || !assignment) {
    return {
      ok: false,
      message:
        assignmentError?.message ??
        "This assignment was not found for the logged-in FMS.",
    };
  }

  const nextStatus: AssignmentStatus =
    intent === "accept" ? "requirements_reviewed" : "factory_researching";

  if (
    intent === "accept" &&
    assignment.assignment_status !== "assigned"
  ) {
    return {
      ok: false,
      message: "Only newly assigned work can be accepted in this phase.",
    };
  }

  if (
    intent === "start_research" &&
    !["assigned", "requirements_reviewed"].includes(assignment.assignment_status)
  ) {
    return {
      ok: false,
      message:
        "Factory research can start only from assigned or requirements-reviewed status.",
    };
  }

  const now = new Date().toISOString();
  const milestoneKey =
    intent === "accept" ? "requirements_reviewed" : "factory_research_started";
  const timelineTitle =
    intent === "accept"
      ? "FMS accepted assignment"
      : "Factory research started";

  const [{ error: updateError }, { error: milestoneError }] = await Promise.all([
    fms.supabase
      .from("fms_assignments")
      .update({
        assignment_status: nextStatus,
        updated_by: fms.authUserId,
      })
      .eq("id", assignment.id),
    fms.supabase
      .from("fms_assignment_milestones")
      .update({
        completed_at: now,
        status: "completed",
        updated_by: fms.authUserId,
      })
      .eq("assignment_id", assignment.id)
      .eq("milestone_key", milestoneKey),
  ]);

  if (updateError || milestoneError) {
    return {
      ok: false,
      message:
        updateError?.message ??
        milestoneError?.message ??
        "Assignment progress could not be updated.",
    };
  }

  const writes: PromiseLike<{ error: { message: string } | null }>[] = [
    fms.supabase.from("import_project_timeline_events").insert({
      body:
        intent === "accept"
          ? "FMS reviewed the assignment brief. Importer contact details remain hidden."
          : "FMS started factory research. Factory options must be submitted for admin review.",
      created_by: fms.authUserId,
      event_type: intent === "accept" ? "fms_assignment_accepted" : "fms_research_started",
      metadata: {
        assignment_code: assignment.assignment_code,
      },
      project_id: assignment.project_id,
      title: timelineTitle,
      visible_to_agent: false,
      visible_to_fms: true,
      visible_to_importer: false,
    }),
  ];

  if (intent === "start_research") {
    const { data: project } = await fms.supabase
      .from("import_projects")
      .select("project_status")
      .eq("id", assignment.project_id)
      .maybeSingle();

    if (project?.project_status !== "fms_working") {
      writes.push(
        fms.supabase.from("import_project_status_history").insert({
          changed_by: fms.authUserId,
          from_status: project?.project_status ?? "fms_assigned",
          metadata: {
            assignment_code: assignment.assignment_code,
          },
          project_id: assignment.project_id,
          reason: "FMS started factory research",
          to_status: "fms_working",
        }),
      );
    }

    writes.push(
      fms.supabase
        .from("import_projects")
        .update({
          project_status: "fms_working",
          updated_by: fms.authUserId,
        })
        .eq("id", assignment.project_id),
    );
  }

  const writeResults = await Promise.all(writes);
  const writeError = writeResults.find((result) => result.error)?.error;

  if (writeError) {
    return { ok: false, message: writeError.message };
  }

  return getFmsAssignmentDetailAction(accessToken, assignment.assignment_code);
}
