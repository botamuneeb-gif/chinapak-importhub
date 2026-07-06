"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/config/brand";
import { fmsApplicationSource } from "@/config/fms-acquisition";
import { getSiteUrl } from "@/config/site-url";
import { ensureActiveRoleAssignment } from "@/lib/auth/role-assignments";
import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { ensureInvoiceForProject } from "@/lib/billing/invoice-helpers";
import { createFmsApplicationUpdateToken } from "@/lib/fms/application-update-tokens";
import {
  sendFmsApplicationAdminMoreInfoEmail,
  sendFmsApplicationDecisionEmail,
  sendFmsApplicationForwardedEmail,
} from "@/lib/notifications/fms-application-emails";
import { createNotification, createNotifications } from "@/lib/notifications/create-notification";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type LeadRow = Database["public"]["Tables"]["unpaid_leads"]["Row"];
type JsonObject = { [key: string]: Json | undefined };
type LeadStatus = Database["public"]["Enums"]["lead_status"];
type SupabaseAdmin = ReturnType<typeof createAdminSupabaseClient>;

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

export type LeadWorkflowStatus =
  | "new"
  | "in_review"
  | "contacted"
  | "qualified"
  | "pending_more_info"
  | "forwarded_to_super_admin"
  | "super_admin_approved"
  | "super_admin_declined"
  | "approved_pending_account_setup"
  | "admin_declined"
  | "converted"
  | "archived";

export type AdminLeadQueueItem = {
  adminReviewNote: string;
  canConvertProjectLead: boolean;
  city: string;
  contactForAdminOnly: string;
  convertedEntityId: string;
  convertedEntityType: string;
  createdDate: string;
  forwardedAt: string;
  id: string;
  importerName: string;
  isFmsApplication: boolean;
  leadCode: string;
  leadStatus: string;
  leadTypeLabel: string;
  packageSelected: string;
  paymentIssue: string;
  product: string;
  searchableText: string;
  superAdminReviewStatus: string;
  workflowStatus: LeadWorkflowStatus;
  workflowStatusLabel: string;
};

export type LeadWorkflowAction =
  | "fms_in_review"
  | "fms_pending_more_info"
  | "fms_decline_admin"
  | "fms_forward_super_admin"
  | "project_contacted"
  | "project_qualified"
  | "project_pending_more_info"
  | "project_decline"
  | "archive";

export type UpdateLeadWorkflowInput = {
  applicantMessage?: string;
  action: LeadWorkflowAction;
  leadId: string;
  note?: string;
};

export type SuperAdminFmsDecision = "approve" | "decline" | "request_more_info";

export type SuperAdminFmsDecisionInput = {
  applicantMessage?: string;
  decision: SuperAdminFmsDecision;
  leadId: string;
  note?: string;
};

export type FmsApplicationQueueItem = AdminLeadQueueItem & {
  email: string;
  experience: string;
  factoryRegions: string;
  languages: string;
  phone: string;
  productCategories: string;
  provinceCity: string;
  shortIntroduction: string;
  wechatId: string;
};

const WORKFLOW_LABELS: Record<LeadWorkflowStatus, string> = {
  admin_declined: "Admin Declined",
  approved_pending_account_setup: "Approved - Account Setup Needed",
  archived: "Archived",
  contacted: "Contacted",
  converted: "Converted",
  forwarded_to_super_admin: "Forwarded to Super Admin",
  in_review: "In Review",
  new: "New",
  pending_more_info: "Pending More Info",
  qualified: "Qualified",
  super_admin_approved: "Super Admin Approved",
  super_admin_declined: "Super Admin Declined",
};

const FMS_WORKFLOW_LABELS: Record<LeadWorkflowStatus, string> = {
  admin_declined: "Declined by Admin Screening",
  approved_pending_account_setup: "Approved - Account Setup Needed",
  archived: "Archived FMS Application",
  contacted: "Admin Screening",
  converted: "FMS Profile Created",
  forwarded_to_super_admin: "Pending Super Admin Review",
  in_review: "Admin Screening",
  new: "New FMS Application",
  pending_more_info: "Pending Candidate Info",
  qualified: "Admin Screening",
  super_admin_approved: "Approved by Super Admin",
  super_admin_declined: "Declined by Super Admin",
};

