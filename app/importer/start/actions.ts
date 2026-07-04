"use server";

import { importProjectFlow } from "@/config/import-project";
import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { ensureInvoiceForProject } from "@/lib/billing/invoice-helpers";
import { createNotification, createNotifications } from "@/lib/notifications/create-notification";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type StartProjectDraftInput = {
  addOnIds: string[];
  budgetId: string;
  experienceId: string;
  packageId: string;
  productDetails: string;
  productLink: string;
  quantity: string;
  requirementFileCount: number;
  qualityLevelId: string;
  selectedLeadReasonId: string;
  specialNotes: string;
  usedPhotoPlaceholder?: boolean;
  usedVoicePlaceholder?: boolean;
  voiceNoteFileName: string;
};

export type StartProjectActionResult =
  | {
      ok: true;
      invoiceCode?: string;
      projectCode?: string;
      leadCode?: string;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

type ImporterContext = {
  authUserId: string;
  importerProfileId: string;
  profileId: string;
};

type PackageRow = {
  id: string;
  package_code: string;
  name: string;
  price_pkr: number;
  delivery_days_min: number | null;
  delivery_days_max: number | null;
};

type AddonRow = {
  id: string;
  addon_code: string;
  name: string;
  price_min_pkr: number | null;
  percentage_rate: number | null;
};

const ADDON_CODE_BY_DRAFT_ID: Record<string, string> = {
  "ai-trade-translation": "ai-trade-translation",
  "voice-note-translation": "voice-note-translation",
  "document-translation": "document-translation",
  "live-factory-call-translation": "live-factory-call-translation",
  "supplier-background-check": "supplier-background-check",
  "video-factory-tour": "video-factory-tour-coordination",
  "sample-coordination": "sample-coordination",
  "shipping-coordination": "shipping-coordination-support",
  "urgent-processing": "urgent-processing",
};

function cleanText(value: string | undefined) {
  return value?.trim() ?? "";
}

function findLabel<T extends { id: string; label: string }>(
  items: readonly T[],
  id: string,
) {
  return items.find((item) => item.id === id)?.label ?? id;
}

function getProductSummary(draft: StartProjectDraftInput) {
  const details = cleanText(draft.productDetails);

  if (details) {
    return details.slice(0, 220);
  }

  const link = cleanText(draft.productLink);

  if (link) {
    return `Product link: ${link}`.slice(0, 220);
  }

  const inputMethods = getInputMethods(draft);
  return inputMethods.length > 0
    ? `Product details provided through ${inputMethods.join(", ")}.`
    : "Product details pending.";
}

function getInputMethods(draft: StartProjectDraftInput) {
  const methods: string[] = [];

  if (draft.requirementFileCount > 0) {
    methods.push("file_upload");
  }

  if (cleanText(draft.productDetails)) {
    methods.push("details_text");
  }

  if (cleanText(draft.productLink)) {
    methods.push("product_link");
  }

  if (cleanText(draft.voiceNoteFileName)) {
    methods.push("voice_note");
  }

  return methods;
}

function getSelectedAddonCodes(addOnIds: string[]) {
  return addOnIds
    .map((id) => ADDON_CODE_BY_DRAFT_ID[id])
    .filter((code): code is string => Boolean(code));
}

function generateReadableCode(prefix: "CPH" | "LEAD") {
  const year = new Date().getFullYear();
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(10 + Math.random() * 90);

  return `${prefix}-${year}-${timestampPart}${randomPart}`;
}

function validateDraft(draft: StartProjectDraftInput) {
  if (
    !cleanText(draft.productDetails) &&
    !cleanText(draft.productLink) &&
    draft.requirementFileCount === 0 &&
    !cleanText(draft.voiceNoteFileName)
  ) {
    return "Please provide product details, a product link, a product file, or a voice note.";
  }

  if (!draft.budgetId || !draft.packageId || !draft.quantity || !draft.qualityLevelId) {
    return "Please complete product budget, quantity, quality, and package details.";
  }

  if (!draft.experienceId) {
    return "Please select importer experience before submitting.";
  }

  return "";
}

async function requireImporterContext(
  accessToken: string,
): Promise<
  | {
      ok: true;
      context: ImporterContext;
      supabase: ReturnType<typeof createAdminSupabaseClient>;
    }
  | { ok: false; message: string }
> {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, [USER_ROLES.importer])) {
    return {
      ok: false,
      message: "Only an importer account can submit an Import Project.",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("importer_profiles")
    .select("id")
    .eq("user_profile_id", authCheck.profile.profileId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message:
        "Your importer profile could not be found. Please contact ChinaPak support.",
    };
  }

  return {
    ok: true,
    context: {
      authUserId: authCheck.profile.authUserId,
      importerProfileId: data.id,
      profileId: authCheck.profile.profileId,
    },
    supabase,
  };
}

