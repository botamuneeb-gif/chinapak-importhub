"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getImporterProjectDetailAction,
  type ImporterProjectDetail,
} from "@/app/importer/projects/actions";
import { ImporterProjectFilesPanel } from "@/components/files/file-panels";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LiveImporterProjectDetailProps = {
  projectCode: string;
};

function getToneClasses(tone: ImporterProjectDetail["statusSummary"]["tone"]) {
  if (tone === "success") {
    return "border-brand-emerald bg-emerald-50 text-brand-emerald";
  }

  if (tone === "danger") {
    return "border-brand-error bg-red-50 text-brand-error";
  }

  if (tone === "attention") {
    return "border-brand-gold bg-amber-50 text-amber-800";
  }

  return "border-slate-300 bg-slate-50 text-brand-navy";
}

function FieldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <dt className="text-xs font-bold uppercase text-brand-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold leading-6 text-brand-navy">
        {value}
      </dd>
    </div>
  );
}

function Section({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-7 text-brand-muted">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm font-semibold leading-7 text-brand-navy shadow-sm">
      {children}
    </div>
  );
}

export function LiveImporterProjectDetail({
  projectCode,
}: LiveImporterProjectDetailProps) {
  const [detail, setDetail] = useState<ImporterProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Login to your importer account to view this project.");
            setIsLoading(false);
          }
          return;
        }

        const result = await getImporterProjectDetailAction(
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
            : "Import Project detail could not be loaded.",
        );
        setIsLoading(false);
      }
    }

    void loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectCode]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-brand-muted shadow-sm">
        Loading Import Project details...
      </div>
    );
  }

  if (message || !detail) {
    return <Notice>{message || "This Import Project is not available."}</Notice>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
          href={ROUTES.importerProjects}
        >
          Back to projects
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
          href={ROUTES.importerStart}
        >
          Start New Project
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p
              className="text-sm font-bold uppercase tracking-wide text-brand-emerald"
              translate="no"
            >
              {detail.projectCode}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-brand-navy">
              {detail.productTitle}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
              Track payment, admin review, FMS assignment, report release,
              invoices, refunds, and safe files for this Import Project.
            </p>
          </div>
          <span
            className={`w-fit rounded-lg border px-3 py-1 text-xs font-bold ${getToneClasses(
              detail.statusSummary.tone,
            )}`}
          >
            {detail.statusSummary.label}
          </span>
        </div>
      </section>

      <Section
        description="This is the importer-safe project summary. Private admin notes, FMS details, and factory contact records are not shown here."
        title="Project Summary"
      >
        <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <FieldCard label="Project ID" value={detail.projectCode} />
          <FieldCard label="Product/category" value={detail.productCategory} />
          <FieldCard label="Package" value={detail.packageName} />
          <FieldCard label="Desired quantity" value={detail.requirements.quantity} />
          <FieldCard label="Budget range" value={detail.requirements.budgetRange} />
          <FieldCard label="Quality level" value={detail.requirements.qualityLevel} />
          <FieldCard
            label="Importer experience"
            value={detail.requirements.importExperience}
          />
          <FieldCard label="Created" value={detail.createdAt} />
          <FieldCard label="Last updated" value={detail.updatedAt} />
        </dl>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-brand-background p-4">
            <h3 className="font-bold text-brand-navy">Product details</h3>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              {detail.requirements.productDescription}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-brand-background p-4">
            <h3 className="font-bold text-brand-navy">Links and notes</h3>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              Product links: {detail.requirements.productLinks}
            </p>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              Special notes: {detail.requirements.specialNotes}
            </p>
          </div>
        </div>
        {detail.addOns.length > 0 ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-brand-background p-4">
            <h3 className="font-bold text-brand-navy">Selected add-ons</h3>
            <ul className="mt-3 grid gap-2">
              {detail.addOns.map((addon) => (
                <li
                  className="flex flex-col gap-1 rounded-lg bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  key={`${addon.name}-${addon.price}`}
                >
                  <span className="font-semibold text-brand-navy">
                    {addon.name}
                  </span>
                  <span className="font-bold text-brand-emerald">
                    {addon.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section title="Current Status">
        <div className="rounded-lg border border-brand-gold bg-amber-50 p-4">
          <h3 className="text-lg font-bold text-brand-navy">
            {detail.statusSummary.label}
          </h3>
          <p className="mt-2 text-sm leading-7 text-brand-navy">
            {detail.statusSummary.description}
          </p>
        </div>
        <dl className="mt-4 grid gap-3 md:grid-cols-3">
          <FieldCard label="Project status" value={detail.projectStatus} />
          <FieldCard label="Payment status" value={detail.paymentStatus} />
          <FieldCard label="Admin review" value={detail.adminReviewStatus} />
        </dl>
      </Section>

      <Section
        description="Only importer-visible timeline events are shown here. Internal admin notes and raw FMS updates remain hidden."
        title="Project Timeline"
      >
        <ol className="grid gap-3">
          {detail.timeline.map((item) => (
            <li
              className="rounded-lg border border-slate-200 bg-brand-background p-4"
              key={item.id}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="font-bold text-brand-navy">{item.title}</h3>
                <span className="text-xs font-bold text-brand-muted">
                  {item.createdAt}
                </span>
              </div>
              {item.body ? (
                <p className="mt-2 text-sm leading-7 text-brand-muted">
                  {item.body}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section description={detail.paymentPanelNotice} title="Payment And Invoice">
        {detail.invoices.length === 0 ? (
          <Notice>
            Invoice is not available yet. If you recently submitted the project,
            refresh after a moment or contact support with the Project ID.
          </Notice>
        ) : (
          <div className="grid gap-4">
            {detail.invoices.map((invoice) => (
              <article
                className="rounded-lg border border-slate-200 bg-brand-background p-4"
                key={invoice.invoiceCode}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3
                      className="text-lg font-bold text-brand-navy"
                      translate="no"
                    >
                      {invoice.invoiceCode}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-brand-muted">
                      {invoice.amount} | Due: {invoice.dueAt} | {invoice.status}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
                      href={`${ROUTES.invoices}/${encodeURIComponent(
                        invoice.invoiceCode,
                      )}`}
                    >
                      View Invoice
                    </Link>
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
                      href={`${ROUTES.invoices}/${encodeURIComponent(
                        invoice.invoiceCode,
                      )}/document`}
                    >
                      Invoice Document
                    </Link>
                    {invoice.statusRaw !== "paid" ? (
                      <Link
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-gold bg-amber-50 px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-navy"
                        href={`${ROUTES.paymentsManual}?invoice=${encodeURIComponent(
                          invoice.invoiceCode,
                        )}`}
                      >
                        Submit Payment
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {detail.manualPayments.length > 0 ? (
          <div className="mt-5">
            <h3 className="font-bold text-brand-navy">
              Manual payment references
            </h3>
            <div className="mt-3 grid gap-3">
              {detail.manualPayments.map((payment) => (
                <div
                  className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
                  key={payment.id}
                >
                  <p className="font-bold text-brand-navy">
                    {payment.method} | {payment.amountPaid}
                  </p>
                  <p className="mt-1 leading-6 text-brand-muted">
                    Reference: <span translate="no">{payment.reference}</span> |
                    Status: {payment.status} | Submitted: {payment.createdAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Section>

      <Section title="Factory Report">
        {detail.report.canView ? (
          <div className="rounded-lg border border-brand-emerald bg-emerald-50 p-4">
            <h3 className="text-lg font-bold text-brand-navy">
              Factory report is ready
            </h3>
            <p className="mt-2 text-sm leading-7 text-brand-navy">
              {detail.report.optionCount} approved option(s) were released on{" "}
              {detail.report.releasedAt}. Raw FMS notes and factory contact
              details are not included.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
                href={detail.report.viewHref}
              >
                View Report
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
                href={detail.report.documentHref}
              >
                Print Report
              </Link>
            </div>
          </div>
        ) : (
          <Notice>{detail.report.status}</Notice>
        )}
      </Section>

      {detail.adminReviewStatusRaw === "needs_information" ||
      detail.projectStatusRaw === "needs_importer_clarification" ? (
        <Section title="More Information Needed">
          <Notice>
            Admin needs more information before this project can continue. Check
            notifications for instructions. You may upload safe product
            reference files below if they help clarify your requirement.
          </Notice>
        </Section>
      ) : null}

      <Section title="Refund Status">
        {detail.refundItems.length === 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-7 text-brand-muted">
              No refund request is linked to this project.
            </p>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.refundsRequest}
            >
              Request Refund
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {detail.refundItems.map((refund) => (
              <article
                className="rounded-lg border border-slate-200 bg-brand-background p-4"
                key={refund.refundCode}
              >
                <h3 className="font-bold text-brand-navy" translate="no">
                  {refund.refundCode}
                </h3>
                <p className="mt-2 text-sm leading-7 text-brand-muted">
                  Status: {refund.status} | Requested: {refund.requestedAmount} |
                  Approved: {refund.approvedAmount}
                </p>
                <p className="mt-2 text-sm leading-7 text-brand-muted">
                  {refund.customerVisibleSummary}
                </p>
                <Link
                  className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
                  href={`${ROUTES.refunds}/${encodeURIComponent(
                    refund.refundCode,
                  )}/document`}
                >
                  Refund Document
                </Link>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section title="Next Steps">
        <ul className="grid gap-3">
          {detail.statusSummary.nextSteps.map((step) => (
            <li
              className="rounded-lg bg-brand-background p-3 text-sm font-semibold leading-7 text-brand-navy"
              key={step}
            >
              {step}
            </li>
          ))}
        </ul>
      </Section>

      <div>
        <ImporterProjectFilesPanel projectCode={detail.projectCode} />
        <p className="mt-3 text-xs font-semibold leading-6 text-brand-muted">
          {detail.filesNotice}
        </p>
      </div>
    </div>
  );
}
