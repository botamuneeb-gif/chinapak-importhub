"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { uploadImporterProjectFileAction } from "@/app/files/actions";
import {
  saveUnpaidLeadAction,
  submitImportProjectAction,
  type ImporterConversionAttribution,
  type StartProjectDraftInput,
} from "@/app/importer/start/actions";
import { AddOnCard } from "@/components/importer/add-on-card";
import { FlowIcon } from "@/components/importer/flow-icon";
import { OptionCard } from "@/components/importer/option-card";
import { PackageCard } from "@/components/importer/package-card";
import { SummaryCard } from "@/components/importer/summary-card";
import { WizardStep } from "@/components/importer/wizard-step";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import { importProjectFlow } from "@/config/import-project";
import { launchFlags } from "@/config/launch-flags";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type FinalStatus = "idle" | "project-created" | "lead-saved";

const initialDraft: StartProjectDraftInput = {
  addOnIds: [],
  budgetId: "",
  customizationNeeds: "",
  destinationCityPakistan: "",
  experienceId: "",
  packageId: "factory-match-plus",
  preferredChinaRegion: "",
  productCategory: "",
  productDetails: "",
  productLink: "",
  qualityConcerns: "",
  quantity: "",
  qualityLevelId: "",
  requirementFileCount: 0,
  selectedLeadReasonId: "",
  specialNotes: "",
  targetBudget: "",
  voiceNoteFileName: "",
};

const stepTitles = [
  "Product Details",
  "Budget Readiness",
  "Quantity and Destination",
  "Supplier Preferences",
  "Package Selection",
  "Add-ons",
  "Review Summary",
  "Payment Readiness",
];

function MethodCard({
  body,
  children,
  icon,
  isActive,
  title,
}: {
  body: string;
  children: ReactNode;
  icon: "photo" | "text" | "link" | "mic";
  isActive: boolean;
  title: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-4 shadow-sm",
        isActive
          ? "border-brand-emerald ring-2 ring-brand-emerald/20"
          : "border-slate-200",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            isActive
              ? "bg-brand-emerald text-white"
              : "bg-brand-background text-brand-navy",
          )}
        >
          <FlowIcon name={icon} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold leading-8 text-brand-navy">{title}</h2>
          <p className="mt-1 text-sm leading-8 text-brand-muted">{body}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

const PRODUCT_FILE_LIMIT = 5;
const PRODUCT_FILE_MAX_BYTES = 10 * 1024 * 1024;
const VOICE_NOTE_MAX_BYTES = 20 * 1024 * 1024;

const PRODUCT_FILE_TYPES = new Set([
  "application/msword",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const PRODUCT_FILE_EXTENSIONS = new Set([
  "doc",
  "docx",
  "jpeg",
  "jpg",
  "pdf",
  "png",
  "webp",
]);

const VOICE_NOTE_TYPES = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
  "audio/x-wav",
]);

const VOICE_NOTE_EXTENSIONS = new Set(["m4a", "mp3", "ogg", "wav", "webm"]);

