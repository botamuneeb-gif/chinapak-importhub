"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/config/brand";
import { fmsApplicationSource } from "@/config/fms-acquisition";
import { USER_ROLES } from "@/lib/auth/roles";
import { hashFmsApplicationUpdateToken } from "@/lib/fms/application-update-tokens";
import { createNotifications } from "@/lib/notifications/create-notification";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { NotificationPayload } from "@/lib/notifications/types";
import type { Database, Json } from "@/lib/supabase/types";

type LeadRow = Database["public"]["Tables"]["unpaid_leads"]["Row"];
type JsonObject = { [key: string]: Json | undefined };

export type FmsApplicationUpdateView =
  | {
      data: {
        canCollectEvidence: boolean;
        canVisitFactories: boolean;
        city: string;
        email: string;
        factoryRegions: string;
        fullName: string;
        languages: string;
        leadCode: string;
        phone: string;
        productCategories: string;
        province: string;
        shortIntroduction: string;
        sourcingExperience: string;
        token: string;
        updateExpiresAt: string;
        wechatId: string;
      };
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type FmsApplicationUpdateResult =
  | {
      message: string;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function asJson(value: JsonObject) {
  return value as Json;
}

function readString(value: Json | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readBoolean(value: Json | null | undefined) {
  return value === true || value === "true";
}

function readNumber(value: Json | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readFormString(
  formData: FormData,
  key: string,
  options: { max?: number; required?: boolean } = {},
) {
  const value = formData.get(key);
  const text = typeof value === "string" ? value.trim() : "";

  if (options.required && !text) {
    throw new Error("Please complete all required application fields.");
  }

  if (options.max && text.length > options.max) {
    throw new Error("One of the application fields is too long.");
  }

  return text;
}

function readFormBoolean(formData: FormData, key: string) {
  const value = formData.get(key);

  return value === "on" || value === "true" || value === "yes";
}

function hasContactChannel(values: {
  email: string;
  phone: string;
  wechatId: string;
}) {
  return Boolean(values.email || values.phone || values.wechatId);
}

function tokenIsExpired(expiresAt: string) {
  const timestamp = Date.parse(expiresAt);

  return !Number.isFinite(timestamp) || timestamp <= Date.now();
}

async function findLeadByToken(token: string) {
  const cleanToken = token.trim();

  if (!cleanToken || cleanToken.length > 180) {
    return {
      ok: false as const,
      message: "This application update link is invalid or expired.",
    };
  }

  const tokenHash = hashFmsApplicationUpdateToken(cleanToken);
  const supabase = createAdminSupabaseClient();
  const { data: lead, error } = await supabase
    .from("unpaid_leads")
    .select("*")
    .filter("metadata->>fms_application_update_token_hash", "eq", tokenHash)
    .maybeSingle();

  if (error || !lead) {
    return {
      ok: false as const,
      message: "This application update link is invalid or expired.",
    };
  }

  const metadata = toJsonObject(lead.metadata);
  const source = readString(metadata.source);
  const intendedRole = readString(metadata.intended_role);
  const leadType = readString(metadata.lead_type);
  const expiresAt = readString(metadata.fms_application_update_token_expires_at);

  if (
    source !== fmsApplicationSource &&
    intendedRole !== USER_ROLES.fms &&
    leadType !== "fms_application"
  ) {
    return {
      ok: false as const,
      message: "This application update link is invalid or expired.",
    };
  }

  if (!expiresAt || tokenIsExpired(expiresAt)) {
    return {
      ok: false as const,
      message: "This application update link is invalid or expired.",
    };
  }

  return { lead: lead as LeadRow, metadata, ok: true as const, supabase };
}

export async function getFmsApplicationUpdateView(
  token: string,
): Promise<FmsApplicationUpdateView> {
  const result = await findLeadByToken(token);

  if (!result.ok) {
    return result;
  }

  const { lead, metadata } = result;

  return {
    data: {
      canCollectEvidence: readBoolean(metadata.can_collect_photos_videos_quotes),
      canVisitFactories: readBoolean(metadata.can_visit_factories),
      city: readString(metadata.city),
      email: readString(metadata.email),
      factoryRegions: readString(metadata.factory_regions),
      fullName: readString(metadata.full_name),
      languages: readString(metadata.languages),
      leadCode: lead.lead_code,
      phone: readString(metadata.phone),
      productCategories: readString(metadata.product_categories),
      province: readString(metadata.province),
      shortIntroduction: readString(metadata.short_introduction),
      sourcingExperience: readString(metadata.sourcing_experience),
      token,
      updateExpiresAt: readString(
        metadata.fms_application_update_token_expires_at,
      ),
      wechatId: readString(metadata.wechat_id),
    },
    ok: true,
  };
}

export async function updateFmsApplicationWithTokenAction(
  formData: FormData,
): Promise<FmsApplicationUpdateResult> {
  try {
    const token = readFormString(formData, "token", {
      max: 180,
      required: true,
    });
    const lookup = await findLeadByToken(token);

    if (!lookup.ok) {
      return lookup;
    }

    const fullName = readFormString(formData, "full_name", {
      max: 120,
      required: true,
    });
    const province = readFormString(formData, "province", {
      max: 80,
      required: true,
    });
    const city = readFormString(formData, "city", {
      max: 80,
      required: true,
    });
    const wechatId = readFormString(formData, "wechat_id", { max: 120 });
    const email = readFormString(formData, "email", { max: 160 });
    const phone = readFormString(formData, "phone", { max: 80 });
    const languages = readFormString(formData, "languages", {
      max: 240,
      required: true,
    });
    const productCategories = readFormString(formData, "product_categories", {
      max: 500,
      required: true,
    });
    const factoryRegions = readFormString(formData, "factory_regions", {
      max: 500,
    });
    const sourcingExperience = readFormString(formData, "sourcing_experience", {
      max: 900,
      required: true,
    });
    const shortIntroduction = readFormString(formData, "short_introduction", {
      max: 900,
    });
    const canCollectEvidence = readFormBoolean(formData, "can_collect_evidence");
    const canVisitFactories = readFormBoolean(formData, "can_visit_factories");

    if (!hasContactChannel({ email, phone, wechatId })) {
      return {
        ok: false,
        message: "Please provide at least one contact channel: WeChat, email, or phone.",
      };
    }

    const { lead, metadata, supabase } = lookup;
    const now = new Date().toISOString();
    const wasForwarded = Boolean(
      readString(metadata.forwarded_to_super_admin_at) ||
        readString(metadata.super_admin_review_status),
    );
    const updateCount = readNumber(metadata.candidate_update_count) + 1;
    const nextMetadata: JsonObject = {
      ...metadata,
      can_collect_photos_videos_quotes: canCollectEvidence,
      can_visit_factories: canVisitFactories,
      candidate_update_count: updateCount,
      candidate_updated_at: now,
      city,
      email,
      factory_regions: factoryRegions,
      fms_application_update_completed_at: now,
      fms_application_update_token_expires_at: null,
      fms_application_update_token_hash: null,
      full_name: fullName,
      languages,
      last_candidate_update_source: "secure_update_link",
      phone,
      product_categories: productCategories,
      province,
      short_introduction: shortIntroduction,
      sourcing_experience: sourcingExperience,
      wechat_id: wechatId,
      workflow_status: wasForwarded ? "forwarded_to_super_admin" : "in_review",
    };

    if (wasForwarded) {
      nextMetadata.super_admin_review_status = "pending";
    } else {
      nextMetadata.admin_review_status = "in_review";
    }

    const { error: updateError } = await supabase
      .from("unpaid_leads")
      .update({
        follow_up_status: "Candidate updated requested information",
        metadata: asJson(nextMetadata),
        payment_problem_reason:
          "FMS application lead updated through secure candidate update link.",
        product_summary: `FMS application: ${fullName} in ${city}, ${province}. Categories: ${productCategories}`,
      })
      .eq("id", lead.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    await supabase.from("lead_followups").insert({
      channel: "secure_update_link",
      lead_id: lead.id,
      metadata: {
        candidate_update_count: updateCount,
        source: "secure_update_link",
      },
      notes: "Candidate updated requested FMS application information.",
      outcome: "candidate_updated_requested_information",
    });

    const notifications: NotificationPayload[] = [
      {
        actionUrl: `/admin/leads?lead=${lead.id}&filter=fms`,
        metadata: {
          candidate_update_count: updateCount,
          lead_code: lead.lead_code,
          lead_id: lead.id,
          source: fmsApplicationSource,
        },
        priority: "high" as const,
        recipientRole: USER_ROLES.admin,
        title: "FMS candidate updated requested information",
        message: `${lead.lead_code} was updated through the secure candidate update link.`,
        type: "unpaid_lead_created" as const,
      },
    ];

    if (wasForwarded) {
      notifications.push({
        actionUrl: `${ROUTES.superAdminFmsApplications}?lead=${lead.id}&filter=pending`,
        metadata: {
          candidate_update_count: updateCount,
          lead_code: lead.lead_code,
          lead_id: lead.id,
          source: fmsApplicationSource,
        },
        priority: "high" as const,
        recipientRole: USER_ROLES.superAdmin,
        title: "FMS candidate updated requested information",
        message: `${lead.lead_code} was updated and is ready for Super Admin review.`,
        type: "role_changed" as const,
      });
    }

    await createNotifications(notifications, supabase);

    revalidatePath("/admin/leads");
    revalidatePath(ROUTES.superAdmin);
    revalidatePath(ROUTES.superAdminFmsApplications);

    return {
      ok: true,
      message:
        "Your application information has been updated. Our team will continue reviewing your application.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Application update could not be saved safely.",
    };
  }
}
