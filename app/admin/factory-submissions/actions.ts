"use server";

import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications/create-notification";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type JsonObject = { [key: string]: Json | undefined };
type SubmissionStatus = Database["public"]["Enums"]["assignment_submission_status"];
type AdminReviewStatus = Database["public"]["Enums"]["admin_review_status"];
type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

export type FactorySubmissionQueueItem = {
  adminReviewStatus: string;
  assignmentCode: string;
  cityProvince: string;
  createdAt: string;
  factoryDisplayName: string;
  fmsCode: string;
  fmsName: string;
  productCategory: string;
  projectCode: string;
  riskFlags: string[];
  submissionCode: string;
  submissionStatus: string;
};

export type FactorySubmissionDetail = FactorySubmissionQueueItem & {
  adminOnlyContact: {
    contactPerson: string;
    email: string;
    exactAddress: string;
    paymentNotes: string;
    phone: string;
    websiteUrl: string;
    wechat: string;
  };
  convertedFactoryCode: string;
  evidenceNotes: string;
  importerSafeSummary: {
    currency: string;
    customizationAvailability: string;
    estimatedUnitPrice: string;
    mainProducts: string;
    moq: string;
    packagingNotes: string;
    priceRange: string;
    productionTime: string;
    productMatchSummary: string;
    qualityReliabilityNotes: string;
    sampleAvailability: string;
  };
  internalNotes: {
    negotiationNotes: string;
    riskNotes: string;
  };
  reviewHistoryNote: string;
};

export type ReviewFactorySubmissionInput = {
  adminNote?: string;
  decision: "approve" | "reject" | "request_revision";
  existingFactoryCode?: string;
  updateFactoryDatabase?: boolean;
};

const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  approved_by_admin: "Approved by Admin",
  changes_requested: "Changes Requested",
  draft: "Draft",
  rejected: "Rejected",
  submitted_for_admin_review: "Submitted for Admin Review",
};

const ADMIN_REVIEW_LABELS: Record<AdminReviewStatus, string> = {
  in_review: "In Review",
  needs_information: "Needs Information",
  not_started: "Not Started",
  ready_for_fms_assignment: "Approved",
  rejected: "Rejected",
};

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | undefined, fallback = "Not provided") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readJsonObject(value: Json | undefined): JsonObject {
  return toJsonObject(value);
}

