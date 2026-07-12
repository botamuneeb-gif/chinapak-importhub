"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/config/brand";
import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { createNotification } from "@/lib/notifications/create-notification";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type ProjectStatus = Database["public"]["Enums"]["project_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type AdminReviewStatus = Database["public"]["Enums"]["admin_review_status"];
type JsonObject = { [key: string]: Json | undefined };

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

export type ProjectManagerWorkflowState =
  | "manager_reviewing"
  | "needs_importer_info"
  | "ready_for_admin_review"
  | "waiting_internal_action"
  | "escalated_to_admin";

export type ProjectManagerProjectListItem = {
  adminReviewStatus: string;
  adminReviewStatusRaw: AdminReviewStatus;
  createdAt: string;
  id: string;
  importerCity: string;
  importerName: string;
  managerWorkflowLabel: string;
  managerWorkflowState: ProjectManagerWorkflowState | "not_set";
  packageName: string;
  paymentStatus: string;
  paymentStatusRaw: PaymentStatus;
  product: string;
  projectCode: string;
  projectStatus: string;
  projectStatusRaw: ProjectStatus;
  updatedAt: string;
};

export type ProjectManagerTimelineItem = {
  body: string;
  createdAt: string;
  id: string;
  label: string;
  type: string;
};

export type ProjectManagerInternalNote = {
  authorLabel: string;
  body: string;
  createdAt: string;
  id: string;
  type: string;
};

export type ProjectManagerProjectDetail = {
  addons: Array<{
    name: string;
    price: string;
  }>;
  assignment: {
    assignmentCode: string;
    status: string;
  } | null;
  importer: {
    businessType: string;
    city: string;
    name: string;
  };
  managerWorkflow: {
    escalationReason: string;
    escalationStatus: string;
    label: string;
    note: string;
    state: ProjectManagerWorkflowState | "not_set";
    updatedAt: string;
  };
  notes: ProjectManagerInternalNote[];
  package: {
    name: string;
    price: string;
  };
  project: ProjectManagerProjectListItem;
  reportReadiness: {
    optionCount: number;
    readinessLabel: string;
    status: string;
    statusLabel: string;
  };
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
  timeline: ProjectManagerTimelineItem[];
};

export type ProjectManagerDashboardData = {
  counts: {
    escalated: number;
    needsImporterInfo: number;
    pendingAdminAction: number;
    total: number;
  };
  needsAttention: ProjectManagerProjectListItem[];
  recentProjects: ProjectManagerProjectListItem[];
};

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
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
  ready_for_fms_assignment: "Approved for Sourcing",
  rejected: "Rejected",
};

const MANAGER_WORKFLOW_LABELS: Record<
  ProjectManagerWorkflowState | "not_set",
  string
