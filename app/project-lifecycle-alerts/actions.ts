"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/config/brand";
import { USER_ROLES, hasAllowedRole, type UserRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import {
  filterLifecycleAlertsForRole,
  formatLifecycleAge,
  generateProjectLifecycleAlertNotifications,
  getProjectLifecycleAlerts,
  type ProjectLifecycleAlert,
  type ProjectLifecycleAlertSeverity,
  type ProjectLifecycleAlertType,
} from "@/lib/projects/project-lifecycle-alerts";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

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

export type ProjectLifecycleAlertRole =
  | typeof USER_ROLES.admin
  | typeof USER_ROLES.projectManager;

export type ProjectLifecycleAlertView = {
  ageInHours: number;
  ageLabel: string;
  alertLabel: string;
  alertType: ProjectLifecycleAlertType;
  currentStage: string;
  projectCode: string;
  productTitle: string;
  projectId: string;
  recommendedAction: string;
  relatedRoute: string;
  severity: ProjectLifecycleAlertSeverity;
  severityLabel: string;
};

export type ProjectLifecycleAlertScanView = {
  alertsFound: number;
  notificationsCreated: number;
  notificationsSkipped: number;
  timelineEventsCreated: number;
};

const ALERT_LABELS: Record<ProjectLifecycleAlertType, string> = {
  admin_review_stuck: "Admin review pending",
  admin_submission_review_needed: "Factory submission review needed",
  awaiting_payment_too_long: "Awaiting payment",
  escalation_open_too_long: "PM escalation still open",
  fms_assignment_needed: "FMS assignment needed",
  fms_submission_overdue: "FMS submission overdue",
  importer_info_missing: "Importer information missing",
  payment_verification_stuck: "Payment verification pending",
  project_no_recent_update: "No recent project update",
  report_release_stuck: "Report release pending",
};

const STAGE_LABELS: Record<ProjectLifecycleAlert["currentStage"], string> = {
  admin_review: "Admin review",
  admin_submission_review: "Factory submission review",
  awaiting_payment: "Awaiting payment",
  fms_assignment: "FMS assignment",
  fms_submission: "FMS submission",
  importer_information: "Importer information",
  payment_verification: "Payment verification",
  project_manager_escalation: "Project Manager escalation",
  project_update: "Project update",
  report_release: "Report release",
};

function severityLabel(severity: ProjectLifecycleAlertSeverity) {
  if (severity === "high") {
    return "High priority";
  }

  if (severity === "medium") {
    return "Needs review";
  }

  return "Follow up";
}

function mapAlertForRole(
  alert: ProjectLifecycleAlert,
  role: ProjectLifecycleAlertRole,
): ProjectLifecycleAlertView {
  const isProjectManager = role === USER_ROLES.projectManager;

  return {
    ageInHours: alert.ageInHours,
    ageLabel: formatLifecycleAge(alert.ageInHours),
    alertLabel: ALERT_LABELS[alert.alertType],
    alertType: alert.alertType,
    currentStage: STAGE_LABELS[alert.currentStage],
    projectCode: alert.projectCode,
    productTitle: alert.productTitle,
    projectId: alert.projectId,
    recommendedAction: isProjectManager
      ? alert.projectManagerRecommendedAction
      : alert.adminRecommendedAction,
    relatedRoute: isProjectManager
      ? `${ROUTES.projectManagerProjects}/${encodeURIComponent(alert.projectCode)}`
      : alert.relatedRoute,
    severity: alert.severity,
    severityLabel: severityLabel(alert.severity),
  };
}

async function requireLifecycleViewer(
  accessToken: string,
  role: ProjectLifecycleAlertRole,
) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  const allowedRoles: UserRole[] =
    role === USER_ROLES.admin
      ? [USER_ROLES.admin, USER_ROLES.superAdmin]
      : [USER_ROLES.projectManager];

  if (!hasAllowedRole(authCheck.profile.roles, allowedRoles)) {
    return {
      ok: false as const,
      message: "This account cannot view lifecycle alerts for this portal.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
    roles: authCheck.profile.roles,
    supabase: createAdminSupabaseClient(),
  };
}

export async function listProjectLifecycleAlertsAction(
  accessToken: string,
  role: ProjectLifecycleAlertRole,
): Promise<ActionResult<ProjectLifecycleAlertView[]>> {
  try {
    const viewer = await requireLifecycleViewer(accessToken, role);

    if (!viewer.ok) {
      return viewer;
    }

    const alerts = await getProjectLifecycleAlerts(viewer.supabase);
    const roleAlerts = filterLifecycleAlertsForRole(alerts, role)
      .slice(0, 12)
      .map((alert) => mapAlertForRole(alert, role));

    return { ok: true, data: roleAlerts };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Project lifecycle alerts could not be loaded.",
    };
  }
}

export async function runProjectLifecycleAlertScanAction(
  accessToken: string,
): Promise<ActionResult<ProjectLifecycleAlertScanView>> {
  try {
    const viewer = await requireLifecycleViewer(accessToken, USER_ROLES.admin);

    if (!viewer.ok) {
      return viewer;
    }

    const actorRole = hasAllowedRole(viewer.roles, [USER_ROLES.superAdmin])
      ? USER_ROLES.superAdmin
      : USER_ROLES.admin;
    const result = await generateProjectLifecycleAlertNotifications({
      actorRole,
      actorUserId: viewer.authUserId,
      supabase: viewer.supabase,
    });

    revalidatePath(ROUTES.admin);
    revalidatePath(ROUTES.adminNotifications);
    revalidatePath(ROUTES.projectManagerDashboard);
    revalidatePath(ROUTES.projectManagerNotifications);

    return {
      ok: true,
      data: result,
      message: `${result.alertsFound} lifecycle alert(s) scanned. ${result.notificationsCreated} notification(s) created; ${result.notificationsSkipped} duplicate notification(s) skipped.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Project lifecycle alert scan could not be completed.",
    };
  }
}
