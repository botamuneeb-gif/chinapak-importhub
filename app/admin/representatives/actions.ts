"use server";

import { randomInt } from "crypto";
import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import {
  formatRepresentativeStatus,
  isRepresentativeCodeFormat,
} from "@/lib/representatives/codes";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type RepresentativeRow = Database["public"]["Tables"]["representatives"]["Row"];
type RepresentativeInsert =
  Database["public"]["Tables"]["representatives"]["Insert"];
type RepresentativeStatus =
  Database["public"]["Enums"]["representative_status"];
type RepresentativeCodeStatus =
  Database["public"]["Enums"]["representative_code_status"];

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

type JsonObject = { [key: string]: Json | undefined };

export type AdminRepresentativeItem = {
  activatedAt: string;
  city: string;
  codeStatus: RepresentativeCodeStatus;
  codeStatusLabel: string;
  createdAt: string;
  displayName: string;
  fullName: string;
  id: string;
  internalNotes: string;
  publicNotes: string;
  province: string;
  recentAttempts: Array<{
    codeEntered: string;
    createdAt: string;
    result: string;
  }>;
  representativeStatus: RepresentativeStatus;
  representativeStatusLabel: string;
  roleTitle: string;
  serviceArea: string;
  suspendedAt: string;
  verificationCode: string;
};

export type RepresentativeFormInput = {
  city?: string;
  displayName?: string;
  fullName?: string;
  internalNotes?: string;
  province?: string;
  publicNotes?: string;
  representativeStatus?: RepresentativeStatus;
  roleTitle?: string;
  serviceArea?: string;
};

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function trimOptional(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : "";
}

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
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

function byRepresentativeId<
  T extends { matched_representative_id: string | null },
>(rows: T[]) {
  const grouped = new Map<string, T[]>();

  rows.forEach((row) => {
    if (!row.matched_representative_id) {
      return;
    }

    const existing = grouped.get(row.matched_representative_id) ?? [];
    grouped.set(row.matched_representative_id, [...existing, row]);
  });

  return grouped;
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
      message: "Only admin or super admin users can manage representatives.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    role: authCheck.profile.roles.includes(USER_ROLES.superAdmin)
      ? USER_ROLES.superAdmin
      : USER_ROLES.admin,
  };
}

function validateRepresentativeInput(input: RepresentativeFormInput) {
  const fullName = trimOptional(input.fullName);
  const displayName = trimOptional(input.displayName) || fullName;
  const roleTitle =
    trimOptional(input.roleTitle) || "ChinaPak ImportHub Representative";

  if (fullName.length < 2) {
    return { ok: false as const, message: "Full name is required." };
  }

  if (displayName.length < 2) {
    return { ok: false as const, message: "Display name is required." };
  }

  return {
    ok: true as const,
    data: {
      city: trimOptional(input.city) || null,
      displayName,
      fullName,
      internalNotes: trimOptional(input.internalNotes) || null,
      province: trimOptional(input.province) || null,
      publicNotes: trimOptional(input.publicNotes) || null,
      representativeStatus: input.representativeStatus ?? "active",
      roleTitle,
      serviceArea: trimOptional(input.serviceArea) || null,
    },
  };
}

function generateCodeCandidate() {
  let suffix = "";

  for (let index = 0; index < 5; index += 1) {
    suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }

  return `CPIH-REP-${suffix}`;
}

async function generateUniqueRepresentativeCode(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generateCodeCandidate();
    const { data, error } = await supabase
      .from("representatives")
      .select("id")
      .eq("verification_code", code)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return code;
    }
  }

  throw new Error("Could not generate a unique representative code.");
}

async function writeRepresentativeAudit(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  input: {
    action: string;
    actorRole: Database["public"]["Enums"]["user_role"];
    actorUserId: string;
    afterData?: Json;
    beforeData?: Json;
    representativeId: string;
  },
) {
  await supabase.from("audit_logs").insert({
    action: input.action,
    actor_role: input.actorRole,
    actor_user_id: input.actorUserId,
    after_data: input.afterData ?? null,
    before_data: input.beforeData ?? null,
    entity_id: input.representativeId,
    entity_type: "representative",
    metadata: {
      phase: "phase_16_representative_verification_workflow",
      no_private_contact_details_publicly_exposed: true,
    },
  });
}

