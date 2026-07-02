import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";
import { deliverEmail } from "@/lib/notifications/email-provider";
import {
  buildEmailTemplate,
  getNotificationTemplate,
} from "@/lib/notifications/templates";
import type { NotificationPayload } from "@/lib/notifications/types";

type SupabaseAdmin = ReturnType<typeof createAdminSupabaseClient>;

type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];

function asJson(value: Json | undefined) {
  return value ?? {};
}

export async function createNotification(
  payload: NotificationPayload,
  supabase: SupabaseAdmin = createAdminSupabaseClient(),
) {
  const template = getNotificationTemplate(payload.type, payload.templateContext);
  const title = payload.title ?? template.title;
  const message = payload.message ?? template.message;
  const channel = payload.channel ?? "in_app";

  try {
    const insertPayload: NotificationInsert = {
      action_url: payload.actionUrl ?? null,
      actor_profile_id: payload.actorProfileId ?? null,
      assignment_id: payload.assignmentId ?? null,
      channel,
      invoice_id: payload.invoiceId ?? null,
      message,
      metadata: asJson(payload.metadata),
      payment_id: payload.paymentId ?? null,
      priority: payload.priority ?? "normal",
      project_id: payload.projectId ?? null,
      recipient_profile_id: payload.recipientProfileId ?? null,
      recipient_role: payload.recipientRole ?? null,
      refund_id: payload.refundId ?? null,
      status: channel === "in_app" || channel === "system" ? "delivered" : "queued",
      submission_id: payload.submissionId ?? null,
      title,
      type: payload.type,
    };
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !notification) {
      return {
        ok: false as const,
        message: error?.message ?? "Notification could not be recorded.",
      };
    }

    if (channel === "email") {
      const emailTemplate = buildEmailTemplate({
        actionLabel: payload.templateContext?.actionLabel,
        actionUrl: payload.actionUrl,
        message,
        title,
      });
      const delivery = await deliverEmail({ template: emailTemplate });

      await supabase.from("notification_delivery_logs").insert({
        delivery_status: delivery.status,
        error_message: delivery.ok ? null : delivery.errorMessage,
        metadata: {
          email_delivery_mode: process.env.EMAIL_DELIVERY_MODE ?? "disabled",
          subject: emailTemplate.subject,
        },
        notification_id: notification.id,
        provider: delivery.provider,
        provider_message_id: delivery.ok ? delivery.providerMessageId ?? null : null,
      });

      if (!delivery.ok) {
        await supabase
          .from("notifications")
          .update({ status: delivery.status })
          .eq("id", notification.id);
      }
    }

    return { id: notification.id, ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Notification infrastructure is not available yet.",
    };
  }
}

export async function createNotifications(
  payloads: NotificationPayload[],
  supabase: SupabaseAdmin = createAdminSupabaseClient(),
) {
  const results = await Promise.all(
    payloads.map((payload) => createNotification(payload, supabase)),
  );

  return {
    ok: results.every((result) => result.ok),
    results,
  };
}
