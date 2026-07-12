"use server";

import { USER_ROLES, hasAllowedRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import {
  calculateFactoryOverallScore,
  factoryReportRecommendationLabels,
  factoryReportRiskLevelLabels,
  factoryReportScoreCategories,
  getFactoryRiskLevelFromScore,
  getFactoryScoreLabel,
  type FactoryReportRecommendationStatus,
  type FactoryReportRiskLevel,
  type FactoryReportScoreBreakdown,
} from "@/config/factory-report-quality";
import { createNotification } from "@/lib/notifications/create-notification";
import { detectContactRiskInFields } from "@/lib/security/contact-firewall";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

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

export type ImporterReportOption = {
  cityProvince: string;
  currency: string;
  customizationAvailability: string;
  estimatedUnitPrice: string;
  evidenceSummary: string;
  factoryLabel: string;
  mainProducts: string;
  moq: string;
  overallScore: number;
  overallScoreLabel: string;
  packagingNotes: string;
  productCategory: string;
  productMatchSummary: string;
  productionLeadTime: string;
  qualityReliabilitySummary: string;
  recommended: boolean;
  recommendationStatus: FactoryReportRecommendationStatus;
  recommendationStatusLabel: string;
  riskLevel: FactoryReportRiskLevel;
  riskLevelLabel: string;
  riskSummary: string;
  sampleAvailability: string;
  scoreBreakdown: FactoryReportScoreBreakdown;
  visibleFields: string[];
};

export type ImporterFactoryReport = {
  adminRecommendation: string;
  comparisonNotes: string;
  importerSafeSummary: string;
  options: ImporterReportOption[];
  releasedAt: string;
  status: "released_to_importer" | "updated";
  statusLabel: string;
  version: number;
};

export type ImporterReportListItem = {
  optionCount: number;
  packageName: string;
  projectCode: string;
  projectStatus: string;
  releaseDate: string;
  reportStatus: string;
};

export type ImporterReportDetail = ImporterReportListItem & {
  report: ImporterFactoryReport;
  nextSteps: string[];
  trustNotice: string;
};

export type ReportFeedbackType =
  Database["public"]["Tables"]["report_feedback"]["Row"]["feedback_type"];
export type ReportFeedbackStatus =
  Database["public"]["Tables"]["report_feedback"]["Row"]["status"];
export type ReportFeedbackUrgency =
  Database["public"]["Tables"]["report_feedback"]["Row"]["urgency_level"];

export type SubmitReportFeedbackInput = {
  feedbackType: ReportFeedbackType;
  message: string;
  selectedOptionLabel?: string;
  urgencyLevel: ReportFeedbackUrgency;
};

export type ImporterReportFeedbackResponse = {
  createdAt: string;
  message: string;
  responseType: string;
};

export type ImporterReportFeedbackItem = {
  adminResponse: string;
  adminRespondedAt: string;
  createdAt: string;
  feedbackCode: string;
  feedbackType: string;
  id: string;
  message: string;
  responses: ImporterReportFeedbackResponse[];
  selectedOptionLabel: string;
  status: string;
  urgencyLevel: string;
};

const PROJECT_STATUS_LABELS: Record<
  Database["public"]["Enums"]["project_status"],
  string
> = {
  admin_quality_review: "Admin review",
  admin_review: "Admin review",
  awaiting_payment: "Awaiting payment",
  cancelled: "Cancelled",
  completed: "Completed",
  disputed: "Disputed",
  draft: "Draft",
  factory_options_submitted: "Factory options submitted",
  fms_assigned: "FMS assigned",
  fms_working: "FMS working",
  importer_feedback_requested: "Importer feedback requested",
  needs_importer_clarification: "Needs information",
  partially_refunded: "Partially refunded",
  payment_received: "Payment received",
  ready_for_fms_assignment: "Ready for FMS assignment",
  refunded: "Refunded",
  results_released_to_importer: "Factory report ready",
};

const REPORT_STATUS_LABELS = {
  released_to_importer: "Released to importer",
  updated: "Updated",
} as const;

const FEEDBACK_TYPE_LABELS: Record<ReportFeedbackType, string> = {
  not_satisfied: "Not satisfied",
  other: "Other",
  question_about_option: "Question about option",
  ready_for_next_step: "Ready for next step",
  request_better_price: "Request better price",
  request_more_factories: "Request more factories",
  request_sample_guidance: "Request sample guidance",
  request_shipping_guidance: "Request shipping guidance",
};

const FEEDBACK_STATUS_LABELS: Record<ReportFeedbackStatus, string> = {
  answered: "Answered",
  closed: "Closed",
  in_review: "In review",
  new: "New",
  rejected_or_not_applicable: "Not applicable",
  routed_to_fms: "Admin checking with sourcing team",
};

const URGENCY_LABELS: Record<ReportFeedbackUrgency, string> = {
  low: "Low",
  normal: "Normal",
  urgent: "Urgent",
};

const SAFE_FIELDS = [
  "cityProvince",
  "productCategory",
  "mainProducts",
  "productMatchSummary",
  "estimatedUnitPrice",
  "moq",
  "sampleAvailability",
  "productionLeadTime",
  "packagingNotes",
  "customizationAvailability",
  "qualityReliabilitySummary",
  "riskSummary",
] as const;

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(value: Json | null | undefined, fallback = 1) {
  return typeof value === "number" ? value : fallback;
}

function readStringArray(value: Json | null | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseScoreBreakdown(
  value: Json | null | undefined,
): FactoryReportScoreBreakdown {
  const object = toJsonObject(value);

  return factoryReportScoreCategories.reduce((breakdown, category) => {
    breakdown[category.key] = readNumber(object[category.key], 65);
    return breakdown;
  }, {} as FactoryReportScoreBreakdown);
}

function normalizeVisibleFields(value: string[]) {
  const allowed = new Set<string>(SAFE_FIELDS);
  const selected = value.filter((field) => allowed.has(field));

  return selected.length > 0 ? selected : [...SAFE_FIELDS];
}

function trimOptional(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : "";
}

function generateFeedbackCode() {
  const year = new Date().getFullYear();
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(10 + Math.random() * 90);

  return `RFB-${year}-${timestampPart}${randomPart}`;
}

function hasFactoryContactReleaseRequest(message: string) {
  return /\b(?:give|send|share|provide|show|need|want|get)\b.{0,40}\b(?:factory\s+)?(?:phone|number|email|wechat|whatsapp|contact|direct contact|address)\b/i.test(
    message,
  );
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

function parseReleasedReport(
  project: TableRow<"import_projects">,
): ImporterFactoryReport | null {
  const metadata = toJsonObject(project.metadata);
  const report = toJsonObject(metadata.phase_7_factory_report);
  const status = readString(report.status);

  if (status !== "released_to_importer" && status !== "updated") {
    return null;
  }

  const optionsValue = Array.isArray(report.options) ? report.options : [];
  const options = optionsValue
    .map((option): ImporterReportOption | null => {
      const optionData = toJsonObject(option);
      const factoryLabel = readString(optionData.factoryLabel);

      if (!factoryLabel) {
        return null;
      }

      const scoreBreakdown = parseScoreBreakdown(optionData.scoreBreakdown);
      const calculatedScore = calculateFactoryOverallScore(scoreBreakdown);
      const overallScore = readNumber(
        optionData.overallScore,
        calculatedScore,
      );
      const riskLevelValue = readString(optionData.riskLevel);
      const riskLevel: FactoryReportRiskLevel =
        riskLevelValue === "low" ||
        riskLevelValue === "medium" ||
        riskLevelValue === "high" ||
        riskLevelValue === "needs_review"
          ? riskLevelValue
          : getFactoryRiskLevelFromScore(overallScore);
      const recommendationStatusValue = readString(
        optionData.recommendationStatus,
      );
      const recommendationStatus: FactoryReportRecommendationStatus =
        recommendationStatusValue === "recommended" ||
        recommendationStatusValue === "backup_option" ||
        recommendationStatusValue === "needs_clarification" ||
        recommendationStatusValue === "not_recommended"
          ? recommendationStatusValue
          : optionData.recommended === true
            ? "recommended"
            : "backup_option";

      return {
        cityProvince: readString(optionData.cityProvince, "Not provided"),
        currency: readString(optionData.currency, "USD"),
        customizationAvailability: readString(
          optionData.customizationAvailability,
          "Not provided",
        ),
        estimatedUnitPrice: readString(
          optionData.estimatedUnitPrice,
          "Not provided",
        ),
        evidenceSummary: readString(
          optionData.evidenceSummary,
          "Evidence reviewed by ChinaPak Admin.",
        ),
        factoryLabel,
        mainProducts: readString(optionData.mainProducts, "Not provided"),
        moq: readString(optionData.moq, "Not provided"),
        overallScore,
        overallScoreLabel: readString(
          optionData.overallScoreLabel,
          getFactoryScoreLabel(overallScore),
        ),
        packagingNotes: readString(optionData.packagingNotes, "Not provided"),
        productCategory: readString(optionData.productCategory, "Not provided"),
        productMatchSummary: readString(
          optionData.productMatchSummary,
          "No product match summary provided.",
        ),
        productionLeadTime: readString(
          optionData.productionLeadTime,
          "Not provided",
        ),
        qualityReliabilitySummary: readString(
          optionData.qualityReliabilitySummary,
          "Admin-reviewed reliability summary pending.",
        ),
        recommended: optionData.recommended === true,
        recommendationStatus,
        recommendationStatusLabel: readString(
          optionData.recommendationStatusLabel,
          factoryReportRecommendationLabels[recommendationStatus],
        ),
        riskLevel,
        riskLevelLabel: readString(
          optionData.riskLevelLabel,
          factoryReportRiskLevelLabels[riskLevel],
        ),
        riskSummary: readString(
          optionData.riskSummary,
          "No risk notes were released.",
        ),
        sampleAvailability: readString(
          optionData.sampleAvailability,
          "Not provided",
        ),
        scoreBreakdown,
        visibleFields: normalizeVisibleFields(
          readStringArray(optionData.visibleFields),
        ),
      };
    })
    .filter((option): option is ImporterReportOption => Boolean(option));

  return {
    adminRecommendation: readString(report.adminRecommendation),
    comparisonNotes: readString(report.comparisonNotes),
    importerSafeSummary: readString(report.importerSafeSummary),
    options,
    releasedAt: readString(report.releasedAt, project.updated_at),
    status,
    statusLabel: REPORT_STATUS_LABELS[status],
    version: readNumber(report.version, 1),
  };
}

async function requireImporter(accessToken: string) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  if (!hasAllowedRole(authCheck.profile.roles, [USER_ROLES.importer])) {
    return {
      ok: false as const,
      message: "Only importer accounts can view importer factory reports.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
  };
}

function mapListItem(
  project: TableRow<"import_projects">,
  report: ImporterFactoryReport,
  packageRow: TableRow<"packages"> | undefined,
): ImporterReportListItem {
  return {
    optionCount: report.options.length,
    packageName: packageRow?.name ?? "Package pending",
    projectCode: project.project_code,
    projectStatus: PROJECT_STATUS_LABELS[project.project_status],
    releaseDate: formatDate(report.releasedAt),
    reportStatus: report.statusLabel,
  };
}

function mapFeedbackItem(
  feedback: TableRow<"report_feedback">,
  responses: TableRow<"report_feedback_responses">[],
): ImporterReportFeedbackItem {
  return {
    adminResponse: feedback.admin_response ?? "",
    adminRespondedAt: formatDate(feedback.admin_responded_at),
    createdAt: formatDate(feedback.created_at),
    feedbackCode: feedback.feedback_code,
    feedbackType: FEEDBACK_TYPE_LABELS[feedback.feedback_type],
    id: feedback.id,
    message: feedback.message,
    responses: responses.map((response) => ({
      createdAt: formatDate(response.created_at),
      message: response.message,
      responseType: response.response_type,
    })),
    selectedOptionLabel: feedback.selected_option_label ?? "General report",
    status: FEEDBACK_STATUS_LABELS[feedback.status],
    urgencyLevel: URGENCY_LABELS[feedback.urgency_level],
  };
}

export async function listImporterFactoryReportsAction(
  accessToken: string,
): Promise<ActionResult<ImporterReportListItem[]>> {
  try {
    const importer = await requireImporter(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const supabase = createAdminSupabaseClient();
    const { data: projects, error: projectsError } = await supabase
      .from("import_projects")
      .select("*")
      .eq("importer_user_id", importer.authUserId)
      .order("updated_at", { ascending: false });

    if (projectsError) {
      return { ok: false, message: projectsError.message };
    }

    const releasedReports = (projects ?? [])
      .map((project) => ({
        project,
        report: parseReleasedReport(project),
      }))
      .filter(
        (
          item,
        ): item is {
          project: TableRow<"import_projects">;
          report: ImporterFactoryReport;
        } => Boolean(item.report),
      );
    const packageIds = Array.from(
      new Set(
        releasedReports
          .map(({ project }) => project.package_id)
          .filter((packageId): packageId is string => Boolean(packageId)),
      ),
    );
    const { data: packageRows } =
      packageIds.length > 0
        ? await supabase.from("packages").select("*").in("id", packageIds)
        : { data: [] };
    const packageMap = new Map(
      (packageRows ?? []).map((packageRow) => [packageRow.id, packageRow]),
    );

    return {
      ok: true,
      data: releasedReports.map(({ project, report }) =>
        mapListItem(
          project,
          report,
          project.package_id ? packageMap.get(project.package_id) : undefined,
        ),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Importer factory reports are not configured yet.",
    };
  }
}

export async function getImporterFactoryReportAction(
  accessToken: string,
  projectCode: string,
): Promise<ActionResult<ImporterReportDetail>> {
  try {
    const importer = await requireImporter(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const supabase = createAdminSupabaseClient();
    const { data: project, error: projectError } = await supabase
      .from("import_projects")
      .select("*")
      .eq("project_code", decodeURIComponent(projectCode))
      .eq("importer_user_id", importer.authUserId)
      .maybeSingle();

    if (projectError) {
      return { ok: false, message: projectError.message };
    }

    if (!project) {
      return {
        ok: false,
        message: "This factory report was not found for your account.",
      };
    }

    const report = parseReleasedReport(project);

    if (!report) {
      return {
        ok: false,
        message:
          "This project does not have an admin-released factory report yet.",
      };
    }

    const { data: packageRow } = project.package_id
      ? await supabase
          .from("packages")
          .select("*")
          .eq("id", project.package_id)
          .maybeSingle()
      : { data: null };
    const listItem = mapListItem(project, report, packageRow ?? undefined);

    return {
      ok: true,
      data: {
        ...listItem,
        nextSteps: [
          "Review the approved factory options inside your account.",
          "Compare price, MOQ, production time, and admin recommendation.",
          "Ask ChinaPak ImportHub team for clarification through platform support.",
          "Factory contact details are not released at this stage.",
        ],
        report,
        trustNotice:
          "یہ report ChinaPak ImportHub admin review کے بعد release کی گئی ہے۔ Factory contact details، FMS private notes، phone، email، WeChat، WhatsApp یا payment details اس stage پر share نہیں کی جاتیں۔",
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Importer factory report detail is not configured yet.",
    };
  }
}

export async function listImporterReportFeedbackAction(
  accessToken: string,
  projectCode: string,
): Promise<ActionResult<ImporterReportFeedbackItem[]>> {
  try {
    const importer = await requireImporter(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const supabase = createAdminSupabaseClient();
    const { data: project, error: projectError } = await supabase
      .from("import_projects")
      .select("*")
      .eq("project_code", decodeURIComponent(projectCode))
      .eq("importer_user_id", importer.authUserId)
      .maybeSingle();

    if (projectError) {
      return { ok: false, message: projectError.message };
    }

    if (!project || !parseReleasedReport(project)) {
      return {
        ok: false,
        message: "Feedback is available only after admin releases your report.",
      };
    }

    const { data: feedbackRows, error: feedbackError } = await supabase
      .from("report_feedback")
      .select("*")
      .eq("project_id", project.id)
      .eq("importer_user_id", importer.authUserId)
      .order("created_at", { ascending: false });

    if (feedbackError) {
      return { ok: false, message: feedbackError.message };
    }

    const feedbackIds = (feedbackRows ?? []).map((feedback) => feedback.id);
    const { data: responseRows } =
      feedbackIds.length > 0
        ? await supabase
            .from("report_feedback_responses")
            .select("*")
            .in("feedback_id", feedbackIds)
            .eq("visible_to_importer", true)
            .order("created_at", { ascending: true })
        : { data: [] };
    const responsesByFeedback = new Map<
      string,
      TableRow<"report_feedback_responses">[]
    >();

    (responseRows ?? []).forEach((response) => {
      const existing = responsesByFeedback.get(response.feedback_id) ?? [];
      responsesByFeedback.set(response.feedback_id, [...existing, response]);
    });

    return {
      ok: true,
      data: (feedbackRows ?? []).map((feedback) =>
        mapFeedbackItem(
          feedback,
          responsesByFeedback.get(feedback.id) ?? [],
        ),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Importer report feedback could not be loaded.",
    };
  }
}

export async function submitImporterReportFeedbackAction(
  accessToken: string,
  projectCode: string,
  input: SubmitReportFeedbackInput,
): Promise<ActionResult<ImporterReportFeedbackItem[]>> {
  try {
    const importer = await requireImporter(accessToken);

    if (!importer.ok) {
      return importer;
    }

    const message = trimOptional(input.message);

    if (message.length < 10) {
      return {
        ok: false,
        message: "Please write a short question or feedback message first.",
      };
    }

    if (hasFactoryContactReleaseRequest(message)) {
      return {
        ok: false,
        message:
          "Factory direct contact release is not available at this stage. Please ask your question without requesting phone, email, WeChat, WhatsApp, address, or direct contact details.",
      };
    }

    const selectedOptionLabel = trimOptional(input.selectedOptionLabel);
    const firewall = detectContactRiskInFields([
      { label: "Feedback message", value: message },
      { label: "Selected option reference", value: selectedOptionLabel },
    ]);

    if (firewall.flags.length > 0) {
      return {
        ok: false,
        message: `Please remove contact/payment details before sending feedback: ${firewall.messages.join(" ")}`,
      };
    }

    const supabase = createAdminSupabaseClient();
    const { data: project, error: projectError } = await supabase
      .from("import_projects")
      .select("*")
      .eq("project_code", decodeURIComponent(projectCode))
      .eq("importer_user_id", importer.authUserId)
      .maybeSingle();

    if (projectError) {
      return { ok: false, message: projectError.message };
    }

    if (!project) {
      return {
        ok: false,
        message: "This factory report was not found for your account.",
      };
    }

    const report = parseReleasedReport(project);

    if (!report) {
      return {
        ok: false,
        message:
          "Feedback can be submitted only after admin releases your sanitized factory report.",
      };
    }

    if (
      selectedOptionLabel &&
      !report.options.some((option) => option.factoryLabel === selectedOptionLabel)
    ) {
      return {
        ok: false,
        message: "Please select a factory option from the released report.",
      };
    }

    const now = new Date().toISOString();
    const feedbackCode = generateFeedbackCode();
    const { error: insertError } = await supabase.from("report_feedback").insert({
      contact_firewall_flags: firewall.flags,
      created_by: importer.authUserId,
      feedback_code: feedbackCode,
      feedback_type: input.feedbackType,
      importer_profile_id: project.importer_profile_id,
      importer_user_id: importer.authUserId,
      message,
      metadata: {
        contact_firewall_checked_at: now,
        phase: "phase_8_importer_feedback_admin_clarifications",
        report_option_count: report.options.length,
      },
      project_id: project.id,
      report_status_snapshot: report.status,
      report_version: report.version,
      selected_option_label: selectedOptionLabel || null,
      status: "new",
      urgency_level: input.urgencyLevel,
    });

    if (insertError) {
      return { ok: false, message: insertError.message };
    }

    const writes: PromiseLike<{ error: { message: string } | null }>[] = [
      supabase.from("import_project_timeline_events").insert({
        body: "Importer submitted feedback or a clarification request about the released factory report. Admin must review before any routing.",
        created_by: importer.authUserId,
        event_type: "report_feedback_submitted",
        metadata: {
          feedback_code: feedbackCode,
          feedback_type: input.feedbackType,
          phase: "phase_8_importer_feedback_admin_clarifications",
        },
        project_id: project.id,
        title: "Importer submitted report feedback",
        visible_to_agent: false,
        visible_to_fms: false,
        visible_to_importer: true,
      }),
    ];

    if (project.project_status !== "importer_feedback_requested") {
      writes.push(
        supabase
          .from("import_projects")
          .update({
            project_status: "importer_feedback_requested",
            updated_by: importer.authUserId,
          })
          .eq("id", project.id),
        supabase.from("import_project_status_history").insert({
          changed_by: importer.authUserId,
          from_status: project.project_status,
          metadata: {
            feedback_code: feedbackCode,
            phase: "phase_8_importer_feedback_admin_clarifications",
          },
          project_id: project.id,
          reason: "Importer submitted report feedback",
          to_status: "importer_feedback_requested",
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
        actionUrl: "/admin/report-feedback",
        actorProfileId: importer.profileId,
        priority: input.urgencyLevel === "urgent" ? "urgent" : "normal",
        projectId: project.id,
        recipientRole: USER_ROLES.admin,
        templateContext: {
          projectCode: project.project_code,
        },
        type: "importer_report_feedback_received",
      },
      supabase,
    );

    return listImporterReportFeedbackAction(accessToken, project.project_code);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Importer report feedback could not be submitted.",
    };
  }
}
