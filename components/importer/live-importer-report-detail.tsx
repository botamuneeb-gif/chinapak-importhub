"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getImporterFactoryReportAction,
  type ImporterReportDetail,
  type ImporterReportOption,
} from "@/app/importer/reports/actions";
import { ImporterProjectFilesPanel } from "@/components/files/file-panels";
import { ReportFeedbackPanel } from "@/components/importer/report-feedback-panel";
import { FactoryOptionComparisonTable } from "@/components/reports/factory-option-comparison-table";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LiveImporterReportDetailProps = {
  projectCode: string;
};

function OptionField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <dt className="text-xs font-bold uppercase text-brand-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-brand-navy">{value}</dd>
    </div>
  );
}

function visible(option: ImporterReportOption, field: string) {
  return option.visibleFields.includes(field);
}

export function LiveImporterReportDetail({
  projectCode,
}: LiveImporterReportDetailProps) {
  const [detail, setDetail] = useState<ImporterReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Report دیکھنے کے لیے importer account میں login کریں۔");
            setIsLoading(false);
          }
          return;
        }

        const result = await getImporterFactoryReportAction(
          session.access_token,
          projectCode,
        );

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setDetail(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Factory report load نہیں ہو سکی۔",
        );
        setIsLoading(false);
      }
    }

    void loadReport();

    return () => {
      isMounted = false;
    };
  }, [projectCode]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-brand-muted shadow-sm">
        Approved factory report load ہو رہی ہے...
      </div>
    );
  }

  if (message || !detail) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
        {message || "Factory report available نہیں ہے۔"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
          href={ROUTES.importerReports}
        >
          Back to reports
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
          href={`${ROUTES.importerReports}/${encodeURIComponent(projectCode)}/document`}
        >
          Print report
        </Link>
      </div>

      <section className="rounded-lg border border-brand-emerald bg-emerald-50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-muted">
              Approved Factory Report
            </p>
            <h1 className="mt-1 text-2xl font-bold text-brand-navy">
              {detail.projectCode}
            </h1>
          </div>
          <span className="w-fit rounded-lg border border-brand-emerald bg-white px-3 py-1 text-xs font-bold text-brand-emerald">
            {detail.report.statusLabel}
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-brand-navy" dir="rtl">
          {detail.trustNotice}
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy">Report summary</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OptionField label="Package" value={detail.packageName} />
          <OptionField label="Options" value={`${detail.optionCount}`} />
          <OptionField label="Released" value={detail.releaseDate} />
          <OptionField label="Project status" value={detail.projectStatus} />
        </dl>
        {detail.report.importerSafeSummary ? (
          <p className="mt-4 rounded-lg bg-brand-background p-4 text-sm leading-7 text-brand-navy">
            {detail.report.importerSafeSummary}
          </p>
        ) : null}
        {detail.report.adminRecommendation ? (
          <div className="mt-4 rounded-lg border border-brand-gold bg-amber-50 p-4">
            <h3 className="font-bold text-brand-navy">Admin recommendation</h3>
            <p className="mt-2 text-sm leading-7 text-brand-navy">
              {detail.report.adminRecommendation}
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy">
          Factory options comparison
        </h2>
        <p className="mt-2 text-sm leading-7 text-brand-muted">
          This side-by-side view compares admin-reviewed factory options. Scores
          are platform review indicators only; prices, MOQ, and lead times must
          be reconfirmed before any order or payment.
        </p>
        <div className="mt-4">
          <FactoryOptionComparisonTable
            caption="Importer factory option comparison"
            options={detail.report.options}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy">
          Approved factory option details
        </h2>
        <div className="mt-4 grid gap-4">
          {detail.report.options.map((option, index) => (
            <article
              className="rounded-lg border border-slate-200 bg-brand-background p-4"
              key={`${option.factoryLabel}-${index}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-brand-navy">
                  {option.factoryLabel}
                </h3>
                {option.recommended ? (
                  <span className="w-fit rounded-lg border border-brand-emerald bg-emerald-50 px-3 py-1 text-xs font-bold text-brand-emerald">
                    Recommended
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <OptionField
                  label="Recommendation"
                  value={option.recommendationStatusLabel}
                />
                <OptionField
                  label="Comparison score"
                  value={`${option.overallScore}/100 · ${option.overallScoreLabel}`}
                />
                <OptionField label="Risk level" value={option.riskLevelLabel} />
              </div>
              <dl className="mt-4 grid gap-3 md:grid-cols-2">
                {visible(option, "cityProvince") ? (
                  <OptionField
                    label="City/province"
                    value={option.cityProvince}
                  />
                ) : null}
                {visible(option, "productCategory") ? (
                  <OptionField
                    label="Category"
                    value={option.productCategory}
                  />
                ) : null}
                {visible(option, "mainProducts") ? (
                  <OptionField
                    label="Main products"
                    value={option.mainProducts}
                  />
                ) : null}
                {visible(option, "productMatchSummary") ? (
                  <OptionField
                    label="Product match"
                    value={option.productMatchSummary}
                  />
                ) : null}
                {visible(option, "estimatedUnitPrice") ? (
                  <OptionField
                    label="Estimated unit price"
                    value={`${option.estimatedUnitPrice} ${option.currency}`}
                  />
                ) : null}
                {visible(option, "moq") ? (
                  <OptionField label="MOQ" value={option.moq} />
                ) : null}
                {visible(option, "sampleAvailability") ? (
                  <OptionField
                    label="Sample availability"
                    value={option.sampleAvailability}
                  />
                ) : null}
                {visible(option, "productionLeadTime") ? (
                  <OptionField
                    label="Production lead time"
                    value={option.productionLeadTime}
                  />
                ) : null}
                {visible(option, "packagingNotes") ? (
                  <OptionField
                    label="Packaging"
                    value={option.packagingNotes}
                  />
                ) : null}
                {visible(option, "customizationAvailability") ? (
                  <OptionField
                    label="Customization/private label"
                    value={option.customizationAvailability}
                  />
                ) : null}
                {visible(option, "qualityReliabilitySummary") ? (
                  <OptionField
                    label="Quality/reliability"
                    value={option.qualityReliabilitySummary}
                  />
                ) : null}
                <OptionField
                  label="Evidence summary"
                  value={option.evidenceSummary}
                />
                {visible(option, "riskSummary") ? (
                  <OptionField label="Risk summary" value={option.riskSummary} />
                ) : null}
              </dl>
            </article>
          ))}
        </div>
      </section>

      {detail.report.comparisonNotes ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            Comparison notes
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            {detail.report.comparisonNotes}
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy">
          What this report means
        </h2>
        <div className="mt-4 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
          ChinaPak provides sourcing support and admin-reviewed factory option
          research. This report does not guarantee final factory acceptance,
          customs clearance, shipment delivery, product compliance, or fixed
          pricing. Final commercial decisions remain with you as the importer.
        </div>
        <h3 className="mt-5 text-lg font-bold text-brand-navy">Next steps</h3>
        <ul className="mt-4 grid gap-3">
          {detail.nextSteps.map((step) => (
            <li
              className="rounded-lg bg-brand-background p-3 text-sm font-semibold leading-6 text-brand-navy"
              key={step}
            >
              {step}
            </li>
          ))}
        </ul>
      </section>

      <ImporterProjectFilesPanel projectCode={projectCode} />

      <ReportFeedbackPanel
        optionLabels={detail.report.options.map((option) => option.factoryLabel)}
        projectCode={projectCode}
      />
    </div>
  );
}
