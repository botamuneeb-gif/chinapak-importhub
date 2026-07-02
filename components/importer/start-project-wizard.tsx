"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  saveUnpaidLeadAction,
  submitImportProjectAction,
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
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type FinalStatus = "idle" | "project-created" | "lead-saved";

const initialDraft: StartProjectDraftInput = {
  addOnIds: [],
  budgetId: "",
  experienceId: "",
  packageId: "factory-match-plus",
  productDetails: "",
  productLink: "",
  quantity: "",
  qualityLevelId: "",
  selectedLeadReasonId: "",
  specialNotes: "",
  usedPhotoPlaceholder: false,
  usedVoicePlaceholder: false,
};

const stepTitles = [
  "Product Input",
  "Import Budget",
  "Quantity and Requirements",
  "Import Experience",
  "Package Selection",
  "Add-ons",
  "Order Summary",
  "Payment or Save Lead",
];

function MethodCard({
  body,
  children,
  icon,
  isActive,
  title,
}: {
  body: string;
  children: React.ReactNode;
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

function fieldClasses() {
  return "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text shadow-sm focus:border-brand-emerald focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 disabled:bg-slate-50";
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
      !draft.usedPhotoPlaceholder &&
      !draft.usedVoicePlaceholder
    ) {
      return "کم از کم product details، link، photo placeholder یا voice note placeholder منتخب کریں۔";
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
    setLeadReasonVisible(false);
    setSubmissionError("");
    setFinalStatus("idle");
    setIsSubmitting(true);

    const accessToken = await getAccessTokenOrRedirect();

    if (!accessToken) {
      setIsSubmitting(false);
      return;
    }

    const result = await submitImportProjectAction(accessToken, draft);
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmissionError(result.message);
      return;
    }

    setCreatedProjectCode(result.projectCode ?? "");
    setCreatedInvoiceCode(result.invoiceCode ?? "");
    setFinalStatus("project-created");
  }

  async function saveLeadToSupabase() {
    if (!draft.selectedLeadReasonId) {
      setValidationMessage("Payment complete نہ ہونے کی وجہ منتخب کریں۔");
      return;
    }

    setLeadReasonVisible(true);
    setSubmissionError("");
    setFinalStatus("idle");
    setIsSubmitting(true);

    const accessToken = await getAccessTokenOrRedirect();

    if (!accessToken) {
      setIsSubmitting(false);
      return;
    }

    const result = await saveUnpaidLeadAction(accessToken, draft);
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

        {currentStep === 1 ? (
          <WizardStep
            copy="Product کی تصویر، link یا details دیں۔ ہماری team اسے review کرے گی۔"
            heading="آپ کیا import کرنا چاہتے ہیں؟"
            stepLabel="Step 1 — Product Input"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <MethodCard
                body={photoMethod.body}
                icon="photo"
                isActive={draft.usedPhotoPlaceholder}
                title={photoMethod.title}
              >
                <button
                  aria-pressed={draft.usedPhotoPlaceholder}
                  className="min-h-12 w-full rounded-lg border border-brand-navy px-4 py-3 font-semibold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
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

              <MethodCard
                body={voiceMethod.body}
                icon="mic"
                isActive={draft.usedVoicePlaceholder}
                title={voiceMethod.title}
              >
                <button
                  aria-pressed={draft.usedVoicePlaceholder}
                  className="min-h-12 w-full rounded-lg border border-brand-navy px-4 py-3 font-semibold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
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
            copy="Add-ons optional ہیں۔ ابھی یہ صرف UI selection ہے؛ final pricing/payment logic backend میں review ہوتی رہے گی۔"
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
            copy="یہ summary Supabase میں Import Project یا unpaid lead save کرنے سے پہلے final review ہے۔"
            heading="Order Summary"
            stepLabel="Step 7 — Order Summary"
          >
            <SummaryCard
              addOns={selectedAddOns}
              budget={selectedBudget?.label ?? "Not selected"}
              experience={selectedExperience?.label ?? "Not selected"}
              packagePlan={selectedPackage}
              productDetails={draft.productDetails}
              productLink={draft.productLink}
              quantity={draft.quantity}
              qualityLevel={selectedQuality?.label ?? "Not selected"}
              specialNotes={draft.specialNotes}
              usedPhotoPlaceholder={draft.usedPhotoPlaceholder}
              usedVoicePlaceholder={draft.usedVoicePlaceholder}
            />
          </WizardStep>
        ) : null}

        {currentStep === 8 ? (
          <WizardStep
            copy="Payment کے بعد project admin review میں جائے گا۔ اگر payment نہیں ہو سکتی تو unpaid lead save ہو سکتا ہے، مگر FMS assignment یا work شروع نہیں ہوگا۔"
            heading="Payment or Save Lead"
            stepLabel="Step 8 — Payment or Save Lead"
          >
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
                  Import Project saved in Supabase.
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
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    href={
                      createdInvoiceCode
                        ? `${ROUTES.invoices}/${createdInvoiceCode}`
                        : ROUTES.invoices
                    }
                    variant="secondary"
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

        <aside className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-8 text-brand-muted shadow-sm">
          Supabase persistence is connected for Import Projects, unpaid leads,
          and invoice creation. This wizard still does not upload files, process
          real gateway payments, send messages, or assign an FMS.
        </aside>
      </div>
    </div>
  );
}
