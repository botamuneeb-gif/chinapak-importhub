"use server";

import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { createNotification } from "@/lib/notifications/create-notification";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type FileBucket = Database["public"]["Enums"]["file_bucket"];
type FileReviewStatus = Database["public"]["Enums"]["file_review_status_enum"];
type UserRole = Database["public"]["Enums"]["user_role"];
type JsonObject = { [key: string]: Json | undefined };

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

export type ManagedFileAsset = {
  assignmentCode: string;
  bucket: FileBucket;
  canReleaseToImporter: boolean;
  createdAt: string;
  fileName: string;
  fileSize: string;
  id: string;
  mimeType: string;
  projectCode: string;
  reviewStatus: string;
  reviewStatusRaw: FileReviewStatus;
  sourceRole: string;
  storagePath: string;
  visibilityScope: string;
};

export type ReviewEvidenceInput = {
  decision:
    | "approve_internal"
    | "mark_admin_only"
    | "reject"
    | "release_to_importer";
  notes?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const FILE_BUCKETS = {
  adminPrivate: "admin-private-files",
  fmsEvidence: "fms-evidence-files",
  importerProject: "importer-project-files",
  importerReleasedReport: "importer-released-report-files",
} as const satisfies Record<string, FileBucket>;

const MAX_FILE_BYTES = {
  document: 10 * 1024 * 1024,
  image: 8 * 1024 * 1024,
  video: 25 * 1024 * 1024,
} as const;

const ALLOWED_MIME_TYPES: Record<string, { group: keyof typeof MAX_FILE_BYTES; label: string }> = {
  "application/pdf": { group: "document", label: "PDF document" },
  "image/jpeg": { group: "image", label: "JPEG image" },
  "image/png": { group: "image", label: "PNG image" },
  "image/webp": { group: "image", label: "WebP image" },
  "video/mp4": { group: "video", label: "MP4 video" },
  "video/webm": { group: "video", label: "WebM video" },
};

const REVIEW_STATUS_LABELS: Record<FileReviewStatus, string> = {
  approved_factory_visible_future: "Factory-visible future",
  approved_fms_visible: "Approved for FMS",
  approved_importer_visible: "Released to importer",
  approved_internal: "Approved internal",
  archived: "Archived",
  needs_redaction: "Needs redaction",
  pending_review: "Pending admin review",
  redacted: "Redacted",
  rejected: "Rejected",
};

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | undefined, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

function sanitizeFileName(fileName: string) {
  const cleaned = fileName
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  return cleaned || "upload";
}

function getFormFile(formData: FormData) {
  const value = formData.get("file");

  if (!(value instanceof File) || value.size === 0) {
    return { ok: false as const, message: "Please choose a file first." };
  }

  return { ok: true as const, file: value };
}

function validateUploadFile(file: File) {
  const allowed = ALLOWED_MIME_TYPES[file.type];

  if (!allowed) {
    return {
      ok: false as const,
      message:
        "Unsupported file type. Allowed files: JPG, JPEG, PNG, WebP, PDF, MP4, or WebM.",
    };
  }

  const maxBytes = MAX_FILE_BYTES[allowed.group];

  if (file.size > maxBytes) {
    return {
      ok: false as const,
      message: `${allowed.label} is too large. Max allowed size is ${formatFileSize(maxBytes)}.`,
    };
  }

  return { ok: true as const, typeLabel: allowed.label };
}

async function requireRole(accessToken: string, roles: UserRole[]) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, roles)) {
    return {
      ok: false as const,
      message: "This account does not have permission for this file action.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    displayName: authCheck.profile.displayName,
    profileId: authCheck.profile.profileId,
    roles: authCheck.profile.roles,
    supabase: createAdminSupabaseClient(),
  };
}

