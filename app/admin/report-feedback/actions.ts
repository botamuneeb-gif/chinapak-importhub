"use server";

import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications/create-notification";
import { detectContactRiskInFields } from "@/lib/security/contact-firewall";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type FeedbackStatus =
  Database["public"]["Tables"]["report_feedback"]["Row"]["status"];
type FeedbackType =
  Database["public"]["Tables"]["report_feedback"]["Row"]["feedback_type"];
type JsonObject = { [key: string]: Json | undefined };

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

export type AdminReportFeedbackItem = {
  adminResponse: string;
  createdAt: string;
  feedbackCode: string;
  feedbackType: string;
  id: string;
  importerName: string;
  internalNotes: string;
  message: string;
  projectCode: string;
  reportStatus: string;
  responses: Array<{
    createdAt: string;
    message: string;
    responseType: string;
    visibleToImporter: boolean;
    visibleToFms: boolean;
  }>;
  selectedOptionLabel: string;
  status: string;
  statusRaw: FeedbackStatus;
  urgencyLevel: string;
};

export type RespondToReportFeedbackInput = {
  adminResponse?: string;
  internalNotes?: string;
  nextStatus: FeedbackStatus;
};

export type RequestFmsClarificationInput = {
  clarificationRequest: string;
  internalNotes?: string;
};

const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  not_satisfied: "Not satisfied",
  other: "Other",
  question_about_option: "Question about option",
  ready_for_next_step: "Ready for next step",
  request_better_price: "Request better price",
  request_more_factories: "Request more factories",
  request_sample_guidance: "Request sample guidance",
  request_shipping_guidance: "Request shipping guidance",
};

const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  answered: "Answered",
  closed: "Closed",
  in_review: "In Review",
  new: "New",
  rejected_or_not_applicable: "Rejected / Not Applicable",
  routed_to_fms: "Routed to FMS",
};

const URGENCY_LABELS: Record<
  Database["public"]["Tables"]["report_feedback"]["Row"]["urgency_level"],
  string
> = {
  low: "Low",
  normal: "Normal",
  urgent: "Urgent",
};

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function trimOptional(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : "";
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

async function getImporterRecipientProfileId(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  importerProfileId: string | null | undefined,
) {
  if (!importerProfileId) {
    return null;
  }

  const { data } = await supabase
    .from("importer_profiles")
    .select("user_profile_id")
    .eq("id", importerProfileId)
    .maybeSingle();

  return data?.user_profile_id ?? null;
}

async function requireAdmin(accessToken: string) {
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
      message: "Only admin or super admin users can manage report feedback.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
    role: authCheck.profile.roles.includes(USER_ROLES.superAdmin)
      ? USER_ROLES.superAdmin
      : USER_ROLES.admin,
  };
}

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function mapFeedbackItem(
  feedback: TableRow<"report_feedback">,
  project: TableRow<"import_projects"> | undefined,
  importer: TableRow<"importer_profiles"> | undefined,
  responses: TableRow<"report_feedback_responses">[],
): AdminReportFeedbackItem {
  return {
    adminResponse: feedback.admin_response ?? "",
    createdAt: formatDate(feedback.created_at),
    feedbackCode: feedback.feedback_code,
    feedbackType: FEEDBACK_TYPE_LABELS[feedback.feedback_type],
    id: feedback.id,
    importerName:
      importer?.full_name ??
      importer?.importer_code ??
      "Importer profile unavailable",
    internalNotes: feedback.internal_notes ?? "",
    message: feedback.message,
    projectCode: project?.project_code ?? "Project unavailable",
    reportStatus: feedback.report_status_snapshot,
    responses: responses.map((response) => ({
      createdAt: formatDate(response.created_at),
      message: response.message,
      responseType: response.response_type,
      visibleToFms: response.visible_to_fms,
      visibleToImporter: response.visible_to_importer,
    })),
    selectedOptionLabel: feedback.selected_option_label ?? "General report",
    status: FEEDBACK_STATUS_LABELS[feedback.status],
    statusRaw: feedback.status,
    urgencyLevel: URGENCY_LABELS[feedback.urgency_level],
  };
}