function mapRepresentativeItem(
  representative: RepresentativeRow,
  attempts: Array<{
    created_at: string;
    result: Database["public"]["Enums"]["representative_verification_result"];
    verification_code_entered: string;
  }>,
): AdminRepresentativeItem {
  return {
    activatedAt: formatDate(representative.activated_at),
    city: representative.city ?? "Not set",
    codeStatus: representative.code_status,
    codeStatusLabel: formatRepresentativeStatus(representative.code_status),
    createdAt: formatDate(representative.created_at),
    displayName: representative.display_name,
    fullName: representative.full_name,
    id: representative.id,
    internalNotes: representative.internal_notes ?? "",
    publicNotes: representative.public_notes ?? "",
    province: representative.province ?? "Not set",
    recentAttempts: attempts.map((attempt) => ({
      codeEntered: attempt.verification_code_entered,
      createdAt: formatDate(attempt.created_at),
      result: formatRepresentativeStatus(attempt.result),
    })),
    representativeStatus: representative.representative_status,
    representativeStatusLabel: formatRepresentativeStatus(
      representative.representative_status,
    ),
    roleTitle: representative.role_title,
    serviceArea: representative.service_area ?? "Not set",
    suspendedAt: formatDate(representative.suspended_at),
    verificationCode: representative.verification_code,
  };
}

async function listRepresentatives(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
) {
  const { data: representativeRows, error: representativesError } = await supabase
    .from("representatives")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (representativesError) {
    return { ok: false as const, message: representativesError.message };
  }

  const representatives = representativeRows ?? [];
  const representativeIds = representatives.map((representative) => representative.id);

  const { data: attemptRows, error: attemptsError } =
    representativeIds.length > 0
      ? await supabase
          .from("representative_verification_attempts")
          .select(
            "matched_representative_id, verification_code_entered, result, created_at",
          )
          .in("matched_representative_id", representativeIds)
          .order("created_at", { ascending: false })
          .limit(100)
      : { data: [], error: null };

  if (attemptsError) {
    return { ok: false as const, message: attemptsError.message };
  }

  const attemptsByRepresentative = byRepresentativeId(attemptRows ?? []);

  return {
    ok: true as const,
    data: representatives.map((representative) =>
      mapRepresentativeItem(
        representative,
        (attemptsByRepresentative.get(representative.id) ?? []).slice(0, 5),
      ),
    ),
  };
}

export async function listAdminRepresentativesAction(
  accessToken: string,
): Promise<ActionResult<AdminRepresentativeItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    return await listRepresentatives(supabase);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Representative directory could not be loaded.",
    };
  }
}

export async function createRepresentativeAction(
  accessToken: string,
  input: RepresentativeFormInput,
): Promise<ActionResult<AdminRepresentativeItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const validated = validateRepresentativeInput(input);

    if (!validated.ok) {
      return validated;
    }

    const supabase = createAdminSupabaseClient();
    const verificationCode = await generateUniqueRepresentativeCode(supabase);
    const now = new Date().toISOString();
    const insertPayload: RepresentativeInsert = {
      activated_at:
        validated.data.representativeStatus === "active" ? now : null,
      city: validated.data.city,
      code_status:
        validated.data.representativeStatus === "active" ? "active" : "suspended",
      created_by: admin.authUserId,
      display_name: validated.data.displayName,
      full_name: validated.data.fullName,
      internal_notes: validated.data.internalNotes,
      metadata: {
        created_from: "admin_representative_management",
      },
      province: validated.data.province,
      public_notes: validated.data.publicNotes,
      representative_status: validated.data.representativeStatus,
      role_title: validated.data.roleTitle,
      service_area: validated.data.serviceArea,
      suspended_at:
        validated.data.representativeStatus === "suspended" ? now : null,
      updated_by: admin.authUserId,
      verification_code: verificationCode,
    };

    const { data: representative, error } = await supabase
      .from("representatives")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      return { ok: false, message: error.message };
    }

    await writeRepresentativeAudit(supabase, {
      action: "representative_created",
      actorRole: admin.role,
      actorUserId: admin.authUserId,
      afterData: {
        code_status: representative.code_status,
        representative_status: representative.representative_status,
        verification_code: representative.verification_code,
      },
      representativeId: representative.id,
    });

    return await listRepresentatives(supabase);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Representative could not be created.",
    };
  }
}