async function getAdminContext(accessToken: string) {
  const user = await requireRole(accessToken, [
    USER_ROLES.admin,
    USER_ROLES.superAdmin,
  ]);

  if (!user.ok) {
    return user;
  }

  const { data: adminProfile } = await user.supabase
    .from("admin_profiles")
    .select("id")
    .eq("user_profile_id", user.profileId)
    .maybeSingle();

  return {
    ...user,
    adminProfileId: adminProfile?.id ?? null,
  };
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

async function getProjectByCodeOrId(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  projectCodeOrId: string,
) {
  const decoded = decodeURIComponent(projectCodeOrId);
  let { data: project, error } = await supabase
    .from("import_projects")
    .select("*")
    .eq("project_code", decoded)
    .maybeSingle();

  if (!project && !error && UUID_PATTERN.test(decoded)) {
    const fallback = await supabase
      .from("import_projects")
      .select("*")
      .eq("id", decoded)
      .maybeSingle();
    project = fallback.data;
    error = fallback.error;
  }

  return { error, project };
}

async function getAssignmentByCodeOrId(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  assignmentCodeOrId: string,
) {
  const decoded = decodeURIComponent(assignmentCodeOrId);
  let { data: assignment, error } = await supabase
    .from("fms_assignments")
    .select("*")
    .eq("assignment_code", decoded)
    .maybeSingle();

  if (!assignment && !error && UUID_PATTERN.test(decoded)) {
    const fallback = await supabase
      .from("fms_assignments")
      .select("*")
      .eq("id", decoded)
      .maybeSingle();
    assignment = fallback.data;
    error = fallback.error;
  }

  return { assignment, error };
}

function mapFileAsset(
  file: TableRow<"file_assets">,
  projectMap: Map<string, TableRow<"import_projects">>,
  assignmentMap: Map<string, TableRow<"fms_assignments">>,
): ManagedFileAsset {
  const metadata = toJsonObject(file.metadata);
  const visibilityScope = readString(
    metadata.visibility_scope,
    file.review_status === "approved_importer_visible"
      ? "released_to_importer"
      : "admin_only",
  );

  return {
    assignmentCode: file.assignment_id
      ? assignmentMap.get(file.assignment_id)?.assignment_code ?? "Assignment"
      : "Not linked",
    bucket: file.bucket,
    canReleaseToImporter:
      Boolean(file.project_id) &&
      file.review_status !== "rejected" &&
      visibilityScope !== "released_to_importer",
    createdAt: formatDate(file.created_at),
    fileName: file.original_filename,
    fileSize: formatFileSize(file.size_bytes),
    id: file.id,
    mimeType: file.mime_type ?? "Unknown",
    projectCode: file.project_id
      ? projectMap.get(file.project_id)?.project_code ?? "Project"
      : "Not linked",
    reviewStatus: REVIEW_STATUS_LABELS[file.review_status],
    reviewStatusRaw: file.review_status,
    sourceRole: file.source_role ?? "unknown",
    storagePath: file.storage_path,
    visibilityScope,
  };
}

async function mapFiles(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  files: TableRow<"file_assets">[],
) {
  const projectIds = Array.from(
    new Set(files.map((file) => file.project_id).filter((id): id is string => Boolean(id))),
  );
  const assignmentIds = Array.from(
    new Set(
      files
        .map((file) => file.assignment_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const [{ data: projects }, { data: assignments }] = await Promise.all([
    projectIds.length > 0
      ? supabase.from("import_projects").select("*").in("id", projectIds)
      : Promise.resolve({ data: [] }),
    assignmentIds.length > 0
      ? supabase.from("fms_assignments").select("*").in("id", assignmentIds)
      : Promise.resolve({ data: [] }),
  ]);
  const projectMap = new Map(
    (projects ?? []).map((project) => [project.id, project]),
  );
  const assignmentMap = new Map(
    (assignments ?? []).map((assignment) => [assignment.id, assignment]),
  );

  return files.map((file) => mapFileAsset(file, projectMap, assignmentMap));
}

async function insertReviewStatus(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  input: {
    adminProfileId?: string | null;
    authUserId: string;
    fileAssetId: string;
    metadata?: JsonObject;
    notes?: string | null;
    status: FileReviewStatus;
  },
) {
  return supabase.from("file_review_status").upsert(
    {
      file_asset_id: input.fileAssetId,
      metadata: input.metadata ?? {},
      review_notes: input.notes ?? null,
      review_status: input.status,
      reviewed_at:
        input.status === "pending_review" ? null : new Date().toISOString(),
      reviewed_by_admin_profile_id: input.adminProfileId ?? null,
      updated_by: input.authUserId,
    },
    { onConflict: "file_asset_id" },
  );
}

async function uploadPrivateFile(input: {
  authUserId: string;
  bucket: FileBucket;
  file: File;
  metadata: JsonObject;
  projectId: string;
  role: UserRole;
  storagePath: string;
  assignmentId?: string | null;
}) {
  const supabase = createAdminSupabaseClient();
  const fileBytes = Buffer.from(await input.file.arrayBuffer());
  const upload = await supabase.storage
    .from(input.bucket)
    .upload(input.storagePath, fileBytes, {
      contentType: input.file.type,
      upsert: false,
    });

  if (upload.error) {
    return { ok: false as const, message: upload.error.message };
  }

  const { data: fileAsset, error: metadataError } = await supabase
    .from("file_assets")
    .insert({
      bucket: input.bucket,
      created_by: input.authUserId,
      metadata: input.metadata,
      mime_type: input.file.type,
      original_filename: input.file.name,
      project_id: input.projectId,
      assignment_id: input.assignmentId ?? null,
      review_status: "pending_review",
      size_bytes: input.file.size,
      source_role: input.role,
      storage_path: input.storagePath,
      uploaded_by: input.authUserId,
    })
    .select("*")
    .single();

  if (metadataError || !fileAsset) {
    await supabase.storage.from(input.bucket).remove([input.storagePath]);

    return {
      ok: false as const,
      message:
        metadataError?.message ?? "File metadata could not be recorded.",
    };
  }

  await insertReviewStatus(supabase, {
    authUserId: input.authUserId,
    fileAssetId: fileAsset.id,
    metadata: {
      visibility_scope: readString(input.metadata.visibility_scope, "admin_only"),
    },
    status: "pending_review",
  });

  return { ok: true as const, fileAsset, supabase };
}

export async function uploadImporterProjectFileAction(
  accessToken: string,
  projectCodeOrId: string,
  formData: FormData,
): Promise<ActionResult<ManagedFileAsset[]>> {
  const importer = await requireRole(accessToken, [USER_ROLES.importer]);

  if (!importer.ok) {
    return importer;
  }

  const fileResult = getFormFile(formData);

  if (!fileResult.ok) {
    return fileResult;
  }

  const validation = validateUploadFile(fileResult.file);

  if (!validation.ok) {
    return validation;
  }

  const { project, error: projectError } = await getProjectByCodeOrId(
    importer.supabase,
    projectCodeOrId,
  );

  if (projectError || !project) {
    return {
      ok: false,
      message: projectError?.message ?? "Import project was not found.",
    };
  }

  if (project.importer_user_id !== importer.authUserId) {
    return {
      ok: false,
      message: "You can upload files only for your own Import Projects.",
    };
  }

  const assetId = crypto.randomUUID();
  const safeName = sanitizeFileName(fileResult.file.name);
  const storagePath = `projects/${project.project_code}/importer/${assetId}-${safeName}`;
  const purpose = String(formData.get("purpose") ?? "product_reference");
  const upload = await uploadPrivateFile({
    authUserId: importer.authUserId,
    bucket: FILE_BUCKETS.importerProject,
    file: fileResult.file,
    metadata: {
      file_group: validation.typeLabel,
      phase: "phase_9_file_evidence_upload",
      purpose,
      visibility_scope: "importer_uploaded",
    },
    projectId: project.id,
    role: USER_ROLES.importer,
    storagePath,
  });

  if (!upload.ok) {
    return upload;
  }

  await importer.supabase.from("import_project_timeline_events").insert({
    body:
      "Importer uploaded a product reference file. Admin must review before any FMS visibility or importer report release.",
    created_by: importer.authUserId,
    event_type: "importer_file_uploaded",
    metadata: {
      file_asset_id: upload.fileAsset.id,
      file_name: upload.fileAsset.original_filename,
      visibility: "admin_review_required",
    },
    project_id: project.id,
    title: "Importer uploaded project file",
    visible_to_agent: false,
    visible_to_fms: false,
    visible_to_importer: true,
  });

  await createNotification(
    {
      actionUrl: `/admin/evidence`,
      actorProfileId: importer.profileId,
      priority: "normal",
      projectId: project.id,
      recipientRole: USER_ROLES.admin,
      templateContext: {
        projectCode: project.project_code,
      },
      type: "file_evidence_uploaded",
    },
    importer.supabase,
  );

  return listImporterProjectFilesAction(accessToken, project.project_code);
}

export async function uploadFmsEvidenceFileAction(
  accessToken: string,
  assignmentCodeOrId: string,
  formData: FormData,
): Promise<ActionResult<ManagedFileAsset[]>> {
  const fms = await requireRole(accessToken, [USER_ROLES.fms]);

  if (!fms.ok) {
    return fms;
  }

  const fileResult = getFormFile(formData);

  if (!fileResult.ok) {
    return fileResult;
  }

  const validation = validateUploadFile(fileResult.file);

  if (!validation.ok) {
    return validation;
  }

  const { assignment, error: assignmentError } = await getAssignmentByCodeOrId(
    fms.supabase,
    assignmentCodeOrId,
  );

  if (assignmentError || !assignment) {
    return {
      ok: false,
      message: assignmentError?.message ?? "FMS assignment was not found.",
    };
  }

  if (assignment.assigned_fms_user_id !== fms.authUserId) {
    return {
      ok: false,
      message: "You can upload evidence only for your own assignment.",
    };
  }

  if (["cancelled", "completed_by_admin"].includes(assignment.assignment_status)) {
    return {
      ok: false,
      message: "This assignment is not open for evidence upload.",
    };
  }

  const submissionCode = String(formData.get("submissionCode") ?? "").trim();
  let submission: TableRow<"fms_factory_submissions"> | null = null;

  if (submissionCode) {
    const submissionResult = await fms.supabase
      .from("fms_factory_submissions")
      .select("*")
      .eq("assignment_id", assignment.id)
      .eq("submission_code", submissionCode)
      .maybeSingle();

    if (submissionResult.error || !submissionResult.data) {
      return {
        ok: false,
        message:
          submissionResult.error?.message ??
          "Selected factory submission was not found for this assignment.",
      };
    }

    submission = submissionResult.data;
  }

  const assetId = crypto.randomUUID();
  const safeName = sanitizeFileName(fileResult.file.name);
  const storagePath = `projects/${assignment.project_id}/fms/${assignment.assignment_code}/${assetId}-${safeName}`;
  const evidenceType = String(formData.get("evidenceType") ?? "fms_evidence");
  const upload = await uploadPrivateFile({
    assignmentId: assignment.id,
    authUserId: fms.authUserId,
    bucket: FILE_BUCKETS.fmsEvidence,
    file: fileResult.file,
    metadata: {
      evidence_type: evidenceType,
      file_group: validation.typeLabel,
      phase: "phase_9_file_evidence_upload",
      submission_code: submission?.submission_code ?? null,
      submission_id: submission?.id ?? null,
      visibility_scope: "fms_to_admin",
    },
    projectId: assignment.project_id,
    role: USER_ROLES.fms,
    storagePath,
  });

  if (!upload.ok) {
    return upload;
  }

  const now = new Date().toISOString();
  const writes: PromiseLike<{ error: { message: string } | null }>[] = [
    fms.supabase.from("fms_assignment_milestones").upsert(
      {
        assignment_id: assignment.id,
        completed_at: now,
        created_by: fms.authUserId,
        metadata: {
          file_asset_id: upload.fileAsset.id,
          phase: "phase_9_file_evidence_upload",
        },
        milestone_key: "evidence_uploaded",
        status: "completed",
        updated_by: fms.authUserId,
      },
      { onConflict: "assignment_id,milestone_key" },
    ),
    fms.supabase.from("import_project_timeline_events").insert({
      body:
        "FMS uploaded evidence for admin review. Raw evidence is not visible to importer unless admin releases it.",
      created_by: fms.authUserId,
      event_type: "fms_evidence_uploaded",
      metadata: {
        assignment_code: assignment.assignment_code,
        file_asset_id: upload.fileAsset.id,
        submission_code: submission?.submission_code ?? null,
      },
      project_id: assignment.project_id,
      title: "FMS uploaded evidence for admin review",
      visible_to_agent: false,
      visible_to_fms: true,
      visible_to_importer: false,
    }),
  ];

  if (submission) {
    writes.push(
      fms.supabase.from("fms_submission_evidence").insert({
        created_by: fms.authUserId,
        evidence_type: evidenceType,
        file_asset_id: upload.fileAsset.id,
        metadata: {
          phase: "phase_9_file_evidence_upload",
          storage_bucket: upload.fileAsset.bucket,
          storage_path: upload.fileAsset.storage_path,
        },
        review_status: "pending_review",
        submission_id: submission.id,
      }),
    );
  }

  const writeResults = await Promise.all(writes);
  const writeError = writeResults.find((result) => result.error)?.error;

  if (writeError) {
    return { ok: false, message: writeError.message };
  }

  await createNotification(
    {
      actionUrl: "/admin/evidence",
      actorProfileId: fms.profileId,
      assignmentId: assignment.id,
      priority: "normal",
      projectId: assignment.project_id,
      recipientRole: USER_ROLES.admin,
      submissionId: submission?.id ?? null,
      templateContext: {
        assignmentCode: assignment.assignment_code,
        submissionCode: submission?.submission_code,
      },
      type: "file_evidence_uploaded",
    },
    fms.supabase,
  );

  return listFmsAssignmentFilesAction(accessToken, assignment.assignment_code);
}

export async function listImporterProjectFilesAction(
  accessToken: string,
  projectCodeOrId: string,
): Promise<ActionResult<ManagedFileAsset[]>> {
  const importer = await requireRole(accessToken, [USER_ROLES.importer]);

  if (!importer.ok) {
    return importer;
  }

  const { project, error: projectError } = await getProjectByCodeOrId(
    importer.supabase,
    projectCodeOrId,
  );

  if (projectError || !project) {
    return {
      ok: false,
      message: projectError?.message ?? "Import project was not found.",
    };
  }

  if (project.importer_user_id !== importer.authUserId) {
    return {
      ok: false,
      message: "You can view files only for your own Import Projects.",
    };
  }

  const { data: fileRows, error: fileError } = await importer.supabase
    .from("file_assets")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  if (fileError) {
    return { ok: false, message: fileError.message };
  }

  const visibleFiles = (fileRows ?? []).filter((file) => {
    const metadata = toJsonObject(file.metadata);
    const visibilityScope = readString(metadata.visibility_scope);

    return (
      file.uploaded_by === importer.authUserId ||
      file.review_status === "approved_importer_visible" ||
      visibilityScope === "released_to_importer"
    );
  });

  return {
    ok: true,
    data: await mapFiles(importer.supabase, visibleFiles),
  };
}

export async function listFmsAssignmentFilesAction(
  accessToken: string,
  assignmentCodeOrId: string,
): Promise<ActionResult<ManagedFileAsset[]>> {
  const fms = await requireRole(accessToken, [USER_ROLES.fms]);

  if (!fms.ok) {
    return fms;
  }

  const { assignment, error: assignmentError } = await getAssignmentByCodeOrId(
    fms.supabase,
    assignmentCodeOrId,
  );

  if (assignmentError || !assignment) {
    return {
      ok: false,
      message: assignmentError?.message ?? "FMS assignment was not found.",
    };
  }

  if (assignment.assigned_fms_user_id !== fms.authUserId) {
    return {
      ok: false,
      message: "You can view evidence only for your own assignment.",
    };
  }

  const { data: fileRows, error: fileError } = await fms.supabase
    .from("file_assets")
    .select("*")
    .eq("assignment_id", assignment.id)
    .eq("uploaded_by", fms.authUserId)
    .order("created_at", { ascending: false });

  if (fileError) {
    return { ok: false, message: fileError.message };
  }

  return {
    ok: true,
    data: await mapFiles(fms.supabase, fileRows ?? []),
  };
}

export async function listEvidenceForAdminAction(
  accessToken: string,
): Promise<ActionResult<ManagedFileAsset[]>> {
  const admin = await getAdminContext(accessToken);

  if (!admin.ok) {
    return admin;
  }

  const { data: fileRows, error: fileError } = await admin.supabase
    .from("file_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (fileError) {
    return { ok: false, message: fileError.message };
  }

  return {
    ok: true,
    data: await mapFiles(admin.supabase, fileRows ?? []),
  };
}

export async function createFileSignedUrlAction(
  accessToken: string,
  fileAssetId: string,
): Promise<ActionResult<{ signedUrl: string }>> {
  const user = await requireRole(accessToken, [
    USER_ROLES.admin,
    USER_ROLES.agent,
    USER_ROLES.fms,
    USER_ROLES.importer,
    USER_ROLES.superAdmin,
  ]);

  if (!user.ok) {
    return user;
  }

  const { data: file, error: fileError } = await user.supabase
    .from("file_assets")
    .select("*")
    .eq("id", fileAssetId)
    .maybeSingle();

  if (fileError || !file) {
    return {
      ok: false,
      message: fileError?.message ?? "File metadata was not found.",
    };
  }

  const isAdmin = hasAllowedRole(user.roles, [
    USER_ROLES.admin,
    USER_ROLES.superAdmin,
  ]);
  let allowed = isAdmin;

  if (!allowed && hasAllowedRole(user.roles, [USER_ROLES.importer])) {
    const { data: project } = file.project_id
      ? await user.supabase
          .from("import_projects")
          .select("id, importer_user_id")
          .eq("id", file.project_id)
          .maybeSingle()
      : { data: null };
    const { data: grants } = await user.supabase
      .from("file_access_grants")
      .select("id")
      .eq("file_asset_id", file.id)
      .or(`granted_to_role.eq.importer,granted_to_user_id.eq.${user.authUserId}`)
      .limit(1);

    allowed =
      project?.importer_user_id === user.authUserId &&
      (file.uploaded_by === user.authUserId ||
        file.review_status === "approved_importer_visible" ||
        (grants ?? []).length > 0);
  }

  if (!allowed && hasAllowedRole(user.roles, [USER_ROLES.fms]) && file.assignment_id) {
    const { data: assignment } = await user.supabase
      .from("fms_assignments")
      .select("id, assigned_fms_user_id")
      .eq("id", file.assignment_id)
      .maybeSingle();

    allowed =
      assignment?.assigned_fms_user_id === user.authUserId &&
      (file.uploaded_by === user.authUserId ||
        file.review_status === "approved_fms_visible");
  }

  if (!allowed) {
    return {
      ok: false,
      message: "This file is not available to your account.",
    };
  }

  const { data: signedUrl, error: signedUrlError } = await user.supabase.storage
    .from(file.bucket)
    .createSignedUrl(file.storage_path, 300);

  if (signedUrlError || !signedUrl?.signedUrl) {
    return {
      ok: false,
      message: signedUrlError?.message ?? "Signed file URL could not be created.",
    };
  }

  return { ok: true, data: { signedUrl: signedUrl.signedUrl } };
}

export async function reviewEvidenceFileAction(
  accessToken: string,
  fileAssetId: string,
  input: ReviewEvidenceInput,
): Promise<ActionResult<ManagedFileAsset[]>> {
  const admin = await getAdminContext(accessToken);

  if (!admin.ok) {
    return admin;
  }

  const { data: file, error: fileError } = await admin.supabase
    .from("file_assets")
    .select("*")
    .eq("id", fileAssetId)
    .maybeSingle();

  if (fileError || !file) {
    return {
      ok: false,
      message: fileError?.message ?? "File metadata was not found.",
    };
  }

  const now = new Date().toISOString();
  const metadata = toJsonObject(file.metadata);
  let nextStatus: FileReviewStatus = "approved_internal";
  let visibilityScope = "admin_only";
  let timelineTitle = "Admin reviewed evidence file";
  let timelineBody =
    "Admin reviewed a project evidence file. Visibility remains controlled by platform policy.";

  if (input.decision === "reject") {
    nextStatus = "rejected";
    visibilityScope = "admin_only";
    timelineTitle = "Admin rejected evidence file";
  }

  if (input.decision === "release_to_importer") {
    if (!file.project_id) {
      return {
        ok: false,
        message: "Only project-linked files can be released to an importer.",
      };
    }

    nextStatus = "approved_importer_visible";
    visibilityScope = "released_to_importer";
    timelineTitle = "Admin released evidence file to importer";
    timelineBody =
      "Admin released a selected evidence file to the importer report area. Raw FMS evidence and contact details remain controlled.";
  }

  const nextMetadata: JsonObject = {
    ...metadata,
    phase_9_review: {
      decision: input.decision,
      reviewed_at: now,
    },
    visibility_scope: visibilityScope,
  };
  const [{ error: updateError }, { error: reviewStatusError }] =
    await Promise.all([
      admin.supabase
        .from("file_assets")
        .update({
          metadata: nextMetadata,
          review_status: nextStatus,
          updated_by: admin.authUserId,
        })
        .eq("id", file.id),
      insertReviewStatus(admin.supabase, {
        adminProfileId: admin.adminProfileId,
        authUserId: admin.authUserId,
        fileAssetId: file.id,
        metadata: {
          decision: input.decision,
          visibility_scope: visibilityScope,
        },
        notes: input.notes ?? null,
        status: nextStatus,
      }),
    ]);

  if (updateError || reviewStatusError) {
    return {
      ok: false,
      message:
        updateError?.message ??
        reviewStatusError?.message ??
        "Evidence review could not be saved.",
    };
  }

  if (input.decision === "release_to_importer" && file.project_id) {
    const { data: existingGrant } = await admin.supabase
      .from("file_access_grants")
      .select("id")
      .eq("file_asset_id", file.id)
      .eq("project_id", file.project_id)
      .eq("granted_to_role", USER_ROLES.importer)
      .eq("scope", "read")
      .maybeSingle();

    if (!existingGrant) {
      const { error: grantError } = await admin.supabase
        .from("file_access_grants")
        .insert({
          created_by: admin.authUserId,
          file_asset_id: file.id,
          granted_by_admin_profile_id: admin.adminProfileId,
          granted_to_role: USER_ROLES.importer,
          metadata: {
            phase: "phase_9_file_evidence_upload",
            release_reason: input.notes ?? "Admin released to importer report.",
          },
          project_id: file.project_id,
          scope: "read",
        });

      if (grantError) {
        return { ok: false, message: grantError.message };
      }
    }
  }

  if (file.project_id) {
    await admin.supabase.from("import_project_timeline_events").insert({
      body: timelineBody,
      created_by: admin.authUserId,
      event_type:
        input.decision === "release_to_importer"
          ? "evidence_released_to_importer"
          : "evidence_admin_reviewed",
      metadata: {
        decision: input.decision,
        file_asset_id: file.id,
        file_name: file.original_filename,
        review_status: nextStatus,
      },
      project_id: file.project_id,
      title: timelineTitle,
      visible_to_agent: false,
      visible_to_fms: false,
      visible_to_importer: input.decision === "release_to_importer",
    });
  }

  if (input.decision === "release_to_importer" && file.project_id) {
    const { data: project } = await admin.supabase
      .from("import_projects")
      .select("id, importer_profile_id, project_code")
      .eq("id", file.project_id)
      .maybeSingle();
    const recipientProfileId = await getImporterRecipientProfileId(
      admin.supabase,
      project?.importer_profile_id,
    );

    if (project && recipientProfileId) {
      await createNotification(
        {
          actionUrl: `/importer/reports/${project.project_code}`,
          actorProfileId: admin.profileId,
          projectId: project.id,
          recipientProfileId,
          templateContext: {
            projectCode: project.project_code,
          },
          type: "file_evidence_released",
        },
        admin.supabase,
      );
    }
  }

  return listEvidenceForAdminAction(accessToken);
}