> = {
  escalated_to_admin: "Escalated to Admin",
  manager_reviewing: "Manager Reviewing",
  needs_importer_info: "Needs Importer Info",
  not_set: "Not Set",
  ready_for_admin_review: "Ready for Admin Review",
  waiting_internal_action: "Waiting Internal Action",
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

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function getManagerWorkflowState(
  metadata: Json | null | undefined,
): ProjectManagerWorkflowState | "not_set" {
  const managerWorkflow = toJsonObject(toJsonObject(metadata).project_manager_workflow);
  const state = readString(managerWorkflow.status);

  if (
    state === "manager_reviewing" ||
    state === "needs_importer_info" ||
    state === "ready_for_admin_review" ||
    state === "waiting_internal_action" ||
    state === "escalated_to_admin"
  ) {
    return state;
  }

  return "not_set";
}

function getRequirementProduct(
  requirement: TableRow<"import_project_requirements"> | undefined,
) {
  return (
    requirement?.product_name ??
    requirement?.product_description?.slice(0, 90) ??
    "Product details pending"
  );
}

function getReportReadiness(metadata: Json | null | undefined) {
  const report = toJsonObject(toJsonObject(metadata).phase_7_factory_report);
  const status = readString(report.status);
  const readiness = toJsonObject(report.readiness);
  const options = Array.isArray(report.options) ? report.options : [];
  const statusLabel =
    status === "released_to_importer"
      ? "Released to Importer"
      : status === "updated"
        ? "Updated and Released"
        : status === "draft"
          ? "Draft"
          : status === "withdrawn"
            ? "Withdrawn"
            : "Not started";

  return {
    optionCount: options.length,
    readinessLabel: readString(readiness.statusLabel, "Report not started"),
    status: status || "not_started",
    statusLabel,
  };
}

function mapListItem(
  project: TableRow<"import_projects">,
  importer: TableRow<"importer_profiles"> | undefined,
  requirement: TableRow<"import_project_requirements"> | undefined,
  packageRow: TableRow<"packages"> | undefined,
): ProjectManagerProjectListItem {
  const workflowState = getManagerWorkflowState(project.metadata);

  return {
    adminReviewStatus:
      ADMIN_REVIEW_STATUS_LABELS[project.admin_review_status] ??
      project.admin_review_status,
    adminReviewStatusRaw: project.admin_review_status,
    createdAt: formatDate(project.created_at),
    id: project.id,
    importerCity: importer?.city ?? "Not provided",
    importerName: importer?.full_name ?? "Importer profile unavailable",
    managerWorkflowLabel: MANAGER_WORKFLOW_LABELS[workflowState],
    managerWorkflowState: workflowState,
    packageName: packageRow?.name ?? "Package pending",
    paymentStatus:
      PAYMENT_STATUS_LABELS[project.payment_status] ?? project.payment_status,
    paymentStatusRaw: project.payment_status,
    product: getRequirementProduct(requirement),
    projectCode: project.project_code,
    projectStatus:
      PROJECT_STATUS_LABELS[project.project_status] ?? project.project_status,
    projectStatusRaw: project.project_status,
    updatedAt: formatDate(project.updated_at),
  };
}

async function requireProjectManager(accessToken: string) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, [USER_ROLES.projectManager])) {
    return {
      ok: false as const,
      message: "This account cannot access the Project Manager portal.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    displayName: authCheck.profile.displayName,
    profileId: authCheck.profile.profileId,
    supabase: createAdminSupabaseClient(),
  };
}

async function getProjectByIdentifier(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  identifier: string,
) {
  const decoded = decodeURIComponent(identifier);
  const { data: projectByCode, error: codeError } = await supabase
    .from("import_projects")
    .select("*")
    .eq("project_code", decoded)
    .maybeSingle();

  if (codeError || projectByCode) {
    return { data: projectByCode, error: codeError };
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(decoded)) {
    return { data: null, error: null };
  }

  return supabase.from("import_projects").select("*").eq("id", decoded).maybeSingle();
}