const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  awaiting_customer: "Awaiting Customer",
  closed: "Closed",
  contact_attempted: "Contact Attempted",
  interested: "Interested",
  new_lead: "New Lead",
  not_interested: "Not Interested",
  payment_completed: "Payment Completed",
  payment_help_needed: "Payment Help Needed",
  payment_link_sent: "Payment Link Sent",
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readStringArray(value: Json | null | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asJson(value: JsonObject) {
  return value as Json;
}

function generateReadableCode(prefix: "CPH" | "FMS") {
  const year = new Date().getFullYear();
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(10 + Math.random() * 90);

  return `${prefix}-${year}-${timestampPart}${randomPart}`;
}

function buildFmsApplicationUpdateUrl(token: string) {
  return `${getSiteUrl()}${ROUTES.fmsApplicationUpdate}/${token}`;
}

function isFmsApplication(
  lead: Pick<LeadRow, "lead_code" | "metadata" | "product_summary">,
) {
  const metadata = toJsonObject(lead.metadata);
  const source = readString(metadata.source);
  const intendedRole = readString(metadata.intended_role);
  const leadType = readString(metadata.lead_type);
  const leadCode = lead.lead_code.toUpperCase();
  const productSummary = lead.product_summary.toLowerCase();

  return (
    source === fmsApplicationSource ||
    intendedRole === USER_ROLES.fms ||
    leadType === "fms_application" ||
    leadCode.startsWith("FMS-APP") ||
    productSummary.includes("fms application")
  );
}

function getSuperAdminReviewStatus(lead: LeadRow) {
  return readString(toJsonObject(lead.metadata).super_admin_review_status);
}

function shouldShowInSuperAdminFmsQueue(lead: LeadRow) {
  if (!isFmsApplication(lead)) {
    return false;
  }

  const workflowStatus = getWorkflowStatus(lead);
  const superAdminReviewStatus = getSuperAdminReviewStatus(lead);

  return (
    [
      "forwarded_to_super_admin",
      "approved_pending_account_setup",
      "converted",
      "super_admin_declined",
      "pending_more_info",
    ].includes(workflowStatus) ||
    ["pending", "approved", "declined", "more_info_requested"].includes(
      superAdminReviewStatus,
    )
  );
}

function getWorkflowStatus(lead: LeadRow): LeadWorkflowStatus {
  const metadata = toJsonObject(lead.metadata);
  const raw = readString(metadata.workflow_status);

  if (raw && raw in WORKFLOW_LABELS) {
    return raw as LeadWorkflowStatus;
  }

  if (isFmsApplication(lead)) {
    const convertedEntityType = readString(metadata.converted_entity_type);
    const convertedEntityId = readString(metadata.converted_entity_id);
    const fmsProfileId = readString(metadata.fms_profile_id);
    const superAdminReviewStatus = readString(metadata.super_admin_review_status);

    if (
      convertedEntityType === "fms_profile" ||
      convertedEntityId ||
      fmsProfileId
    ) {
      return "converted";
    }

    if (superAdminReviewStatus === "pending") {
      return "forwarded_to_super_admin";
    }

    if (superAdminReviewStatus === "approved") {
      return "approved_pending_account_setup";
    }

    if (superAdminReviewStatus === "declined") {
      return "super_admin_declined";
    }

    if (superAdminReviewStatus === "more_info_requested") {
      return "pending_more_info";
    }

    return "new";
  }

  if (lead.lead_status === "closed") {
    return "archived";
  }

  if (lead.lead_status === "not_interested") {
    return "admin_declined";
  }

  if (lead.lead_status === "contact_attempted") {
    return "contacted";
  }

  if (lead.lead_status === "interested") {
    return "qualified";
  }

  if (lead.lead_status === "awaiting_customer") {
    return "pending_more_info";
  }

  return "new";
}

function getFmsApplicationDisplayStatusLabel(
  lead: LeadRow,
  workflowStatus: LeadWorkflowStatus,
) {
  const metadata = toJsonObject(lead.metadata);
  const superAdminReviewStatus = readString(metadata.super_admin_review_status);

  if (
    workflowStatus === "converted" ||
    readString(metadata.converted_entity_type) === "fms_profile" ||
    readString(metadata.fms_profile_id)
  ) {
    return "FMS Profile Created";
  }

  if (workflowStatus === "approved_pending_account_setup") {
    return "Approved - Account Setup Needed";
  }

  if (workflowStatus === "super_admin_approved") {
    return "Approved by Super Admin";
  }

  if (
    workflowStatus === "super_admin_declined" ||
    superAdminReviewStatus === "declined"
  ) {
    return "Declined by Super Admin";
  }

  if (workflowStatus === "admin_declined") {
    return "Declined by Admin Screening";
  }

  if (
    workflowStatus === "forwarded_to_super_admin" ||
    superAdminReviewStatus === "pending"
  ) {
    return "Pending Super Admin Review";
  }

  if (superAdminReviewStatus === "more_info_requested") {
    return "More Info Requested by Super Admin";
  }

  return FMS_WORKFLOW_LABELS[workflowStatus] ?? "New FMS Application";
}

function buildFmsContact(metadata: JsonObject) {
  return [
    readString(metadata.wechat_id) ? `WeChat: ${readString(metadata.wechat_id)}` : "",
    readString(metadata.email) ? `Email: ${readString(metadata.email)}` : "",
    readString(metadata.phone) ? `Phone: ${readString(metadata.phone)}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function mapLeadQueueItem(
  lead: LeadRow,
  importer?: Database["public"]["Tables"]["importer_profiles"]["Row"] | null,
  packageRow?: Database["public"]["Tables"]["packages"]["Row"] | null,
): AdminLeadQueueItem {
  const metadata = toJsonObject(lead.metadata);
  const fmsApplication = isFmsApplication(lead);
  const workflowStatus = getWorkflowStatus(lead);
  const fmsLocation = [
    readString(metadata.city),
    readString(metadata.province),
  ]
    .filter(Boolean)
    .join(", ");
  const convertedEntityType = readString(metadata.converted_entity_type);
  const convertedEntityId = readString(metadata.converted_entity_id);
  const contactForAdminOnly = fmsApplication
    ? buildFmsContact(metadata) || "No contact channel provided"
    : importer?.phone_whatsapp ?? "Hidden because active importer role was not found";
  const importerName = fmsApplication
    ? readString(metadata.full_name, "FMS applicant")
    : importer?.full_name ?? "Importer role inactive or profile pending";
  const city = fmsApplication
    ? fmsLocation || "China location not provided"
    : importer?.city ?? "Not provided";
  const product = fmsApplication
    ? readString(metadata.product_categories, lead.product_summary)
    : lead.product_summary;
  const paymentIssue = fmsApplication
    ? readString(
        metadata.sourcing_experience,
        lead.payment_problem_reason ?? "Experience not provided",
      )
    : lead.payment_problem_reason ?? "Payment issue not provided";
  const displayStatusLabel = fmsApplication
    ? getFmsApplicationDisplayStatusLabel(lead, workflowStatus)
    : WORKFLOW_LABELS[workflowStatus];

  return {
    adminReviewNote: fmsApplication
      ? "Admin may pre-screen and forward to Super Admin. Only Super Admin can approve FMS onboarding."
      : "Admin may contact, qualify, decline, or convert if project data is complete.",
    canConvertProjectLead:
      !fmsApplication &&
      Boolean(lead.importer_profile_id && lead.importer_user_id && lead.package_id) &&
      workflowStatus !== "converted",
    city,
    contactForAdminOnly,
    convertedEntityId,
    convertedEntityType,
    createdDate: formatDate(lead.created_at),
    forwardedAt: formatDate(readString(metadata.forwarded_to_super_admin_at)),
    id: lead.id,
    importerName,
    isFmsApplication: fmsApplication,
    leadCode: lead.lead_code,
    leadStatus: fmsApplication
      ? displayStatusLabel
      : LEAD_STATUS_LABELS[lead.lead_status] ?? lead.lead_status,
    leadTypeLabel: fmsApplication ? "FMS application" : "Project lead",
    packageSelected: fmsApplication
      ? "FMS Application Review"
      : packageRow?.name ?? "Package pending",
    paymentIssue,
    product,
    searchableText: [
      lead.lead_code,
      lead.id,
      importerName,
      city,
      contactForAdminOnly,
      product,
      paymentIssue,
      readString(metadata.email),
      readString(metadata.wechat_id),
      readString(metadata.phone),
      readString(metadata.languages),
      readString(metadata.factory_regions),
    ]
      .join(" ")
      .toLowerCase(),
    superAdminReviewStatus: readString(metadata.super_admin_review_status, "Not started"),
    workflowStatus,
    workflowStatusLabel: displayStatusLabel,
  };
}

function mapFmsApplicationQueueItem(item: AdminLeadQueueItem, lead: LeadRow) {
  const metadata = toJsonObject(lead.metadata);

  return {
    ...item,
    email: readString(metadata.email, "Not provided"),
    experience: readString(metadata.sourcing_experience, "Not provided"),
    factoryRegions: readString(metadata.factory_regions, "Not provided"),
    languages: readString(metadata.languages, "Not provided"),
    phone: readString(metadata.phone, "Not provided"),
    productCategories: readString(metadata.product_categories, "Not provided"),
    provinceCity:
      [readString(metadata.city), readString(metadata.province)]
        .filter(Boolean)
        .join(", ") || "Not provided",
    shortIntroduction: readString(metadata.short_introduction, "Not provided"),
    wechatId: readString(metadata.wechat_id, "Not provided"),
  } satisfies FmsApplicationQueueItem;
}

async function requireAdminOrSuperAdmin(accessToken: string) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (
    !hasAllowedRole(authCheck.profile.roles, [
      USER_ROLES.admin,
      USER_ROLES.superAdmin,
    ])
  ) {
    return {
      ok: false as const,
      message: "Only Admin or Super Admin users can manage leads.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
    roles: authCheck.profile.roles,
  };
}

async function requireSuperAdmin(accessToken: string) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, [USER_ROLES.superAdmin])) {
    return {
      ok: false as const,
      message: "Only Super Admin can approve or decline FMS applications.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
  };
}

async function getLeadById(supabase: SupabaseAdmin, leadId: string) {
  const { data: lead, error } = await supabase
    .from("unpaid_leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (error || !lead) {
    return {
      ok: false as const,
      message: error?.message ?? "Lead was not found.",
    };
  }

  return { ok: true as const, lead };
}

async function writeLeadFollowup({
  actorUserId,
  leadId,
  notes,
  outcome,
  supabase,
}: {
  actorUserId: string;
  leadId: string;
  notes: string;
  outcome: string;
  supabase: SupabaseAdmin;
}) {
  await supabase.from("lead_followups").insert({
    actor_user_id: actorUserId,
    channel: "admin_portal",
    created_by: actorUserId,
    lead_id: leadId,
    metadata: {
      action_source: "lead_management_workflow",
    },
    notes: notes || outcome,
    outcome,
    updated_by: actorUserId,
  });
}

async function writeAudit({
  action,
  actorRole,
  actorUserId,
  afterData,
  beforeData,
  entityId,
}: {
  action: string;
  actorRole: Database["public"]["Enums"]["user_role"];
  actorUserId: string;
  afterData: JsonObject;
  beforeData: JsonObject | null;
  entityId: string;
}) {
  const supabase = createAdminSupabaseClient();
  await supabase.from("audit_logs").insert({
    action,
    actor_role: actorRole,
    actor_user_id: actorUserId,
    after_data: afterData as Json,
    before_data: beforeData as Json | null,
    entity_id: entityId,
    entity_type: "unpaid_lead",
    metadata: {
      action_source: "actionable_lead_management",
    },
  });
}

function leadStatusForWorkflow(action: LeadWorkflowAction): {
  followUpStatus: string;
  leadStatus: LeadStatus;
  workflowStatus: LeadWorkflowStatus;
} {
  switch (action) {
    case "fms_in_review":
      return {
        followUpStatus: "FMS admin screening",
        leadStatus: "contact_attempted",
        workflowStatus: "in_review",
      };
    case "fms_pending_more_info":
      return {
        followUpStatus: "Pending candidate information",
        leadStatus: "awaiting_customer",
        workflowStatus: "pending_more_info",
      };
    case "fms_decline_admin":
      return {
        followUpStatus: "FMS declined by admin screening",
        leadStatus: "not_interested",
        workflowStatus: "admin_declined",
      };
    case "fms_forward_super_admin":
      return {
        followUpStatus: "FMS forwarded to Super Admin",
        leadStatus: "interested",
        workflowStatus: "forwarded_to_super_admin",
      };
    case "project_contacted":
      return {
        followUpStatus: "Project lead contacted",
        leadStatus: "contact_attempted",
        workflowStatus: "contacted",
      };
    case "project_qualified":
      return {
        followUpStatus: "Project lead qualified",
        leadStatus: "interested",
        workflowStatus: "qualified",
      };
    case "project_pending_more_info":
      return {
        followUpStatus: "Project lead more info needed",
        leadStatus: "awaiting_customer",
        workflowStatus: "pending_more_info",
      };
    case "project_decline":
      return {
        followUpStatus: "Project lead declined",
        leadStatus: "not_interested",
        workflowStatus: "admin_declined",
      };
    case "archive":
      return {
        followUpStatus: "Lead archived",
        leadStatus: "closed",
        workflowStatus: "archived",
      };
  }
}

export async function listLeadQueueAction(
  accessToken: string,
): Promise<ActionResult<AdminLeadQueueItem[]>> {
  try {
    const admin = await requireAdminOrSuperAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: leads, error: leadsError } = await supabase
      .from("unpaid_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(250);

    if (leadsError) {
      return { ok: false, message: leadsError.message };
    }

    const leadRows = leads ?? [];
    const importerIds = Array.from(
      new Set(
        leadRows
          .map((lead) => lead.importer_profile_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const packageIds = Array.from(
      new Set(
        leadRows
          .map((lead) => lead.package_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const [{ data: importerRows }, { data: packageRows }] = await Promise.all([
      importerIds.length > 0
        ? supabase.from("importer_profiles").select("*").in("id", importerIds)
        : Promise.resolve({ data: [] }),
      packageIds.length > 0
        ? supabase.from("packages").select("*").in("id", packageIds)
        : Promise.resolve({ data: [] }),
    ]);

    const importerMap = new Map((importerRows ?? []).map((row) => [row.id, row]));
    const packageMap = new Map((packageRows ?? []).map((row) => [row.id, row]));

    return {
      ok: true,
      data: leadRows.map((lead) =>
        mapLeadQueueItem(
          lead,
          lead.importer_profile_id
            ? importerMap.get(lead.importer_profile_id) ?? null
            : null,
          lead.package_id ? packageMap.get(lead.package_id) ?? null : null,
        ),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Lead queue could not be loaded.",
    };
  }
}

export async function updateLeadWorkflowAction(
  accessToken: string,
  input: UpdateLeadWorkflowInput,
): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdminOrSuperAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const leadResult = await getLeadById(supabase, input.leadId.trim());

    if (!leadResult.ok) {
      return leadResult;
    }

    const lead = leadResult.lead;
    const metadata = toJsonObject(lead.metadata);
    const fmsLead = isFmsApplication(lead);
    const actionIsFms = input.action.startsWith("fms_");
    const actionIsProject = input.action.startsWith("project_");

    if (actionIsFms && !fmsLead) {
      return { ok: false, message: "This action is only for FMS application leads." };
    }

    if (actionIsProject && fmsLead) {
      return { ok: false, message: "This action is only for project leads." };
    }

    const next = leadStatusForWorkflow(input.action);
    const now = new Date().toISOString();
    const note = input.note?.trim() ?? "";
    const applicantMessage = input.applicantMessage?.trim() ?? "";
    const actionUsesApplicantMessage =
      input.action === "fms_pending_more_info" ||
      input.action === "fms_forward_super_admin";
    const updateToken =
      input.action === "fms_pending_more_info"
        ? createFmsApplicationUpdateToken()
        : null;

    if (input.action === "fms_pending_more_info" && !applicantMessage) {
      return {
        ok: false,
        message:
          "Please add a message to the candidate before requesting more information.",
      };
    }

    const nextMetadata: JsonObject = {
      ...metadata,
      admin_review_status:
        next.workflowStatus === "admin_declined"
          ? "declined"
          : next.workflowStatus === "pending_more_info"
            ? "pending_more_info"
            : "in_review",
      last_applicant_message:
        actionUsesApplicantMessage && applicantMessage
          ? applicantMessage
          : readString(metadata.last_applicant_message),
      last_admin_note: note || readString(metadata.last_admin_note),
      last_workflow_action: input.action,
      reviewed_at: now,
      reviewed_by_profile_id: admin.profileId,
      workflow_status: next.workflowStatus,
    };

    if (updateToken) {
      nextMetadata.fms_application_update_token_hash = updateToken.tokenHash;
      nextMetadata.fms_application_update_token_expires_at =
        updateToken.expiresAt;
      nextMetadata.fms_application_update_requested_at = now;
      nextMetadata.fms_application_update_requested_by_profile_id =
        admin.profileId;
      nextMetadata.fms_application_update_request_source = "admin_more_info";
    }

    if (input.action === "fms_forward_super_admin") {
      nextMetadata.forwarded_by_profile_id = admin.profileId;
      nextMetadata.forwarded_to_super_admin_at = now;
      nextMetadata.super_admin_review_status = "pending";
    }

    const { error: updateError } = await supabase
      .from("unpaid_leads")
      .update({
        follow_up_status: next.followUpStatus,
        lead_status: next.leadStatus,
        metadata: asJson(nextMetadata),
        updated_by: admin.authUserId,
      })
      .eq("id", lead.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    await writeLeadFollowup({
      actorUserId: admin.authUserId,
      leadId: lead.id,
      notes: note,
      outcome: next.followUpStatus,
      supabase,
    });

    if (input.action === "fms_forward_super_admin") {
      await createNotification(
        {
          actionUrl: `${ROUTES.superAdminFmsApplications}?lead=${lead.id}&filter=pending`,
          metadata: {
            lead_code: lead.lead_code,
            lead_id: lead.id,
            source: fmsApplicationSource,
            super_admin_review_status: "pending",
            workflow_status: "forwarded_to_super_admin",
          },
          priority: "high",
          recipientRole: USER_ROLES.superAdmin,
          title: "FMS application forwarded",
          message: `${lead.lead_code} was forwarded for Super Admin FMS approval.`,
          type: "role_changed",
        },
        supabase,
      );
    }

    let applicantEmailStatusMessage = "";

    if (input.action === "fms_pending_more_info") {
      const emailResult = await sendFmsApplicationAdminMoreInfoEmail({
        applicantMessage,
        candidateEmail: readString(metadata.email),
        candidateName: readString(metadata.full_name),
        leadCode: lead.lead_code,
        leadId: lead.id,
        supabase,
        updateExpiresAt: updateToken?.expiresAt,
        updateUrl: updateToken
          ? buildFmsApplicationUpdateUrl(updateToken.token)
          : null,
      });
      applicantEmailStatusMessage = emailResult.statusMessage;

      await createNotification(
        {
          actionUrl: `/admin/leads?lead=${lead.id}&filter=fms`,
          metadata: {
            email_status: emailResult.status,
            lead_code: lead.lead_code,
            lead_id: lead.id,
            workflow_status: next.workflowStatus,
          },
          priority: "normal",
          recipientRole: USER_ROLES.admin,
          title: "FMS candidate information requested",
          message: `${lead.lead_code}: Admin requested more information from the FMS candidate.`,
          type: "unpaid_lead_created",
        },
        supabase,
      );
    }

    if (input.action === "fms_forward_super_admin") {
      const emailResult = await sendFmsApplicationForwardedEmail({
        applicantMessage,
        candidateEmail: readString(metadata.email),
        candidateName: readString(metadata.full_name),
        leadCode: lead.lead_code,
        leadId: lead.id,
        supabase,
      });
      applicantEmailStatusMessage = emailResult.statusMessage;
    }

    if (input.action === "project_decline") {
      await createNotification(
        {
          actionUrl: "/admin/leads",
          metadata: {
            lead_code: lead.lead_code,
            lead_id: lead.id,
            workflow_status: next.workflowStatus,
          },
          priority: "normal",
          recipientRole: USER_ROLES.admin,
          title: "Project lead declined",
          message: `${lead.lead_code} was declined by admin lead review.`,
          type: "unpaid_lead_created",
        },
        supabase,
      );
    }

    await writeAudit({
      action: `lead_${input.action}`,
      actorRole: admin.roles.includes(USER_ROLES.superAdmin)
        ? USER_ROLES.superAdmin
        : USER_ROLES.admin,
      actorUserId: admin.authUserId,
      afterData: nextMetadata,
      beforeData: metadata,
      entityId: lead.id,
    });

    revalidatePath("/admin/leads");
    revalidatePath(ROUTES.superAdmin);
    revalidatePath(ROUTES.superAdminFmsApplications);

    return {
      ok: true,
      data: null,
      message: `${lead.lead_code} updated to ${
        fmsLead
          ? getFmsApplicationDisplayStatusLabel(
              { ...lead, metadata: asJson(nextMetadata) },
              next.workflowStatus,
            )
          : WORKFLOW_LABELS[next.workflowStatus]
      }.${applicantEmailStatusMessage ? ` ${applicantEmailStatusMessage}` : ""}`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Lead workflow update failed.",
    };
  }
}

async function insertProjectAddonsFromLead({
  actorUserId,
  metadata,
  projectId,
  supabase,
}: {
  actorUserId: string;
  metadata: JsonObject;
  projectId: string;
  supabase: SupabaseAdmin;
}) {
  const addonCodes = readStringArray(metadata.selected_addon_codes);

  if (addonCodes.length === 0) {
    return { ok: true as const };
  }

  const { data: addonRows, error } = await supabase
    .from("addons")
    .select("id, price_min_pkr")
    .in("addon_code", addonCodes)
    .eq("status", "active");

  if (error) {
    return { ok: false as const, message: error.message };
  }

  if (!addonRows || addonRows.length === 0) {
    return { ok: true as const };
  }

  const { error: insertError } = await supabase.from("import_project_addons").insert(
    addonRows.map((addon) => ({
      addon_id: addon.id,
      created_by: actorUserId,
      metadata: {
        conversion_source: "admin_lead_conversion",
      },
      price_snapshot_pkr: addon.price_min_pkr,
      project_id: projectId,
      status: "selected",
      updated_by: actorUserId,
    })),
  );

  if (insertError) {
    return { ok: false as const, message: insertError.message };
  }

  return { ok: true as const };
}

export async function convertProjectLeadToImportProjectAction(
  accessToken: string,
  leadId: string,
): Promise<ActionResult<{ projectCode: string; projectId: string }>> {
  try {
    const admin = await requireAdminOrSuperAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const leadResult = await getLeadById(supabase, leadId.trim());

    if (!leadResult.ok) {
      return leadResult;
    }

    const lead = leadResult.lead;
    const metadata = toJsonObject(lead.metadata);

    if (isFmsApplication(lead)) {
      return { ok: false, message: "FMS applications cannot be converted to Import Projects." };
    }

    if (getWorkflowStatus(lead) === "converted") {
      return { ok: false, message: "This lead is already converted." };
    }

    const missing = [
      !lead.importer_profile_id ? "importer profile" : "",
      !lead.importer_user_id ? "importer auth user" : "",
      !lead.package_id ? "package" : "",
    ].filter(Boolean);

    if (missing.length > 0) {
      return {
        ok: false,
        message: `Cannot convert yet. Missing: ${missing.join(", ")}.`,
      };
    }

    const importerProfileId = lead.importer_profile_id;
    const importerUserId = lead.importer_user_id;
    const packageId = lead.package_id;

    if (!importerProfileId || !importerUserId || !packageId) {
      return {
        ok: false,
        message: "Cannot convert yet. Lead ownership/package data is incomplete.",
      };
    }

    const projectCode = generateReadableCode("CPH");
    const productLink = readString(metadata.product_link);
    const productDetails = readString(metadata.product_details, lead.product_summary);
    const inputMethods = readStringArray(metadata.input_methods);

    const { data: project, error: projectError } = await supabase
      .from("import_projects")
      .insert({
        admin_review_status: "not_started",
        created_by: admin.authUserId,
        importer_profile_id: importerProfileId,
        importer_user_id: importerUserId,
        metadata: {
          ...metadata,
          conversion_source: "admin_lead_conversion",
          converted_from_lead_code: lead.lead_code,
          converted_from_lead_id: lead.id,
          fms_assignment_blocked_until: "payment_and_admin_review",
          payment_gateway_status: "manual_offline_pending",
        },
        package_id: packageId,
        payment_status: "awaiting_payment",
        project_code: projectCode,
        project_status: "awaiting_payment",
        updated_by: admin.authUserId,
      })
      .select("id, project_code")
      .single();

    if (projectError || !project) {
      return {
        ok: false,
        message: projectError?.message ?? "Import Project could not be created.",
      };
    }

    const { error: requirementsError } = await supabase
      .from("import_project_requirements")
      .insert({
        budget_range: readString(metadata.budget_label),
        created_by: admin.authUserId,
        import_experience: readString(metadata.experience_label),
        input_methods: inputMethods.length > 0 ? inputMethods : ["admin_lead_conversion"],
        metadata: {
          ...metadata,
          conversion_source: "admin_lead_conversion",
        },
        product_description: productDetails,
        product_links: productLink ? [productLink] : [],
        product_name: lead.product_summary.slice(0, 120),
        project_id: project.id,
        quality_level: readString(metadata.quality_level_label),
        quantity: readString(metadata.quantity),
        special_notes: readString(metadata.special_notes),
        updated_by: admin.authUserId,
      });

    if (requirementsError) {
      return { ok: false, message: requirementsError.message };
    }

    const addonResult = await insertProjectAddonsFromLead({
      actorUserId: admin.authUserId,
      metadata,
      projectId: project.id,
      supabase,
    });

    if (!addonResult.ok) {
      return addonResult;
    }

    const invoiceResult = await ensureInvoiceForProject(
      supabase,
      project.id,
      admin.authUserId,
    );

    if (!invoiceResult.ok) {
      return invoiceResult;
    }

    const nextMetadata: JsonObject = {
      ...metadata,
      converted_at: new Date().toISOString(),
      converted_by_profile_id: admin.profileId,
      converted_entity_id: project.id,
      converted_entity_type: "import_project",
      converted_project_code: project.project_code,
      workflow_status: "converted",
    };

    const { error: updateError } = await supabase
      .from("unpaid_leads")
      .update({
        draft_project_id: project.id,
        follow_up_status: "Converted to Import Project",
        lead_status: "payment_link_sent",
        metadata: asJson(nextMetadata),
        updated_by: admin.authUserId,
      })
      .eq("id", lead.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    await supabase.from("import_project_timeline_events").insert({
      body:
        "Admin converted a lead into an Import Project. Payment verification is still required before sourcing.",
      created_by: admin.authUserId,
      event_type: "lead_converted_to_project",
      metadata: {
        lead_code: lead.lead_code,
        lead_id: lead.id,
      },
      project_id: project.id,
      title: "Lead converted to Import Project",
      visible_to_importer: true,
    });

    await writeLeadFollowup({
      actorUserId: admin.authUserId,
      leadId: lead.id,
      notes: `Converted to ${project.project_code}`,
      outcome: "Converted to Import Project",
      supabase,
    });

    await createNotifications(
      [
        {
          actionUrl: `/admin/projects/${project.id}`,
          metadata: {
            lead_code: lead.lead_code,
            lead_id: lead.id,
            project_code: project.project_code,
          },
          priority: "high",
          recipientRole: USER_ROLES.admin,
          title: "Lead converted to Import Project",
          message: `${lead.lead_code} was converted to ${project.project_code}. Payment remains awaiting verification.`,
          type: "new_project_submitted",
        },
      ],
      supabase,
    );

    await writeAudit({
      action: "lead_converted_to_import_project",
      actorRole: admin.roles.includes(USER_ROLES.superAdmin)
        ? USER_ROLES.superAdmin
        : USER_ROLES.admin,
      actorUserId: admin.authUserId,
      afterData: nextMetadata,
      beforeData: metadata,
      entityId: lead.id,
    });

    return {
      ok: true,
      data: {
        projectCode: project.project_code,
        projectId: project.id,
      },
      message: `${lead.lead_code} converted to ${project.project_code}. Payment verification remains required.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Lead conversion failed.",
    };
  }
}

