import "server-only";

import { ROUTES, brand } from "@/config/brand";
import { fmsApplicationSource } from "@/config/fms-acquisition";
import { getSiteUrl } from "@/config/site-url";
import { deliverEmail } from "@/lib/notifications/email-provider";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { EmailTemplatePayload } from "@/lib/notifications/types";

type SupabaseAdmin = ReturnType<typeof createAdminSupabaseClient>;

export type FmsApplicationDecision = "approve" | "decline" | "request_more_info";

type FmsApplicationEmailResult = {
  status: "queued" | "delivered" | "failed" | "skipped";
  statusMessage: string;
};

type FmsApplicationEmailContext = {
  applicantMessage?: string;
  candidateEmail?: string | null;
  candidateName?: string | null;
  leadCode: string;
  leadId: string;
  supabase: SupabaseAdmin;
  updateExpiresAt?: string | null;
  updateUrl?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteSiteUrl(path: string) {
  return `${getSiteUrl()}${path}`;
}

function formatEmailParagraphs(paragraphs: string[]) {
  return paragraphs
    .filter((paragraph) => paragraph.trim())
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;line-height:1.7">${escapeHtml(paragraph)}</p>`,
    )
    .join("");
}

function formatEmailList(items: string[]) {
  return `<ul style="margin:0 0 16px 20px;padding:0;line-height:1.7">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function buildFmsApplicationTemplate(input: {
  actionUrl: string;
  bodyHtml: string;
  bodyText: string[];
  ctaLabel: string;
  subject: string;
}) {
  const contactUrl = absoluteSiteUrl(ROUTES.contact);

  return {
    html: `
      <div style="font-family:Arial,sans-serif;background:#F7F9FC;padding:24px;color:#111827">
        <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;padding:24px">
          <div style="border-bottom:4px solid #C99A2E;padding-bottom:16px">
            <h1 style="margin:0;color:#0B1F3A">${escapeHtml(brand.name)}</h1>
            <p style="margin:8px 0 0;color:#6B7280">${escapeHtml(brand.tagline)}</p>
          </div>
          <h2 style="color:#0B1F3A;margin-top:24px">${escapeHtml(input.subject)}</h2>
          ${input.bodyHtml}
          <p><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#138A4A;color:#fff;padding:12px 16px;text-decoration:none;font-weight:bold">${escapeHtml(input.ctaLabel)}</a></p>
          <p style="border-top:1px solid #E5E7EB;margin-top:24px;padding-top:16px;color:#6B7280;font-size:13px;line-height:1.6">
            Need help? Contact ${escapeHtml(brand.name)} support through
            <a href="${escapeHtml(contactUrl)}">${escapeHtml(contactUrl)}</a>.
            This email does not contain importer data, factory private data, passwords, or internal admin notes.
          </p>
        </div>
      </div>`,
    subject: input.subject,
    text: [
      brand.name,
      "",
      input.subject,
      "",
      ...input.bodyText,
      "",
      `${input.ctaLabel}: ${input.actionUrl}`,
      "",
      `Support: ${contactUrl}`,
      brand.domain,
    ].join("\n"),
  } satisfies EmailTemplatePayload;
}

function buildConfirmationTemplate({
  candidateName,
  leadCode,
}: {
  candidateName: string;
  leadCode: string;
}) {
  const paragraphs = [
    `Hello ${candidateName},`,
    `Your ChinaPak ImportHub Factory Match Specialist application was received. Application reference: ${leadCode}.`,
    "Our review process has three steps: Admin pre-screening, Super Admin final approval if shortlisted, and secure invite-based FMS onboarding if approved.",
    "Public FMS signup is not enabled. Approved FMS access is created only through secure invitation.",
    "Our team will contact you if more information is required.",
  ];

  return buildFmsApplicationTemplate({
    actionUrl: absoluteSiteUrl(ROUTES.fmsApply),
    bodyHtml: formatEmailParagraphs(paragraphs),
    bodyText: paragraphs,
    ctaLabel: "View FMS Application Page",
    subject: "Your ChinaPak ImportHub FMS application was received",
  });
}

function buildAdminRequestInfoTemplate({
  applicantMessage,
  candidateName,
  leadCode,
  updateExpiresAt,
  updateUrl,
}: {
  applicantMessage: string;
  candidateName: string;
  leadCode: string;
  updateExpiresAt?: string | null;
  updateUrl?: string | null;
}) {
  const actionUrl = updateUrl || absoluteSiteUrl(ROUTES.fmsApply);
  const expiryText = updateExpiresAt
    ? `This secure update link expires on ${new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(updateExpiresAt))}.`
    : "This secure update link is time-limited.";
  const paragraphs = [
    `Hello ${candidateName},`,
    `Your FMS application ${leadCode} is still under admin review. We need more information before the application can move forward.`,
    applicantMessage,
    "Please use the secure link below to update your existing application. Do not submit a duplicate FMS application.",
    expiryText,
    "If the secure link expires, contact ChinaPak ImportHub support or submit a new application only if support asks you to do so.",
  ];

  return buildFmsApplicationTemplate({
    actionUrl,
    bodyHtml: formatEmailParagraphs(paragraphs),
    bodyText: paragraphs,
    ctaLabel: updateUrl ? "Update Existing Application" : "Open FMS Application Page",
    subject: "More information needed for your ChinaPak ImportHub FMS application",
  });
}

function buildForwardedTemplate({
  applicantMessage,
  candidateName,
  leadCode,
}: {
  applicantMessage?: string;
  candidateName: string;
  leadCode: string;
}) {
  const paragraphs = [
    `Hello ${candidateName},`,
    `Your FMS application ${leadCode} has passed admin pre-screening and was forwarded for Super Admin final review.`,
    applicantMessage ||
      "No action is needed from you right now unless our team contacts you for more information.",
    "Forwarding for final review does not guarantee approval. If approved, onboarding remains secure invite-based only.",
  ];

  return buildFmsApplicationTemplate({
    actionUrl: absoluteSiteUrl(ROUTES.fmsApply),
    bodyHtml: formatEmailParagraphs(paragraphs),
    bodyText: paragraphs,
    ctaLabel: "View FMS Application Page",
    subject: "Your FMS application is under final review",
  });
}

function buildDecisionTemplate({
  applicantMessage,
  candidateName,
  decision,
  leadCode,
  updateExpiresAt,
  updateUrl,
}: {
  applicantMessage: string;
  candidateName: string;
  decision: FmsApplicationDecision;
  leadCode: string;
  updateExpiresAt?: string | null;
  updateUrl?: string | null;
}) {
  const fmsLoginUrl = absoluteSiteUrl(ROUTES.fmsLogin);
  const fmsAcademyUrl = absoluteSiteUrl(ROUTES.fmsAcademy);
  const fmsApplyUrl = absoluteSiteUrl(ROUTES.fmsApply);
  const inviteUrl = absoluteSiteUrl(ROUTES.authInvite);
  const subject =
    decision === "approve"
      ? "Your ChinaPak ImportHub FMS application has been approved"
      : decision === "decline"
        ? "Update on your ChinaPak ImportHub FMS application"
        : "More information needed for your ChinaPak ImportHub FMS application";

  if (decision === "approve") {
    const paragraphs = [
      `Hello ${candidateName},`,
      `Your Factory Match Specialist application ${leadCode} has been approved by ChinaPak ImportHub.`,
      applicantMessage ||
        "Welcome to ChinaPak ImportHub. Please complete your secure account setup using the invite link sent to your inbox.",
      "Your FMS access is created through secure invitation only. Public FMS signup is not enabled.",
      "Please check your inbox for the secure Supabase account setup invitation. If you were also given an invitation code, enter it on the invitation page.",
      "After activation, log in through the FMS login page to review assignments and submit factory options/evidence for admin review.",
    ];

    return buildFmsApplicationTemplate({
      actionUrl: inviteUrl,
      bodyHtml: `${formatEmailParagraphs(paragraphs)}
        <div style="border:1px solid #D1FAE5;background:#ECFDF5;padding:16px;margin:18px 0">
          <p style="margin:0 0 10px;font-weight:bold;color:#0B1F3A">Secure account activation</p>
          ${formatEmailList([
            "Use the secure Supabase account setup invitation sent separately as the activation step.",
            "If you were given an invitation code, enter it on the invitation page for account setup support.",
            "Use FMS Login only after activation is complete.",
          ])}
          <p style="margin:0 0 10px;font-weight:bold;color:#0B1F3A">Important platform boundaries</p>
          ${formatEmailList([
            "FMS does not contact importers directly.",
            "FMS users never see importer contact details.",
            "FMS submits factory options and evidence for admin review only.",
            "Factory contact details must not be released without admin approval.",
          ])}
          <p style="line-height:1.7;color:#6B7280">Invitation/code help: <a href="${escapeHtml(inviteUrl)}">${escapeHtml(inviteUrl)}</a></p>
          <p style="line-height:1.7;color:#6B7280">FMS Login after activation: <a href="${escapeHtml(fmsLoginUrl)}">${escapeHtml(fmsLoginUrl)}</a></p>
          <p style="line-height:1.7;color:#6B7280">FMS Academy: <a href="${escapeHtml(fmsAcademyUrl)}">${escapeHtml(fmsAcademyUrl)}</a></p>
        </div>`,
      bodyText: [
        ...paragraphs,
        "",
        "Secure account activation:",
        "- Use the secure Supabase account setup invitation sent separately as the activation step.",
        "- If you were given an invitation code, enter it on the invitation page for account setup support.",
        "- Use FMS Login only after activation is complete.",
        "",
        "Important platform boundaries:",
        "- FMS does not contact importers directly.",
        "- FMS users never see importer contact details.",
        "- FMS submits factory options and evidence for admin review only.",
        "- Factory contact details must not be released without admin approval.",
        "",
        `Invitation/code help: ${inviteUrl}`,
        `FMS Login after activation: ${fmsLoginUrl}`,
        `FMS Academy: ${fmsAcademyUrl}`,
      ],
      ctaLabel: "Open Invitation Help",
      subject,
    });
  }

  if (decision === "decline") {
    const paragraphs = [
      `Hello ${candidateName},`,
      `Thank you for applying to become a Factory Match Specialist with ChinaPak ImportHub. We are unable to approve your FMS application ${leadCode} at this time.`,
      applicantMessage,
      "You may reapply after updating your experience details and providing stronger sourcing/factory information.",
    ];

    return buildFmsApplicationTemplate({
      actionUrl: fmsApplyUrl,
      bodyHtml: `${formatEmailParagraphs(paragraphs)}
        <div style="border:1px solid #E5E7EB;background:#F9FAFB;padding:16px;margin:18px 0">
          <p style="margin:0 0 10px;font-weight:bold;color:#0B1F3A">What we usually require</p>
          ${formatEmailList([
            "Clear city/province in China.",
            "Verified WeChat/contact details.",
            "Sourcing/factory experience.",
            "Product category knowledge.",
            "Ability to collect quotations, photos, and videos.",
            "Basic English or ability to communicate with the admin team.",
            "Sample report or resume if available.",
          ])}
        </div>`,
      bodyText: [
        ...paragraphs,
        "",
        "What we usually require:",
        "- Clear city/province in China.",
        "- Verified WeChat/contact details.",
        "- Sourcing/factory experience.",
        "- Product category knowledge.",
        "- Ability to collect quotations, photos, and videos.",
        "- Basic English or ability to communicate with the admin team.",
        "- Sample report or resume if available.",
      ],
      ctaLabel: "Apply Again",
      subject,
    });
  }

  const paragraphs = [
    `Hello ${candidateName},`,
    `Your FMS application ${leadCode} is still under review. We need more information before a final decision can be made.`,
    applicantMessage,
    "Please use the secure link below to update your existing application. Do not submit a duplicate FMS application.",
    updateExpiresAt
      ? `This secure update link expires on ${new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(new Date(updateExpiresAt))}.`
      : "This secure update link is time-limited.",
    "If the secure link expires, contact ChinaPak ImportHub support or submit a new application only if support asks you to do so.",
  ];

  return buildFmsApplicationTemplate({
    actionUrl: updateUrl || fmsApplyUrl,
    bodyHtml: formatEmailParagraphs(paragraphs),
    bodyText: paragraphs,
    ctaLabel: updateUrl ? "Update Existing Application" : "Open FMS Application Page",
    subject,
  });
}

async function recordAndDeliverFmsApplicationEmail({
  actionUrl,
  candidateEmail,
  kind,
  leadCode,
  leadId,
  priority = "normal",
  supabase,
  template,
}: {
  actionUrl: string;
  candidateEmail?: string | null;
  kind: string;
  leadCode: string;
  leadId: string;
  priority?: "high" | "normal";
  supabase: SupabaseAdmin;
  template: EmailTemplatePayload;
}): Promise<FmsApplicationEmailResult> {
  const cleanEmail = candidateEmail?.trim().toLowerCase() || "";
  const { data: notification, error: notificationError } = await supabase
    .from("notifications")
    .insert({
      action_url: actionUrl,
      channel: "email",
      message: template.text,
      metadata: {
        applicant_email_available: Boolean(cleanEmail),
        email_kind: kind,
        lead_code: leadCode,
        lead_id: leadId,
        source: fmsApplicationSource,
        subject: template.subject,
      },
      priority,
      status: "queued",
      title: template.subject,
      type: kind,
    })
    .select("id")
    .single();

  if (notificationError || !notification) {
    return {
      status: "failed",
      statusMessage:
        "Action saved, but the applicant email attempt could not be recorded.",
    };
  }

  const delivery = cleanEmail
    ? await deliverEmail({ template, to: cleanEmail })
    : {
        ok: false as const,
        errorMessage: "No applicant email address is available.",
        provider: "none",
        status: "skipped" as const,
      };

  await supabase.from("notification_delivery_logs").insert({
    delivery_status: delivery.status,
    error_message: delivery.ok ? null : delivery.errorMessage,
    metadata: {
      applicant_email_available: Boolean(cleanEmail),
      email_delivery_mode: process.env.EMAIL_DELIVERY_MODE ?? "disabled",
      email_kind: kind,
      lead_code: leadCode,
      subject: template.subject,
    },
    notification_id: notification.id,
    provider: delivery.provider,
    provider_message_id: delivery.ok ? delivery.providerMessageId ?? null : null,
  });

  await supabase
    .from("notifications")
    .update({ status: delivery.status })
    .eq("id", notification.id);

  if (!cleanEmail) {
    return {
      status: "skipped",
      statusMessage:
        "Action saved, but no candidate email is available. Please contact the candidate manually.",
    };
  }

  if (delivery.provider === "disabled") {
    return {
      status: "skipped",
      statusMessage:
        "Action saved, but email delivery is disabled. Please contact the candidate manually.",
    };
  }

  if (!delivery.ok) {
    return {
      status: delivery.status,
      statusMessage:
        "Action saved, but applicant email could not be sent. Please contact candidate manually.",
    };
  }

  if (delivery.provider === "log") {
    return {
      status: "skipped",
      statusMessage:
        "Action saved and applicant email was logged safely because EMAIL_DELIVERY_MODE=log.",
    };
  }

  return {
    status: delivery.status,
    statusMessage: "Action saved and applicant email queued/sent.",
  };
}

function getCandidateName(name?: string | null) {
  return name?.trim() || "FMS applicant";
}

export async function sendFmsApplicationConfirmationEmail({
  candidateEmail,
  candidateName,
  leadCode,
  leadId,
  supabase,
}: FmsApplicationEmailContext) {
  return recordAndDeliverFmsApplicationEmail({
    actionUrl: absoluteSiteUrl(ROUTES.fmsApply),
    candidateEmail,
    kind: "fms_application_confirmation_email",
    leadCode,
    leadId,
    priority: "normal",
    supabase,
    template: buildConfirmationTemplate({
      candidateName: getCandidateName(candidateName),
      leadCode,
    }),
  });
}

export async function sendFmsApplicationAdminMoreInfoEmail({
  applicantMessage,
  candidateEmail,
  candidateName,
  leadCode,
  leadId,
  supabase,
  updateExpiresAt,
  updateUrl,
}: FmsApplicationEmailContext & { applicantMessage: string }) {
  return recordAndDeliverFmsApplicationEmail({
    actionUrl: updateUrl || absoluteSiteUrl(ROUTES.fmsApply),
    candidateEmail,
    kind: "fms_application_admin_more_info_email",
    leadCode,
    leadId,
    priority: "high",
    supabase,
    template: buildAdminRequestInfoTemplate({
      applicantMessage,
      candidateName: getCandidateName(candidateName),
      leadCode,
      updateExpiresAt,
      updateUrl,
    }),
  });
}

export async function sendFmsApplicationForwardedEmail({
  applicantMessage,
  candidateEmail,
  candidateName,
  leadCode,
  leadId,
  supabase,
}: FmsApplicationEmailContext) {
  return recordAndDeliverFmsApplicationEmail({
    actionUrl: absoluteSiteUrl(ROUTES.fmsApply),
    candidateEmail,
    kind: "fms_application_forwarded_email",
    leadCode,
    leadId,
    priority: "normal",
    supabase,
    template: buildForwardedTemplate({
      applicantMessage,
      candidateName: getCandidateName(candidateName),
      leadCode,
    }),
  });
}

export async function sendFmsApplicationDecisionEmail({
  applicantMessage = "",
  candidateEmail,
  candidateName,
  decision,
  leadCode,
  leadId,
  supabase,
  updateExpiresAt,
  updateUrl,
}: FmsApplicationEmailContext & { decision: FmsApplicationDecision }) {
  return recordAndDeliverFmsApplicationEmail({
    actionUrl:
      decision === "approve"
        ? absoluteSiteUrl(ROUTES.authInvite)
        : updateUrl || absoluteSiteUrl(ROUTES.fmsApply),
    candidateEmail,
    kind: "fms_application_decision_email",
    leadCode,
    leadId,
    priority: decision === "approve" ? "high" : "normal",
    supabase,
    template: buildDecisionTemplate({
      applicantMessage,
      candidateName: getCandidateName(candidateName),
      decision,
      leadCode,
      updateExpiresAt,
      updateUrl,
    }),
  });
}
