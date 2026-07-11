import "server-only";

import { ROUTES, brand } from "@/config/brand";
import { fmsApplicationSource } from "@/config/fms-acquisition";
import { getSiteUrl } from "@/config/site-url";
import { USER_ROLES, type UserRole } from "@/lib/auth/roles";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { deliverEmail } from "@/lib/notifications/email-provider";
import { createNotification } from "@/lib/notifications/create-notification";
import type { EmailTemplatePayload } from "@/lib/notifications/types";
import {
  filterLifecycleAlertsForRole,
  formatLifecycleAge,
  getProjectLifecycleAlerts,
  type ProjectLifecycleAlert,
  type ProjectLifecycleAlertSeverity,
  type ProjectLifecycleAlertType,
} from "@/lib/projects/project-lifecycle-alerts";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type SupabaseAdmin = ReturnType<typeof createAdminSupabaseClient>;
type JsonObject = { [key: string]: Json | undefined };
type UnpaidLead = Database["public"]["Tables"]["unpaid_leads"]["Row"];

export type DailyDigestRole =
  | typeof USER_ROLES.admin
  | typeof USER_ROLES.projectManager
  | typeof USER_ROLES.superAdmin;

export type DailyOperationsDigestMode = "cron" | "manual";

type DigestItem = {
  actionUrl: string;
  ageLabel: string;
  alertLabel: string;
  projectCode: string;
  recommendedAction: string;
  severity: ProjectLifecycleAlertSeverity;
  title: string;
};

type FmsApplicationDigestItem = {
  actionUrl: string;
  leadCode: string;
  status: string;
};

export type RoleDailyOperationsDigest = {
  dashboardUrl: string;
  date: string;
  fmsApplications: {
    adminReviewCount: number;
    adminReviewItems: FmsApplicationDigestItem[];
    superAdminReviewCount: number;
    superAdminReviewItems: FmsApplicationDigestItem[];
  };
  generatedAt: string;
  highPriority: DigestItem[];
  lowPriority: DigestItem[];
  mediumPriority: DigestItem[];
  role: DailyDigestRole;
  roleLabel: string;
  summary: {
    highPriorityCount: number;
    lowPriorityCount: number;
    mediumPriorityCount: number;
    totalAlerts: number;
    totalsByAlertType: Record<string, number>;
  };
};