async function getFeedbackBundle(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  feedbackId: string,
) {
  const { data: feedback, error: feedbackError } = await supabase
    .from("report_feedback")
    .select("*")
    .eq("id", feedbackId)
    .maybeSingle();

  if (feedbackError) {
    return { ok: false as const, message: feedbackError.message };
  }

  if (!feedback) {
    return { ok: false as const, message: "Report feedback was not found." };
  }

  const { data: project, error: projectError } = await supabase
    .from("import_projects")
    .select("*")
    .eq("id", feedback.project_id)
    .maybeSingle();

  if (projectError || !project) {
    return {
      ok: false as const,
      message: projectError?.message ?? "Feedback project was not found.",
    };
  }

  return { ok: true as const, feedback, project };
}

async function listFeedbackByProjectId(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  projectId?: string,
) {
  let query = supabase
    .from("report_feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data: feedbackRows, error: feedbackError } = await query;

  if (feedbackError) {
    return { ok: false as const, message: feedbackError.message };
  }

  const rows = feedbackRows ?? [];
  const projectIds = Array.from(new Set(rows.map((row) => row.project_id)));
  const importerIds = Array.from(
    new Set(rows.map((row) => row.importer_profile_id)),
  );
  const feedbackIds = rows.map((row) => row.id);
  const [projectsResult, importersResult, responsesResult] = await Promise.all([
    projectIds.length > 0
      ? supabase.from("import_projects").select("*").in("id", projectIds)
      : Promise.resolve({ data: [], error: null }),
    importerIds.length > 0
      ? supabase.from("importer_profiles").select("*").in("id", importerIds)
      : Promise.resolve({ data: [], error: null }),
    feedbackIds.length > 0
      ? supabase
          .from("report_feedback_responses")
          .select("*")
          .in("feedback_id", feedbackIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (
    projectsResult.error ||
    importersResult.error ||
    responsesResult.error
  ) {
    return {
      ok: false as const,
      message:
        projectsResult.error?.message ??
        importersResult.error?.message ??
        responsesResult.error?.message ??
        "Feedback supporting data could not be loaded.",
    };
  }

  const projectMap = byId(projectsResult.data ?? []);
  const importerMap = byId(importersResult.data ?? []);
  const responsesByFeedback = new Map<
    string,
    TableRow<"report_feedback_responses">[]
  >();

  (responsesResult.data ?? []).forEach((response) => {
    const existing = responsesByFeedback.get(response.feedback_id) ?? [];
    responsesByFeedback.set(response.feedback_id, [...existing, response]);
  });

  return {
    ok: true as const,
    rows: rows.map((feedback) =>
      mapFeedbackItem(
        feedback,
        projectMap.get(feedback.project_id),
        importerMap.get(feedback.importer_profile_id),
        responsesByFeedback.get(feedback.id) ?? [],
      ),
    ),
  };
}

export async function listAdminReportFeedbackAction(
  accessToken: string,
): Promise<ActionResult<AdminReportFeedbackItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const result = await listFeedbackByProjectId(supabase);

    if (!result.ok) {
      return result;
    }

    return { ok: true, data: result.rows };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Report feedback inbox could not be loaded.",
    };
  }
}

export async function getAdminProjectReportFeedbackAction(
  accessToken: string,
  projectCode: string,
): Promise<ActionResult<AdminReportFeedbackItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: project, error: projectError } = await supabase
      .from("import_projects")
      .select("id")
      .eq("project_code", decodeURIComponent(projectCode))
      .maybeSingle();

    if (projectError || !project) {
      return {
        ok: false,
        message: projectError?.message ?? "Project was not found.",
      };
    }

    const result = await listFeedbackByProjectId(supabase, project.id);

    if (!result.ok) {
      return result;
    }

    return { ok: true, data: result.rows };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Project report feedback could not be loaded.",
    };
  }
}

