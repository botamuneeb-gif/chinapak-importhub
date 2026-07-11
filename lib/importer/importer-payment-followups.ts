import "server-only";

import { ROUTES } from "@/config/brand";
import { getSiteUrl } from "@/config/site-url";
import { USER_ROLES } from "@/lib/auth/roles";
import { createNotification } from "@/lib/notifications/create-notification";
import { deliverEmail } from "@/lib/notifications/email-provider";
import {
  buildEmailTemplate,
  getNotificationTemplate,
} from "@/lib/notifications/templates";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type SupabaseAdmin = ReturnType<typeof createAdminSupabaseClient>;
type ImportProjectRow = Database["public"]["Tables"]["import_projects"]["Row"];
type ImporterProfileRow =
  Database["public"]["Tables"]["importer_profiles"]["Row"];

const PAYMENT_FOLLOWUP_THRESHOLD_HOURS = 24;
const PAYMENT_VERIFICATION_THRESHOLD_HOURS = 12;
const MAX_IMPORTER_PAYMENT_REMINDERS = 3;

function hoursAgo(hours: number, now = new Date()) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function dateBucket(now = new Date()) {
  return now.toISOString().slice(0, 10);
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

async function countImporterReminders(
  supabase: SupabaseAdmin,
  projectId: string,
) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("type", "importer_payment_reminder");

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function getImporterProfile(
  supabase: SupabaseAdmin,
  importerProfileId: string,
) {
  const { data, error } = await supabase
    .from("importer_profiles")
    .select("*")
    .eq("id", importerProfileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getVerifiedImporterEmail(
  supabase: SupabaseAdmin,
  importerUserId: string,
) {
  const { data, error } = await supabase.auth.admin.getUserById(importerUserId);

  if (error || !data.user?.email_confirmed_at) {
    return null;
  }

  return data.user.email ?? null;
}

function projectRouteForRole(role: "admin" | "project_manager", projectCode: string) {
  return role === "admin"
    ? `/admin/projects/${encodeURIComponent(projectCode)}`
    : `${ROUTES.projectManagerProjects}/${encodeURIComponent(projectCode)}`;
}

function absoluteUrl(path: string) {
  return `${getSiteUrl()}${path}`;
}

async function createInternalFollowupNotification(input: {
  alertType: string;
  project: ImportProjectRow;
  role: "admin" | "project_manager";
  supabase: SupabaseAdmin;
  now: Date;
}) {
  const dedupeKey = `importer_payment_followup:${input.project.id}:${input.alertType}:${input.role}:${dateBucket(input.now)}`;

  if (await notificationExists(input.supabase, dedupeKey)) {
    return "skipped" as const;
  }

  const roleLabel =
    input.role === "project_manager" ? "Project Manager" : "Admin";
  const message =
    input.alertType === "payment_verification_pending"
      ? `${input.project.project_code} has a payment reference awaiting Admin verification. ${roleLabel} should review the project status; payment verification remains Admin/Super Admin only.`
      : `${input.project.project_code} has not completed manual payment after submission. Follow up through the platform and keep FMS work blocked until Admin verifies payment.`;

  const result = await createNotification(
    {
      actionUrl: projectRouteForRole(input.role, input.project.project_code),
      metadata: {
        alert_type: input.alertType,
        date_bucket: dateBucket(input.now),
        dedupe_key: dedupeKey,
        reminder_type: "importer_payment_followup",
      },
      message,
      priority:
        input.alertType === "payment_verification_pending" ? "high" : "normal",
      projectId: input.project.id,
      recipientRole:
        input.role === "admin" ? USER_ROLES.admin : USER_ROLES.projectManager,
      title:
        input.alertType === "payment_verification_pending"
          ? "Payment verification pending"
          : "Importer payment follow-up needed",
      type: "project_lifecycle_alert",
    },
    input.supabase,
  );

  return result.ok ? ("created" as const) : ("failed" as const);
}

async function createImporterReminder(input: {
  importerProfile: ImporterProfileRow | null;
  project: ImportProjectRow;
  sendEmail: boolean;
  supabase: SupabaseAdmin;
  now: Date;
}) {
  if (!input.importerProfile?.user_profile_id) {
    return "skipped" as const;
  }

  const reminderCount = await countImporterReminders(
    input.supabase,
    input.project.id,
  );

  if (reminderCount >= MAX_IMPORTER_PAYMENT_REMINDERS) {
    return "skipped" as const;
  }

  const dedupeKey = `importer_payment_reminder:${input.project.id}:${dateBucket(input.now)}`;

  if (await notificationExists(input.supabase, dedupeKey)) {
    return "skipped" as const;
  }

  const actionUrl = `${ROUTES.importerProjects}/${encodeURIComponent(
    input.project.project_code,
  )}`;
  const notification = await createNotification(
    {
      actionUrl,
      metadata: {
        date_bucket: dateBucket(input.now),
        dedupe_key: dedupeKey,
        reminder_count_after_create: reminderCount + 1,
        reminder_type: "importer_payment_reminder",
      },
      projectId: input.project.id,
      recipientProfileId: input.importerProfile.user_profile_id,
      templateContext: {
        projectCode: input.project.project_code,
      },
      type: "importer_payment_reminder",
    },
    input.supabase,
  );

  if (!notification.ok || !input.sendEmail) {
    return notification.ok ? ("created" as const) : ("failed" as const);
  }

  const recipientEmail = await getVerifiedImporterEmail(
    input.supabase,
    input.project.importer_user_id,
  );

  if (!recipientEmail) {
    return "created" as const;
  }

  const template = getNotificationTemplate("importer_payment_reminder", {
    projectCode: input.project.project_code,
  });
  const delivery = await deliverEmail({
    template: buildEmailTemplate({
      actionLabel: "Open Import Project",
      actionUrl: absoluteUrl(actionUrl),
      message: template.message,
      title: template.title,
    }),
    to: recipientEmail,
  });

  await input.supabase.from("notification_delivery_logs").insert({
    delivery_status: delivery.status,
    error_message: delivery.ok ? null : delivery.errorMessage,
    metadata: {
      email_delivery_mode: process.env.EMAIL_DELIVERY_MODE ?? "disabled",
      project_code: input.project.project_code,
      reminder_type: "importer_payment_reminder",
    },
    notification_id: notification.id,
    provider: delivery.provider,
    provider_message_id: delivery.ok
      ? delivery.providerMessageId ?? null
      : null,
  });

  return "created" as const;
}

export async function generateImporterPaymentFollowups(input: {
  now?: Date;
  sendImporterEmails?: boolean;
  supabase?: SupabaseAdmin;
} = {}) {
  const supabase = input.supabase ?? createAdminSupabaseClient();
  const now = input.now ?? new Date();
  const submittedBefore = hoursAgo(PAYMENT_FOLLOWUP_THRESHOLD_HOURS, now);
  const verificationBefore = hoursAgo(PAYMENT_VERIFICATION_THRESHOLD_HOURS, now);
  const results = {
    internalCreated: 0,
    internalSkipped: 0,
    importerCreated: 0,
    importerSkipped: 0,
    projectsReviewed: 0,
  };

  const { data: awaitingProjects, error: projectError } = await supabase
    .from("import_projects")
    .select("*")
    .eq("payment_status", "awaiting_payment")
    .lte("created_at", submittedBefore)
    .order("created_at", { ascending: true });

  if (projectError) {
    throw new Error(projectError.message);
  }

  const { data: pendingPaymentRequests, error: paymentError } = await supabase
    .from("manual_payment_requests")
    .select("project_id")
    .in("status", ["submitted", "under_review"])
    .lte("created_at", verificationBefore);

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const pendingVerificationProjectIds = new Set(
    (pendingPaymentRequests ?? [])
      .map((request) => request.project_id)
      .filter((projectId): projectId is string => Boolean(projectId)),
  );

  for (const project of awaitingProjects ?? []) {
    results.projectsReviewed += 1;
    const alertType = pendingVerificationProjectIds.has(project.id)
      ? "payment_verification_pending"
      : "payment_not_started";

    for (const role of ["admin", "project_manager"] as const) {
      const result = await createInternalFollowupNotification({
        alertType,
        now,
        project,
        role,
        supabase,
      });

      if (result === "created") {
        results.internalCreated += 1;
      } else {
        results.internalSkipped += 1;
      }
    }

    if (alertType === "payment_not_started") {
      const importerProfile = await getImporterProfile(
        supabase,
        project.importer_profile_id,
      );
      const result = await createImporterReminder({
        importerProfile,
        now,
        project,
        sendEmail: Boolean(input.sendImporterEmails),
        supabase,
      });

      if (result === "created") {
        results.importerCreated += 1;
      } else {
        results.importerSkipped += 1;
      }
    }
  }

  return results;
}