export async function updateRepresentativeAction(
  accessToken: string,
  representativeId: string,
  input: RepresentativeFormInput,
): Promise<ActionResult<AdminRepresentativeItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const validated = validateRepresentativeInput(input);

    if (!validated.ok) {
      return validated;
    }

    const supabase = createAdminSupabaseClient();
    const { data: before } = await supabase
      .from("representatives")
      .select("*")
      .eq("id", representativeId)
      .maybeSingle();

    if (!before) {
      return { ok: false, message: "Representative was not found." };
    }

    const { error } = await supabase
      .from("representatives")
      .update({
        city: validated.data.city,
        display_name: validated.data.displayName,
        full_name: validated.data.fullName,
        internal_notes: validated.data.internalNotes,
        metadata: {
          ...toJsonObject(before.metadata),
          last_admin_edit_at: new Date().toISOString(),
        },
        province: validated.data.province,
        public_notes: validated.data.publicNotes,
        role_title: validated.data.roleTitle,
        service_area: validated.data.serviceArea,
        updated_by: admin.authUserId,
      })
      .eq("id", representativeId);

    if (error) {
      return { ok: false, message: error.message };
    }

    await writeRepresentativeAudit(supabase, {
      action: "representative_updated",
      actorRole: admin.role,
      actorUserId: admin.authUserId,
      afterData: {
        city: validated.data.city,
        display_name: validated.data.displayName,
        province: validated.data.province,
        service_area: validated.data.serviceArea,
      },
      beforeData: {
        city: before.city,
        display_name: before.display_name,
        province: before.province,
        service_area: before.service_area,
      },
      representativeId,
    });

    return await listRepresentatives(supabase);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Representative could not be updated.",
    };
  }
}

function statusPayload(
  nextStatus: RepresentativeStatus,
): {
  activated_at?: string | null;
  code_status: RepresentativeCodeStatus;
  representative_status: RepresentativeStatus;
  suspended_at?: string | null;
} {
  const now = new Date().toISOString();

  if (nextStatus === "active") {
    return {
      activated_at: now,
      code_status: "active",
      representative_status: "active",
      suspended_at: null,
    };
  }

  if (nextStatus === "archived") {
    return {
      code_status: "revoked",
      representative_status: "archived",
      suspended_at: now,
    };
  }

  return {
    code_status: "suspended",
    representative_status: nextStatus,
    suspended_at: now,
  };
}

export async function setRepresentativeStatusAction(
  accessToken: string,
  representativeId: string,
  nextStatus: RepresentativeStatus,
): Promise<ActionResult<AdminRepresentativeItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    if (!["active", "pending", "suspended", "archived"].includes(nextStatus)) {
      return { ok: false, message: "Unsupported representative status." };
    }

    const supabase = createAdminSupabaseClient();
    const { data: before } = await supabase
      .from("representatives")
      .select("*")
      .eq("id", representativeId)
      .maybeSingle();

    if (!before) {
      return { ok: false, message: "Representative was not found." };
    }

    const payload = statusPayload(nextStatus);
    const { error } = await supabase
      .from("representatives")
      .update({
        ...payload,
        metadata: {
          ...toJsonObject(before.metadata),
          last_status_change_at: new Date().toISOString(),
        },
        updated_by: admin.authUserId,
      })
      .eq("id", representativeId);

    if (error) {
      return { ok: false, message: error.message };
    }

    await writeRepresentativeAudit(supabase, {
      action:
        nextStatus === "active"
          ? "representative_reactivated"
          : nextStatus === "archived"
            ? "representative_archived"
            : nextStatus === "suspended"
              ? "representative_suspended"
              : "representative_status_updated",
      actorRole: admin.role,
      actorUserId: admin.authUserId,
      afterData: payload,
      beforeData: {
        code_status: before.code_status,
        representative_status: before.representative_status,
      },
      representativeId,
    });

    return await listRepresentatives(supabase);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Representative status could not be updated.",
    };
  }
}

export async function regenerateRepresentativeCodeAction(
  accessToken: string,
  representativeId: string,
): Promise<ActionResult<AdminRepresentativeItem[]>> {
  try {
    const admin = await requireAdmin(accessToken);

    if (!admin.ok) {
      return admin;
    }

    const supabase = createAdminSupabaseClient();
    const { data: before } = await supabase
      .from("representatives")
      .select("*")
      .eq("id", representativeId)
      .maybeSingle();

    if (!before) {
      return { ok: false, message: "Representative was not found." };
    }

    const nextCode = await generateUniqueRepresentativeCode(supabase);

    if (!isRepresentativeCodeFormat(nextCode)) {
      return { ok: false, message: "Generated representative code was invalid." };
    }

    const { error } = await supabase
      .from("representatives")
      .update({
        code_status:
          before.representative_status === "active" ? "active" : "suspended",
        metadata: {
          ...toJsonObject(before.metadata),
          previous_verification_code: before.verification_code,
          regenerated_at: new Date().toISOString(),
        },
        updated_by: admin.authUserId,
        verification_code: nextCode,
      })
      .eq("id", representativeId);

    if (error) {
      return { ok: false, message: error.message };
    }

    await writeRepresentativeAudit(supabase, {
      action: "representative_code_regenerated",
      actorRole: admin.role,
      actorUserId: admin.authUserId,
      afterData: {
        verification_code: nextCode,
      },
      beforeData: {
        verification_code: before.verification_code,
      },
      representativeId,
    });

    return await listRepresentatives(supabase);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Representative code could not be regenerated.",
    };
  }
}