async function loadProjectList(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
) {
  const { data: projects, error } = await supabase
    .from("import_projects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(150);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  const projectRows = projects ?? [];
  const projectIds = projectRows.map((project) => project.id);
  const importerIds = Array.from(
    new Set(projectRows.map((project) => project.importer_profile_id)),
  );
  const packageIds = Array.from(
    new Set(projectRows.map((project) => project.package_id).filter(Boolean)),
  ) as string[];

  const [importersResult, requirementsResult, packagesResult] =
    await Promise.all([
      importerIds.length > 0
        ? supabase.from("importer_profiles").select("*").in("id", importerIds)
        : Promise.resolve({ data: [], error: null }),
      projectIds.length > 0
        ? supabase
            .from("import_project_requirements")
            .select("*")
            .in("project_id", projectIds)
        : Promise.resolve({ data: [], error: null }),
      packageIds.length > 0
        ? supabase.from("packages").select("*").in("id", packageIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (importersResult.error || requirementsResult.error || packagesResult.error) {
    return {
      ok: false as const,
      message:
        importersResult.error?.message ??
        requirementsResult.error?.message ??
        packagesResult.error?.message ??
        "Project Manager project data could not be loaded.",
    };
  }

  const importerMap = byId(importersResult.data ?? []);
  const requirementMap = new Map(
    (requirementsResult.data ?? []).map((row) => [row.project_id, row]),
  );
  const packageMap = byId(packagesResult.data ?? []);

  return {
    ok: true as const,
    rows: projectRows.map((project) =>
      mapListItem(
        project,
        importerMap.get(project.importer_profile_id),
        requirementMap.get(project.id),
        project.package_id ? packageMap.get(project.package_id) : undefined,
      ),
    ),
  };
}

export async function listProjectManagerProjectsAction(
  accessToken: string,
): Promise<ActionResult<ProjectManagerProjectListItem[]>> {
  const projectManager = await requireProjectManager(accessToken);

  if (!projectManager.ok) {
    return projectManager;
  }

  const result = await loadProjectList(projectManager.supabase);

  if (!result.ok) {
    return result;
  }

  return { ok: true, data: result.rows };
}

export async function getProjectManagerDashboardAction(
  accessToken: string,
): Promise<ActionResult<ProjectManagerDashboardData>> {
  const projectManager = await requireProjectManager(accessToken);

  if (!projectManager.ok) {
    return projectManager;
  }

  const result = await loadProjectList(projectManager.supabase);

  if (!result.ok) {
    return result;
  }

  const rows = result.rows;
  const needsAttention = rows.filter(
    (project) =>
      project.managerWorkflowState === "needs_importer_info" ||
      project.managerWorkflowState === "escalated_to_admin" ||
      project.adminReviewStatusRaw === "needs_information" ||
      project.projectStatusRaw === "admin_quality_review" ||
      project.projectStatusRaw === "factory_options_submitted",
  );

  return {
    ok: true,
    data: {
      counts: {
        escalated: rows.filter(
          (project) => project.managerWorkflowState === "escalated_to_admin",
        ).length,
        needsImporterInfo: rows.filter(
          (project) => project.managerWorkflowState === "needs_importer_info",
        ).length,
        pendingAdminAction: rows.filter(
          (project) =>
            project.managerWorkflowState === "ready_for_admin_review" ||
            project.managerWorkflowState === "escalated_to_admin",
        ).length,
        total: rows.length,
      },
      needsAttention: needsAttention.slice(0, 8),
      recentProjects: rows.slice(0, 8),
    },
  };
}

export async function getProjectManagerProjectDetailAction(
  accessToken: string,
  projectIdentifier: string,
): Promise<ActionResult<ProjectManagerProjectDetail>> {
  const projectManager = await requireProjectManager(accessToken);

  if (!projectManager.ok) {
    return projectManager;
  }

  const { data: project, error: projectError } = await getProjectByIdentifier(
    projectManager.supabase,
    projectIdentifier,
  );

  if (projectError || !project) {
    return {
      ok: false,
      message: projectError?.message ?? "This Import Project was not found.",
    };
  }

  const [
    importerResult,
    requirementResult,
    packageResult,
    selectedAddonsResult,
    timelineResult,
    notesResult,
    assignmentResult,
  ] = await Promise.all([
    projectManager.supabase
      .from("importer_profiles")
      .select("*")
      .eq("id", project.importer_profile_id)
      .maybeSingle(),
    projectManager.supabase
      .from("import_project_requirements")
      .select("*")
      .eq("project_id", project.id)
      .maybeSingle(),
    project.package_id
      ? projectManager.supabase
          .from("packages")
          .select("*")
          .eq("id", project.package_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    projectManager.supabase
      .from("import_project_addons")
      .select("*")
      .eq("project_id", project.id),
    projectManager.supabase
      .from("import_project_timeline_events")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true }),
    projectManager.supabase
      .from("import_project_internal_notes")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .limit(20),
    projectManager.supabase
      .from("fms_assignments")
      .select("assignment_code, assignment_status")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (importerResult.error || requirementResult.error || packageResult.error) {
    return {
      ok: false,
      message:
        importerResult.error?.message ??
        requirementResult.error?.message ??
        packageResult.error?.message ??
        "Project detail could not be loaded.",
    };
  }

  const selectedAddons = selectedAddonsResult.data ?? [];
  const addonIds = selectedAddons.map((selected) => selected.addon_id);
  const { data: addonRows } =
    addonIds.length > 0
      ? await projectManager.supabase.from("addons").select("*").in("id", addonIds)
      : { data: [] };
  const addonMap = byId(addonRows ?? []);
  const workflowMetadata = toJsonObject(toJsonObject(project.metadata).project_manager_workflow);
  const escalationMetadata = toJsonObject(toJsonObject(project.metadata).project_manager_escalation);
  const workflowState = getManagerWorkflowState(project.metadata);
  const importer = importerResult.data;
  const requirement = requirementResult.data;
  const packageRow = packageResult.data;
  const listItem = mapListItem(
    project,
    importer ?? undefined,
    requirement ?? undefined,
    packageRow ?? undefined,
  );

  return {
    ok: true,
    data: {
      addons: selectedAddons.map((selected) => {
        const addon = addonMap.get(selected.addon_id);

        return {
          name: addon?.name ?? "Selected add-on",
          price: formatPrice(selected.price_snapshot_pkr),
        };
      }),
      assignment: assignmentResult.data?.[0]
        ? {
            assignmentCode: assignmentResult.data[0].assignment_code,
            status: assignmentResult.data[0].assignment_status.replaceAll("_", " "),
          }
        : null,
      importer: {
        businessType: importer?.business_type ?? "Not provided",
        city: importer?.city ?? "Not provided",
        name: importer?.full_name ?? "Importer profile unavailable",
      },
      managerWorkflow: {
        escalationReason: readString(escalationMetadata.reason, "No escalation reason recorded"),
        escalationStatus: readString(escalationMetadata.status, "Not escalated"),
        label: MANAGER_WORKFLOW_LABELS[workflowState],
        note: readString(workflowMetadata.note, "No manager workflow note recorded"),
        state: workflowState,
        updatedAt: formatDate(readString(workflowMetadata.updated_at, "")),
      },
      notes: (notesResult.data ?? []).map((note) => ({
        authorLabel: readString(
          toJsonObject(note.metadata).author_display_name,
          "Internal operator",
        ),
        body: note.note_body,
        createdAt: formatDate(note.created_at),
        id: note.id,
        type: note.note_type,
      })),
      package: {
        name: packageRow?.name ?? "Package pending",
        price: formatPrice(packageRow?.price_pkr),
      },
      project: listItem,
      reportReadiness: getReportReadiness(project.metadata),
      requirements: {
        budget: requirement?.budget_range ?? "Not provided",
        importExperience: requirement?.import_experience ?? "Not provided",
        inputMethod: requirement?.input_methods.join(", ") || "Not provided",
        productDetails:
          requirement?.product_description ?? "Product details pending",
        productLinks:
          requirement?.product_links.join(", ") || "No product link provided",
        quantity: requirement?.quantity ?? "Not provided",
        qualityLevel: requirement?.quality_level ?? "Not provided",
        specialNotes: requirement?.special_notes ?? "No special notes",
      },
      timeline: (timelineResult.data ?? []).map((event) => ({
        body: event.body ?? "",
        createdAt: formatDate(event.created_at),
        id: event.id,
        label: event.title,
        type: event.event_type,
      })),
    },
  };
}

export async function addProjectManagerNoteAction(
  accessToken: string,
  projectIdentifier: string,
  noteBody: string,
): Promise<ActionResult<ProjectManagerProjectDetail>> {
  const projectManager = await requireProjectManager(accessToken);

  if (!projectManager.ok) {
    return projectManager;
  }

  const body = noteBody.trim();

  if (body.length < 4) {
    return { ok: false, message: "Write a clear internal note first." };
  }

  const { data: project, error: projectError } = await getProjectByIdentifier(
    projectManager.supabase,
    projectIdentifier,
  );

  if (projectError || !project) {
    return {
      ok: false,
      message: projectError?.message ?? "This Import Project was not found.",
    };
  }

  const metadata = {
    author_display_name: projectManager.displayName ?? "Project Manager",
    author_profile_id: projectManager.profileId,
    author_role: USER_ROLES.projectManager,
    source: "project_manager_portal",
  };

  const [noteResult, timelineResult] = await Promise.all([
    projectManager.supabase.from("import_project_internal_notes").insert({
      created_by: projectManager.authUserId,
      metadata,
      note_body: body,
      note_type: "project_manager_note",
      project_id: project.id,
      updated_by: projectManager.authUserId,
    }),
    projectManager.supabase.from("import_project_timeline_events").insert({
      body: "Project Manager added an internal operational note.",
      created_by: projectManager.authUserId,
      event_type: "project_manager_note",
      metadata,
      project_id: project.id,
      title: "Project Manager note added",
      visible_to_agent: false,
      visible_to_fms: false,
      visible_to_importer: false,
    }),
  ]);

  if (noteResult.error || timelineResult.error) {
    return {
      ok: false,
      message:
        noteResult.error?.message ??
        timelineResult.error?.message ??
        "Project Manager note could not be saved.",
    };
  }

  const audit = await writeAuditLog(
    {
      action: "project_manager_internal_note_added",
      actorRole: USER_ROLES.projectManager,
      actorUserId: projectManager.authUserId,
      afterData: {
        note_length: body.length,
        note_type: "project_manager_note",
        project_code: project.project_code,
      },
      entityId: project.id,
      entityType: "import_project",
      metadata: {
        actor_profile_id: projectManager.profileId,
        project_code: project.project_code,
      },
    },
    projectManager.supabase,
  );

  if (!audit.ok) {
    return { ok: false, message: audit.message };
  }

  revalidatePath(ROUTES.projectManagerDashboard);
  revalidatePath(ROUTES.projectManagerProjects);
  revalidatePath(`${ROUTES.projectManagerProjects}/${project.project_code}`);

  const detail = await getProjectManagerProjectDetailAction(
    accessToken,
    project.project_code,
  );

  return detail.ok
    ? { ...detail, message: "Internal Project Manager note saved." }
    : detail;
}

export async function updateProjectManagerWorkflowAction(
  accessToken: string,
  projectIdentifier: string,
  input: {
    note?: string;
    state: ProjectManagerWorkflowState;
  },
): Promise<ActionResult<ProjectManagerProjectDetail>> {
  const projectManager = await requireProjectManager(accessToken);

  if (!projectManager.ok) {
    return projectManager;
  }

  if (!MANAGER_WORKFLOW_LABELS[input.state]) {
    return { ok: false, message: "Unsupported Project Manager workflow state." };
  }

  const { data: project, error: projectError } = await getProjectByIdentifier(
    projectManager.supabase,
    projectIdentifier,
  );

  if (projectError || !project) {
    return {
      ok: false,
      message: projectError?.message ?? "This Import Project was not found.",
    };
  }

  const existingMetadata = toJsonObject(project.metadata);
  const existingWorkflow = toJsonObject(existingMetadata.project_manager_workflow);
  const updatedWorkflow = {
    ...existingWorkflow,
    label: MANAGER_WORKFLOW_LABELS[input.state],
    note: input.note?.trim() ?? "",
    status: input.state,
    updated_at: new Date().toISOString(),
    updated_by_profile_id: projectManager.profileId,
  };
  const nextMetadata = {
    ...existingMetadata,
    project_manager_workflow: updatedWorkflow,
  };

  const { error: updateError } = await projectManager.supabase
    .from("import_projects")
    .update({
      metadata: nextMetadata,
      updated_by: projectManager.authUserId,
    })
    .eq("id", project.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  const { error: timelineError } = await projectManager.supabase
    .from("import_project_timeline_events")
    .insert({
      body: input.note?.trim() || null,
      created_by: projectManager.authUserId,
      event_type: "project_manager_workflow_marker",
      metadata: {
        next_state: input.state,
        previous_state: readString(existingWorkflow.status, "not_set"),
        project_manager_profile_id: projectManager.profileId,
      },
      project_id: project.id,
      title: `Project Manager marker: ${MANAGER_WORKFLOW_LABELS[input.state]}`,
      visible_to_agent: false,
      visible_to_fms: false,
      visible_to_importer: false,
    });

  if (timelineError) {
    return { ok: false, message: timelineError.message };
  }

  const audit = await writeAuditLog(
    {
      action: "project_manager_workflow_marker_updated",
      actorRole: USER_ROLES.projectManager,
      actorUserId: projectManager.authUserId,
      afterData: {
        project_manager_workflow: updatedWorkflow,
      },
      beforeData: {
        project_manager_workflow: existingWorkflow,
      },
      entityId: project.id,
      entityType: "import_project",
      metadata: {
        actor_profile_id: projectManager.profileId,
        project_code: project.project_code,
      },
    },
    projectManager.supabase,
  );

  if (!audit.ok) {
    return { ok: false, message: audit.message };
  }

  revalidatePath(ROUTES.projectManagerDashboard);
  revalidatePath(ROUTES.projectManagerProjects);
  revalidatePath(`${ROUTES.projectManagerProjects}/${project.project_code}`);

  const detail = await getProjectManagerProjectDetailAction(
    accessToken,
    project.project_code,
  );

  return detail.ok
    ? {
        ...detail,
        message: `Project Manager marker updated to ${MANAGER_WORKFLOW_LABELS[input.state]}.`,
      }
    : detail;
}

export async function escalateProjectToAdminAction(
  accessToken: string,
  projectIdentifier: string,
  input: {
    note?: string;
    reason: string;
    urgency: "normal" | "high" | "urgent";
  },
): Promise<ActionResult<ProjectManagerProjectDetail>> {
  const projectManager = await requireProjectManager(accessToken);

  if (!projectManager.ok) {
    return projectManager;
  }

  const reason = input.reason.trim();

  if (reason.length < 6) {
    return { ok: false, message: "Add a clear escalation reason first." };
  }

  const { data: project, error: projectError } = await getProjectByIdentifier(
    projectManager.supabase,
    projectIdentifier,
  );

  if (projectError || !project) {
    return {
      ok: false,
      message: projectError?.message ?? "This Import Project was not found.",
    };
  }

  const existingMetadata = toJsonObject(project.metadata);
  const existingEscalation = toJsonObject(
    existingMetadata.project_manager_escalation,
  );
  const now = new Date().toISOString();
  const nextEscalation = {
    escalated_at: now,
    escalated_by_project_manager_profile_id: projectManager.profileId,
    note: input.note?.trim() ?? "",
    reason,
    status: "open",
    urgency: input.urgency,
  };
  const nextMetadata = {
    ...existingMetadata,
    project_manager_escalation: nextEscalation,
    project_manager_workflow: {
      ...toJsonObject(existingMetadata.project_manager_workflow),
      label: MANAGER_WORKFLOW_LABELS.escalated_to_admin,
      note: input.note?.trim() ?? reason,
      status: "escalated_to_admin",
      updated_at: now,
      updated_by_profile_id: projectManager.profileId,
    },
  };

  const { error: updateError } = await projectManager.supabase
    .from("import_projects")
    .update({
      metadata: nextMetadata,
      updated_by: projectManager.authUserId,
    })
    .eq("id", project.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  const [timelineResult, notificationResult] = await Promise.all([
    projectManager.supabase.from("import_project_timeline_events").insert({
      body: `${reason}${input.note?.trim() ? ` | ${input.note.trim()}` : ""}`,
      created_by: projectManager.authUserId,
      event_type: "project_manager_escalation",
      metadata: {
        project_manager_profile_id: projectManager.profileId,
        urgency: input.urgency,
      },
      project_id: project.id,
      title: "Project Manager escalated project to Admin",
      visible_to_agent: false,
      visible_to_fms: false,
      visible_to_importer: false,
    }),
    createNotification(
      {
        actionUrl: `${ROUTES.admin}/projects/${project.project_code}`,
        actorProfileId: projectManager.profileId,
        metadata: {
          project_code: project.project_code,
          reason,
          urgency: input.urgency,
        },
        priority: input.urgency === "normal" ? "high" : input.urgency,
        projectId: project.id,
        recipientRole: USER_ROLES.admin,
        templateContext: {
          projectCode: project.project_code,
        },
        type: "project_manager_project_escalated",
      },
      projectManager.supabase,
    ),
  ]);

  if (timelineResult.error || !notificationResult.ok) {
    return {
      ok: false,
      message:
        timelineResult.error?.message ??
        notificationResult.message ??
        "Project escalation could not be recorded.",
    };
  }

  const audit = await writeAuditLog(
    {
      action: "project_manager_project_escalated",
      actorRole: USER_ROLES.projectManager,
      actorUserId: projectManager.authUserId,
      afterData: {
        project_manager_escalation: nextEscalation,
      },
      beforeData: {
        project_manager_escalation: existingEscalation,
      },
      entityId: project.id,
      entityType: "import_project",
      metadata: {
        actor_profile_id: projectManager.profileId,
        admin_notification_created: true,
        project_code: project.project_code,
      },
    },
    projectManager.supabase,
  );

  if (!audit.ok) {
    return { ok: false, message: audit.message };
  }

  revalidatePath(ROUTES.projectManagerDashboard);
  revalidatePath(ROUTES.projectManagerProjects);
  revalidatePath(`${ROUTES.projectManagerProjects}/${project.project_code}`);
  revalidatePath(ROUTES.admin);
  revalidatePath(`${ROUTES.admin}/projects/${project.project_code}`);

  const detail = await getProjectManagerProjectDetailAction(
    accessToken,
    project.project_code,
  );

  return detail.ok
    ? {
        ...detail,
        message: "Project escalated to Admin. Admin notification was created.",
      }
    : detail;
}
