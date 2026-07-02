import "server-only";

import type { Database } from "@/lib/supabase/types";

type AdminReviewStatus = Database["public"]["Enums"]["admin_review_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];

export type ImporterProjectStatusInput = {
  adminReviewStatus: AdminReviewStatus;
  hasActiveAssignment?: boolean;
  hasReleasedReport?: boolean;
  latestManualPaymentStatus?: string | null;
  latestRefundStatus?: Database["public"]["Enums"]["refund_status"] | null;
  paymentStatus: PaymentStatus;
  projectStatus: ProjectStatus;
};

export type ImporterProjectStatusSummary = {
  description: string;
  label: string;
  nextSteps: string[];
  tone: "attention" | "danger" | "neutral" | "success";
};

const DEFAULT_NEXT_STEPS = [
  "Keep your project details accurate inside the platform.",
  "ChinaPak ImportHub admin will update the project as each gate is completed.",
  "FMS and factory private contact details stay hidden unless a future approved workflow allows release.",
];

function manualPaymentLabel(status: string | null | undefined) {
  if (!status) {
    return null;
  }

  if (status === "submitted" || status === "under_review") {
    return {
      description:
        "Your manual payment reference has been received and is waiting for admin verification.",
      label: "Payment Submitted",
      nextSteps: [
        "Wait for ChinaPak ImportHub admin to verify the payment reference.",
        "FMS sourcing will remain blocked until payment is verified and admin review approves the project.",
      ],
      tone: "attention" as const,
    };
  }

  if (status === "needs_more_info") {
    return {
      description:
        "Admin needs more information before the manual payment reference can be verified.",
      label: "Payment Needs More Information",
      nextSteps: [
        "Check your notifications or payment page for admin instructions.",
        "Do not submit payment to unofficial personal accounts or numbers.",
      ],
      tone: "attention" as const,
    };
  }

  if (status === "rejected") {
    return {
      description:
        "The latest manual payment reference could not be verified by admin.",
      label: "Payment Issue",
      nextSteps: [
        "Open the payment page and submit a correct reference if payment was completed.",
        "Your project cannot move to FMS sourcing until payment is verified.",
      ],
      tone: "danger" as const,
    };
  }

  return null;
}

export function getImporterProjectStatusSummary(
  input: ImporterProjectStatusInput,
): ImporterProjectStatusSummary {
  if (input.latestRefundStatus === "processed") {
    return {
      description:
        "A refund decision has been processed for this project through the manual/offline workflow.",
      label: "Refund Processed",
      nextSteps: [
        "Review your refund document and invoice status.",
        "Contact ChinaPak ImportHub support through approved channels if you need clarification.",
      ],
      tone: "danger",
    };
  }

  if (
    input.projectStatus === "refunded" ||
    input.paymentStatus === "refunded"
  ) {
    return {
      description: "This project is marked as refunded.",
      label: "Refunded",
      nextSteps: [
        "Review your refund records for the final decision summary.",
        "Start a new Import Project if you want to source another product.",
      ],
      tone: "danger",
    };
  }

  if (
    input.projectStatus === "partially_refunded" ||
    input.paymentStatus === "partially_refunded"
  ) {
    return {
      description: "This project has a partial refund status.",
      label: "Partially Refunded",
      nextSteps: [
        "Review your refund record for the approved amount and admin response.",
        "Follow admin instructions before taking the next sourcing step.",
      ],
      tone: "danger",
    };
  }

  if (input.projectStatus === "cancelled") {
    return {
      description:
        "This project is cancelled or was not approved for sourcing in its current form.",
      label: "Cancelled",
      nextSteps: [
        "Review the latest project timeline or admin status.",
        "Start a new project with updated requirements if needed.",
      ],
      tone: "danger",
    };
  }

  if (input.projectStatus === "disputed") {
    return {
      description: "This project is under dispute review.",
      label: "Dispute Review",
      nextSteps: [
        "Wait for admin review and keep all communication inside the platform.",
        "Review refund or feedback records if they are linked to this project.",
      ],
      tone: "danger",
    };
  }

  if (input.hasReleasedReport) {
    return {
      description:
        "Admin has released a sanitized factory report for this project.",
      label: "Factory Report Ready",
      nextSteps: [
        "Open the released factory report and compare the approved options.",
        "Use the report feedback form if you need clarification.",
        "Factory contact details and raw FMS notes are not released at this stage.",
      ],
      tone: "success",
    };
  }

  if (
    input.projectStatus === "factory_options_submitted" ||
    input.projectStatus === "admin_quality_review"
  ) {
    return {
      description:
        "Factory options have been submitted for ChinaPak ImportHub admin review.",
      label: "Factory Options Under Review",
      nextSteps: [
        "Wait while admin checks quality, risk, and contact-firewall safety.",
        "Only admin-approved and sanitized information will be released to you.",
      ],
      tone: "attention",
    };
  }

  if (input.projectStatus === "fms_working") {
    return {
      description:
        "Factory research is in progress through the assigned Factory Match Specialist.",
      label: "Factory Research In Progress",
      nextSteps: [
        "Wait for factory options to be submitted to admin review.",
        "FMS works through the platform and will not contact you directly.",
      ],
      tone: "attention",
    };
  }

  if (input.projectStatus === "fms_assigned" || input.hasActiveAssignment) {
    return {
      description:
        "Your project has been assigned for factory matching through the platform.",
      label: "Factory Matching Started",
      nextSteps: [
        "The FMS receives only approved sourcing-task information.",
        "Importer and FMS private contact details remain hidden from each other.",
      ],
      tone: "attention",
    };
  }

  if (input.projectStatus === "ready_for_fms_assignment") {
    return {
      description:
        "Payment is verified and admin review has approved this project for FMS assignment.",
      label: "Ready for FMS Assignment",
      nextSteps: [
        "Wait for admin to assign an approved Factory Match Specialist.",
        "No direct importer-FMS communication is allowed.",
      ],
      tone: "success",
    };
  }

  if (
    input.adminReviewStatus === "needs_information" ||
    input.projectStatus === "needs_importer_clarification"
  ) {
    return {
      description:
        "Admin needs more information before this project can move forward.",
      label: "Need More Information",
      nextSteps: [
        "Watch your notifications for admin instructions.",
        "Upload additional safe product files if they help explain the requirement.",
      ],
      tone: "attention",
    };
  }

  if (input.adminReviewStatus === "rejected") {
    return {
      description:
        "Admin did not approve this project for sourcing in its current form.",
      label: "Project Not Approved",
      nextSteps: [
        "Review the project timeline for the latest admin status.",
        "Submit a new project with corrected requirements if needed.",
      ],
      tone: "danger",
    };
  }

  if (input.paymentStatus === "failed") {
    return {
      description:
        "The project has a payment issue and cannot move to sourcing yet.",
      label: "Payment Issue",
      nextSteps: [
        "Open the payment page and submit a corrected manual payment reference.",
        "FMS sourcing stays blocked until payment is verified.",
      ],
      tone: "danger",
    };
  }

  const manualPayment = manualPaymentLabel(input.latestManualPaymentStatus);

  if (input.paymentStatus !== "paid" && manualPayment) {
    return manualPayment;
  }

  if (input.paymentStatus !== "paid") {
    return {
      description:
        "Payment is required before admin approval and FMS sourcing can begin.",
      label: "Payment Required",
      nextSteps: [
        "Open the invoice or manual payment page and submit payment reference details.",
        "No FMS work begins until payment is verified and admin review is approved.",
      ],
      tone: "attention",
    };
  }

  if (
    input.adminReviewStatus === "not_started" ||
    input.adminReviewStatus === "in_review" ||
    input.projectStatus === "admin_review" ||
    input.projectStatus === "payment_received"
  ) {
    return {
      description:
        "Payment is verified. Admin is reviewing the project before FMS assignment.",
      label: "Admin Review",
      nextSteps: [
        "Wait for admin to approve, request more information, or reject the project.",
        "FMS assignment remains blocked until admin marks the project ready.",
      ],
      tone: "attention",
    };
  }

  return {
    description: "ChinaPak ImportHub is tracking this Import Project.",
    label: "Project Tracking",
    nextSteps: DEFAULT_NEXT_STEPS,
    tone: "neutral",
  };
}
