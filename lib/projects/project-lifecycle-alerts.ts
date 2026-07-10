import "server-only";

import { ROUTES } from "@/config/brand";
import { projectLifecycleThresholdsHours } from "@/config/project-lifecycle";
import { USER_ROLES, type UserRole } from "@/lib/auth/roles";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { createNotification } from "@/lib/notifications/create-notification";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type SupabaseAdmin = ReturnType<typeof createAdminSupabaseClient>;
type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
type JsonObject = { [key: string]: Json | undefined };

export type ProjectLifecycleAlertType =
  | "admin_review_stuck"
  | "admin_submission_review_needed"
  | "awaiting_payment_too_long"
  | "escalation_open_too_long"
  | "fms_assignment_needed"
  | "fms_submission_overdue"
  | "importer_info_missing"
  | "payment_verification_stuck"
  | "project_no_recent_update"
  | "report_release_stuck";

export type ProjectLifecycleAlertSeverity = "low" | "medium" | "high";

export type ProjectLifecycleAlertStage =
  | "admin_review"
  | "admin_submission_review"
  | "awaiting_payment"
  | "fms_assignment"
  | "fms_submission"
  | "importer_information"
  | "payment_verification"
  | "project_manager_escalation"
  | "project_update"
  | "report_release";

export type ProjectLifecycleAlert = {
  adminRecommendedAction: string;
  ageInHours: number;
  alertType: ProjectLifecycleAlertType;
  currentStage: ProjectLifecycleAlertStage;
  metadata: JsonObject;
  productTitle: string;
  projectCode: string;
  projectId: string;
  projectManagerRecommendedAction: string;
  recommendedAction: string;
  relatedRoute: string;
  severity: ProjectLifecycleAlertSeverity;
  targetRoles: Array<typeof USER_ROLES.admin | typeof USER_ROLES.projectManager>;
};

export type ProjectLifecycleNotificationScanResult = {
  alertsFound: number;
  notificationsCreated: number;
  notificationsSkipped: number;
  timelineEventsCreated: number;
};

const terminalProjectStatuses = new Set<Database["public"]["Enums"]["project_status"]>([
  "cancelled",
  "completed",
  "refunded",
  "partially_refunded",
  "disputed",
]);

const activeAssignmentStatuses = new Set<Database["public"]["Enums"]["assignment_status"]>([
  "assigned",
  "requirements_reviewed",
  "factory_researching",
  "factory_options_drafted",
  "submitted_for_admin_review",
  "changes_requested",
  "approved_by_admin",
]);

const fmsSubmissionPendingStatuses = new Set<Database["public"]["Enums"]["assignment_status"]>([
  "assigned",
  "requirements_reviewed",
  "factory_researching",
  "factory_options_drafted",
  "changes_requested",
]);

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function hoursSince(value: string | null | undefined, now = new Date()) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return 0;
  }

  return Math.max(0, Math.floor((now.getTime() - timestamp) / 3_600_000));
}

function hasExceeded(ageInHours: number, threshold: number) {
  return ageInHours >= threshold;
}