function readStringArray(value: Json | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function trimOptional(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
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

function byId<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function generateFactoryCode() {
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900);

  return `FACT-FMS-${timestampPart}${randomPart}`;
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
      message: "Only admin or super admin users can review FMS submissions.",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("user_profile_id", authCheck.profile.profileId)
    .maybeSingle();

  return {
    ok: true as const,
    adminProfileId: adminProfile?.id ?? null,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
    supabase,
  };
}

function mapSubmissionQueueItem(
  submission: TableRow<"fms_factory_submissions">,
  assignment: TableRow<"fms_assignments"> | undefined,
  project: TableRow<"import_projects"> | undefined,
  fmsProfile: TableRow<"fms_profiles"> | undefined,
  fmsUser: TableRow<"user_profiles"> | undefined,
): FactorySubmissionQueueItem {
  const metadata = toJsonObject(submission.metadata);

  return {
    adminReviewStatus:
      ADMIN_REVIEW_LABELS[submission.admin_review_status] ??
      submission.admin_review_status,
    assignmentCode: assignment?.assignment_code ?? "Assignment pending",
    cityProvince: submission.city_province ?? "Not provided",
    createdAt: formatDate(submission.created_at),
    factoryDisplayName:
      submission.factory_display_name ?? "Factory name pending",
    fmsCode: fmsProfile?.fms_code ?? "FMS code pending",
    fmsName: fmsUser?.display_name ?? "FMS name pending",
    productCategory: submission.product_category ?? "Category pending",
    projectCode: project?.project_code ?? "Project pending",
    riskFlags: readStringArray(metadata.risk_flags),
    submissionCode: submission.submission_code,
    submissionStatus:
      SUBMISSION_STATUS_LABELS[submission.submission_status] ??
      submission.submission_status,
  };
}

async function getSubmissionBundle(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  submissionCodeOrId: string,
) {
  const decoded = decodeURIComponent(submissionCodeOrId);
  let { data: submission, error: submissionError } = await supabase
    .from("fms_factory_submissions")
    .select("*")
    .eq("submission_code", decoded)
    .maybeSingle();

  if (!submission && !submissionError) {
    const fallback = await supabase
      .from("fms_factory_submissions")
      .select("*")
      .eq("id", decoded)
      .maybeSingle();
    submission = fallback.data;
    submissionError = fallback.error;
  }

  if (submissionError || !submission) {
    return {
      ok: false as const,
      message:
        submissionError?.message ?? "Factory submission was not found.",
    };
  }

  const [{ data: assignment }, { data: evidenceRows }] = await Promise.all([
    supabase
      .from("fms_assignments")
      .select("*")
      .eq("id", submission.assignment_id)
      .maybeSingle(),
    supabase
      .from("fms_submission_evidence")
      .select("*")
      .eq("submission_id", submission.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!assignment) {
    return {
      ok: false as const,
      message: "Submission assignment was not found.",
    };
  }

  const [{ data: project }, { data: fmsProfile }, { data: convertedFactory }] =
    await Promise.all([
      supabase
        .from("import_projects")
        .select("*")
        .eq("id", assignment.project_id)
        .maybeSingle(),
      supabase
        .from("fms_profiles")
        .select("*")
        .eq("id", assignment.fms_profile_id)
        .maybeSingle(),
      submission.converted_factory_id
        ? supabase
            .from("factories")
            .select("*")
            .eq("id", submission.converted_factory_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const { data: fmsUser } = fmsProfile
    ? await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", fmsProfile.user_profile_id)
        .maybeSingle()
    : { data: null };

  return {
    ok: true as const,
    assignment,
    convertedFactory,
    evidenceRows: evidenceRows ?? [],
    fmsProfile,
    fmsUser,
    project,
    submission,
  };
}

export async function listFactorySubmissionsForAdminAction(
  accessToken: string,
): Promise<ActionResult<FactorySubmissionQueueItem[]>> {
  const admin = await requireAdmin(accessToken);

  if (!admin.ok) {
    return admin;
  }

  const { data: submissions, error: submissionsError } = await admin.supabase
    .from("fms_factory_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (submissionsError) {
    return { ok: false, message: submissionsError.message };
  }

  const submissionRows = submissions ?? [];
  const assignmentIds = Array.from(
    new Set(submissionRows.map((submission) => submission.assignment_id)),
  );

  const { data: assignments } =
    assignmentIds.length > 0
      ? await admin.supabase
          .from("fms_assignments")
          .select("*")
          .in("id", assignmentIds)
      : { data: [] };

  const assignmentRows = assignments ?? [];
  const projectIds = Array.from(
    new Set(assignmentRows.map((assignment) => assignment.project_id)),
  );
  const fmsProfileIds = Array.from(
    new Set(assignmentRows.map((assignment) => assignment.fms_profile_id)),
  );

  const [{ data: projects }, { data: fmsProfiles }] = await Promise.all([
    projectIds.length > 0
      ? admin.supabase.from("import_projects").select("*").in("id", projectIds)
      : Promise.resolve({ data: [] }),
    fmsProfileIds.length > 0
      ? admin.supabase.from("fms_profiles").select("*").in("id", fmsProfileIds)
      : Promise.resolve({ data: [] }),
  ]);

  const fmsUserProfileIds = Array.from(
    new Set((fmsProfiles ?? []).map((fms) => fms.user_profile_id)),
  );
  const { data: fmsUsers } =
    fmsUserProfileIds.length > 0
      ? await admin.supabase
          .from("user_profiles")
          .select("*")
          .in("id", fmsUserProfileIds)
      : { data: [] };

  const assignmentMap = byId(assignmentRows);
  const projectMap = byId(projects ?? []);
  const fmsProfileMap = byId(fmsProfiles ?? []);
  const fmsUserMap = byId(fmsUsers ?? []);

  return {
    ok: true,
    data: submissionRows.map((submission) => {
      const assignment = assignmentMap.get(submission.assignment_id);
      const fmsProfile = assignment
        ? fmsProfileMap.get(assignment.fms_profile_id)
        : undefined;
      const fmsUser = fmsProfile
        ? fmsUserMap.get(fmsProfile.user_profile_id)
        : undefined;

      return mapSubmissionQueueItem(
        submission,
        assignment,
        assignment ? projectMap.get(assignment.project_id) : undefined,
        fmsProfile,
        fmsUser,
      );
    }),
  };
}

export async function getFactorySubmissionDetailForAdminAction(
  accessToken: string,
  submissionCodeOrId: string,
): Promise<ActionResult<FactorySubmissionDetail>> {
  const admin = await requireAdmin(accessToken);

  if (!admin.ok) {
    return admin;
  }

  const bundle = await getSubmissionBundle(admin.supabase, submissionCodeOrId);

  if (!bundle.ok) {
    return bundle;
  }

  const metadata = toJsonObject(bundle.submission.metadata);
  const adminOnlyContact = readJsonObject(metadata.admin_only_contact);
  const latestEvidence = bundle.evidenceRows[0];
  const evidenceMetadata = toJsonObject(latestEvidence?.metadata);
  const queueItem = mapSubmissionQueueItem(
    bundle.submission,
    bundle.assignment,
    bundle.project ?? undefined,
    bundle.fmsProfile ?? undefined,
    bundle.fmsUser ?? undefined,
  );

  return {
    ok: true,
    data: {
      ...queueItem,
      adminOnlyContact: {
        contactPerson: readString(adminOnlyContact.contact_person),
        email: readString(adminOnlyContact.email),
        exactAddress: readString(adminOnlyContact.exact_address),
        paymentNotes: readString(adminOnlyContact.payment_notes),
        phone: readString(adminOnlyContact.phone),
        websiteUrl: readString(adminOnlyContact.website_url),
        wechat: readString(adminOnlyContact.wechat),
      },
      convertedFactoryCode: bundle.convertedFactory?.factory_code ?? "Not linked",
      evidenceNotes: readString(
        metadata.evidence_notes ?? evidenceMetadata.evidence_notes,
      ),
      importerSafeSummary: {
        currency: readString(metadata.currency, "CNY"),
        customizationAvailability: readString(
          metadata.customization_availability,
        ),
        estimatedUnitPrice: readString(metadata.estimated_unit_price),
        mainProducts:
          bundle.submission.main_products.length > 0
            ? bundle.submission.main_products.join(", ")
            : "Not provided",
        moq: bundle.submission.moq ?? "Not provided",
        packagingNotes: readString(metadata.packaging_notes),
        priceRange: bundle.submission.price_range ?? "Not provided",
        productionTime: bundle.submission.production_time ?? "Not provided",
        productMatchSummary: readString(metadata.product_match_summary),
        qualityReliabilityNotes: readString(metadata.quality_reliability_notes),
        sampleAvailability: readString(metadata.sample_availability),
      },
      internalNotes: {
        negotiationNotes: readString(metadata.negotiation_notes_for_admin),
        riskNotes: readString(metadata.risk_notes),
      },
      reviewHistoryNote: readString(metadata.admin_review_note, "No review note yet"),
    },
  };
}

async function createOrUpdatePrivateFactoryRecord({
  admin,
  assignment,
  input,
  submission,
}: {
  admin: Extract<Awaited<ReturnType<typeof requireAdmin>>, { ok: true }>;
  assignment: TableRow<"fms_assignments">;
  input: ReviewFactorySubmissionInput;
  submission: TableRow<"fms_factory_submissions">;
}) {
  const metadata = toJsonObject(submission.metadata);
  const adminOnlyContact = readJsonObject(metadata.admin_only_contact);
  const existingFactoryCode = trimOptional(input.existingFactoryCode);
  const now = new Date().toISOString();

  let factory: TableRow<"factories"> | null = null;

  if (existingFactoryCode) {
    const { data: existingFactory, error: existingFactoryError } =
      await admin.supabase
        .from("factories")
        .select("*")
        .eq("factory_code", existingFactoryCode)
        .maybeSingle();

    if (existingFactoryError || !existingFactory) {
      return {
        ok: false as const,
        message:
          existingFactoryError?.message ??
          `Existing factory code ${existingFactoryCode} was not found.`,
      };
    }

    const { data: updatedFactory, error: updateError } = await admin.supabase
      .from("factories")
      .update({
        category: submission.product_category,
        city_province: submission.city_province,
        display_name:
          submission.factory_display_name ?? existingFactory.display_name,
        last_verified_at: now,
        metadata: {
          ...toJsonObject(existingFactory.metadata),
          last_phase_6_submission_code: submission.submission_code,
          source: "phase_6_admin_review_update",
        },
        status: "active_internal_record",
        submitted_by_fms_profile_id: assignment.fms_profile_id,
        source_assignment_id: assignment.id,
        updated_by: admin.authUserId,
        verification_status: "evidence_reviewed",
      })
      .eq("id", existingFactory.id)
      .select("*")
      .single();

    if (updateError || !updatedFactory) {
      return {
        ok: false as const,
        message:
          updateError?.message ?? "Existing factory record could not be updated.",
      };
    }

    factory = updatedFactory;
  } else {
    const { data: newFactory, error: insertError } = await admin.supabase
      .from("factories")
      .insert({
        category: submission.product_category,
        city_province: submission.city_province,
        created_by: admin.authUserId,
        display_name: submission.factory_display_name ?? "FMS submitted factory",
        factory_code: generateFactoryCode(),
        last_verified_at: now,
        metadata: {
          phase: "phase_6_fms_submission_approval",
          source_submission_code: submission.submission_code,
        },
        status: "active_internal_record",
        submitted_by_fms_profile_id: assignment.fms_profile_id,
        source_assignment_id: assignment.id,
        trust_score: 70,
        verification_status: "evidence_reviewed",
      })
      .select("*")
      .single();

    if (insertError || !newFactory) {
      return {
        ok: false as const,
        message: insertError?.message ?? "Private factory record could not be created.",
      };
    }

    factory = newFactory;
  }

  const [{ error: contactError }, { error: productError }, { error: evidenceError }] =
    await Promise.all([
      admin.supabase.from("factory_sensitive_contacts").upsert(
        {
          bank_payment_notes: trimOptional(readString(adminOnlyContact.payment_notes, "")),
          contact_person: trimOptional(readString(adminOnlyContact.contact_person, "")),
          created_by: admin.authUserId,
          email: trimOptional(readString(adminOnlyContact.email, "")),
          exact_address: trimOptional(readString(adminOnlyContact.exact_address, "")),
          factory_id: factory.id,
          metadata: {
            source_submission_code: submission.submission_code,
            visibility: "admin_only",
          },
          phone: trimOptional(readString(adminOnlyContact.phone, "")),
          updated_by: admin.authUserId,
          website_url: trimOptional(readString(adminOnlyContact.website_url, "")),
          wechat: trimOptional(readString(adminOnlyContact.wechat, "")),
        },
        { onConflict: "factory_id" },
      ),
      admin.supabase.from("factory_products").insert({
        category: submission.product_category,
        created_by: admin.authUserId,
        factory_id: factory.id,
        main_products: submission.main_products,
        metadata: {
          customization_availability: metadata.customization_availability,
          product_match_summary: metadata.product_match_summary,
          source_submission_code: submission.submission_code,
        },
        moq_range: submission.moq,
        price_range_notes: submission.price_range,
        production_time_notes: submission.production_time,
        product_name: submission.product_category,
      }),
      admin.supabase.from("factory_evidence").insert({
        created_by: admin.authUserId,
        evidence_type: "fms_submission_notes",
        factory_id: factory.id,
        metadata: {
          evidence_notes: metadata.evidence_notes,
          source_submission_code: submission.submission_code,
        },
        review_status: "approved_internal",
        visibility_scope: "admin_only",
      }),
    ]);

  if (contactError || productError || evidenceError) {
    return {
      ok: false as const,
      message:
        contactError?.message ??
        productError?.message ??
        evidenceError?.message ??
        "Factory record was linked, but supporting private factory details could not be saved.",
    };
  }

  return { ok: true as const, factory };
}

export async function reviewFactorySubmissionAction(
  accessToken: string,
  submissionCodeOrId: string,
  input: ReviewFactorySubmissionInput,
): Promise<ActionResult<FactorySubmissionDetail>> {
  const admin = await requireAdmin(accessToken);

  if (!admin.ok) {
    return admin;
  }

  const bundle = await getSubmissionBundle(admin.supabase, submissionCodeOrId);

  if (!bundle.ok) {
    return bundle;
  }

  const now = new Date().toISOString();
  const adminNote = trimOptional(input.adminNote);
  const decisionConfig: Record<
    ReviewFactorySubmissionInput["decision"],
    {
      assignmentStatus: AssignmentStatus;
      projectStatus: ProjectStatus;
      reviewStatus: AdminReviewStatus;
      submissionStatus: SubmissionStatus;
      timelineTitle: string;
    }
  > = {
    approve: {
      assignmentStatus: "approved_by_admin",
      projectStatus: "admin_quality_review",
      reviewStatus: "ready_for_fms_assignment",
      submissionStatus: "approved_by_admin",
      timelineTitle: "Admin approved FMS factory submission",
    },
    reject: {
      assignmentStatus: "changes_requested",
      projectStatus: "fms_working",
      reviewStatus: "rejected",
      submissionStatus: "rejected",
      timelineTitle: "Admin rejected FMS factory submission",
    },
    request_revision: {
      assignmentStatus: "changes_requested",
      projectStatus: "fms_working",
      reviewStatus: "needs_information",
      submissionStatus: "changes_requested",
      timelineTitle: "Admin requested FMS submission revision",
    },
  };
  const config = decisionConfig[input.decision];
  let convertedFactoryId = bundle.submission.converted_factory_id;

  if (input.decision === "approve" && input.updateFactoryDatabase) {
    const factoryResult = await createOrUpdatePrivateFactoryRecord({
      admin,
      assignment: bundle.assignment,
      input,
      submission: bundle.submission,
    });

    if (!factoryResult.ok) {
      return { ok: false, message: factoryResult.message };
    }

    convertedFactoryId = factoryResult.factory.id;
  }

  const reviewMetadata = {
    ...toJsonObject(bundle.submission.metadata),
    admin_review_note: adminNote,
    admin_reviewed_at: now,
    admin_reviewed_by: admin.authUserId,
    factory_database_action:
      input.decision === "approve" && input.updateFactoryDatabase
        ? "private_factory_record_linked_or_created"
        : "not_requested",
    phase: "phase_6_admin_factory_submission_review",
  };

  const writes: PromiseLike<{ error: { message: string } | null }>[] = [
    admin.supabase
      .from("fms_factory_submissions")
      .update({
        admin_review_status: config.reviewStatus,
        converted_factory_id: convertedFactoryId,
        metadata: reviewMetadata,
        submission_status: config.submissionStatus,
        updated_by: admin.authUserId,
      })
      .eq("id", bundle.submission.id),
    admin.supabase
      .from("fms_assignments")
      .update({
        assignment_status: config.assignmentStatus,
        updated_by: admin.authUserId,
      })
      .eq("id", bundle.assignment.id),
    admin.supabase.from("import_project_timeline_events").insert({
      body:
        input.decision === "approve"
          ? "Admin approved the FMS factory submission for internal workflow. Importer release is not connected yet."
          : "Admin reviewed the FMS factory submission and kept it inside the admin/FMS workflow.",
      created_by: admin.authUserId,
      event_type: `phase_6_${input.decision}`,
      metadata: {
        admin_note: adminNote,
        assignment_code: bundle.assignment.assignment_code,
        submission_code: bundle.submission.submission_code,
        visible_to_importer: false,
      },
      project_id: bundle.assignment.project_id,
      title: config.timelineTitle,
      visible_to_agent: false,
      visible_to_fms: true,
      visible_to_importer: false,
    }),
  ];

  if (bundle.project?.project_status !== config.projectStatus) {
    writes.push(
      admin.supabase.from("import_project_status_history").insert({
        changed_by: admin.authUserId,
        from_status: bundle.project?.project_status ?? "factory_options_submitted",
        metadata: {
          decision: input.decision,
          submission_code: bundle.submission.submission_code,
          visible_to_importer: false,
        },
        project_id: bundle.assignment.project_id,
        reason: config.timelineTitle,
        to_status: config.projectStatus,
      }),
      admin.supabase
        .from("import_projects")
        .update({
          project_status: config.projectStatus,
          updated_by: admin.authUserId,
        })
        .eq("id", bundle.assignment.project_id),
    );
  }

  const writeResults = await Promise.all(writes);
  const writeError = writeResults.find((result) => result.error)?.error;

  if (writeError) {
    return { ok: false, message: writeError.message };
  }

  const notificationType =
    input.decision === "approve"
      ? "factory_submission_approved"
      : input.decision === "request_revision"
        ? "factory_submission_changes_requested"
        : "factory_submission_rejected";

  if (bundle.fmsProfile?.user_profile_id) {
    await createNotification(
      {
        actionUrl: `/fms/assignments/${bundle.assignment.assignment_code}`,
        actorProfileId: admin.profileId,
        assignmentId: bundle.assignment.id,
        projectId: bundle.assignment.project_id,
        recipientProfileId: bundle.fmsProfile.user_profile_id,
        submissionId: bundle.submission.id,
        templateContext: {
          assignmentCode: bundle.assignment.assignment_code,
          submissionCode: bundle.submission.submission_code,
        },
        type: notificationType,
      },
      admin.supabase,
    );
  }

  return getFactorySubmissionDetailForAdminAction(
    accessToken,
    bundle.submission.submission_code,
  );
}
