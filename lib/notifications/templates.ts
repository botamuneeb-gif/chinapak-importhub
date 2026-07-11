import { brand } from "@/config/brand";
import type {
  EmailTemplatePayload,
  NotificationTemplateContext,
  NotificationType,
} from "@/lib/notifications/types";

type TemplateResult = {
  message: string;
  title: string;
};

function value(value: string | undefined, fallback: string) {
  return value && value.trim() ? value : fallback;
}

const IMPORTER_PROJECT_WORD = "Import Project";

export function getNotificationTemplate(
  type: NotificationType,
  context: NotificationTemplateContext = {},
): TemplateResult {
  const projectCode = value(context.projectCode, "your Import Project");
  const invoiceCode = value(context.invoiceCode, "your invoice");
  const refundCode = value(context.refundCode, "your refund request");
  const assignmentCode = value(context.assignmentCode, "your assignment");
  const submissionCode = value(context.submissionCode, "factory submission");

  switch (type) {
    case "project_submitted":
      return {
        title: "Import Project submitted",
        message: `${projectCode} محفوظ ہو گیا ہے۔ Payment verification اور admin review کے بعد sourcing work start ہو سکے گا۔`,
      };
    case "importer_project_received":
      return {
        title: "Import Project received",
        message: `${projectCode} was received. Your next step is to review the invoice/payment instructions and submit a manual payment reference for Admin verification.`,
      };
    case "importer_payment_instructions":
      return {
        title: "Payment instructions ready",
        message: `${invoiceCode} is ready for ${projectCode}. Submit your manual payment reference only through the platform; never share card numbers, banking passwords, OTPs, or private account credentials.`,
      };
    case "importer_payment_proof_received":
      return {
        title: "Payment proof received",
        message: `${invoiceCode} payment reference was received. Admin verification is pending before factory search or FMS work can begin.`,
      };
    case "importer_payment_verified":
      return {
        title: "Payment verified",
        message: `${projectCode} payment was verified by Admin. The project still follows Admin review before any FMS assignment or factory search proceeds.`,
      };
    case "importer_payment_needs_correction":
      return {
        title: "Payment needs correction",
        message: `${projectCode} payment reference needs correction or more information. Review the Admin message and submit corrected payment details through the platform.`,
      };
    case "importer_payment_reminder":
      return {
        title: "Payment reminder",
        message: `${projectCode} is still awaiting payment verification. Submit the manual payment reference when ready so Admin can review it before sourcing begins.`,
      };
    case "invoice_issued":
      return {
        title: "Invoice issued",
        message: `${invoiceCode} prepared for ${projectCode}. Manual payment verification is available in your importer portal.`,
      };
    case "manual_payment_submitted":
      return {
        title: "Manual payment submitted",
        message: `${invoiceCode} payment reference has been submitted for admin review.`,
      };
    case "payment_verified":
      return {
        title: "Payment verified",
        message: `Payment verified for ${projectCode}. Admin review must also approve the project before FMS assignment.`,
      };
    case "payment_rejected":
      return {
        title: "Payment issue",
        message: `Payment reference for ${projectCode} could not be verified. Please review the admin note and submit correct details.`,
      };
    case "payment_needs_more_info":
      return {
        title: "Payment needs more information",
        message: `Admin needs clearer payment details for ${projectCode}. FMS work remains blocked until payment is verified.`,
      };
    case "admin_needs_project_info":
      return {
        title: "Project information needed",
        message: `Admin needs more details for ${projectCode}. Please respond through the platform when requested.`,
      };
    case "project_approved":
      return {
        title: "Project approved by admin",
        message: `${projectCode} has passed admin review. FMS assignment can happen only after payment is verified.`,
      };
    case "project_rejected":
      return {
        title: "Project review rejected",
        message: `${projectCode} was rejected by admin review. Please contact ChinaPak ImportHub support for next steps.`,
      };
    case "factory_report_released":
      return {
        title: "Factory report ready",
        message: `${projectCode} کا approved factory report آپ کے importer portal میں ready ہے۔ Factory contact details اس stage پر share نہیں کی جاتیں۔`,
      };
    case "factory_report_withdrawn":
      return {
        title: "Factory report withdrawn",
        message: `${projectCode} report was withdrawn by admin for review. You will see updates after admin releases it again.`,
      };
    case "report_feedback_answered":
      return {
        title: "Report feedback answered",
        message: `Admin responded to your feedback for ${projectCode}.`,
      };
    case "refund_requested":
      return {
        title: "Refund request submitted",
        message: `${refundCode} has been submitted for admin review.`,
      };
    case "refund_approved":
      return {
        title: "Refund approved",
        message: `${refundCode} was approved by admin. Money movement remains manual/offline until a gateway is connected.`,
      };
    case "refund_rejected":
      return {
        title: "Refund rejected",
        message: `${refundCode} was rejected after admin review. Please review the admin response.`,
      };
    case "refund_processed":
      return {
        title: "Refund processed",
        message: `${refundCode} was marked processed manually/offline by admin.`,
      };
    case "fms_assignment_created":
      return {
        title: "New FMS assignment",
        message: `${assignmentCode} has been assigned. Importer contact details are hidden by platform policy.`,
      };
    case "assignment_status_updated":
      return {
        title: "Assignment status updated",
        message: `${assignmentCode} status was updated to ${value(context.decision, "the next milestone")}.`,
      };
    case "factory_submission_changes_requested":
      return {
        title: "Factory submission changes requested",
        message: `Admin requested changes for ${submissionCode}. Please update through the FMS portal only.`,
      };
    case "factory_submission_approved":
      return {
        title: "Factory submission approved",
        message: `${submissionCode} was approved by admin for internal workflow.`,
      };
    case "factory_submission_rejected":
      return {
        title: "Factory submission rejected",
        message: `${submissionCode} was rejected by admin review.`,
      };
    case "fms_clarification_requested":
      return {
        title: "Clarification requested",
        message: `Admin requested sourcing clarification for ${assignmentCode}. Do not contact the importer directly.`,
      };
    case "new_project_submitted":
      return {
        title: "New paid-intent project",
        message: `${projectCode} was submitted and awaits payment/admin review.`,
      };
    case "unpaid_lead_created":
      return {
        title: "New unpaid lead",
        message: `${value(context.leadCode, "A lead")} was saved for payment-help follow-up. It is not assignable to FMS.`,
      };
    case "fms_factory_submission_received":
      return {
        title: "FMS factory submission received",
        message: `${submissionCode} is waiting for admin review.`,
      };
    case "importer_report_feedback_received":
      return {
        title: "Importer report feedback received",
        message: `Importer submitted report feedback for ${projectCode}. Admin review is required before routing.`,
      };
    case "file_evidence_uploaded":
      return {
        title: "Evidence uploaded",
        message: `New evidence was uploaded for ${projectCode}. Admin review controls visibility.`,
      };
    case "file_evidence_released":
      return {
        title: "Evidence released",
        message: `Admin released selected evidence for ${projectCode}.`,
      };
    case "unsafe_contact_firewall_flag":
      return {
        title: "Contact firewall flag",
        message: `A possible unsafe contact/payment detail was detected for ${projectCode}. Admin review is required.`,
      };
    case "password_reset_by_super_admin":
      return {
        title: "Password reset by Super Admin",
        message: `A Super Admin reset a user password. No password value is stored in notifications.`,
      };
    case "role_changed":
      return {
        title: "User role changed",
        message: `A user role was changed to ${value(context.decision, "a new role")}.`,
      };
    case "user_suspended":
      return {
        title: "User suspended",
        message: `A user profile was suspended by Super Admin.`,
      };
    case "suspicious_access_or_role_mismatch":
      return {
        title: "Role mismatch warning",
        message: `Potential role/profile mismatch detected. Super Admin review is recommended.`,
      };
    case "project_lifecycle_alert":
      return {
        title: "Project lifecycle alert",
        message: `${projectCode} needs operational follow-up. Review the recommended action before changing any payment, FMS, or report state.`,
      };
    case "daily_operations_digest":
      return {
        title: "Daily operations digest ready",
        message:
          "Today's internal operations digest is ready. Review high-priority items before changing payment, FMS, report, or user state.",
      };
    case "project_manager_project_updated":
      return {
        title: "Project Manager update",
        message: `${projectCode} was updated by a Project Manager. Review the internal timeline before the next operational step.`,
      };
    case "project_manager_project_escalated":
      return {
        title: "Project escalated by Project Manager",
        message: `${projectCode} was escalated to Admin for a restricted decision or operational unblock.`,
      };
    default:
      return {
        title: "ChinaPak ImportHub update",
        message: `${IMPORTER_PROJECT_WORD} update is available.`,
      };
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildEmailTemplate(input: {
  actionLabel?: string;
  actionUrl?: string | null;
  message: string;
  title: string;
}): EmailTemplatePayload {
  const actionUrl = input.actionUrl ?? "";
  const escapedTitle = escapeHtml(input.title);
  const escapedMessage = escapeHtml(input.message);
  const escapedActionUrl = escapeHtml(actionUrl);
  const actionLabel = escapeHtml(input.actionLabel ?? "Open portal");

  return {
    html: `
      <div style="font-family:Arial,sans-serif;background:#F7F9FC;padding:24px;color:#111827">
        <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;padding:24px">
          <div style="border-bottom:4px solid #C99A2E;padding-bottom:16px">
            <h1 style="margin:0;color:#0B1F3A">${escapeHtml(brand.name)}</h1>
            <p style="margin:8px 0 0;color:#6B7280">${escapeHtml(brand.tagline)}</p>
          </div>
          <h2 style="color:#0B1F3A;margin-top:24px">${escapedTitle}</h2>
          <p style="line-height:1.7">${escapedMessage}</p>
          ${
            actionUrl
              ? `<p><a href="${escapedActionUrl}" style="display:inline-block;background:#138A4A;color:#fff;padding:12px 16px;text-decoration:none;font-weight:bold">${actionLabel}</a></p>`
              : ""
          }
          <p style="border-top:1px solid #E5E7EB;margin-top:24px;padding-top:16px;color:#6B7280;font-size:13px">
            This is an operational notification from ${escapeHtml(brand.name)}.
          </p>
        </div>
      </div>`,
    subject: `${brand.name}: ${input.title}`,
    text: `${brand.name}\n\n${input.title}\n\n${input.message}${
      actionUrl ? `\n\n${input.actionLabel ?? "Open portal"}: ${actionUrl}` : ""
    }\n\n${brand.domain}`,
  };
}