async function getPackageAndAddons(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  draft: StartProjectDraftInput,
): Promise<
  | { ok: true; packageRow: PackageRow; addonRows: AddonRow[] }
  | { ok: false; message: string }
> {
  const { data: packageRow, error: packageError } = await supabase
    .from("packages")
    .select(
      "id, package_code, name, price_pkr, delivery_days_min, delivery_days_max",
    )
    .eq("package_code", draft.packageId)
    .eq("status", "active")
    .maybeSingle();

  if (packageError || !packageRow) {
    return {
      ok: false,
      message:
        "The selected package is not active in Supabase seed data yet. Please ask admin to verify package defaults.",
    };
  }

  const addonCodes = getSelectedAddonCodes(draft.addOnIds);

  if (addonCodes.length === 0) {
    return { ok: true, packageRow, addonRows: [] };
  }

  const { data: addonRows, error: addonError } = await supabase
    .from("addons")
    .select("id, addon_code, name, price_min_pkr, percentage_rate")
    .in("addon_code", addonCodes)
    .eq("status", "active");

  if (addonError) {
    return {
      ok: false,
      message: "Selected add-ons could not be checked in Supabase.",
    };
  }

  return { ok: true, packageRow, addonRows: addonRows ?? [] };
}

function buildDraftMetadata(draft: StartProjectDraftInput) {
  const selectedBudget = findLabel(importProjectFlow.budgets, draft.budgetId);
  const selectedQuality = findLabel(
    importProjectFlow.qualityLevels,
    draft.qualityLevelId,
  );
  const selectedExperience = findLabel(
    importProjectFlow.experienceLevels,
    draft.experienceId,
  );
  const selectedAddOnCodes = getSelectedAddonCodes(draft.addOnIds);
  const hasManualDescription = Boolean(cleanText(draft.productDetails));
  const hasProductUrl = Boolean(cleanText(draft.productLink));
  const hasUploadedFiles = draft.requirementFileCount > 0;
  const hasVoiceNote = Boolean(cleanText(draft.voiceNoteFileName));
  const methodCount = [
    hasManualDescription,
    hasProductUrl,
    hasUploadedFiles,
    hasVoiceNote,
  ].filter(Boolean).length;
  const submissionMethod =
    methodCount > 1
      ? "mixed"
      : hasUploadedFiles
        ? "file_upload"
        : hasVoiceNote
          ? "voice_note"
          : hasProductUrl
            ? "product_url"
            : "manual_details";

  return {
    budget_id: draft.budgetId,
    budget_label: selectedBudget,
    quality_level_id: draft.qualityLevelId,
    quality_level_label: selectedQuality,
    experience_id: draft.experienceId,
    experience_label: selectedExperience,
    selected_addon_ids: draft.addOnIds,
    selected_addon_codes: selectedAddOnCodes,
    has_manual_description: hasManualDescription,
    has_product_url: hasProductUrl,
    has_voice_note: hasVoiceNote,
    uploaded_requirement_file_count: draft.requirementFileCount,
    voice_note_file_name: cleanText(draft.voiceNoteFileName) || null,
    submission_method: submissionMethod,
    source: "importer_start_wizard",
  };
}

