export type FactoryReportScoreCategoryKey =
  | "productMatch"
  | "priceCompetitiveness"
  | "moqSuitability"
  | "leadTimeSuitability"
  | "evidenceQuality"
  | "supplierClarity"
  | "riskLevel";

export type FactoryReportScoreBreakdown = Record<
  FactoryReportScoreCategoryKey,
  number
>;

export type FactoryReportRecommendationStatus =
  | "recommended"
  | "backup_option"
  | "needs_clarification"
  | "not_recommended";

export type FactoryReportRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "needs_review";

export type FactoryReportReadinessStatus =
  | "not_ready"
  | "needs_admin_review"
  | "ready_to_release";

export type FactoryReportReadinessItem = {
  checked: boolean;
  key: string;
  label: string;
  severity: "required" | "recommended";
};

export type FactoryReportReadiness = {
  items: FactoryReportReadinessItem[];
  missingItems: string[];
  status: FactoryReportReadinessStatus;
  statusLabel: string;
};

export type FactoryReportReadinessOption = {
  estimatedUnitPrice?: string;
  evidenceSummary?: string;
  moq?: string;
  productionLeadTime?: string;
  qualityReliabilitySummary?: string;
  recommended?: boolean;
  riskSummary?: string;
};

export const factoryReportScoreCategories: Array<{
  key: FactoryReportScoreCategoryKey;
  label: string;
}> = [
  { key: "productMatch", label: "Product match" },
  { key: "priceCompetitiveness", label: "Price competitiveness" },
  { key: "moqSuitability", label: "MOQ suitability" },
  { key: "leadTimeSuitability", label: "Lead time suitability" },
  { key: "evidenceQuality", label: "Evidence quality" },
  { key: "supplierClarity", label: "Supplier clarity" },
  { key: "riskLevel", label: "Risk review" },
];

export const factoryReportRecommendationLabels: Record<
  FactoryReportRecommendationStatus,
  string
> = {
  backup_option: "Backup option",
  needs_clarification: "Needs clarification",
  not_recommended: "Not recommended",
  recommended: "Recommended",
};

export const factoryReportRiskLevelLabels: Record<
  FactoryReportRiskLevel,
  string
> = {
  high: "High",
  low: "Low",
  medium: "Medium",
  needs_review: "Needs review",
};

export const factoryReportReadinessLabels: Record<
  FactoryReportReadinessStatus,
  string
> = {
  needs_admin_review: "Needs Admin review",
  not_ready: "Not ready",
  ready_to_release: "Ready to release",
};

export function clampFactoryReportScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateFactoryOverallScore(
  breakdown: FactoryReportScoreBreakdown,
) {
  const total = factoryReportScoreCategories.reduce(
    (sum, category) => sum + clampFactoryReportScore(breakdown[category.key]),
    0,
  );

  return clampFactoryReportScore(total / factoryReportScoreCategories.length);
}

export function getFactoryScoreLabel(score: number) {
  const normalized = clampFactoryReportScore(score);

  if (normalized >= 85) {
    return "Strong option";
  }

  if (normalized >= 70) {
    return "Good option";
  }

  if (normalized >= 50) {
    return "Needs clarification";
  }

  return "High risk / not recommended";
}

export function getFactoryRiskLevelFromScore(
  score: number,
): FactoryReportRiskLevel {
  const normalized = clampFactoryReportScore(score);

  if (normalized >= 80) {
    return "low";
  }

  if (normalized >= 65) {
    return "medium";
  }

  if (normalized >= 45) {
    return "needs_review";
  }

  return "high";
}

export function getFactoryRecommendationStatus(input: {
  hasCriticalGaps: boolean;
  overallScore: number;
  recommended: boolean;
  riskLevel: FactoryReportRiskLevel;
}): FactoryReportRecommendationStatus {
  if (input.recommended) {
    return "recommended";
  }

  if (input.riskLevel === "high" || input.overallScore < 50) {
    return "not_recommended";
  }

  if (input.hasCriticalGaps || input.riskLevel === "needs_review") {
    return "needs_clarification";
  }

  return "backup_option";
}

function hasMeaningfulValue(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();

  return Boolean(
    normalized &&
      normalized !== "not provided" &&
      normalized !== "not set" &&
      normalized !== "pending" &&
      !normalized.includes("pending.") &&
      !normalized.includes("not provided"),
  );
}

export function buildFactoryReportReadiness(input: {
  adminRecommendation: string;
  importerSafeSummary: string;
  options: FactoryReportReadinessOption[];
}): FactoryReportReadiness {
  const options = input.options;
  const hasOptions = options.length > 0;
  const hasRecommendedOption = options.some((option) => option.recommended);

  const items: FactoryReportReadinessItem[] = [
    {
      checked: hasOptions,
      key: "reviewed_options",
      label: "At least one factory/supplier option reviewed",
      severity: "required",
    },
    {
      checked:
        hasOptions &&
        options.every((option) => hasMeaningfulValue(option.estimatedUnitPrice)),
      key: "price_or_reason",
      label: "Price or quote information present, or reason marked unavailable",
      severity: "recommended",
    },
    {
      checked: hasOptions && options.every((option) => hasMeaningfulValue(option.moq)),
      key: "moq_or_reason",
      label: "MOQ information present, or reason marked unavailable",
      severity: "recommended",
    },
    {
      checked:
        hasOptions &&
        options.every((option) => hasMeaningfulValue(option.productionLeadTime)),
      key: "lead_time_or_reason",
      label: "Lead time information present, or reason marked unavailable",
      severity: "recommended",
    },
    {
      checked:
        hasOptions &&
        options.some(
          (option) =>
            hasMeaningfulValue(option.evidenceSummary) ||
            hasMeaningfulValue(option.qualityReliabilitySummary),
        ),
      key: "evidence_reviewed",
      label: "Evidence/photos/docs reviewed",
      severity: "recommended",
    },
    {
      checked:
        hasOptions &&
        options.some((option) => hasMeaningfulValue(option.riskSummary)),
      key: "risk_reviewed",
      label: "Risk notes reviewed",
      severity: "recommended",
    },
    {
      checked: input.importerSafeSummary.trim().length >= 20,
      key: "importer_safe_summary",
      label: "Importer-safe summary completed",
      severity: "required",
    },
    {
      checked: true,
      key: "admin_notes_excluded",
      label: "Admin-only notes excluded from importer report",
      severity: "required",
    },
    {
      checked: hasRecommendedOption || input.adminRecommendation.trim().length >= 20,
      key: "recommendation",
      label: "Recommended option selected or no-recommendation explanation written",
      severity: "recommended",
    },
  ];

  const requiredMissing = items.filter(
    (item) => item.severity === "required" && !item.checked,
  );
  const missingItems = items
    .filter((item) => !item.checked)
    .map((item) => item.label);
  const status: FactoryReportReadinessStatus =
    requiredMissing.length > 0
      ? "not_ready"
      : missingItems.length > 0
        ? "needs_admin_review"
        : "ready_to_release";

  return {
    items,
    missingItems,
    status,
    statusLabel: factoryReportReadinessLabels[status],
  };
}