export type DailyOperationsDigestResult = {
  date: string;
  emailDelivery: {
    delivered: number;
    failed: number;
    queued: number;
    skipped: number;
  };
  generatedAt: string;
  notificationsCreated: number;
  notificationsSkipped: number;
  roles: Record<DailyDigestRole, RoleDailyOperationsDigest>;
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

const ROLE_LABELS: Record<DailyDigestRole, string> = {
  [USER_ROLES.admin]: "Admin",
  [USER_ROLES.projectManager]: "Project Manager",
  [USER_ROLES.superAdmin]: "Super Admin",
};

const ROLE_DASHBOARD_ROUTES: Record<DailyDigestRole, string> = {
  [USER_ROLES.admin]: ROUTES.admin,
  [USER_ROLES.projectManager]: ROUTES.projectManagerDashboard,
  [USER_ROLES.superAdmin]: ROUTES.superAdmin,
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${getSiteUrl()}${path}`;
}

function formatDateBucket(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function countByAlertType(alerts: ProjectLifecycleAlert[]) {
  return alerts.reduce<Record<string, number>>((accumulator, alert) => {
    accumulator[alert.alertType] = (accumulator[alert.alertType] ?? 0) + 1;
    return accumulator;
  }, {});
}

function severityPriority(severity: ProjectLifecycleAlertSeverity) {
  if (severity === "high") {
    return "high-priority";
  }

  if (severity === "medium") {
    return "needs-review";
  }

  return "follow-up";
}

function mapAlertToDigestItem(
  alert: ProjectLifecycleAlert,
  role: DailyDigestRole,
): DigestItem {
  const isProjectManager = role === USER_ROLES.projectManager;
  const actionUrl = isProjectManager
    ? `${ROUTES.projectManagerProjects}/${encodeURIComponent(alert.projectCode)}`
    : alert.relatedRoute;

  return {
    actionUrl: absoluteUrl(actionUrl),
    ageLabel: formatLifecycleAge(alert.ageInHours),
    alertLabel: ALERT_LABELS[alert.alertType],
    projectCode: alert.projectCode,
    recommendedAction: isProjectManager
      ? alert.projectManagerRecommendedAction
      : alert.adminRecommendedAction,
    severity: alert.severity,
    title: alert.productTitle,
  };
}

function isFmsApplicationLead(lead: UnpaidLead) {
  const metadata = toJsonObject(lead.metadata);

  return (
    lead.lead_code.startsWith("FMS-APP") ||
    readString(metadata.source) === fmsApplicationSource ||
    readString(metadata.intended_role) === USER_ROLES.fms ||
    readString(metadata.lead_type) === "fms_application"
  );
}

function getFmsWorkflowStatus(lead: UnpaidLead) {
  const metadata = toJsonObject(lead.metadata);
  const workflowStatus = readString(metadata.workflow_status);
  const superAdminReviewStatus = readString(metadata.super_admin_review_status);

  if (workflowStatus) {
    return workflowStatus;
  }

  if (superAdminReviewStatus) {
    return `super_admin_${superAdminReviewStatus}`;
  }

  return "new";
}

function fmsStatusLabel(status: string) {
  const labels: Record<string, string> = {
    approved_pending_account_setup: "Approved - account setup needed",
    candidate_updated: "Candidate updated information",
    converted: "FMS profile created",
    forwarded_to_super_admin: "Pending Super Admin review",
    in_review: "Admin screening",
    new: "New FMS application",
    pending_more_info: "Pending candidate information",
    super_admin_approved: "Approved by Super Admin",
    super_admin_declined: "Declined by Super Admin",
    super_admin_more_info_requested: "More info requested by Super Admin",
    super_admin_pending: "Pending Super Admin review",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

async function loadFmsApplicationDigest(
  supabase: SupabaseAdmin,
): Promise<RoleDailyOperationsDigest["fmsApplications"]> {
  const { data, error } = await supabase
    .from("unpaid_leads")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const fmsLeads = (data ?? []).filter(isFmsApplicationLead);
  const adminStatuses = new Set([
    "new",
    "in_review",
    "pending_more_info",
    "candidate_updated",
  ]);
  const superAdminStatuses = new Set([
    "forwarded_to_super_admin",
    "super_admin_pending",
  ]);
  const adminReviewItems = fmsLeads
    .filter((lead) => adminStatuses.has(getFmsWorkflowStatus(lead)))
    .slice(0, 8)
    .map((lead) => ({
      actionUrl: absoluteUrl(`${ROUTES.admin}/leads?filter=fms`),
      leadCode: lead.lead_code,
      status: fmsStatusLabel(getFmsWorkflowStatus(lead)),
    }));
  const superAdminReviewItems = fmsLeads
    .filter((lead) => superAdminStatuses.has(getFmsWorkflowStatus(lead)))
    .slice(0, 8)
    .map((lead) => ({
      actionUrl: absoluteUrl(
        `${ROUTES.superAdminFmsApplications}?lead=${encodeURIComponent(
          lead.id,
        )}&filter=pending`,
      ),
      leadCode: lead.lead_code,
      status: fmsStatusLabel(getFmsWorkflowStatus(lead)),
    }));

  return {
    adminReviewCount: fmsLeads.filter((lead) =>
      adminStatuses.has(getFmsWorkflowStatus(lead)),
    ).length,
    adminReviewItems,
    superAdminReviewCount: fmsLeads.filter((lead) =>
      superAdminStatuses.has(getFmsWorkflowStatus(lead)),
    ).length,
    superAdminReviewItems,
  };
}

function buildRoleDigest(input: {
  alerts: ProjectLifecycleAlert[];
  date: string;
  fmsApplications: RoleDailyOperationsDigest["fmsApplications"];
  generatedAt: string;
  role: DailyDigestRole;
}): RoleDailyOperationsDigest {
  const roleAlerts =
    input.role === USER_ROLES.superAdmin
      ? filterLifecycleAlertsForRole(input.alerts, USER_ROLES.admin)
      : filterLifecycleAlertsForRole(input.alerts, input.role);
  const highPriority = roleAlerts
    .filter((alert) => alert.severity === "high")
    .slice(0, 10)
    .map((alert) => mapAlertToDigestItem(alert, input.role));
  const mediumPriority = roleAlerts
    .filter((alert) => alert.severity === "medium")
    .slice(0, 10)
    .map((alert) => mapAlertToDigestItem(alert, input.role));
  const lowPriority = roleAlerts
    .filter((alert) => alert.severity === "low")
    .slice(0, 8)
    .map((alert) => mapAlertToDigestItem(alert, input.role));

  return {
    dashboardUrl: absoluteUrl(ROLE_DASHBOARD_ROUTES[input.role]),
    date: input.date,
    fmsApplications: input.fmsApplications,
    generatedAt: input.generatedAt,
    highPriority,
    lowPriority,
    mediumPriority,
    role: input.role,
    roleLabel: ROLE_LABELS[input.role],
    summary: {
      highPriorityCount: roleAlerts.filter((alert) => alert.severity === "high")
        .length,
      lowPriorityCount: roleAlerts.filter((alert) => alert.severity === "low")
        .length,
      mediumPriorityCount: roleAlerts.filter(
        (alert) => alert.severity === "medium",
      ).length,
      totalAlerts: roleAlerts.length,
      totalsByAlertType: countByAlertType(roleAlerts),
    },
  };
}

export async function buildDailyOperationsDigest(
  supabase: SupabaseAdmin = createAdminSupabaseClient(),
  now = new Date(),
) {
  const [alerts, fmsApplications] = await Promise.all([
    getProjectLifecycleAlerts(supabase, now),
    loadFmsApplicationDigest(supabase),
  ]);
  const date = formatDateBucket(now);
  const generatedAt = now.toISOString();

  return {
    [USER_ROLES.admin]: buildRoleDigest({
      alerts,
      date,
      fmsApplications,
      generatedAt,
      role: USER_ROLES.admin,
    }),
    [USER_ROLES.projectManager]: buildRoleDigest({
      alerts,
      date,
      fmsApplications,
      generatedAt,
      role: USER_ROLES.projectManager,
    }),
    [USER_ROLES.superAdmin]: buildRoleDigest({
      alerts,
      date,
      fmsApplications,
      generatedAt,
      role: USER_ROLES.superAdmin,
    }),
  } satisfies Record<DailyDigestRole, RoleDailyOperationsDigest>;
}

function sectionHtml(title: string, items: DigestItem[]) {
  if (items.length === 0) {
    return `<p style="margin:0 0 16px;color:#6B7280">No ${escapeHtml(
      title.toLowerCase(),
    )} items.</p>`;
  }

  return `<h3 style="color:#0B1F3A;margin:20px 0 8px">${escapeHtml(
    title,
  )}</h3>
  <ul style="margin:0 0 16px 20px;padding:0;line-height:1.7">
    ${items
      .map(
        (item) =>
          `<li><strong>${escapeHtml(item.projectCode)}</strong> - ${escapeHtml(
            item.alertLabel,
          )} (${escapeHtml(item.ageLabel)}, ${escapeHtml(
            severityPriority(item.severity),
          )}). ${escapeHtml(item.recommendedAction)} <a href="${escapeHtml(
            item.actionUrl,
          )}">Open</a></li>`,
      )
      .join("")}
  </ul>`;
}

function fmsSectionHtml(digest: RoleDailyOperationsDigest) {
  const items =
    digest.role === USER_ROLES.superAdmin
      ? digest.fmsApplications.superAdminReviewItems
      : digest.fmsApplications.adminReviewItems;
  const count =
    digest.role === USER_ROLES.superAdmin
      ? digest.fmsApplications.superAdminReviewCount
      : digest.fmsApplications.adminReviewCount;

  if (digest.role === USER_ROLES.projectManager) {
    return "";
  }

  if (count === 0) {
    return `<p style="margin:0 0 16px;color:#6B7280">No FMS application items require ${escapeHtml(
      digest.roleLabel,
    )} action today.</p>`;
  }

  return `<h3 style="color:#0B1F3A;margin:20px 0 8px">FMS application queue</h3>
  <p style="line-height:1.7">${count} FMS application item(s) need ${escapeHtml(
    digest.role === USER_ROLES.superAdmin ? "final review" : "admin review",
  )}.</p>
  <ul style="margin:0 0 16px 20px;padding:0;line-height:1.7">
    ${items
      .map(
        (item) =>
          `<li><strong>${escapeHtml(item.leadCode)}</strong> - ${escapeHtml(
            item.status,
          )}. <a href="${escapeHtml(item.actionUrl)}">Open queue</a></li>`,
      )
      .join("")}
  </ul>`;
}

function sectionText(title: string, items: DigestItem[]) {
  if (items.length === 0) {
    return [`No ${title.toLowerCase()} items.`];
  }

  return [
    `${title}:`,
    ...items.map(
      (item) =>
        `- ${item.projectCode} | ${item.alertLabel} | ${item.ageLabel} | ${item.recommendedAction} | ${item.actionUrl}`,
    ),
  ];
}

function buildDigestEmailTemplate(
  digest: RoleDailyOperationsDigest,
): EmailTemplatePayload {
  const highPriorityCount = digest.summary.highPriorityCount;
  const subject =
    highPriorityCount > 0
      ? `ChinaPak Operations: ${highPriorityCount} high-priority item(s) need review`
      : `ChinaPak Daily Operations Digest - ${digest.date}`;
  const totals = Object.entries(digest.summary.totalsByAlertType)
    .map(([type, count]) => `${ALERT_LABELS[type as ProjectLifecycleAlertType] ?? type}: ${count}`)
    .join(", ");
  const fmsSummary =
    digest.role === USER_ROLES.superAdmin
      ? `${digest.fmsApplications.superAdminReviewCount} FMS application(s) pending Super Admin review.`
      : digest.role === USER_ROLES.admin
        ? `${digest.fmsApplications.adminReviewCount} FMS application(s) pending Admin review.`
        : "Project Manager digest excludes FMS application approval actions.";

  return {
    html: `
      <div style="font-family:Arial,sans-serif;background:#F7F9FC;padding:24px;color:#111827">
        <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;padding:24px">
          <div style="border-bottom:4px solid #C99A2E;padding-bottom:16px">
            <h1 style="margin:0;color:#0B1F3A">${escapeHtml(brand.name)}</h1>
            <p style="margin:8px 0 0;color:#6B7280">${escapeHtml(brand.tagline)}</p>
          </div>
          <h2 style="color:#0B1F3A;margin-top:24px">Daily operations digest - ${escapeHtml(
            digest.roleLabel,
          )}</h2>
          <p style="line-height:1.7">Date: ${escapeHtml(
            digest.date,
          )}. Generated at ${escapeHtml(digest.generatedAt)} UTC.</p>
          <div style="border:1px solid #E5E7EB;background:#F9FAFB;padding:16px;margin:18px 0">
            <p style="margin:0 0 8px"><strong>Total lifecycle alerts:</strong> ${digest.summary.totalAlerts}</p>
            <p style="margin:0 0 8px"><strong>High:</strong> ${digest.summary.highPriorityCount} | <strong>Medium:</strong> ${digest.summary.mediumPriorityCount} | <strong>Low:</strong> ${digest.summary.lowPriorityCount}</p>
            <p style="margin:0"><strong>Alert mix:</strong> ${escapeHtml(
              totals || "No active lifecycle alerts",
            )}</p>
          </div>
          <p style="line-height:1.7">${escapeHtml(fmsSummary)}</p>
          ${sectionHtml("High priority", digest.highPriority)}
          ${sectionHtml("Medium priority", digest.mediumPriority)}
          ${sectionHtml("Low priority", digest.lowPriority)}
          ${fmsSectionHtml(digest)}
          <p><a href="${escapeHtml(
            digest.dashboardUrl,
          )}" style="display:inline-block;background:#138A4A;color:#fff;padding:12px 16px;text-decoration:none;font-weight:bold">Open dashboard</a></p>
          <p style="border-top:1px solid #E5E7EB;margin-top:24px;padding-top:16px;color:#6B7280;font-size:13px;line-height:1.6">
            This internal digest intentionally excludes importer private contact details, FMS contact details, invite links, tokens, service-role keys, and raw private metadata.
          </p>
        </div>
      </div>`,
    subject,
    text: [
      brand.name,
      "",
      subject,
      "",
      `Role: ${digest.roleLabel}`,
      `Date: ${digest.date}`,
      `Generated at: ${digest.generatedAt} UTC`,
      "",
      `Total lifecycle alerts: ${digest.summary.totalAlerts}`,
      `High: ${digest.summary.highPriorityCount} | Medium: ${digest.summary.mediumPriorityCount} | Low: ${digest.summary.lowPriorityCount}`,
      `Alert mix: ${totals || "No active lifecycle alerts"}`,
      fmsSummary,
      "",
      ...sectionText("High priority", digest.highPriority),
      "",
      ...sectionText("Medium priority", digest.mediumPriority),
      "",
      ...sectionText("Low priority", digest.lowPriority),
      "",
      `Dashboard: ${digest.dashboardUrl}`,
      "",
      "This internal digest excludes importer private contact details, FMS contact details, invite links, tokens, service-role keys, and raw private metadata.",
    ].join("\n"),
  };
}

async function notificationExists(supabase: SupabaseAdmin, dedupeKey: string) {
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

async function loadRecipients(supabase: SupabaseAdmin, role: DailyDigestRole) {
  const { data, error } = await supabase
    .from("admin_user_directory")
    .select("email, display_name, user_profile_id, active_roles, profile_status");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter((user) => {
    const roles = user.active_roles ?? [];

    return (
      user.profile_status === "active" &&
      Boolean(user.email?.trim()) &&
      roles.includes(role)
    );
  });
}

async function recordDelivery(input: {
  notificationId: string;
  recipientEmailAvailable: boolean;
  result: Awaited<ReturnType<typeof deliverEmail>>;
  role: DailyDigestRole;
  supabase: SupabaseAdmin;
  subject: string;
}) {
  await input.supabase.from("notification_delivery_logs").insert({
    delivery_status: input.result.status,
    error_message: input.result.ok ? null : input.result.errorMessage,
    metadata: {
      digest_role: input.role,
      email_delivery_mode: process.env.EMAIL_DELIVERY_MODE ?? "disabled",
      recipient_email_available: input.recipientEmailAvailable,
      subject: input.subject,
    },
    notification_id: input.notificationId,
    provider: input.result.provider,
    provider_message_id: input.result.ok
      ? input.result.providerMessageId ?? null
      : null,
  });
}

function incrementDeliveryCount(
  counts: DailyOperationsDigestResult["emailDelivery"],
  status: "delivered" | "failed" | "queued" | "skipped",
) {
  counts[status] += 1;
}

export async function generateDailyOperationsDigest(input: {
  actorRole?: UserRole;
  actorUserId?: string | null;
  mode?: DailyOperationsDigestMode;
  supabase?: SupabaseAdmin;
} = {}): Promise<DailyOperationsDigestResult> {
  const supabase = input.supabase ?? createAdminSupabaseClient();
  const mode = input.mode ?? "cron";
  const now = new Date();
  const roles = await buildDailyOperationsDigest(supabase, now);
  const date = formatDateBucket(now);
  const generatedAt = now.toISOString();
  let notificationsCreated = 0;
  let notificationsSkipped = 0;
  const emailDelivery: DailyOperationsDigestResult["emailDelivery"] = {
    delivered: 0,
    failed: 0,
    queued: 0,
    skipped: 0,
  };

  for (const role of [
    USER_ROLES.admin,
    USER_ROLES.projectManager,
    USER_ROLES.superAdmin,
  ] satisfies DailyDigestRole[]) {
    const roleDigest = roles[role];
    const baseDedupeKey = `daily_operations_digest:${role}:${date}`;
    const dedupeKey =
      mode === "manual"
        ? `${baseDedupeKey}:manual:${now.toISOString()}`
        : baseDedupeKey;

    if (mode === "cron" && (await notificationExists(supabase, dedupeKey))) {
      notificationsSkipped += 1;
      continue;
    }

    const notification = await createNotification(
      {
        actionUrl: ROLE_DASHBOARD_ROUTES[role],
        metadata: {
          base_dedupe_key: baseDedupeKey,
          date_bucket: date,
          dedupe_key: dedupeKey,
          digest_role: role,
          generated_at: generatedAt,
          high_priority_count: roleDigest.summary.highPriorityCount,
          mode,
          total_alerts: roleDigest.summary.totalAlerts,
        },
        message:
          role === USER_ROLES.projectManager
            ? `Project follow-up digest ready: ${roleDigest.summary.totalAlerts} project alert(s), ${roleDigest.summary.highPriorityCount} high priority.`
            : `Daily operations digest ready: ${roleDigest.summary.totalAlerts} project alert(s), ${roleDigest.summary.highPriorityCount} high priority.`,
        priority:
          roleDigest.summary.highPriorityCount > 0 ? "high" : "normal",
        recipientRole: role,
        title:
          role === USER_ROLES.projectManager
            ? "Project follow-up digest ready"
            : role === USER_ROLES.superAdmin
              ? "Platform operations digest ready"
              : "Daily operations digest ready",
        type: "daily_operations_digest",
      },
      supabase,
    );

    if (!notification.ok) {
      notificationsSkipped += 1;
      continue;
    }

    notificationsCreated += 1;

    const recipients = await loadRecipients(supabase, role);
    const template = buildDigestEmailTemplate(roleDigest);

    if (recipients.length === 0) {
      await recordDelivery({
        notificationId: notification.id,
        recipientEmailAvailable: false,
        result: {
          errorMessage: "No active role recipients with email were found.",
          ok: false,
          provider: "none",
          status: "skipped",
        },
        role,
        subject: template.subject,
        supabase,
      });
      incrementDeliveryCount(emailDelivery, "skipped");
      continue;
    }

    for (const recipient of recipients) {
      const delivery = await deliverEmail({
        template,
        to: recipient.email,
      });

      await recordDelivery({
        notificationId: notification.id,
        recipientEmailAvailable: Boolean(recipient.email),
        result: delivery,
        role,
        subject: template.subject,
        supabase,
      });

      incrementDeliveryCount(emailDelivery, delivery.status);
    }
  }

  await writeAuditLog(
    {
      action:
        mode === "manual"
          ? "daily_operations_digest_sent_manually"
          : "daily_operations_digest_cron_ran",
      actorRole: input.actorRole ?? USER_ROLES.admin,
      actorUserId: input.actorUserId ?? null,
      entityType: "daily_operations_digest",
      metadata: {
        date_bucket: date,
        email_delivery: emailDelivery,
        generated_at: generatedAt,
        mode,
        notifications_created: notificationsCreated,
        notifications_skipped: notificationsSkipped,
      },
    },
    supabase,
  );

  return {
    date,
    emailDelivery,
    generatedAt,
    notificationsCreated,
    notificationsSkipped,
    roles,
  };
}