export async function respondToReportFeedbackAction(
  accessToken: string,
  feedbackId: string,
  input: RespondToReportFeedbackInput,
): Promise<ActionResult<AdminReportFeedbackItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const adminResponse = trimOptional(input.adminResponse);
    const internalNotes = trimOptional(input.internalNotes);

    if (adminResponse) {
      const firewall = detectContactRiskInFields([
        { label: "Admin response", value: adminResponse },
      ]);

      if (firewall.flags.length > 0) {
        return {
          ok: false,
          message: `Admin response contains contact/payment details: ${firewall.messages.join(" ")}`,
        };
      }
    }

    const supabase = createAdminSupabaseClient();
    const bundle = await getFeedbackBundle(supabase, feedbackId);

    if (!bundle.ok) {
      return bundle;
    }

    const now = new Date().toISOString();
    const nextStatus = input.nextStatus;
    const { error: updateError } = await supabase
      .from("report_feedback")
      .update({
        admin_response: adminResponse || bundle.feedback.admin_response,
        admin_responded_at: adminResponse ? now : bundle.feedback.admin_responded_at,
        admin_responded_by: adminResponse
          ? admin.authUserId
          : bundle.feedback.admin_responded_by,
        internal_notes: internalNotes || bundle.feedback.internal_notes,
        metadata: {
          ...toJsonObject(bundle.feedback.metadata),
          last_admin_action_at: now,
          last_admin_action_by: admin.authUserId,
        },
        status: nextStatus,
        updated_by: admin.authUserId,
      })
      .eq("id", bundle.feedback.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    const responseInserts: Array<
      Database["public"]["Tables"]["report_feedback_responses"]["Insert"]
    > = [];

    if (adminResponse) {
      responseInserts.push({
        created_by: admin.authUserId,
        feedback_id: bundle.feedback.id,
        message: adminResponse,
        metadata: {
          phase: "phase_8_importer_feedback_admin_clarifications",
        },
        responder_role: admin.role,
        responder_user_id: admin.authUserId,
        response_type: "admin_response",
        visible_to_fms: false,
        visible_to_importer: true,
      });
    }

    if (internalNotes) {
      responseInserts.push({
        created_by: admin.authUserId,
        feedback_id: bundle.feedback.id,
        message: internalNotes,
        metadata: {
          phase: "phase_8_importer_feedback_admin_clarifications",
        },
        responder_role: admin.role,
        responder_user_id: admin.authUserId,
        response_type: "internal_note",
        visible_to_fms: false,
        visible_to_importer: false,
      });
    }

    const writes: PromiseLike<{ error: { message: string } | null }>[] = [
      supabase.from("import_project_timeline_events").insert({
        body: adminResponse
          ? "Admin responded to importer feedback. The response is visible in the importer report feedback thread."
          : "Admin updated importer report feedback status.",
        created_by: admin.authUserId,
        event_type: "report_feedback_admin_response",
        metadata: {
          feedback_code: bundle.feedback.feedback_code,
          feedback_status: nextStatus,
          phase: "phase_8_importer_feedback_admin_clarifications",
        },
        project_id: bundle.project.id,
        title: "Admin responded to importer feedback",
        visible_to_agent: false,
        visible_to_fms: false,
        visible_to_importer: Boolean(adminResponse),
      }),
    ];

    if (responseInserts.length > 0) {
      writes.push(supabase.from("report_feedback_responses").insert(responseInserts));
    }

    const writeResults = await Promise.all(writes);
    const writeError = writeResults.find((result) => result.error)?.error;

    if (writeError) {
      return { ok: false, message: writeError.message };
    }

    if (adminResponse) {
      const recipientProfileId = await getImporterRecipientProfileId(
        supabase,
        bundle.feedback.importer_profile_id,
      );

      if (recipientProfileId) {
        await createNotification(
          {
            actionUrl: `/importer/reports/${bundle.project.project_code}`,
            actorProfileId: admin.profileId,
            message: adminResponse,
            projectId: bundle.project.id,
            recipientProfileId,
            templateContext: {
              projectCode: bundle.project.project_code,
            },
            type: "report_feedback_answered",
          },
          supabase,
        );
      }
    }

    const result = await listFeedbackByProjectId(supabase, bundle.project.id);

    if (!result.ok) {
      return result;
    }

    return { ok: true, data: result.rows };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Feedback response could not be saved.",
    };
  }
}