function fieldClasses() {
  return "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text shadow-sm focus:border-brand-emerald focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 disabled:bg-slate-50";
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isAllowedFile(
  file: File,
  allowedTypes: Set<string>,
  allowedExtensions: Set<string>,
) {
  return allowedTypes.has(file.type) || allowedExtensions.has(getExtension(file.name));
}

function isSupportedPackageId(value: string | null) {
  return Boolean(
    value && importProjectFlow.packages.some((plan) => plan.id === value),
  );
}

function captureAttribution(): ImporterConversionAttribution {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const sourcePage =
    params.get("source_page") || params.get("sourcePage") || window.location.pathname;

  return {
    landingPage: sourcePage,
    referrer: document.referrer || "",
    selectedPackage: params.get("package") || "",
    sourcePageSlug: sourcePage,
    submittedFromUrl: window.location.href,
    utmCampaign: params.get("utm_campaign") || "",
    utmContent: params.get("utm_content") || "",
    utmMedium: params.get("utm_medium") || "",
    utmSource: params.get("utm_source") || "",
  };
}

export function StartProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<StartProjectDraftInput>(initialDraft);
  const [validationMessage, setValidationMessage] = useState("");
  const [leadReasonVisible, setLeadReasonVisible] = useState(false);
  const [finalStatus, setFinalStatus] = useState<FinalStatus>("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [createdProjectCode, setCreatedProjectCode] = useState("");
  const [createdInvoiceCode, setCreatedInvoiceCode] = useState("");
  const [createdLeadCode, setCreatedLeadCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentReadinessConfirmed, setPaymentReadinessConfirmed] =
    useState(false);
  const [requirementFiles, setRequirementFiles] = useState<File[]>([]);
  const [voiceNoteFile, setVoiceNoteFile] = useState<File | null>(null);
  const [uploadWarning, setUploadWarning] = useState("");

  const selectedBudget = importProjectFlow.budgets.find(
    (budget) => budget.id === draft.budgetId,
  );
  const selectedQuality = importProjectFlow.qualityLevels.find(
    (quality) => quality.id === draft.qualityLevelId,
  );
  const selectedExperience = importProjectFlow.experienceLevels.find(
    (experience) => experience.id === draft.experienceId,
  );
  const selectedPackage =
    importProjectFlow.packages.find((plan) => plan.id === draft.packageId) ??
    importProjectFlow.packages[1];
  const selectedAddOns = useMemo(
    () =>
      importProjectFlow.addOns.filter((addOn) =>
        draft.addOnIds.includes(addOn.id),
      ),
    [draft.addOnIds],
  );

  const progressPercent = Math.round(
    (currentStep / importProjectFlow.totalSteps) * 100,
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const packageParam = params.get("package");
    const attribution = captureAttribution();

    setDraft((previous) => {
      const nextPackageId = isSupportedPackageId(packageParam)
        ? packageParam ?? previous.packageId
        : previous.packageId;

      return {
        ...previous,
        attribution: {
          ...attribution,
          selectedPackage: nextPackageId,
        },
        packageId: nextPackageId,
      };
    });
  }, []);

  function updateDraft(partial: Partial<StartProjectDraftInput>) {
    setDraft((previous) => ({ ...previous, ...partial }));
    setValidationMessage("");
    setSubmissionError("");
  }

  function validateStep(step: number) {
    if (
      step === 1 &&
      !draft.productDetails.trim() &&
      !draft.productLink.trim() &&
      requirementFiles.length === 0 &&
      !voiceNoteFile
    ) {
      return "کم از کم product details یا product link درج کریں۔";
    }

    if (step === 2 && !draft.budgetId) {
      return "براہ کرم import budget منتخب کریں۔";
    }

    if (step === 3 && !draft.quantity.trim()) {
      return "Approximate quantity لکھیں۔";
    }

    if (step === 3 && !draft.qualityLevelId) {
      return "Preferred quality level منتخب کریں۔";
    }

    if (step === 4 && !draft.experienceId) {
      return "Import experience منتخب کریں۔";
    }

    if (step === 5 && !draft.packageId) {
      return "Package منتخب کریں۔";
    }

    return "";
  }

  function goNext() {
    const message = validateStep(currentStep);

    if (message) {
      setValidationMessage(message);
      return;
    }

    setValidationMessage("");
    setCurrentStep((step) =>
      Math.min(step + 1, importProjectFlow.totalSteps),
    );
  }

  function goBack() {
    setValidationMessage("");
    setSubmissionError("");
    setFinalStatus("idle");
    setLeadReasonVisible(false);
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  function toggleAddOn(addOnId: string) {
    updateDraft({
      addOnIds: draft.addOnIds.includes(addOnId)
        ? draft.addOnIds.filter((id) => id !== addOnId)
        : [...draft.addOnIds, addOnId],
    });
  }

  function handleRequirementFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    const nextFiles = [...requirementFiles, ...selectedFiles];

    if (nextFiles.length > PRODUCT_FILE_LIMIT) {
      setValidationMessage(
        `You can upload up to ${PRODUCT_FILE_LIMIT} product photos, screenshots, or catalog files.`,
      );
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !isAllowedFile(file, PRODUCT_FILE_TYPES, PRODUCT_FILE_EXTENSIONS) ||
        file.size > PRODUCT_FILE_MAX_BYTES,
    );

    if (invalidFile) {
      setValidationMessage(
        `${invalidFile.name} is not allowed or is larger than ${formatBytes(
          PRODUCT_FILE_MAX_BYTES,
        )}. Use JPG, PNG, WebP, PDF, DOC, or DOCX files.`,
      );
      return;
    }

    setRequirementFiles(nextFiles);
    updateDraft({ requirementFileCount: nextFiles.length });
  }

  function removeRequirementFile(index: number) {
    const nextFiles = requirementFiles.filter((_, fileIndex) => fileIndex !== index);
    setRequirementFiles(nextFiles);
    updateDraft({ requirementFileCount: nextFiles.length });
  }

  function handleVoiceNote(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (
      !isAllowedFile(selectedFile, VOICE_NOTE_TYPES, VOICE_NOTE_EXTENSIONS) ||
      selectedFile.size > VOICE_NOTE_MAX_BYTES
    ) {
      setValidationMessage(
        `${selectedFile.name} is not a supported voice note or is larger than ${formatBytes(
          VOICE_NOTE_MAX_BYTES,
        )}. Use MP3, M4A, WAV, WebM, or OGG.`,
      );
      return;
    }

    setVoiceNoteFile(selectedFile);
    updateDraft({ voiceNoteFileName: selectedFile.name });
  }

  function removeVoiceNote() {
    setVoiceNoteFile(null);
    updateDraft({ voiceNoteFileName: "" });
  }

  async function uploadStagedProjectFiles(
    accessToken: string,
    projectCode: string,
  ) {
    const uploadErrors: string[] = [];

    for (const file of requirementFiles) {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("purpose", "initial_requirement_file");
      formData.set("kind", "product_requirement");

      const result = await uploadImporterProjectFileAction(
        accessToken,
        projectCode,
        formData,
      );

      if (!result.ok) {
        uploadErrors.push(`${file.name}: ${result.message}`);
      }
    }

    if (voiceNoteFile) {
      const formData = new FormData();
      formData.set("file", voiceNoteFile);
      formData.set("purpose", "voice_note");
      formData.set("kind", "voice_note");

      const result = await uploadImporterProjectFileAction(
        accessToken,
        projectCode,
        formData,
      );

      if (!result.ok) {
        uploadErrors.push(`${voiceNoteFile.name}: ${result.message}`);
      }
    }

    if (uploadErrors.length > 0) {
      setUploadWarning(
        `Project was created, but some files could not upload: ${uploadErrors.join(
          " | ",
        )}. You can upload files again from the project detail page.`,
      );
      return;
    }

    setUploadWarning("");
  }

  async function getAccessTokenOrRedirect() {
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.access_token) {
        router.push(
          `${ROUTES.login}?next=${encodeURIComponent(ROUTES.importerStart)}`,
        );
        return null;
      }

      return session.access_token;
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Supabase authentication is not configured yet.",
      );
      return null;
    }
  }

  async function submitPaidIntentProject() {
    if (!paymentReadinessConfirmed) {
      setValidationMessage(
        "Please confirm that you understand manual payment must be verified by Admin before factory sourcing starts.",
      );
      return;
    }

    setLeadReasonVisible(false);
    setSubmissionError("");
    setUploadWarning("");
    setFinalStatus("idle");
    setIsSubmitting(true);

    const accessToken = await getAccessTokenOrRedirect();

    if (!accessToken) {
      setIsSubmitting(false);
      return;
    }

    const submissionDraft: StartProjectDraftInput = {
      ...draft,
      attribution: {
        ...draft.attribution,
        selectedPackage: draft.packageId,
        submittedAt: new Date().toISOString(),
        submittedFromUrl:
          typeof window === "undefined" ? "" : window.location.href,
      },
      requirementFileCount: requirementFiles.length,
      voiceNoteFileName: voiceNoteFile?.name ?? "",
    };
    const result = await submitImportProjectAction(accessToken, submissionDraft);

    if (!result.ok) {
      setIsSubmitting(false);
      setSubmissionError(result.message);
      return;
    }

    setCreatedProjectCode(result.projectCode ?? "");
    setCreatedInvoiceCode(result.invoiceCode ?? "");

    if (result.projectCode) {
      await uploadStagedProjectFiles(accessToken, result.projectCode);
    }

    setIsSubmitting(false);
    setFinalStatus("project-created");
  }

  async function saveLeadToSupabase() {
    if (!draft.selectedLeadReasonId) {
      setValidationMessage("Payment complete نہ ہونے کی وجہ منتخب کریں۔");
      return;
    }

    setLeadReasonVisible(true);
    setSubmissionError("");
    setUploadWarning("");
    setFinalStatus("idle");
    setIsSubmitting(true);

    const accessToken = await getAccessTokenOrRedirect();

    if (!accessToken) {
      setIsSubmitting(false);
      return;
    }

    const leadDraft: StartProjectDraftInput = {
      ...draft,
      attribution: {
        ...draft.attribution,
        selectedPackage: draft.packageId,
        submittedAt: new Date().toISOString(),
        submittedFromUrl:
          typeof window === "undefined" ? "" : window.location.href,
      },
      requirementFileCount: requirementFiles.length,
      voiceNoteFileName: voiceNoteFile?.name ?? "",
    };
    const result = await saveUnpaidLeadAction(accessToken, leadDraft);
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmissionError(result.message);
      return;
    }

    setCreatedLeadCode(result.leadCode ?? "");
    setFinalStatus("lead-saved");
  }

  const photoMethod = importProjectFlow.productMethods[0];
  const detailsMethod = importProjectFlow.productMethods[1];
  const linkMethod = importProjectFlow.productMethods[2];
  const voiceMethod = importProjectFlow.productMethods[3];

  return (
    <div className="urdu-text bg-brand-background" dir="rtl" lang="ur">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-emerald">
                Import Project Wizard
              </p>
              <p className="mt-1 text-lg font-bold text-brand-navy">
                Step {currentStep} of {importProjectFlow.totalSteps}:{" "}
                {stepTitles[currentStep - 1]}
              </p>
            </div>
            <p className="text-sm font-semibold text-brand-muted">
              {progressPercent}% complete
            </p>
          </div>
          <div
            aria-label="Wizard progress"
            aria-valuemax={importProjectFlow.totalSteps}
            aria-valuemin={1}
            aria-valuenow={currentStep}
            className="mt-4 h-3 overflow-hidden rounded-lg bg-slate-100"
            role="progressbar"
          >
            <div
              className="h-full rounded-lg bg-brand-emerald transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <section className="mb-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-brand-navy shadow-sm">
          <p className="text-sm font-bold text-brand-emerald">
            Import Project readiness
          </p>
          <div className="mt-3 grid gap-3 text-sm leading-7 md:grid-cols-5">
            {[
              "Product details",
              "Supplier preferences",
              "Attachments",
              "Package/payment readiness",
              "Review and submit",
            ].map((item) => (
              <div className="rounded-lg bg-white/70 p-3 font-semibold" key={item}>
                {item}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            Factory matching starts only after Admin verifies payment and reviews
            the project. FMS never contacts importers directly.
          </p>
        </section>

        {currentStep === 1 ? (
          <WizardStep
            copy="Product کی تصویر، link یا details دیں۔ ہماری team اسے review کرے گی۔"
            heading="آپ کیا import کرنا چاہتے ہیں؟"
            stepLabel="Step 1 — Product Input"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {launchFlags.enablePhotoUploadInWizard ? (
                <MethodCard
                  body={photoMethod.body}
                  icon="photo"
                  isActive={requirementFiles.length > 0}
                  title={photoMethod.title}
                >
                  <input
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-brand-text"
                    multiple
                    onChange={handleRequirementFiles}
                    type="file"
                  />
                  <p className="mt-2 text-xs font-semibold leading-6 text-brand-muted">
                    Up to 5 files. Max 10 MB each. JPG, PNG, WebP, PDF, DOC,
                    or DOCX.
                  </p>
                  {requirementFiles.length > 0 ? (
                    <ul className="mt-3 grid gap-2">
                      {requirementFiles.map((file, index) => (
                        <li
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-brand-background px-3 py-2 text-sm"
                          key={`${file.name}-${file.size}-${index}`}
                        >
                          <span className="min-w-0 truncate text-brand-navy">
                            {file.name} ({formatBytes(file.size)})
                          </span>
                          <button
                            className="shrink-0 font-bold text-brand-error"
                            onClick={() => removeRequirementFile(index)}
                            type="button"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <button
                    aria-pressed={draft.usedPhotoPlaceholder}
                    className="hidden"
                    onClick={() =>
                      updateDraft({
                        usedPhotoPlaceholder: !draft.usedPhotoPlaceholder,
                      })
                    }
                    type="button"
                  >
                    {draft.usedPhotoPlaceholder
                      ? "Photo method selected"
                      : "Photo method select کریں"}
                  </button>
                </MethodCard>
              ) : null}

              <MethodCard
                body={detailsMethod.body}
                icon="text"
                isActive={Boolean(draft.productDetails.trim())}
                title={detailsMethod.title}
              >
                <label className="sr-only" htmlFor="product-details">
                  Product name/details
                </label>
                <textarea
                  className={fieldClasses()}
                  id="product-details"
                  onChange={(event) =>
                    updateDraft({ productDetails: event.target.value })
                  }
                  placeholder="مثلاً: بچوں کے school bags، medium size، better quality..."
                  rows={5}
                  value={draft.productDetails}
                />
                <label
                  className="mt-4 block text-sm font-semibold text-brand-navy"
                  htmlFor="product-category"
                >
                  Product category (optional)
                </label>
                <input
                  className={fieldClasses()}
                  id="product-category"
                  onChange={(event) =>
                    updateDraft({ productCategory: event.target.value })
                  }
                  placeholder="Electronics, garments, toys, home goods..."
                  type="text"
                  value={draft.productCategory ?? ""}
                />
              </MethodCard>

              <MethodCard
                body={linkMethod.body}
                icon="link"
                isActive={Boolean(draft.productLink.trim())}
                title={linkMethod.title}
              >
                <label className="sr-only" htmlFor="product-link">
                  Product link
                </label>
                <input
                  className={fieldClasses()}
                  id="product-link"
                  onChange={(event) =>
                    updateDraft({ productLink: event.target.value })
                  }
                  placeholder="https://..."
                  type="url"
                  value={draft.productLink}
                />
              </MethodCard>

              {launchFlags.enableVoiceNotes ? (
                <MethodCard
                  body={voiceMethod.body}
                  icon="mic"
                  isActive={Boolean(voiceNoteFile)}
                  title={voiceMethod.title}
                >
                  <input
                    accept=".mp3,.m4a,.wav,.webm,.ogg,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,audio/webm,audio/ogg"
                    className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-brand-text"
                    onChange={handleVoiceNote}
                    type="file"
                  />
                  <p className="mt-2 text-xs font-semibold leading-6 text-brand-muted">
                    One audio file. Max 20 MB. MP3, M4A, WAV, WebM, or OGG.
                    Voice notes are reviewed manually; automatic transcription
                    is not enabled yet.
                  </p>
                  {voiceNoteFile ? (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-brand-background px-3 py-2 text-sm">
                      <span className="min-w-0 truncate text-brand-navy">
                        {voiceNoteFile.name} ({formatBytes(voiceNoteFile.size)})
                      </span>
                      <button
                        className="shrink-0 font-bold text-brand-error"
                        onClick={removeVoiceNote}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                  <button
                    aria-pressed={draft.usedVoicePlaceholder}
                    className="hidden"
                    onClick={() =>
                      updateDraft({
                        usedVoicePlaceholder: !draft.usedVoicePlaceholder,
                      })
                    }
                    type="button"
                  >
                    {draft.usedVoicePlaceholder
                      ? "Voice note method selected"
                      : "Voice note method select کریں"}
                  </button>
                </MethodCard>
              ) : null}
            </div>
          </WizardStep>
        ) : null}

        {currentStep === 2 ? (
          <WizardStep
            heading="تقریباً کتنے روپے کا سامان منگوانا چاہتے ہیں؟"
            stepLabel="Step 2 — Import Budget"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {importProjectFlow.budgets.map((budget) => (
                <OptionCard
                  isSelected={draft.budgetId === budget.id}
                  key={budget.id}
                  onSelect={() => updateDraft({ budgetId: budget.id })}
                  title={budget.label}
                />
              ))}
            </div>
            <label
              className="mt-5 block text-sm font-semibold text-brand-navy"
              htmlFor="target-budget"
            >
              Target product budget or price range (optional)
            </label>
            <input
              className={fieldClasses()}
              id="target-budget"
              onChange={(event) =>
                updateDraft({ targetBudget: event.target.value })
              }
              placeholder="Example: PKR 700 per piece, USD 2-3 FOB, or Admin will confirm"
              type="text"
              value={draft.targetBudget ?? ""}
            />
          </WizardStep>
        ) : null}

        {currentStep === 3 ? (
          <WizardStep
            heading="Quantity اور requirements بتائیں"
            stepLabel="Step 3 — Quantity and Requirements"
          >
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="quantity"
                >
                  Approximate quantity
                </label>
                <input
                  className={fieldClasses()}
                  id="quantity"
                  onChange={(event) =>
                    updateDraft({ quantity: event.target.value })
                  }
                  placeholder="مثلاً: 500 pieces، 100 cartons، 1 container"
                  type="text"
                  value={draft.quantity}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="destination-city"
                >
                  Destination city in Pakistan (optional)
                </label>
                <input
                  className={fieldClasses()}
                  id="destination-city"
                  onChange={(event) =>
                    updateDraft({
                      destinationCityPakistan: event.target.value,
                    })
                  }
                  placeholder="Karachi, Lahore, Islamabad, Faisalabad..."
                  type="text"
                  value={draft.destinationCityPakistan ?? ""}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-brand-navy">
                  Preferred quality level
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {importProjectFlow.qualityLevels.map((quality) => (
                    <OptionCard
                      isSelected={draft.qualityLevelId === quality.id}
                      key={quality.id}
                      onSelect={() =>
                        updateDraft({ qualityLevelId: quality.id })
                      }
                      title={quality.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="quality-concerns"
                >
                  Quality concerns (optional)
                </label>
                <textarea
                  className={fieldClasses()}
                  id="quality-concerns"
                  onChange={(event) =>
                    updateDraft({ qualityConcerns: event.target.value })
                  }
                  placeholder="Material, finishing, safety, packaging, sample, or durability concerns..."
                  rows={4}
                  value={draft.qualityConcerns ?? ""}
                />
              </div>

              <div className="lg:col-span-2">
                <label
                  className="block text-sm font-semibold text-brand-navy"
                  htmlFor="special-notes"
                >
                  Special notes
                </label>
                <textarea
                  className={fieldClasses()}
                  id="special-notes"
                  onChange={(event) =>
                    updateDraft({ specialNotes: event.target.value })
                  }
                  placeholder="Packing, color, size, quality, delivery یا market related کوئی خاص بات..."
                  rows={4}
                  value={draft.specialNotes}
                />
              </div>
            </div>
          </WizardStep>
        ) : null}

        {currentStep === 4 ? (
          <WizardStep
            heading="کیا آپ نے پہلے کبھی China سے import کیا ہے؟"
            stepLabel="Step 4 — Import Experience"
          >
            <div className="grid gap-3 md:grid-cols-3">
              {importProjectFlow.experienceLevels.map((experience) => (
                <OptionCard
                  isSelected={draft.experienceId === experience.id}
                  key={experience.id}
                  onSelect={() => updateDraft({ experienceId: experience.id })}
                  title={experience.label}
                />
              ))}
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-brand-navy">
                Preferred China city/province (optional)
                <input
                  className={fieldClasses()}
                  onChange={(event) =>
                    updateDraft({ preferredChinaRegion: event.target.value })
                  }
                  placeholder="Guangzhou, Shenzhen, Yiwu, Foshan, any suitable region..."
                  type="text"
                  value={draft.preferredChinaRegion ?? ""}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-brand-navy">
                Customization, branding, or packaging needs (optional)
                <textarea
                  className={fieldClasses()}
                  onChange={(event) =>
                    updateDraft({ customizationNeeds: event.target.value })
                  }
                  placeholder="Logo printing, color, packaging, labeling, MOQ concerns, or supplier preferences..."
                  rows={4}
                  value={draft.customizationNeeds ?? ""}
                />
              </label>
            </div>
          </WizardStep>
        ) : null}

        {currentStep === 5 ? (
          <WizardStep
            copy="Payment submission پر encourage کیا جاتا ہے تاکہ admin review کے بعد work شروع ہو سکے۔"
            heading="Package Selection"
            stepLabel="Step 5 — Package Selection"
          >
            <div className="grid gap-4 lg:grid-cols-3" dir="ltr" lang="en">
              {importProjectFlow.packages.map((plan) => (
                <PackageCard
                  isSelected={draft.packageId === plan.id}
                  key={plan.id}
                  onSelect={() => updateDraft({ packageId: plan.id })}
                  plan={plan}
                />
              ))}
            </div>
          </WizardStep>
        ) : null}

        {currentStep === 6 ? (
          <WizardStep
            copy="Add-ons optional ہیں۔ Selected add-ons کو admin payment review کے دوران confirm کیا جائے گا۔"
            heading="Optional Add-ons"
            stepLabel="Step 6 — Add-ons"
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" dir="ltr" lang="en">
              {importProjectFlow.addOns.map((addOn) => (
                <AddOnCard
                  addOn={addOn}
                  isSelected={draft.addOnIds.includes(addOn.id)}
                  key={addOn.id}
                  onToggle={() => toggleAddOn(addOn.id)}
                />
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-brand-gold bg-brand-background p-4 text-sm leading-8 text-brand-navy">
              AI translations are provided to support communication. For legal
              contracts, technical specifications, certifications, and payment
              terms, admin or human review may be required.
            </div>
          </WizardStep>
        ) : null}

        {currentStep === 7 ? (
          <WizardStep
            copy="Import Project submit کرنے سے پہلے اپنی details final review کر لیں۔"
            heading="Order Summary"
            stepLabel="Step 7 — Order Summary"
          >
            <SummaryCard
              addOns={selectedAddOns}
              budget={selectedBudget?.label ?? "Not selected"}
              customizationNeeds={draft.customizationNeeds}
              destinationCityPakistan={draft.destinationCityPakistan}
              experience={selectedExperience?.label ?? "Not selected"}
              packagePlan={selectedPackage}
              preferredChinaRegion={draft.preferredChinaRegion}
              productCategory={draft.productCategory}
              productDetails={draft.productDetails}
              productLink={draft.productLink}
              qualityConcerns={draft.qualityConcerns}
              quantity={draft.quantity}
              qualityLevel={selectedQuality?.label ?? "Not selected"}
              requirementFileCount={requirementFiles.length}
              specialNotes={draft.specialNotes}
              targetBudget={draft.targetBudget}
              voiceNoteFileName={voiceNoteFile?.name ?? ""}
            />
          </WizardStep>
        ) : null}

        {currentStep === 8 ? (
          <WizardStep
            copy="Payment کے بعد project admin review میں جائے گا۔ اگر payment نہیں ہو سکتی تو unpaid lead save ہو سکتا ہے، مگر FMS assignment یا work شروع نہیں ہوگا۔"
            heading="Payment or Save Lead"
            stepLabel="Step 8 — Payment or Save Lead"
          >
            <div className="mb-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
              <p className="font-bold">Before factory sourcing starts</p>
              <ul className="mt-2 grid gap-2">
                <li>Admin must verify the manual payment reference.</li>
                <li>Admin must review and approve the Import Project.</li>
                <li>FMS will never contact you directly or collect payment.</li>
              </ul>
              <label className="mt-4 flex items-start gap-3 font-semibold">
                <input
                  checked={paymentReadinessConfirmed}
                  className="mt-1 h-5 w-5 rounded border-slate-300"
                  onChange={(event) =>
                    setPaymentReadinessConfirmed(event.target.checked)
                  }
                  type="checkbox"
                />
                <span>
                  I understand payment is manual/admin-verified and factory
                  sourcing starts only after payment and Admin review gates pass.
                </span>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                className="rounded-lg border border-brand-emerald bg-brand-emerald p-5 text-start text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                onClick={submitPaidIntentProject}
                type="button"
              >
                <span className="block text-xl font-bold">
                  Pay & Start My Import Project
                </span>
                <span className="mt-2 block text-base leading-8 text-white/90">
                  Payment کر کے Import Project شروع کریں
                </span>
              </button>

              <button
                className="rounded-lg border border-brand-navy bg-white p-5 text-start text-brand-navy shadow-sm transition hover:-translate-y-0.5 hover:border-brand-emerald hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                onClick={() => {
                  setLeadReasonVisible(true);
                  setFinalStatus("idle");
                }}
                type="button"
              >
                <span className="block text-xl font-bold">
                  Save My Project & Get Assistance
                </span>
                <span className="mt-2 block text-base leading-8 text-brand-muted">
                  Project save کریں اور payment میں مدد حاصل کریں
                </span>
              </button>
            </div>

            {leadReasonVisible ? (
              <div className="mt-6 rounded-lg border border-slate-200 bg-brand-background p-4">
                <p className="font-bold text-brand-navy">
                  Payment complete کیوں نہیں ہوئی؟
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {importProjectFlow.leadReasons.map((reason) => (
                    <OptionCard
                      isSelected={draft.selectedLeadReasonId === reason.id}
                      key={reason.id}
                      onSelect={() =>
                        updateDraft({ selectedLeadReasonId: reason.id })
                      }
                      title={reason.label}
                    />
                  ))}
                </div>
                <Button
                  className="mt-5 w-full sm:w-auto"
                  disabled={isSubmitting}
                  onClick={saveLeadToSupabase}
                >
                  <span className="block">
                    {isSubmitting ? "Saving..." : "Project save کریں"}
                  </span>
                </Button>
              </div>
            ) : null}

            {submissionError ? (
              <div
                className="mt-6 rounded-lg border border-brand-error bg-red-50 p-4 text-sm font-semibold text-brand-error"
                role="alert"
              >
                {submissionError}
              </div>
            ) : null}

            {finalStatus === "project-created" ? (
              <div className="mt-6 rounded-lg border border-brand-gold bg-brand-background p-5 text-brand-navy">
                <h2 className="text-xl font-bold">
                  Import Project saved.
                </h2>
                <p className="mt-2 text-sm leading-8">
                  Project ID:{" "}
                  <span className="font-bold text-brand-emerald" translate="no">
                    {createdProjectCode || "Created"}
                  </span>
                  . Invoice ID:{" "}
                  <span className="font-bold text-brand-emerald" translate="no">
                    {createdInvoiceCode || "Prepared"}
                  </span>
                  . Payment is still required before sourcing can begin.
                </p>
                {uploadWarning ? (
                  <div className="mt-4 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm font-semibold leading-7 text-brand-navy">
                    {uploadWarning}
                  </div>
                ) : requirementFiles.length > 0 || voiceNoteFile ? (
                  <div className="mt-4 rounded-lg border border-brand-emerald bg-emerald-50 p-4 text-sm font-semibold leading-7 text-brand-emerald">
                    Requirement files and voice notes that passed validation
                    were uploaded privately for admin review.
                  </div>
                ) : null}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  {createdProjectCode ? (
                    <Button
                      href={`${ROUTES.importerProjects}/${createdProjectCode}`}
                      variant="secondary"
                    >
                      Track Project
                    </Button>
                  ) : null}
                  {createdInvoiceCode ? (
                    <Button
                      href={`${ROUTES.paymentsManual}?invoice=${createdInvoiceCode}`}
                      variant="primary"
                    >
                      Complete payment
                    </Button>
                  ) : null}
                  <Button
                    href={
                      createdInvoiceCode
                        ? `${ROUTES.invoices}/${createdInvoiceCode}`
                        : ROUTES.invoices
                    }
                    variant="outline"
                  >
                    Invoice دیکھیں
                  </Button>
                  <Button href={ROUTES.importerDashboard} variant="outline">
                    Importer dashboard
                  </Button>
                </div>
              </div>
            ) : null}

            {finalStatus === "lead-saved" ? (
              <div className="mt-6 rounded-lg border border-brand-emerald bg-white p-5 text-brand-navy shadow-sm">
                <h2 className="text-xl font-bold">
                  آپ کا Import Project محفوظ ہو گیا ہے۔
                </h2>
                <p className="mt-2 text-sm leading-8 text-brand-muted">
                  ہماری team آپ سے رابطہ کر سکتی ہے تاکہ payment مکمل کرنے یا
                  questions answer کرنے میں مدد مل سکے۔
                </p>
                <p className="mt-3 text-sm leading-8 text-brand-navy">
                  Lead ID:{" "}
                  <span className="font-bold text-brand-emerald" translate="no">
                    {createdLeadCode || "Saved"}
                  </span>
                  . Unpaid leads are follow-up only and must not be assigned to
                  an FMS.
                </p>
              </div>
            ) : null}
          </WizardStep>
        ) : null}

        {validationMessage ? (
          <div
            className="mt-4 rounded-lg border border-brand-error bg-red-50 p-4 text-sm font-semibold text-brand-error"
            role="alert"
          >
            {validationMessage}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            disabled={currentStep === 1}
            onClick={goBack}
            variant="outline"
          >
            Back
          </Button>
          {currentStep < importProjectFlow.totalSteps ? (
            <Button onClick={goNext} variant="secondary">
              Continue
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