function dateBucket(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function productTitleForProject(
  requirement: TableRow<"import_project_requirements"> | undefined,
) {
  return (
    requirement?.product_name ??
    requirement?.product_description ??
    "Product details pending"
  );
}

function getManagerMetadata(project: TableRow<"import_projects">) {
  const metadata = toJsonObject(project.metadata);

  return {
    escalation: toJsonObject(metadata.project_manager_escalation),
    workflow: toJsonObject(metadata.project_manager_workflow),
  };
}

function alertPriority(severity: ProjectLifecycleAlertSeverity) {
  return severity === "high" ? "high" : severity === "medium" ? "normal" : "low";
}

function severityLabel(severity: ProjectLifecycleAlertSeverity) {
  if (severity === "high") {
    return "High priority";
  }

  if (severity === "medium") {
    return "Needs review";
  }

  return "Follow up";
}

function adminRoute(projectCode: string, anchor?: string) {
  return `${ROUTES.admin}/projects/${encodeURIComponent(projectCode)}${anchor ?? ""}`;
}

function projectManagerRoute(projectCode: string) {
  return `${ROUTES.projectManagerProjects}/${encodeURIComponent(projectCode)}`;
}

function makeAlert(input: {
  adminRecommendedAction: string;
  ageInHours: number;
  alertType: ProjectLifecycleAlertType;
  currentStage: ProjectLifecycleAlertStage;
  metadata?: JsonObject;
  productTitle: string;
  project: TableRow<"import_projects">;
  projectManagerRecommendedAction?: string;
  relatedRoute?: string;
  severity: ProjectLifecycleAlertSeverity;
  targetRoles?: ProjectLifecycleAlert["targetRoles"];
}): ProjectLifecycleAlert {
  const projectManagerRecommendedAction =
    input.projectManagerRecommendedAction ??
    "Open the Project Manager project page, add a safe internal note, and escalate to Admin if a restricted action is required.";

  return {
    adminRecommendedAction: input.adminRecommendedAction,
    ageInHours: input.ageInHours,
    alertType: input.alertType,
    currentStage: input.currentStage,
    metadata: input.metadata ?? {},
    productTitle: input.productTitle,
    projectCode: input.project.project_code,
    projectId: input.project.id,
    projectManagerRecommendedAction,
    recommendedAction: input.adminRecommendedAction,
    relatedRoute: input.relatedRoute ?? adminRoute(input.project.project_code),
    severity: input.severity,
    targetRoles: input.targetRoles ?? [USER_ROLES.admin],
  };
}

function latestByProject<T extends { project_id: string | null; updated_at: string; created_at: string }>(
  rows: T[],
) {
  const map = new Map<string, T>();

  for (const row of rows) {
    if (!row.project_id) {
      continue;
    }

    const current = map.get(row.project_id);
    const rowTime = new Date(row.updated_at ?? row.created_at).getTime();
    const currentTime = current
      ? new Date(current.updated_at ?? current.created_at).getTime()
      : 0;

    if (!current || rowTime > currentTime) {
      map.set(row.project_id, row);
    }
  }

  return map;
}

function activeAssignmentsByProject(rows: TableRow<"fms_assignments">[]) {
  const map = new Map<string, TableRow<"fms_assignments">[]>();

  for (const assignment of rows) {
    if (!activeAssignmentStatuses.has(assignment.assignment_status)) {
      continue;
    }

    const existing = map.get(assignment.project_id) ?? [];
    existing.push(assignment);
    map.set(assignment.project_id, existing);
  }

  return map;
}

function submissionsByAssignment(rows: TableRow<"fms_factory_submissions">[]) {
  const map = new Map<string, TableRow<"fms_factory_submissions">[]>();

  for (const submission of rows) {
    const existing = map.get(submission.assignment_id) ?? [];
    existing.push(submission);
    map.set(submission.assignment_id, existing);
  }

  return map;
}

function hasReleasedReport(project: TableRow<"import_projects">) {
  const report = toJsonObject(toJsonObject(project.metadata).phase_7_factory_report);
  const status = readString(report.status);

  return status === "released_to_importer" || status === "updated";
}

export function filterLifecycleAlertsForRole(
  alerts: ProjectLifecycleAlert[],
  role: typeof USER_ROLES.admin | typeof USER_ROLES.projectManager,
) {
  return alerts.filter((alert) => alert.targetRoles.includes(role));
}

export async function getProjectLifecycleAlerts(
  supabase: SupabaseAdmin = createAdminSupabaseClient(),
  now = new Date(),
): Promise<ProjectLifecycleAlert[]> {
  const [
    projectsResult,
    requirementsResult,
    assignmentsResult,
    submissionsResult,
    manualPaymentsResult,
  ] = await Promise.all([
    supabase
      .from("import_projects")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(250),
    supabase.from("import_project_requirements").select("*"),
    supabase.from("fms_assignments").select("*"),
    supabase.from("fms_factory_submissions").select("*"),
    supabase
      .from("manual_payment_requests")
      .select("*")
      .in("status", ["submitted", "under_review"]),
  ]);

  if (projectsResult.error) {
    throw new Error(projectsResult.error.message);
  }

  if (requirementsResult.error) {
    throw new Error(requirementsResult.error.message);
  }

  if (assignmentsResult.error) {
    throw new Error(assignmentsResult.error.message);
  }

  if (submissionsResult.error) {
    throw new Error(submissionsResult.error.message);
  }

  if (manualPaymentsResult.error) {
    throw new Error(manualPaymentsResult.error.message);
  }

  const requirements = new Map(
    (requirementsResult.data ?? []).map((requirement) => [
      requirement.project_id,
      requirement,
    ]),
  );
  const activeAssignments = activeAssignmentsByProject(assignmentsResult.data ?? []);
  const assignmentSubmissions = submissionsByAssignment(submissionsResult.data ?? []);
  const latestManualPayment = latestByProject(manualPaymentsResult.data ?? []);
  const alerts: ProjectLifecycleAlert[] = [];

  for (const project of projectsResult.data ?? []) {
    if (terminalProjectStatuses.has(project.project_status)) {
      continue;
    }

    const requirement = requirements.get(project.id);
    const productTitle = productTitleForProject(requirement);
    const projectAssignments = activeAssignments.get(project.id) ?? [];
    const latestPaymentRequest = latestManualPayment.get(project.id);
    const managerMetadata = getManagerMetadata(project);

    if (latestPaymentRequest && project.payment_status !== "paid") {
      const age = hoursSince(latestPaymentRequest.updated_at, now);

      if (
        hasExceeded(
          age,
          projectLifecycleThresholdsHours.payment_verification_pending,
        )
      ) {
        alerts.push(
          makeAlert({
            adminRecommendedAction:
              "Open manual payments and verify, reject, or request more information. Do not start FMS work until payment is verified.",
            ageInHours: age,
            alertType: "payment_verification_stuck",
            currentStage: "payment_verification",
            metadata: {
              manual_payment_request_id: latestPaymentRequest.id,
              payment_request_status: latestPaymentRequest.status,
            },
            productTitle,
            project,
            relatedRoute: ROUTES.adminPayments,
            severity: "high",
            targetRoles: [USER_ROLES.admin],
          }),
        );
      }
    } else if (project.payment_status === "awaiting_payment") {
      const age = hoursSince(project.created_at, now);

      if (hasExceeded(age, projectLifecycleThresholdsHours.awaiting_payment)) {
        alerts.push(
          makeAlert({
            adminRecommendedAction:
              "Follow up through approved support channels. No sourcing work should start until payment is verified.",
            ageInHours: age,
            alertType: "awaiting_payment_too_long",
            currentStage: "awaiting_payment",
            productTitle,
            project,
            relatedRoute: adminRoute(project.project_code, "#payment"),
            severity: "low",
            targetRoles: [USER_ROLES.admin],
          }),
        );
      }
    }

    if (
      project.payment_status === "paid" &&
      project.admin_review_status !== "ready_for_fms_assignment" &&
      project.admin_review_status !== "rejected" &&
      project.project_status !== "needs_importer_clarification"
    ) {
      const age = hoursSince(project.paid_at ?? project.updated_at, now);

      if (hasExceeded(age, projectLifecycleThresholdsHours.admin_review_pending)) {
        alerts.push(
          makeAlert({
            adminRecommendedAction:
              "Open the Admin review panel and approve, reject, or request importer information.",
            ageInHours: age,
            alertType: "admin_review_stuck",
            currentStage: "admin_review",
            productTitle,
            project,
            projectManagerRecommendedAction:
              "Open the PM project page and escalate to Admin if the review is blocking downstream work.",
            relatedRoute: adminRoute(project.project_code, "#review"),
            severity: "medium",
            targetRoles: [USER_ROLES.admin, USER_ROLES.projectManager],
          }),
        );
      }
    }

    if (
      project.admin_review_status === "needs_information" ||
      project.project_status === "needs_importer_clarification"
    ) {
      const age = hoursSince(project.updated_at, now);

      if (hasExceeded(age, projectLifecycleThresholdsHours.importer_info_missing)) {
        alerts.push(
          makeAlert({
            adminRecommendedAction:
              "Review the missing information request and follow up with the importer through approved channels.",
            ageInHours: age,
            alertType: "importer_info_missing",
            currentStage: "importer_information",
            productTitle,
            project,
            projectManagerRecommendedAction:
              "Check whether the project needs a clearer internal note or Admin escalation for importer follow-up.",
            relatedRoute: adminRoute(project.project_code, "#review"),
            severity: "medium",
            targetRoles: [USER_ROLES.admin, USER_ROLES.projectManager],
          }),
        );
      }
    }

    if (
      project.payment_status === "paid" &&
      project.admin_review_status === "ready_for_fms_assignment" &&
      project.project_status === "ready_for_fms_assignment" &&
      projectAssignments.length === 0
    ) {
      const age = hoursSince(
        project.ready_for_fms_at ?? project.admin_reviewed_at ?? project.updated_at,
        now,
      );

      if (hasExceeded(age, projectLifecycleThresholdsHours.fms_assignment_pending)) {
        alerts.push(
          makeAlert({
            adminRecommendedAction:
              "Assign an approved FMS from the Admin project detail page. Project Manager can only escalate this action.",
            ageInHours: age,
            alertType: "fms_assignment_needed",
            currentStage: "fms_assignment",
            productTitle,
            project,
            projectManagerRecommendedAction:
              "Open the PM project page and escalate to Admin because FMS assignment is an Admin-only action.",
            relatedRoute: adminRoute(project.project_code, "#assignment"),
            severity: "medium",
            targetRoles: [USER_ROLES.admin, USER_ROLES.projectManager],
          }),
        );
      }
    }

    for (const assignment of projectAssignments) {
      const submissions = assignmentSubmissions.get(assignment.id) ?? [];

      if (fmsSubmissionPendingStatuses.has(assignment.assignment_status)) {
        const hasSubmittedOption = submissions.some(
          (submission) =>
            submission.submission_status === "submitted_for_admin_review" ||
            submission.submission_status === "approved_by_admin",
        );
        const age = hoursSince(assignment.updated_at, now);

        if (
          !hasSubmittedOption &&
          hasExceeded(age, projectLifecycleThresholdsHours.fms_submission_pending)
        ) {
          alerts.push(
            makeAlert({
              adminRecommendedAction:
                "Check the FMS assignment status and follow up through platform-controlled FMS channels.",
              ageInHours: age,
              alertType: "fms_submission_overdue",
              currentStage: "fms_submission",
              metadata: {
                assignment_code: assignment.assignment_code,
                assignment_id: assignment.id,
                assignment_status: assignment.assignment_status,
              },
              productTitle,
              project,
              projectManagerRecommendedAction:
                "Review the project timeline and escalate to Admin if FMS follow-up is needed.",
              relatedRoute: `${ROUTES.adminFactorySubmissions}`,
              severity: "medium",
              targetRoles: [USER_ROLES.admin, USER_ROLES.projectManager],
            }),
          );
        }
      }
    }

    const submissionsForProject = projectAssignments.flatMap(
      (assignment) => assignmentSubmissions.get(assignment.id) ?? [],
    );
    const pendingAdminSubmission = submissionsForProject
      .filter(
        (submission) =>
          submission.submission_status === "submitted_for_admin_review" ||
          submission.admin_review_status === "in_review",
      )
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )[0];

    if (pendingAdminSubmission) {
      const age = hoursSince(pendingAdminSubmission.updated_at, now);

      if (
        hasExceeded(
          age,
          projectLifecycleThresholdsHours.admin_submission_review_pending,
        )
      ) {
        alerts.push(
          makeAlert({
            adminRecommendedAction:
              "Open factory submissions and approve, reject, or request changes. Do not release raw FMS data to importer.",
            ageInHours: age,
            alertType: "admin_submission_review_needed",
            currentStage: "admin_submission_review",
            metadata: {
              submission_code: pendingAdminSubmission.submission_code,
              submission_id: pendingAdminSubmission.id,
              submission_status: pendingAdminSubmission.submission_status,
            },
            productTitle,
            project,
            projectManagerRecommendedAction:
              "Escalate to Admin if factory submission review is blocking the project.",
            relatedRoute: `${ROUTES.adminFactorySubmissions}/${encodeURIComponent(
              pendingAdminSubmission.submission_code,
            )}`,
            severity: "high",
            targetRoles: [USER_ROLES.admin, USER_ROLES.projectManager],
          }),
        );
      }
    }

    const approvedSubmission = submissionsForProject
      .filter((submission) => submission.submission_status === "approved_by_admin")
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )[0];

    if (approvedSubmission && !hasReleasedReport(project)) {
      const age = hoursSince(approvedSubmission.updated_at, now);

      if (hasExceeded(age, projectLifecycleThresholdsHours.report_release_pending)) {
        alerts.push(
          makeAlert({
            adminRecommendedAction:
              "Prepare and release an importer-safe report from approved FMS submissions. Keep raw FMS/factory contact data hidden.",
            ageInHours: age,
            alertType: "report_release_stuck",
            currentStage: "report_release",
            metadata: {
              approved_submission_code: approvedSubmission.submission_code,
              approved_submission_id: approvedSubmission.id,
            },
            productTitle,
            project,
            projectManagerRecommendedAction:
              "Escalate to Admin because report release is an Admin-only action.",
            relatedRoute: adminRoute(project.project_code, "#report-release"),
            severity: "high",
            targetRoles: [USER_ROLES.admin, USER_ROLES.projectManager],
          }),
        );
      }
    }

    const escalationStatus = readString(managerMetadata.escalation.status);
    const escalatedAt = readString(managerMetadata.escalation.escalated_at);

    if (escalationStatus === "open" && escalatedAt) {
      const age = hoursSince(escalatedAt, now);

      if (
        hasExceeded(
          age,
          projectLifecycleThresholdsHours.project_manager_escalation_open,
        )
      ) {
        alerts.push(
          makeAlert({
            adminRecommendedAction:
              "Review the Project Manager escalation and close the operational unblock path.",
            ageInHours: age,
            alertType: "escalation_open_too_long",
            currentStage: "project_manager_escalation",
            metadata: {
              escalation_reason: readString(managerMetadata.escalation.reason),
              escalation_status: escalationStatus,
            },
            productTitle,
            project,
            projectManagerRecommendedAction:
              "Open the PM project page, update internal notes, and confirm whether Admin follow-up is still needed.",
            relatedRoute: adminRoute(project.project_code),
            severity: "high",
            targetRoles: [USER_ROLES.admin, USER_ROLES.projectManager],
          }),
        );
      }
    }

    const managerWorkflowState = readString(managerMetadata.workflow.status);
    const ageSinceProjectUpdate = hoursSince(project.updated_at, now);

    if (
      hasExceeded(
        ageSinceProjectUpdate,
        projectLifecycleThresholdsHours.no_project_update,
      )
    ) {
      alerts.push(
        makeAlert({
          adminRecommendedAction:
            "Review the project timeline and confirm the next safe operational step.",
          ageInHours: ageSinceProjectUpdate,
          alertType: "project_no_recent_update",
          currentStage: "project_update",
          metadata: {
            manager_workflow_status: managerWorkflowState,
            project_status: project.project_status,
          },
          productTitle,
          project,
          projectManagerRecommendedAction:
            "Open the PM project page, add an internal note, update the safe workflow marker, or escalate if the next action is restricted.",
          relatedRoute: adminRoute(project.project_code, "#timeline"),
          severity: "low",
          targetRoles: [USER_ROLES.admin, USER_ROLES.projectManager],
        }),
      );
    }
  }

  return alerts.sort((a, b) => {
    const severityWeight = { high: 3, medium: 2, low: 1 } satisfies Record<
      ProjectLifecycleAlertSeverity,
      number
    >;

    return (
      severityWeight[b.severity] - severityWeight[a.severity] ||
      b.ageInHours - a.ageInHours
    );
  });
}