export async function requestFmsClarificationForFeedbackAction(
  accessToken: string,
  feedbackId: string,
  input: RequestFmsClarificationInput,
): Promise<ActionResult<AdminReportFeedbackItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const clarificationRequest = trimOptional(input.clarificationRequest);
    const internalNotes = trimOptional(input.internalNotes);

    if (clarificationRequest.length < 10) {
      return {
        ok: false,
        message: "Write a sanitized FMS clarification request first.",
      };
    }

    const firewall = detectContactRiskInFields([
      { label: "FMS clarification request", value: clarificationRequest },
    ]);

    if (firewall.flags.length > 0) {
      return {
        ok: false,
        message: `FMS clarification request contains contact/payment details: ${firewall.messages.join(" ")}`,
      };
    }

    const supabase = createAdminSupabaseClient();
    const bundle = await getFeedbackBundle(supabase, feedbackId);

    if (!bundle.ok) {
      return bundle;
    }

    const { data: assignment } = await supabase
      .from("fms_assignments")
      .select("*")
      .eq("project_id", bundle.project.id)
      .not("assignment_status", "in", '("cancelled","reassigned")')
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("report_feedback")
      .update({
        fms_clarification_request: clarificationRequest,
        fms_clarification_status: "requested",
        internal_notes: internalNotes || bundle.feedback.internal_notes,
        metadata: {
          ...toJsonObject(bundle.feedback.metadata),
          clarification_request_created_at: now,
          clarification_route_note:
            "Sanitized request only. Importer contact details and raw importer message are not sent to FMS.",
        },
        routed_to_assignment_id: assignment?.id ?? null,
        status: "routed_to_fms",
        updated_by: admin.authUserId,
      })
      .eq("id", bundle.feedback.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    const writes: PromiseLike<{ error: { message: string } | null }>[] = [
      supabase.from("report_feedback_responses").insert({
        created_by: admin.authUserId,
        feedback_id: bundle.feedback.id,
        message: clarificationRequest,
        metadata: {
          assignment_code: assignment?.assignment_code ?? null,
          phase: "phase_8_importer_feedback_admin_clarifications",
          privacy_rule:
            "FMS receives sanitized admin request only, not importer contact details.",
        },
        responder_role: admin.role,
        responder_user_id: admin.authUserId,
        response_type: "fms_clarification_request",
        visible_to_fms: Boolean(assignment),
        visible_to_importer: false,
      }),
      supabase.from("import_project_timeline_events").insert({
        body: "Admin requested a sanitized clarification from the sourcing side. Importer contact details remain hidden.",
        created_by: admin.authUserId,
        event_type: "report_feedback_fms_clarification_requested",
        metadata: {
          assignment_code: assignment?.assignment_code ?? null,
          feedback_code: bundle.feedback.feedback_code,
          phase: "phase_8_importer_feedback_admin_clarifications",
        },
        project_id: bundle.project.id,
        title: "Admin requested FMS clarification",
        visible_to_agent: false,
        visible_to_fms: Boolean(assignment),
        visible_to_importer: true,
      }),
    ];

    if (internalNotes) {
      writes.push(
        supabase.from("report_feedback_responses").insert({
          created_by: admin.authUserId,
          feedback_id: bundle.feedback.id,
          message: internalNotes,
          metadata: {
            phase: "phase_8_importer_feedback_admin_clarifications",
          },
          responder_role: admin.role,
          responder_user_id: admin.authUserId,
          response_type: "internal_note",
          visible_to_fms: false,
          visible_to_importer: false,
        }),
      );
    }

    const writeResults = await Promise.all(writes);
    const writeError = writeResults.find((result) => result.error)?.error;

    if (writeError) {
      return { ok: false, message: writeError.message };
    }

    if (assignment?.fms_profile_id) {
      const { data: fmsProfile } = await supabase
        .from("fms_profiles")
        .select("user_profile_id")
        .eq("id", assignment.fms_profile_id)
        .maybeSingle();

      if (fmsProfile?.user_profile_id) {
        await createNotification(
          {
            actionUrl: `/fms/assignments/${assignment.assignment_code}`,
            actorProfileId: admin.profileId,
            assignmentId: assignment.id,
            projectId: bundle.project.id,
            recipientProfileId: fmsProfile.user_profile_id,
            templateContext: {
              assignmentCode: assignment.assignment_code,
              projectCode: bundle.project.project_code,
            },
            type: "fms_clarification_requested",
          },
          supabase,
        );
      }
    }

    const result = await listFeedbackByProjectId(supabase, bundle.project.id);

    if (!result.ok) {
      return result;
    }

    return { ok: true, data: result.rows };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "FMS clarification request could not be saved.",
    };
  }
}
