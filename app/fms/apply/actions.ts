"use server";

import { ROUTES } from "@/config/brand";
import { fmsApplicationSource } from "@/config/fms-acquisition";
import { USER_ROLES } from "@/lib/auth/roles";
import { createNotification } from "@/lib/notifications/create-notification";
import { sendFmsApplicationConfirmationEmail } from "@/lib/notifications/fms-application-emails";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

export type FmsApplicationResult =
  | {
      leadCode: string;
      message: string;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

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

function readBoolean(formData: FormData, key: string) {
  const value = formData.get(key);

  return value === "on" || value === "true" || value === "yes";
}

function readTrackingString(formData: FormData, key: string, max = 500) {
  const value = formData.get(key);
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    return "";
  }

  return text.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);
}

function readFmsSeoPageType(formData: FormData) {
  const value = readTrackingString(formData, "tracking_fms_seo_page_type", 40);

  if (
    value === "hub" ||
    value === "core" ||
    value === "city" ||
    value === "category" ||
    value === "apply"
  ) {
    return value;
  }

  return "apply";
}

function hasContactChannel(values: {
  email: string;
  phone: string;
  wechatId: string;
}) {
  return Boolean(values.email || values.phone || values.wechatId);
}

function generateFmsLeadCode() {
  const year = new Date().getFullYear();
  const timestampPart = Date.now().toString(36).toUpperCase().slice(-5);
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 6);

  return `FMS-APP-${year}-${timestampPart}${randomPart}`;
}

export async function submitFmsApplicationLeadAction(
  formData: FormData,
): Promise<FmsApplicationResult> {
  try {
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
    const canCollectEvidence = readBoolean(formData, "can_collect_evidence");
    const canVisitFactories = readBoolean(formData, "can_visit_factories");
    const consent = readBoolean(formData, "consent");
    const submittedAt = new Date().toISOString();

    if (!hasContactChannel({ email, phone, wechatId })) {
      return {
        ok: false,
        message: "Please provide at least one contact channel: WeChat, email, or phone.",
      };
    }

    if (!consent) {
      return {
        ok: false,
        message: "Please confirm that this is an application for admin review only.",
      };
    }

    const supabase = createAdminSupabaseClient();
    const metadata = {
      account_creation: "not_created",
      admin_review_required: true,
      can_collect_photos_videos_quotes: canCollectEvidence,
      can_visit_factories: canVisitFactories,
      city,
      consent_received: true,
      email,
      factory_regions: factoryRegions,
      fms_seo_page_type: readFmsSeoPageType(formData),
      full_name: fullName,
      intended_role: USER_ROLES.fms,
      landing_page: readTrackingString(formData, "tracking_landing_page"),
      languages,
      lead_type: "fms_application",
      phone,
      product_categories: productCategories,
      province,
      referrer: readTrackingString(formData, "tracking_referrer"),
      short_introduction: shortIntroduction,
      source: fmsApplicationSource,
      source_page_slug: readTrackingString(formData, "tracking_source_page_slug", 160),
      sourcing_experience: sourcingExperience,
      submitted_at: submittedAt,
      submitted_from_url: readTrackingString(
        formData,
        "tracking_submitted_from_url",
      ),
      user_language: readTrackingString(formData, "tracking_user_language", 80),
      utm_campaign: readTrackingString(formData, "tracking_utm_campaign", 160),
      utm_content: readTrackingString(formData, "tracking_utm_content", 160),
      utm_medium: readTrackingString(formData, "tracking_utm_medium", 120),
      utm_source: readTrackingString(formData, "tracking_utm_source", 120),
      utm_term: readTrackingString(formData, "tracking_utm_term", 160),
      wechat_id: wechatId,
      workflow_status: "new",
    } satisfies Record<string, boolean | string>;

    let lastErrorMessage = "";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const leadCode = generateFmsLeadCode();
      const { data: lead, error } = await supabase
        .from("unpaid_leads")
        .insert({
          follow_up_status: "New FMS application",
          lead_code: leadCode,
          lead_status: "new_lead",
          metadata: metadata as Json,
          payment_problem_reason:
            "FMS application lead for admin review; no importer payment workflow.",
          product_summary: `FMS application: ${fullName} in ${city}, ${province}. Categories: ${productCategories}`,
        })
        .select("id, lead_code")
        .single();

      if (lead) {
        await createNotification(
          {
            actionUrl: `/admin/leads?lead=${lead.id}&filter=fms`,
            metadata: {
              lead_id: lead.id,
              source: fmsApplicationSource,
            },
            priority: "high",
            recipientRole: USER_ROLES.admin,
            templateContext: { leadCode: lead.lead_code },
            title: "New FMS application lead",
            message: `${lead.lead_code} was submitted from the public FMS application page. Review it in admin leads before creating any FMS account.`,
            type: "unpaid_lead_created",
          },
          supabase,
        );

        await sendFmsApplicationConfirmationEmail({
          candidateEmail: email,
          candidateName: fullName,
          leadCode: lead.lead_code,
          leadId: lead.id,
          supabase,
        });

        return {
          leadCode: lead.lead_code,
          message:
            "Application received. Our admin team will review and contact approved candidates.",
          ok: true,
        };
      }

      lastErrorMessage = error?.message ?? "Application could not be saved.";

      if (error && !error.message.toLowerCase().includes("duplicate")) {
        break;
      }
    }

    return {
      ok: false,
      message:
        lastErrorMessage ||
        `Application could not be submitted. Please contact support through ${ROUTES.contact}.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Application could not be submitted safely.",
    };
  }
}