async function notificationExists(
  supabase: SupabaseAdmin,
  dedupeKey: string,
) {
  const { data, error } = await supabase
    .from("notifications")
    .select("id")
    .filter("metadata->>dedupe_key", "eq", dedupeKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

async function latestTimelineAlertSeverity(
  supabase: SupabaseAdmin,
  projectId: string,
  lifecycleTimelineKey: string,
) {
  const { data, error } = await supabase
    .from("import_project_timeline_events")
    .select("metadata")
    .eq("project_id", projectId)
    .eq("event_type", "project_lifecycle_alert")
    .filter("metadata->>lifecycle_timeline_key", "eq", lifecycleTimelineKey)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return readString(toJsonObject(data?.[0]?.metadata).severity);
}

async function createTimelineEventIfNeeded(
  supabase: SupabaseAdmin,
  alert: ProjectLifecycleAlert,
) {
  const lifecycleTimelineKey = `project_lifecycle_alert:${alert.projectId}:${alert.alertType}`;
  const latestSeverity = await latestTimelineAlertSeverity(
    supabase,
    alert.projectId,
    lifecycleTimelineKey,
  );

  if (latestSeverity === alert.severity) {
    return false;
  }

  const { error } = await supabase.from("import_project_timeline_events").insert({
    body: `${severityLabel(alert.severity)} lifecycle alert: ${
      alert.adminRecommendedAction
    }`,
    event_type: "project_lifecycle_alert",
    metadata: {
      alert_type: alert.alertType,
      age_in_hours: alert.ageInHours,
      lifecycle_timeline_key: lifecycleTimelineKey,
      severity: alert.severity,
    },
    project_id: alert.projectId,
    title: "Project lifecycle alert generated",
    visible_to_agent: false,
    visible_to_fms: false,
    visible_to_importer: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function generateProjectLifecycleAlertNotifications(input: {
  actorRole?: UserRole;
  actorUserId?: string | null;
  supabase?: SupabaseAdmin;
} = {}): Promise<ProjectLifecycleNotificationScanResult> {
  const supabase = input.supabase ?? createAdminSupabaseClient();
  const now = new Date();
  const alerts = await getProjectLifecycleAlerts(supabase, now);
  let notificationsCreated = 0;
  let notificationsSkipped = 0;
  let timelineEventsCreated = 0;
  const bucket = dateBucket(now);

  for (const alert of alerts) {
    const timelineCreated = await createTimelineEventIfNeeded(supabase, alert);

    if (timelineCreated) {
      timelineEventsCreated += 1;
    }

    for (const role of alert.targetRoles) {
      const dedupeKey = `project_lifecycle_alert:${alert.projectId}:${alert.alertType}:${role}:${bucket}`;
      const lifecycleBaseKey = `project_lifecycle_alert:${alert.projectId}:${alert.alertType}:${role}`;

      if (await notificationExists(supabase, dedupeKey)) {
        notificationsSkipped += 1;
        continue;
      }

      const isProjectManager = role === USER_ROLES.projectManager;
      const actionUrl = isProjectManager
        ? projectManagerRoute(alert.projectCode)
        : alert.relatedRoute;
      const recommendedAction = isProjectManager
        ? alert.projectManagerRecommendedAction
        : alert.adminRecommendedAction;
      const result = await createNotification(
        {
          actionUrl,
          metadata: {
            ...alert.metadata,
            alert_type: alert.alertType,
            age_in_hours: alert.ageInHours,
            date_bucket: bucket,
            dedupe_key: dedupeKey,
            lifecycle_base_key: lifecycleBaseKey,
            project_code: alert.projectCode,
            recommended_action: recommendedAction,
            severity: alert.severity,
            target_role: role,
          },
          message: `${alert.projectCode} has been in ${alert.currentStage.replaceAll(
            "_",
            " ",
          )} for about ${alert.ageInHours} hour(s). ${recommendedAction}`,
          priority: alertPriority(alert.severity),
          projectId: alert.projectId,
          recipientRole: role,
          title: `${severityLabel(alert.severity)}: ${alert.productTitle}`,
          type:
            alert.alertType === "escalation_open_too_long"
              ? "project_manager_project_escalated"
              : "project_lifecycle_alert",
        },
        supabase,
      );

      if (result.ok) {
        notificationsCreated += 1;
      }
    }
  }

  await writeAuditLog(
    {
      action: "project_lifecycle_alert_scan_ran",
      actorRole: input.actorRole ?? USER_ROLES.admin,
      actorUserId: input.actorUserId ?? null,
      entityType: "project_lifecycle_alerts",
      metadata: {
        alerts_found: alerts.length,
        date_bucket: bucket,
        notifications_created: notificationsCreated,
        notifications_skipped: notificationsSkipped,
        timeline_events_created: timelineEventsCreated,
      },
    },
    supabase,
  );

  return {
    alertsFound: alerts.length,
    notificationsCreated,
    notificationsSkipped,
    timelineEventsCreated,
  };
}

export function formatLifecycleAge(ageInHours: number) {
  if (ageInHours < 24) {
    return `${ageInHours}h`;
  }

  const days = Math.floor(ageInHours / 24);
  const hours = ageInHours % 24;

  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}