export async function listForwardedFmsApplicationsAction(
  accessToken: string,
): Promise<ActionResult<FmsApplicationQueueItem[]>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: leads, error } = await supabase
      .from("unpaid_leads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(250);

    if (error) {
      return { ok: false, message: error.message };
    }

    const leadRows = leads ?? [];
    const fmsApplicationRows = leadRows.filter((lead) => isFmsApplication(lead));
    const applicationRows = fmsApplicationRows.filter((lead) =>
      shouldShowInSuperAdminFmsQueue(lead),
    );

    console.info("FMS application Super Admin queue diagnostics", {
      fmsApplicationCount: fmsApplicationRows.length,
      forwardedOrReviewedCount: applicationRows.length,
      statuses: fmsApplicationRows.reduce<Record<string, number>>((counts, lead) => {
        const workflowStatus = getWorkflowStatus(lead);
        const superAdminStatus = getSuperAdminReviewStatus(lead) || "none";
        const key = `${workflowStatus}:${superAdminStatus}`;
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {}),
    });

    return {
      ok: true,
      data: applicationRows.map((lead) =>
        mapFmsApplicationQueueItem(mapLeadQueueItem(lead), lead),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "FMS application approval queue could not be loaded.",
    };
  }
}

async function generateUniqueFmsCode(supabase: SupabaseAdmin) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = String(Math.floor(1 + Math.random() * 999)).padStart(3, "0");
    const code = `CPIH-FMS-CN-${suffix}`;
    const { data } = await supabase
      .from("fms_profiles")
      .select("id")
      .eq("fms_code", code)
      .maybeSingle();

    if (!data) {
      return code;
    }
  }

  return `CPIH-FMS-CN-${Date.now().toString().slice(-6)}`;
}

