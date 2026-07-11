"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getImporterInvoiceAction,
  listImporterInvoicesAction,
  listImporterRefundsAction,
  submitManualPaymentRecordAction,
  submitRefundRequestAction,
  type BillingInvoiceDetail,
  type BillingInvoiceListItem,
  type ManualPaymentSubmissionInput,
  type RefundListItem,
  type RefundRequestInput,
} from "@/app/billing/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { ROUTES, brand } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LoadState = "idle" | "loading" | "ready" | "error";

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login to your importer account first.");
  }

  return session.access_token;
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const classes = normalized.includes("paid")
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : normalized.includes("reject") ||
        normalized.includes("cancel") ||
        normalized.includes("refund")
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${classes}`}>
      {status}
    </span>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-gold/40 bg-brand-gold/10 p-4 text-sm font-semibold leading-6 text-brand-navy">
      {children}
    </div>
  );
}

const paymentReadinessStates = [
  {
    body: "Invoice is ready, but no manual payment reference has been submitted yet.",
    title: "Awaiting payment",
  },
  {
    body: "Importer submits bank/Easypaisa/JazzCash reference details through this portal.",
    title: "Proof submitted",
  },
  {
    body: "Admin checks the reference manually. FMS work remains blocked.",
    title: "Verification pending",
  },
  {
    body: "Payment is marked verified by Admin, then project review and FMS assignment rules continue.",
    title: "Payment verified",
  },
  {
    body: "If Admin cannot verify the reference, submit corrected details from the invoice or manual payment page.",
    title: "Needs correction",
  },
];

function PaymentReadinessChecklist() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-brand-emerald">
        Manual payment readiness
      </p>
      <h2 className="mt-1 text-xl font-bold text-brand-navy">
        What happens after payment
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {paymentReadinessStates.map((state) => (
          <article
            className="rounded-lg border border-slate-200 bg-brand-background p-3"
            key={state.title}
          >
            <h3 className="text-sm font-bold text-brand-navy">
              {state.title}
            </h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-brand-muted">
              {state.body}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-4">
        <Notice>
          Do not share card numbers, banking passwords, OTPs, CNIC images, or
          private account credentials in payment notes. Admin only needs enough
          transaction reference detail to verify the manual payment.
        </Notice>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-brand-navy">
      {label}
      <input
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
      {message}
    </p>
  );
}

export function LiveImporterInvoices() {
  const [state, setState] = useState<LoadState>("loading");
  const [invoices, setInvoices] = useState<BillingInvoiceListItem[]>([]);
  const [error, setError] = useState("");

  const loadInvoices = useCallback(async () => {
    setState("loading");
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await listImporterInvoicesAction(accessToken);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setInvoices(result.data);
      setState("ready");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Invoices could not be loaded.",
      );
      setState("error");
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  if (state === "loading") {
    return <Notice>Loading your invoices and payment status...</Notice>;
  }

  if (state === "error") {
    return <ErrorMessage message={error} />;
  }

  if (invoices.length === 0) {
    return (
      <Notice>
        No invoices found yet. Start an Import Project and an invoice will be
        prepared for manual payment verification.
      </Notice>
    );
  }

  return (
    <div className="grid gap-4">
      <PaymentReadinessChecklist />
      {invoices.map((invoice) => (
        <article
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          key={invoice.invoiceId}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-emerald">
                {invoice.projectCode}
              </p>
              <h2 className="mt-1 text-xl font-bold text-brand-navy">
                {invoice.invoiceCode}
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {invoice.packageName} | Due: {invoice.dueAt}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={invoice.status} />
              <span className="rounded-lg bg-slate-50 px-3 py-1 text-sm font-bold text-brand-text">
                {invoice.amount}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
              href={`${ROUTES.invoices}/${encodeURIComponent(invoice.invoiceCode)}`}
            >
              View invoice
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={`${ROUTES.invoices}/${encodeURIComponent(invoice.invoiceCode)}/document`}
            >
              Print document
            </Link>
            {invoice.statusRaw !== "paid" ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
                href={`${ROUTES.paymentsManual}?invoice=${encodeURIComponent(invoice.invoiceCode)}`}
              >
                Submit payment reference
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function ManualPaymentForm({
  defaultInvoiceCode,
  onSubmitted,
}: {
  defaultInvoiceCode: string;
  onSubmitted?: (detail: BillingInvoiceDetail) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const input: ManualPaymentSubmissionInput = {
        amountPaid: String(formData.get("amountPaid") ?? ""),
        invoiceCode: String(formData.get("invoiceCode") ?? defaultInvoiceCode),
        notes: String(formData.get("notes") ?? ""),
        payerName: String(formData.get("payerName") ?? ""),
        paymentDate: String(formData.get("paymentDate") ?? ""),
        paymentMethod: String(formData.get("paymentMethod") ?? ""),
        referenceNumber: String(formData.get("referenceNumber") ?? ""),
      };
      const accessToken = await getAccessToken();
      const result = await submitManualPaymentRecordAction(accessToken, input);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      form.reset();
      onSubmitted?.(result.data);
      setMessage(
        "Payment reference submitted. Admin will verify it before FMS sourcing can begin.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Payment reference could not be submitted.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={submitPayment}
    >
      <div>
        <p className="text-sm font-bold text-brand-emerald">
          Manual payment reference
        </p>
        <h2 className="mt-1 text-xl font-bold text-brand-navy">
          Submit bank/Easypaisa/JazzCash reference
        </h2>
      </div>
      <input
        defaultValue={defaultInvoiceCode}
        name="invoiceCode"
        type="hidden"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Payment method"
          name="paymentMethod"
          placeholder="Bank transfer, Easypaisa, JazzCash"
          required
        />
        <Field
          label="Amount paid (PKR)"
          name="amountPaid"
          placeholder="35000"
          required
        />
        <Field
          label="Transaction/reference number"
          name="referenceNumber"
          placeholder="Reference ID"
          required
        />
        <Field label="Payer name" name="payerName" required />
        <Field label="Payment date" name="paymentDate" type="date" />
      </div>
      <label className="grid gap-2 text-sm font-bold text-brand-navy">
        Notes for admin
        <textarea
          className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
          name="notes"
          placeholder="Any useful payment detail. Do not enter card data or banking passwords."
        />
      </label>
      <Notice>
        This creates a manual review request. No FMS work begins until payment is
        verified and admin review approves the Import Project.
      </Notice>
      <button
        className="min-h-12 rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Submitting..." : "Submit payment reference"}
      </button>
      <ActionFeedback error={error} message={message} />
    </form>
  );
}

export function LiveImporterInvoiceDetail({
  invoiceCode,
}: {
  invoiceCode: string;
}) {
  const [state, setState] = useState<LoadState>("loading");
  const [invoice, setInvoice] = useState<BillingInvoiceDetail | null>(null);
  const [error, setError] = useState("");

  const loadInvoice = useCallback(async () => {
    setState("loading");
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await getImporterInvoiceAction(accessToken, invoiceCode);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setInvoice(result.data);
      setState("ready");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Invoice could not be loaded.",
      );
      setState("error");
    }
  }, [invoiceCode]);

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  if (state === "loading") {
    return <Notice>Loading invoice document...</Notice>;
  }

  if (state === "error" || !invoice) {
    return <ErrorMessage message={error || "Invoice was not found."} />;
  }

  return (
    <div className="grid gap-6">
      <PaymentReadinessChecklist />

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
          href={`${ROUTES.invoices}/${encodeURIComponent(invoice.invoiceCode)}/document`}
        >
          Print / Save as PDF
        </Link>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
        <div className="border-b-4 border-brand-gold pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-muted">
                {brand.domain}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-brand-navy">
                {brand.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Professional manual-payment invoice for Import Project tracking.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-bold text-brand-muted">Invoice</p>
              <p className="text-2xl font-black text-brand-navy">
                {invoice.invoiceCode}
              </p>
              <div className="mt-2">
                <StatusPill status={invoice.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
              Document ID
            </p>
            <p className="mt-1 font-semibold text-brand-text">
              {invoice.documentId}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
              Project ID
            </p>
            <p className="mt-1 font-semibold text-brand-text">
              {invoice.projectCode}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
              Due Date
            </p>
            <p className="mt-1 font-semibold text-brand-text">{invoice.dueAt}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <section className="rounded-lg border border-slate-200 p-4">
            <h2 className="font-bold text-brand-navy">Customer</h2>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {invoice.customer.name}
              <br />
              {invoice.customer.businessType}
              <br />
              {invoice.customer.city}
              <br />
              WhatsApp/phone: {invoice.customer.phoneWhatsapp}
            </p>
          </section>
          <section className="rounded-lg border border-slate-200 p-4">
            <h2 className="font-bold text-brand-navy">Payment Instructions</h2>
            <ul className="mt-2 grid gap-2 text-sm leading-6 text-brand-muted">
              {invoice.manualPaymentInstructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-brand-muted">
                <th className="border border-slate-200 px-3 py-2">Service</th>
                <th className="border border-slate-200 px-3 py-2">Type</th>
                <th className="border border-slate-200 px-3 py-2">Qty</th>
                <th className="border border-slate-200 px-3 py-2">Unit</th>
                <th className="border border-slate-200 px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={`${item.itemType}-${item.description}`}>
                  <td className="border border-slate-200 px-3 py-3 font-semibold text-brand-text">
                    {item.description}
                  </td>
                  <td className="border border-slate-200 px-3 py-3 text-brand-muted">
                    {item.itemType}
                  </td>
                  <td className="border border-slate-200 px-3 py-3 text-brand-muted">
                    {item.quantity}
                  </td>
                  <td className="border border-slate-200 px-3 py-3 text-brand-muted">
                    {item.unitPrice}
                  </td>
                  <td className="border border-slate-200 px-3 py-3 font-bold text-brand-text">
                    {item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-3 sm:ml-auto sm:max-w-sm">
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Subtotal</span>
            <span className="font-bold text-brand-text">{invoice.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Discount</span>
            <span className="font-bold text-brand-text">{invoice.discount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Tax placeholder</span>
            <span className="font-bold text-brand-text">{invoice.tax}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg">
            <span className="font-bold text-brand-navy">Total</span>
            <span className="font-black text-brand-navy">{invoice.total}</span>
          </div>
        </div>
      </article>

      {invoice.statusRaw === "paid" ||
      invoice.statusRaw === "refunded" ||
      invoice.statusRaw === "partially_refunded" ? null : (
        <ManualPaymentForm
          defaultInvoiceCode={invoice.invoiceCode}
          onSubmitted={setInvoice}
        />
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">
              Manual payment review history
            </h2>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              Admin verifies these records manually. Receipt file upload remains
              a future hardening item.
            </p>
          </div>
          {invoice.statusRaw === "paid" ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={`${ROUTES.refundsRequest}?invoice=${encodeURIComponent(invoice.invoiceCode)}`}
            >
              Request refund
            </Link>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3">
          {invoice.manualPayments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm font-semibold text-brand-muted">
              No manual payment references submitted yet.
            </p>
          ) : (
            invoice.manualPayments.map((payment) => (
              <div
                className="rounded-lg border border-slate-200 p-4"
                key={payment.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-brand-navy">
                      {payment.method} | {payment.amountPaid}
                    </p>
                    <p className="mt-1 text-sm text-brand-muted">
                      Ref: {payment.reference} | Submitted: {payment.createdAt}
                    </p>
                    {String(payment.status).toLowerCase() === "verified" ? (
                      <Link
                        className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-navy bg-white px-3 py-2 text-xs font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
                        href={`${ROUTES.payments}/${encodeURIComponent(payment.id)}/document`}
                      >
                        View payment document
                      </Link>
                    ) : null}
                  </div>
                  <StatusPill status={payment.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export function LiveManualPaymentPage() {
  const [invoices, setInvoices] = useState<BillingInvoiceListItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const accessToken = await getAccessToken();
        const result = await listImporterInvoicesAction(accessToken);

        if (!result.ok) {
          throw new Error(result.message);
        }

        if (!isMounted) {
          return;
        }

        setInvoices(result.data);
        setSelectedInvoice(
          new URLSearchParams(window.location.search).get("invoice") ??
            result.data[0]?.invoiceCode ??
            "",
        );
        setState("ready");
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Invoices could not be loaded.",
          );
          setState("error");
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (state === "loading") {
    return <Notice>Loading invoices for manual payment...</Notice>;
  }

  if (state === "error") {
    return <ErrorMessage message={error} />;
  }

  if (invoices.length === 0) {
    return <Notice>No invoices are available for manual payment yet.</Notice>;
  }

  return (
    <div className="grid gap-5">
      <PaymentReadinessChecklist />

      <label className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-brand-navy shadow-sm">
        Select invoice
        <select
          className="min-h-11 rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setSelectedInvoice(event.target.value)}
          value={selectedInvoice}
        >
          {invoices.map((invoice) => (
            <option key={invoice.invoiceId} value={invoice.invoiceCode}>
              {invoice.invoiceCode} | {invoice.projectCode} | {invoice.amount}
            </option>
          ))}
        </select>
      </label>
      <ManualPaymentForm defaultInvoiceCode={selectedInvoice} />
    </div>
  );
}

export function LiveRefundsOverview() {
  const [refunds, setRefunds] = useState<RefundListItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const accessToken = await getAccessToken();
        const result = await listImporterRefundsAction(accessToken);

        if (!result.ok) {
          throw new Error(result.message);
        }

        if (isMounted) {
          setRefunds(result.data);
          setState("ready");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Refunds could not be loaded.",
          );
          setState("error");
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (state === "loading") {
    return <Notice>Loading refund requests...</Notice>;
  }

  if (state === "error") {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy">Refund Policy</h2>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-brand-muted md:grid-cols-2">
          <p>
            Before FMS assignment/work starts, full refund is allowed according
            to ChinaPak ImportHub policy.
          </p>
          <p>
            After FMS assignment/work starts, refund is admin-reviewed based on
            milestones, evidence, and possible reassignment.
          </p>
        </div>
      </div>

      <Link
        className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
        href={ROUTES.refundsRequest}
      >
        Request refund
      </Link>

      {refunds.length === 0 ? (
        <Notice>No refund requests submitted yet.</Notice>
      ) : (
        refunds.map((refund) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={refund.refundId}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-emerald">
                  {refund.projectCode} | {refund.invoiceCode}
                </p>
                <h3 className="mt-1 text-xl font-bold text-brand-navy">
                  {refund.refundCode}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  {refund.reason} | Requested: {refund.requestedAmount}
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-muted">
                  {refund.warning}
                </p>
              </div>
              <StatusPill status={refund.status} />
            </div>
            <div className="mt-4">
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-navy bg-white px-3 py-2 text-xs font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
                href={`${ROUTES.refunds}/${encodeURIComponent(refund.refundCode)}/document`}
              >
                View refund document
              </Link>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

export function LiveRefundRequestForm() {
  const [invoices, setInvoices] = useState<BillingInvoiceListItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [state, setState] = useState<LoadState>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const paidInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.statusRaw === "paid"),
    [invoices],
  );

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const accessToken = await getAccessToken();
        const result = await listImporterInvoicesAction(accessToken);

        if (!result.ok) {
          throw new Error(result.message);
        }

        const queryInvoice = new URLSearchParams(window.location.search).get(
          "invoice",
        );

        if (isMounted) {
          setInvoices(result.data);
          setSelectedInvoice(
            queryInvoice ??
              result.data.find((invoice) => invoice.statusRaw === "paid")
                ?.invoiceCode ??
              "",
          );
          setState("ready");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Paid invoices could not be loaded.",
          );
          setState("error");
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  async function submitRefund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const input: RefundRequestInput = {
        explanation: String(formData.get("explanation") ?? ""),
        invoiceCode: selectedInvoice,
        preferredFollowUp: String(formData.get("preferredFollowUp") ?? ""),
        reason: String(formData.get("reason") ?? ""),
        requestedAmount: String(formData.get("requestedAmount") ?? ""),
      };
      const accessToken = await getAccessToken();
      const result = await submitRefundRequestAction(accessToken, input);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      event.currentTarget.reset();
      setMessage("Refund request submitted for admin review.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Refund request could not be submitted.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (state === "loading") {
    return <Notice>Loading paid invoices...</Notice>;
  }

  if (state === "error") {
    return <ErrorMessage message={error} />;
  }

  if (paidInvoices.length === 0) {
    return (
      <Notice>
        No paid invoices are available for refund request. Refund requests open
        after admin verifies payment.
      </Notice>
    );
  }

  return (
    <form
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={submitRefund}
    >
      <label className="grid gap-2 text-sm font-bold text-brand-navy">
        Paid invoice
        <select
          className="min-h-11 rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setSelectedInvoice(event.target.value)}
          value={selectedInvoice}
        >
          {paidInvoices.map((invoice) => (
            <option key={invoice.invoiceId} value={invoice.invoiceCode}>
              {invoice.invoiceCode} | {invoice.projectCode} | {invoice.amount}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Reason for refund"
        name="reason"
        placeholder="Payment issue, not satisfied, service not started..."
        required
      />
      <Field
        label="Requested amount (optional)"
        name="requestedAmount"
        placeholder="Leave blank for full invoice amount"
      />
      <label className="grid gap-2 text-sm font-bold text-brand-navy">
        Explanation
        <textarea
          className="min-h-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-brand-text outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
          name="explanation"
          required
        />
      </label>
      <Field
        label="Preferred follow-up method"
        name="preferredFollowUp"
        placeholder="WhatsApp, phone, portal"
      />
      <Notice>
        Before FMS assignment/work, full refund policy may apply. After FMS
        assignment/work, admin reviews milestones and may offer reassignment
        before refund.
      </Notice>
      <button
        className="min-h-12 rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Submitting..." : "Submit refund request"}
      </button>
      <ActionFeedback error={error} message={message} />
    </form>
  );
}
