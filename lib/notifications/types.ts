import type { Database, Json } from "@/lib/supabase/types";

export type NotificationType =
  | "project_submitted"
  | "invoice_issued"
  | "manual_payment_submitted"
  | "payment_verified"
  | "payment_rejected"
  | "payment_needs_more_info"
  | "admin_needs_project_info"
  | "project_approved"
  | "project_rejected"
  | "factory_report_released"
  | "factory_report_withdrawn"
  | "report_feedback_answered"
  | "refund_requested"
  | "refund_approved"
  | "refund_rejected"
  | "refund_processed"
  | "fms_assignment_created"
  | "assignment_status_updated"
  | "factory_submission_changes_requested"
  | "factory_submission_approved"
  | "factory_submission_rejected"
  | "fms_clarification_requested"
  | "new_project_submitted"
  | "unpaid_lead_created"
  | "fms_factory_submission_received"
  | "importer_report_feedback_received"
  | "file_evidence_uploaded"
  | "file_evidence_released"
  | "unsafe_contact_firewall_flag"
  | "password_reset_by_super_admin"
  | "role_changed"
  | "user_suspended"
  | "suspicious_access_or_role_mismatch"
  | "project_lifecycle_alert"
  | "daily_operations_digest"
  | "project_manager_project_updated"
  | "project_manager_project_escalated";

export type NotificationChannel = "in_app" | "email" | "system";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationStatus =
  | "queued"
  | "delivered"
  | "read"
  | "failed"
  | "skipped";

export type NotificationRecipientRole =
  Database["public"]["Enums"]["user_role"];

export type NotificationTemplateContext = {
  actionLabel?: string;
  adminMessage?: string;
  amount?: string;
  assignmentCode?: string;
  city?: string;
  decision?: string;
  fmsCode?: string;
  invoiceCode?: string;
  leadCode?: string;
  packageName?: string;
  paymentStatus?: string;
  projectCode?: string;
  refundCode?: string;
  submissionCode?: string;
  userName?: string;
};

export type NotificationPayload = {
  actionUrl?: string | null;
  actorProfileId?: string | null;
  assignmentId?: string | null;
  channel?: NotificationChannel;
  invoiceId?: string | null;
  metadata?: Json;
  message?: string;
  paymentId?: string | null;
  priority?: NotificationPriority;
  projectId?: string | null;
  recipientProfileId?: string | null;
  recipientRole?: NotificationRecipientRole | null;
  refundId?: string | null;
  submissionId?: string | null;
  templateContext?: NotificationTemplateContext;
  title?: string;
  type: NotificationType;
};

export type EmailTemplatePayload = {
  html: string;
  subject: string;
  text: string;
};