async function createOrInviteFmsAccount({
  lead,
  metadata,
  note,
  superAdmin,
  supabase,
}: {
  lead: LeadRow;
  metadata: JsonObject;
  note: string;
  superAdmin: { authUserId: string; profileId: string };
  supabase: SupabaseAdmin;
}) {
  const email = readString(metadata.email).toLowerCase();
  const fullName = readString(metadata.full_name, "FMS applicant");

  if (!email) {
    return {
      ok: true as const,
      manual: true as const,
      message:
        "FMS application approved, but no email was provided. Create the account manually after collecting a verified email.",
      metadata: {
        approval_status: "approved_pending_account_setup",
        account_setup_reason: "missing_email",
      } satisfies JsonObject,
    };
  }

  const { data: existingDirectoryRows, error: directoryError } = await supabase
    .from("admin_user_directory")
    .select("*")
    .eq("email", email)
    .limit(5);

  if (directoryError) {
    return { ok: false as const, message: directoryError.message };
  }

  const existingDirectory = existingDirectoryRows?.[0];

  if (existingDirectory) {
    const activeRoles = existingDirectory.active_roles ?? [];
    const unsafeRoles = activeRoles.filter((role) => role !== USER_ROLES.fms);

    if (unsafeRoles.length > 0) {
      return {
        ok: false as const,
        message:
          "This email already belongs to another role. Manual review is required before FMS approval.",
      };
    }

    if (!existingDirectory.user_profile_id || !existingDirectory.auth_user_id) {
      return {
        ok: false as const,
        message:
          "Existing account directory row is incomplete. Manual Super Admin review is required.",
      };
    }

    const roleResult = await ensureActiveRoleAssignment({
      actorId: superAdmin.authUserId,
      allowPrivilegedRole: true,
      metadata: {
        approved_from_fms_application_lead_id: lead.id,
      },
      role: USER_ROLES.fms,
      source: "super_admin_fms_application_approval_existing_user",
      userProfileId: existingDirectory.user_profile_id,
    });

    if (!roleResult.ok) {
      return roleResult;
    }

    const fmsProfile = await upsertFmsProfileForLead({
      authUserId: superAdmin.authUserId,
      lead,
      metadata,
      note,
      supabase,
      userProfileId: existingDirectory.user_profile_id,
    });

    if (!fmsProfile.ok) {
      return fmsProfile;
    }

    return {
      authUserId: existingDirectory.auth_user_id,
      fmsProfileId: fmsProfile.fmsProfileId,
      manual: false as const,
      message: "Existing FMS account/profile was approved and activated.",
      ok: true as const,
      userProfileId: existingDirectory.user_profile_id,
    };
  }

  const siteUrl = getSiteUrl();
  const { data: invitedUser, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        display_name: fullName,
        intended_role: USER_ROLES.fms,
        signup_source: "super_admin_fms_application_approval",
      },
      redirectTo: `${siteUrl}${ROUTES.fmsLogin}`,
    });

  if (inviteError || !invitedUser.user) {
    return {
      ok: true as const,
      manual: true as const,
      message:
        "Super Admin approved this FMS application, but Supabase invite email could not be created. Complete account setup manually.",
      metadata: {
        account_setup_error: inviteError?.message ?? "invite_user_failed",
        approval_status: "approved_pending_account_setup",
      } satisfies JsonObject,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .upsert(
      {
        auth_user_id: invitedUser.user.id,
        created_by: superAdmin.authUserId,
        display_name: fullName,
        metadata: {
          approved_from_fms_application_lead_id: lead.id,
          email,
          source: "super_admin_fms_application_approval",
        },
        preferred_language: "zh-CN",
        primary_role: USER_ROLES.fms,
        status: "active",
        updated_by: superAdmin.authUserId,
      },
      { onConflict: "auth_user_id" },
    )
    .select("id")
    .single();

  if (profileError || !profile) {
    return {
      ok: false as const,
      message: profileError?.message ?? "FMS user profile could not be created.",
    };
  }

  const roleResult = await ensureActiveRoleAssignment({
    actorId: superAdmin.authUserId,
    allowPrivilegedRole: true,
    metadata: {
      approved_from_fms_application_lead_id: lead.id,
    },
    role: USER_ROLES.fms,
    source: "super_admin_fms_application_approval",
    userProfileId: profile.id,
  });

  if (!roleResult.ok) {
    return roleResult;
  }

  const fmsProfile = await upsertFmsProfileForLead({
    authUserId: superAdmin.authUserId,
    lead,
    metadata,
    note,
    supabase,
    userProfileId: profile.id,
  });

  if (!fmsProfile.ok) {
    return fmsProfile;
  }

  return {
    authUserId: invitedUser.user.id,
    fmsProfileId: fmsProfile.fmsProfileId,
    manual: false as const,
    message:
      "FMS invite/profile/role created. The candidate must complete secure invite/password setup.",
    ok: true as const,
    userProfileId: profile.id,
  };
}

async function upsertFmsProfileForLead({
  authUserId,
  lead,
  metadata,
  note,
  supabase,
  userProfileId,
}: {
  authUserId: string;
  lead: LeadRow;
  metadata: JsonObject;
  note: string;
  supabase: SupabaseAdmin;
  userProfileId: string;
}) {
  const fmsCode = await generateUniqueFmsCode(supabase);
  const categories = readString(metadata.product_categories)
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);
  const cityProvince = [readString(metadata.city), readString(metadata.province)]
    .filter(Boolean)
    .join(", ");

  const { data: fmsProfile, error } = await supabase
    .from("fms_profiles")
    .upsert(
      {
        academy_status: "not_started",
        categories:
          categories.length > 0
            ? categories
            : ["general sourcing", "consumer products"],
        city_province: cityProvince || null,
        created_by: authUserId,
        fms_code: fmsCode,
        metadata: {
          approval_status: "approved",
          approved_from_fms_application_lead_id: lead.id,
          factory_regions: readString(metadata.factory_regions),
          languages: readString(metadata.languages),
          super_admin_note: note,
        },
        quality_score: 80,
        status: "active",
        tier: "bronze",
        updated_by: authUserId,
        user_profile_id: userProfileId,
      },
      { onConflict: "user_profile_id" },
    )
    .select("id, fms_code")
    .single();

  if (error || !fmsProfile) {
    return {
      ok: false as const,
      message: error?.message ?? "FMS profile could not be created.",
    };
  }

  return {
    fmsCode: fmsProfile.fms_code,
    fmsProfileId: fmsProfile.id,
    ok: true as const,
  };
}