export async function submitImportProjectAction(
  accessToken: string,
  draft: StartProjectDraftInput,
): Promise<StartProjectActionResult> {
  const validationMessage = validateDraft(draft);

  if (validationMessage) {
    return { ok: false, message: validationMessage };
  }

  try {
    const importer = await requireImporterContext(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const packageLookup = await getPackageAndAddons(importer.supabase, draft);

    if (!packageLookup.ok) {
      return packageLookup;
    }

    const projectCode = generateReadableCode("CPH");
    const productSummary = getProductSummary(draft);
    const productLinks = cleanText(draft.productLink)
      ? [cleanText(draft.productLink)]
      : [];
    const inputMethods = getInputMethods(draft);
    const metadata = buildDraftMetadata(draft);

    const { data: project, error: projectError } = await importer.supabase
      .from("import_projects")
      .insert({
        project_code: projectCode,
        importer_profile_id: importer.context.importerProfileId,
        importer_user_id: importer.context.authUserId,
        package_id: packageLookup.packageRow.id,
        payment_status: "awaiting_payment",
        project_status: "awaiting_payment",
        admin_review_status: "not_started",
        created_by: importer.context.authUserId,
        metadata: {
          ...metadata,
          payment_gateway_status: "placeholder_not_connected",
          fms_assignment_blocked_until: "payment_and_admin_review",
        },
      })
      .select("id, project_code")
      .single();

    if (projectError || !project) {
      return {
        ok: false,
        message:
          projectError?.message ??
          "The Import Project could not be created in Supabase.",
      };
    }

    const { error: requirementsError } = await importer.supabase
      .from("import_project_requirements")
      .insert({
        project_id: project.id,
        product_name: productSummary.slice(0, 120),
        product_description: cleanText(draft.productDetails) || productSummary,
        product_links: productLinks,
        budget_range: metadata.budget_label,
        quantity: cleanText(draft.quantity),
        quality_level: metadata.quality_level_label,
        import_experience: metadata.experience_label,
        special_notes: cleanText(draft.specialNotes) || null,
        input_methods: inputMethods,
        created_by: importer.context.authUserId,
        metadata,
      });

    if (requirementsError) {
      return {
        ok: false,
        message:
          "The Import Project was created, but its requirements could not be saved. Please contact admin support with the Project ID.",
      };
    }

    if (packageLookup.addonRows.length > 0) {
      const { error: addonsError } = await importer.supabase
        .from("import_project_addons")
        .insert(
          packageLookup.addonRows.map((addon) => ({
            project_id: project.id,
            addon_id: addon.id,
            status: "selected",
            price_snapshot_pkr: addon.price_min_pkr,
            notes:
              addon.percentage_rate !== null
                ? "Percentage add-on selected; final pricing remains payment placeholder."
                : null,
            created_by: importer.context.authUserId,
            metadata: {
              addon_code: addon.addon_code,
              payment_gateway_status: "placeholder_not_connected",
            },
          })),
        );

      if (addonsError) {
        return {
          ok: false,
          message:
            "The Import Project was created, but selected add-ons could not be saved. Please contact admin support with the Project ID.",
        };
      }
    }

    await importer.supabase.from("import_project_status_history").insert({
      project_id: project.id,
      from_status: null,
      to_status: "awaiting_payment",
      reason:
        "Importer submitted project with payment intent. Payment gateway is not connected yet.",
      changed_by: importer.context.authUserId,
      metadata: {
        phase: "phase_3_import_project_persistence",
      },
    });

    await importer.supabase.from("import_project_timeline_events").insert({
      project_id: project.id,
      event_type: "project_submitted",
      title: "Project submitted by importer",
      body: "Payment is still required before admin review and FMS assignment.",
      visible_to_importer: true,
      visible_to_fms: false,
      visible_to_agent: false,
      created_by: importer.context.authUserId,
      metadata: {
        payment_status: "awaiting_payment",
        admin_review_status: "not_started",
      },
    });

    const invoiceResult = await ensureInvoiceForProject(
      importer.supabase,
      project.id,
      importer.context.authUserId,
    );

    if (!invoiceResult.ok) {
      return {
        ok: false,
        message:
          "The Import Project was saved, but its invoice could not be prepared. Please contact admin support with the Project ID.",
      };
    }

    await createNotifications(
      [
        {
          actionUrl: "/importer/dashboard",
          actorProfileId: importer.context.profileId,
          invoiceId: invoiceResult.data.invoice.id,
          projectId: project.id,
          recipientProfileId: importer.context.profileId,
          templateContext: {
            invoiceCode: invoiceResult.data.invoice.invoice_code,
            projectCode: project.project_code,
          },
          type: "project_submitted",
        },
        {
          actionUrl: `/invoices/${invoiceResult.data.invoice.invoice_code}`,
          actorProfileId: importer.context.profileId,
          invoiceId: invoiceResult.data.invoice.id,
          projectId: project.id,
          recipientProfileId: importer.context.profileId,
          templateContext: {
            invoiceCode: invoiceResult.data.invoice.invoice_code,
            projectCode: project.project_code,
          },
          type: "invoice_issued",
        },
        {
          actionUrl: `/admin/projects/${project.project_code}`,
          actorProfileId: importer.context.profileId,
          invoiceId: invoiceResult.data.invoice.id,
          priority: "high",
          projectId: project.id,
          recipientRole: USER_ROLES.admin,
          templateContext: {
            invoiceCode: invoiceResult.data.invoice.invoice_code,
            projectCode: project.project_code,
          },
          type: "new_project_submitted",
        },
      ],
      importer.supabase,
    );

    return {
      ok: true,
      invoiceCode: invoiceResult.data.invoice.invoice_code,
      projectCode: project.project_code,
      message:
        "Import Project saved and invoice prepared. Payment is still required before sourcing can begin.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Supabase project submission is not configured yet.",
    };
  }
}

export async function saveUnpaidLeadAction(
  accessToken: string,
  draft: StartProjectDraftInput,
): Promise<StartProjectActionResult> {
  const validationMessage = validateDraft(draft);

  if (validationMessage) {
    return { ok: false, message: validationMessage };
  }

  if (!draft.selectedLeadReasonId) {
    return {
      ok: false,
      message: "Please select why payment could not be completed.",
    };
  }

  try {
    const importer = await requireImporterContext(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const packageLookup = await getPackageAndAddons(importer.supabase, draft);

    if (!packageLookup.ok) {
      return packageLookup;
    }

    const leadCode = generateReadableCode("LEAD");
    const metadata = buildDraftMetadata(draft);
    const leadReason =
      importProjectFlow.leadReasons.find(
        (reason) => reason.id === draft.selectedLeadReasonId,
      )?.label ?? draft.selectedLeadReasonId;

    const { data: lead, error: leadError } = await importer.supabase
      .from("unpaid_leads")
      .insert({
        lead_code: leadCode,
        importer_profile_id: importer.context.importerProfileId,
        importer_user_id: importer.context.authUserId,
        draft_project_id: null,
        package_id: packageLookup.packageRow.id,
        product_summary: getProductSummary(draft),
        payment_problem_reason: leadReason,
        lead_status: "new_lead",
        follow_up_status: "New Lead",
        created_by: importer.context.authUserId,
        metadata: {
          ...metadata,
          product_link: cleanText(draft.productLink) || null,
          product_details: cleanText(draft.productDetails) || null,
          quantity: cleanText(draft.quantity),
          special_notes: cleanText(draft.specialNotes) || null,
          input_methods: getInputMethods(draft),
          payment_problem_reason_id: draft.selectedLeadReasonId,
          unpaid_lead_rule:
            "Lead is follow-up only and cannot be assigned to an FMS.",
        },
      })
      .select("lead_code")
      .single();

    if (leadError || !lead) {
      return {
        ok: false,
        message:
          leadError?.message ??
          "The unpaid lead could not be saved in Supabase.",
      };
    }

    await createNotification(
      {
        actionUrl: "/admin/leads",
        actorProfileId: importer.context.profileId,
        priority: "high",
        recipientRole: USER_ROLES.admin,
        templateContext: {
          leadCode: lead.lead_code,
        },
        type: "unpaid_lead_created",
      },
      importer.supabase,
    );

    return {
      ok: true,
      leadCode: lead.lead_code,
      message:
        "Unpaid lead saved for admin or local-agent follow-up. No FMS work can begin from this lead.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Supabase unpaid lead saving is not configured yet.",
    };
  }
}
