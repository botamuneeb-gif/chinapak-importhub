"use client";

import { useEffect, useState } from "react";
import {
  listImporterReportFeedbackAction,
  submitImporterReportFeedbackAction,
  type ImporterReportFeedbackItem,
  type ReportFeedbackType,
  type ReportFeedbackUrgency,
} from "@/app/importer/reports/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type ReportFeedbackPanelProps = {
  optionLabels: string[];
  projectCode: string;
};

const feedbackTypes: Array<{ label: string; value: ReportFeedbackType }> = [
  { label: "Factory option کے بارے میں سوال", value: "question_about_option" },
  { label: "Better price request", value: "request_better_price" },
  { label: "مزید factories چاہیے", value: "request_more_factories" },
  { label: "Sample guidance چاہیے", value: "request_sample_guidance" },
  { label: "Shipping guidance چاہیے", value: "request_shipping_guidance" },
  { label: "Report سے satisfied نہیں ہوں", value: "not_satisfied" },
  { label: "Next step کے لیے ready ہوں", value: "ready_for_next_step" },
  { label: "Other", value: "other" },
];

const urgencyLevels: Array<{ label: string; value: ReportFeedbackUrgency }> = [
  { label: "Normal", value: "normal" },
  { label: "Urgent", value: "urgent" },
  { label: "Low", value: "low" },
];

export function ReportFeedbackPanel({
  optionLabels,
  projectCode,
}: ReportFeedbackPanelProps) {
  const [feedbackItems, setFeedbackItems] = useState<ImporterReportFeedbackItem[]>(
    [],
  );
  const [feedbackType, setFeedbackType] = useState<ReportFeedbackType>(
    "question_about_option",
  );
  const [urgencyLevel, setUrgencyLevel] =
    useState<ReportFeedbackUrgency>("normal");
  const [selectedOptionLabel, setSelectedOptionLabel] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function getAccessToken() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Feedback بھیجنے کے لیے importer account میں login کریں۔");
    }

    return session.access_token;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadFeedback() {
      try {
        const accessToken = await getAccessToken();
        const result = await listImporterReportFeedbackAction(
          accessToken,
          projectCode,
        );

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setError(result.message);
          setIsLoading(false);
          return;
        }

        setFeedbackItems(result.data);
        setIsLoading(false);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Feedback load نہیں ہو سکا۔",
        );
        setIsLoading(false);
      }
    }

    void loadFeedback();

    return () => {
      isMounted = false;
    };
  }, [projectCode]);

  async function submitFeedback() {
    setIsSubmitting(true);
    setNotice("");
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await submitImporterReportFeedbackAction(
        accessToken,
        projectCode,
        {
          feedbackType,
          message,
          selectedOptionLabel,
          urgencyLevel,
        },
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setFeedbackItems(result.data);
      setMessage("");
      setSelectedOptionLabel("");
      setUrgencyLevel("normal");
      setFeedbackType("question_about_option");
      setNotice("آپ کا feedback admin review کے لیے submit ہو گیا ہے۔");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Feedback submit نہیں ہو سکا۔",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-brand-navy" dir="rtl">
        Report کے بارے میں سوال یا feedback
      </h2>
      <p className="mt-2 text-sm leading-7 text-brand-muted" dir="rtl">
        آپ factory report کے بارے میں سوال پوچھ سکتے ہیں۔ Direct factory/FMS
        contact، phone، email، WeChat، WhatsApp یا payment instructions request
        نہ کریں؛ communication admin کے ذریعے manage ہوتی ہے۔
      </p>

      {(notice || error) && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm font-semibold ${
            error
              ? "border-brand-error bg-red-50 text-brand-error"
              : "border-brand-emerald bg-emerald-50 text-brand-emerald"
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <label
            className="block text-sm font-semibold text-brand-navy"
            htmlFor="feedback-type"
          >
            Feedback type
          </label>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            disabled={isSubmitting}
            id="feedback-type"
            onChange={(event) =>
              setFeedbackType(event.target.value as ReportFeedbackType)
            }
            value={feedbackType}
          >
            {feedbackTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-semibold text-brand-navy"
            htmlFor="feedback-option"
          >
            Factory option
          </label>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            disabled={isSubmitting}
            id="feedback-option"
            onChange={(event) => setSelectedOptionLabel(event.target.value)}
            value={selectedOptionLabel}
          >
            <option value="">General report question</option>
            {optionLabels.map((optionLabel) => (
              <option key={optionLabel} value={optionLabel}>
                {optionLabel}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-semibold text-brand-navy"
            htmlFor="feedback-urgency"
          >
            Urgency
          </label>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-brand-text"
            disabled={isSubmitting}
            id="feedback-urgency"
            onChange={(event) =>
              setUrgencyLevel(event.target.value as ReportFeedbackUrgency)
            }
            value={urgencyLevel}
          >
            {urgencyLevels.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label
        className="mt-5 block text-sm font-semibold text-brand-navy"
        htmlFor="feedback-message"
      >
        Message / question
      </label>
      <textarea
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-brand-text"
        disabled={isSubmitting}
        id="feedback-message"
        onChange={(event) => setMessage(event.target.value)}
        placeholder="اپنا سوال یہاں لکھیں۔ Direct factory contact details request نہ کریں۔"
        rows={4}
        value={message}
      />

      <button
        className="mt-4 min-h-12 rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-55"
        disabled={isSubmitting}
        onClick={() => void submitFeedback()}
        type="button"
      >
        Feedback submit کریں
      </button>

      <div className="mt-7">
        <h3 className="text-lg font-bold text-brand-navy">
          Previous feedback
        </h3>
        {isLoading ? (
          <p className="mt-3 rounded-lg bg-brand-background p-4 text-sm font-semibold text-brand-muted">
            Feedback load ہو رہا ہے...
          </p>
        ) : feedbackItems.length > 0 ? (
          <div className="mt-3 grid gap-3">
            {feedbackItems.map((item) => (
              <article
                className="rounded-lg border border-slate-200 bg-brand-background p-4"
                key={item.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-brand-muted">
                      {item.feedbackCode} • {item.feedbackType}
                    </p>
                    <h4 className="mt-1 font-bold text-brand-navy">
                      {item.selectedOptionLabel}
                    </h4>
                  </div>
                  <span className="w-fit rounded-lg border border-brand-gold bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-brand-navy">
                  {item.message}
                </p>
                <p className="mt-2 text-xs font-semibold text-brand-muted">
                  {item.createdAt} • Urgency: {item.urgencyLevel}
                </p>
                {item.adminResponse ? (
                  <div className="mt-3 rounded-lg border border-brand-emerald bg-emerald-50 p-3">
                    <p className="text-xs font-bold uppercase text-brand-emerald">
                      Admin response
                    </p>
                    <p className="mt-1 text-sm leading-7 text-brand-navy">
                      {item.adminResponse}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-brand-muted">
                      {item.adminRespondedAt}
                    </p>
                  </div>
                ) : null}
                {item.responses.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {item.responses.map((response) => (
                      <div
                        className="rounded-lg border border-emerald-100 bg-white p-3 text-sm leading-6 text-brand-navy"
                        key={`${item.id}-${response.createdAt}-${response.responseType}`}
                      >
                        {response.message}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-lg bg-brand-background p-4 text-sm font-semibold text-brand-muted">
            ابھی کوئی feedback submit نہیں ہوا۔
          </p>
        )}
      </div>
    </section>
  );
}