export async function reviewFmsApplicationBySuperAdminAction(
  accessToken: string,
  input: SuperAdminFmsDecisionInput,
): Promise<ActionResult<null>> {
  try {
    const superAdmin = await requireSuperAdmin(accessToken);

    if (!superAdmin.ok) {
      return superAdmin;
    }

    const supabase = createAdminSupabaseClient();
    const leadResult = await getLeadById(supabase, input.leadId.trim());

    if (!leadResult.ok) {
      return leadResult;
    }

    const lead = leadResult.lead;
    const metadata = toJsonObject(lead.metadata);
    const note = input.note?.trim() ?? "";
    const applicantMessage = input.applicantMessage?.trim() ?? "";

    if (!isFmsApplication(lead)) {
      return { ok: false, message: "Only FMS application leads can be reviewed here." };
    }

    if (
      getWorkflowStatus(lead) !== "forwarded_to_super_admin" &&
      getSuperAdminReviewStatus(lead) !== "pending"
    ) {
      return {
        ok: false,
        message:
          "This FMS application must be forwarded by Admin before final Super Admin review.",
      };
    }

    if (
      (input.decision === "decline" || input.decision === "request_more_info") &&
      !applicantMessage
    ) {
      return {
        ok: false,
        message:
          input.decision === "decline"
            ? "Please add an applicant-facing decline reason before declining this FMS application."
            : "Please add the applicant-facing information request before sending this FMS application back for more information.",
      };
    }

    const now = new Date().toISOString();
    const updateToken =
      input.decision === "request_more_info"
        ? createFmsApplicationUpdateToken()
        : null;
    let nextMetadata: JsonObject = {
      ...metadata,
      applicant_decision_message:
        applicantMessage || readString(metadata.applicant_decision_message),
      last_super_admin_note: note || readString(metadata.last_super_admin_note),
      reviewed_by_super_admin_profile_id: superAdmin.profileId,
      super_admin_reviewed_at: now,
    };
    let followUpStatus = "";
    let leadStatus: LeadStatus = "interested";
    let message = "";

    if (input.decision === "decline") {
      nextMetadata = {
        ...nextMetadata,
        super_admin_review_status: "declined",
        workflow_status: "super_admin_declined",
      };
      followUpStatus = "FMS declined by Super Admin";
      leadStatus = "not_interested";
      message = `${lead.lead_code} declined by Super Admin.`;
    } else if (input.decision === "request_more_info") {
      nextMetadata = {
        ...nextMetadata,
        fms_application_update_request_source: "super_admin_more_info",
        fms_application_update_requested_at: now,
        fms_application_update_requested_by_profile_id: superAdmin.profileId,
        fms_application_update_token_expires_at: updateToken?.expiresAt,
        fms_application_update_token_hash: updateToken?.tokenHash,
        super_admin_review_status: "more_info_requested",
        workflow_status: "pending_more_info",
      };
      followUpStatus = "FMS more info requested by Super Admin";
      leadStatus = "awaiting_customer";
      message = `${lead.lead_code} sent back for more information.`;
    } else {
      const accountResult = await createOrInviteFmsAccount({
        lead,
        metadata,
        note,
        superAdmin,
        supabase,
      });

      if (!accountResult.ok) {
        return accountResult;
      }

      if (accountResult.manual) {
        nextMetadata = {
          ...nextMetadata,
          ...accountResult.metadata,
          super_admin_review_status: "approved",
          workflow_status: "approved_pending_account_setup",
        };
        followUpStatus = "FMS approved - manual account setup needed";
        leadStatus = "interested";
      } else {
        nextMetadata = {
          ...nextMetadata,
          auth_user_id: accountResult.authUserId,
          converted_entity_id: accountResult.fmsProfileId,
          converted_entity_type: "fms_profile",
          fms_profile_id: accountResult.fmsProfileId,
          super_admin_review_status: "approved",
          user_profile_id: accountResult.userProfileId,
          workflow_status: "converted",
        };
        followUpStatus = "FMS approved and account invite/profile created";
        leadStatus = "payment_completed";
      }

      message = `${lead.lead_code}: ${accountResult.message}`;
    }

    const { error: updateError } = await supabase
      .from("unpaid_leads")
      .update({
        follow_up_status: followUpStatus,
        lead_status: leadStatus,
        metadata: asJson(nextMetadata),
        updated_by: superAdmin.authUserId,
      })
      .eq("id", lead.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    await writeLeadFollowup({
      actorUserId: superAdmin.authUserId,
      leadId: lead.id,
      notes: note,
      outcome: followUpStatus,
      supabase,
    });

    const adminDecisionTitle =
      input.decision === "approve"
        ? "FMS application approved by Super Admin"
        : input.decision === "decline"
          ? "FMS application declined by Super Admin"
          : "More information requested by Super Admin";

    await createNotifications(
      [
        {
          actionUrl: `${ROUTES.superAdminFmsApplications}?lead=${lead.id}`,
          metadata: {
            lead_code: lead.lead_code,
            lead_id: lead.id,
            workflow_status: readString(nextMetadata.workflow_status),
          },
          priority: "high",
          recipientRole: USER_ROLES.superAdmin,
          title: "FMS application reviewed",
          message,
          type: "role_changed",
        },
        {
          actionUrl: `/admin/leads?lead=${lead.id}&filter=fms`,
          metadata: {
            lead_code: lead.lead_code,
            lead_id: lead.id,
            workflow_status: readString(nextMetadata.workflow_status),
          },
          priority: "high",
          recipientRole: USER_ROLES.admin,
          title: adminDecisionTitle,
          message,
          type: "role_changed",
        },
      ],
      supabase,
    );

    const emailResult = await sendFmsApplicationDecisionEmail({
      applicantMessage,
      candidateEmail: readString(metadata.email),
      candidateName: readString(metadata.full_name),
      decision: input.decision,
      leadCode: lead.lead_code,
      leadId: lead.id,
      supabase,
      updateExpiresAt: updateToken?.expiresAt,
      updateUrl: updateToken
        ? buildFmsApplicationUpdateUrl(updateToken.token)
        : null,
    });
    message = `${message} ${emailResult.statusMessage}`;

    await writeAudit({
      action: `fms_application_${input.decision}_by_super_admin`,
      actorRole: USER_ROLES.superAdmin,
      actorUserId: superAdmin.authUserId,
      afterData: nextMetadata,
      beforeData: metadata,
      entityId: lead.id,
    });

    revalidatePath("/admin/leads");
    revalidatePath(ROUTES.superAdmin);
    revalidatePath(ROUTES.superAdminFmsApplications);

    return { ok: true, data: null, message };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "FMS application review failed.",
    };
  }
}
