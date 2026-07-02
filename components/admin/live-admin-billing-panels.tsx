"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  listAdminManualPaymentsAction,
  listAdminRefundsAction,
  reviewManualPaymentAction,
  reviewRefundAction,
  type AdminManualPaymentItem,
  type AdminPaymentReviewInput,
  type AdminRefundItem,
  type AdminRefundReviewInput,
} from "@/app/billing/actions";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login as admin again.");
  }

  return session.access_token;
}

function AdminBillingNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-gold/40 bg-brand-gold/10 p-4 text-sm font-semibold leading-6 text-brand-navy">
      {children}
    </div>
  );
}

function AdminBillingError({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
      {message}
    </p>
  );
}

export function LiveAdminManualPaymentsPanel() {
  const [payments, setPayments] = useState<AdminManualPaymentItem[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState("");

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await listAdminManualPaymentsAction(accessToken);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setPayments(result.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Manual payment queue could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  async function reviewPayment(
    paymentId: string,
    input: AdminPaymentReviewInput,
  ) {
    setMutatingId(paymentId);
    setError("");
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await reviewManualPaymentAction(
        accessToken,
        paymentId,
        input,
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setPayments(result.data);
      setMessage("Manual payment review updated.");
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Manual payment review failed.",
      );
    } finally {
      setMutatingId("");
    }
  }

  if (isLoading) {
    return <AdminBillingNotice>Loading manual payment queue...</AdminBillingNotice>;
  }

  return (
    <div className="grid gap-4">
      <AdminBillingNotice>
        Manual payment review is the active Phase 10 payment model. Verifying a
        record updates the linked invoice and Import Project payment status, but
        no real gateway or bank verification is connected.
      </AdminBillingNotice>
      <AdminBillingError message={error} />
      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          {message}
        </p>
      ) : null}
      {payments.length === 0 ? (
        <AdminBillingNotice>No manual payment submissions yet.</AdminBillingNotice>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-brand-muted">
                <th className="px-4 py-3">Invoice / Project</th>
                <th className="px-4 py-3">Importer</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr className="border-t border-slate-200" key={payment.id}>
                  <td className="px-4 py-4">
                    <p className="font-bold text-brand-navy">
                      {payment.invoiceCode}
                    </p>
                    <p className="text-xs font-semibold text-brand-muted">
                      {payment.projectCode} | Due: {payment.totalDue}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-brand-text">
                      {payment.importerName}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {payment.city} | {payment.phoneWhatsapp}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-brand-muted">
                    <p>{payment.method}</p>
                    <p className="font-bold text-brand-text">
                      {payment.amountPaid}
                    </p>
                    <p className="text-xs">{payment.paymentDate}</p>
                  </td>
                  <td className="px-4 py-4 text-brand-muted">
                    <p className="font-semibold text-brand-text">
                      {payment.reference}
                    </p>
                    <p className="text-xs">{payment.notes || "No notes"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <AdminStatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="min-h-10 rounded-lg bg-brand-emerald px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:bg-slate-400"
                        disabled={mutatingId === payment.id}
                        onClick={() =>
                          reviewPayment(payment.id, { decision: "verify" })
                        }
                        type="button"
                      >
                        Verify
                      </button>
                      <button
                        className="min-h-10 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        disabled={mutatingId === payment.id}
                        onClick={() =>
                          reviewPayment(payment.id, {
                            decision: "needs_more_info",
                            importerMessage:
                              "Please submit clearer payment reference details.",
                          })
                        }
                        type="button"
                      >
                        Needs info
                      </button>
                      <button
                        className="min-h-10 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        disabled={mutatingId === payment.id}
                        onClick={() =>
                          reviewPayment(payment.id, {
                            decision: "reject",
                            importerMessage:
                              "Payment reference could not be verified.",
                          })
                        }
                        type="button"
                      >
                        Reject
                      </button>
                      {String(payment.status).toLowerCase() === "verified" ? (
                        <Link
                          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-navy bg-white px-3 py-2 text-xs font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
                          href={`${ROUTES.adminPayments}/${encodeURIComponent(payment.id)}/document`}
                        >
                          Document
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function LiveAdminRefundsPanel() {
  const [refunds, setRefunds] = useState<AdminRefundItem[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState("");

  const loadRefunds = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await listAdminRefundsAction(accessToken);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setRefunds(result.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Refund queue could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  async function submitReview(
    refundId: string,
    input: AdminRefundReviewInput,
  ) {
    setMutatingId(refundId);
    setError("");
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await reviewRefundAction(accessToken, refundId, input);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setRefunds(result.data);
      setMessage("Refund review updated.");
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Refund review failed.",
      );
    } finally {
      setMutatingId("");
    }
  }

  function submitPartial(
    event: FormEvent<HTMLFormElement>,
    refundId: string,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    void submitReview(refundId, {
      approvedAmount: String(formData.get("approvedAmount") ?? ""),
      customerVisibleSummary:
        "A partial refund was approved after admin milestone review.",
      decision: "approve_partial",
      internalNote: String(formData.get("internalNote") ?? ""),
    });
  }

  if (isLoading) {
    return <AdminBillingNotice>Loading refund queue...</AdminBillingNotice>;
  }

  return (
    <div className="grid gap-4">
      <AdminBillingNotice>
        Refund tracking is manual/offline. Before FMS assignment, full refund
        policy may apply. After assignment/work, admin reviews milestones and may
        offer reassignment before refund.
      </AdminBillingNotice>
      <AdminBillingError message={error} />
      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          {message}
        </p>
      ) : null}
      {refunds.length === 0 ? (
        <AdminBillingNotice>No refund requests yet.</AdminBillingNotice>
      ) : (
        refunds.map((refund) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={refund.refundId}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-emerald">
                  {refund.projectCode} | {refund.invoiceCode}
                </p>
                <h2 className="mt-1 text-xl font-bold text-brand-navy">
                  {refund.refundCode}
                </h2>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  Importer: {refund.importerName} | Reason: {refund.reason}
                </p>
                <p className="mt-2 text-sm font-semibold text-brand-muted">
                  {refund.warning}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge status={refund.status} />
                {refund.activeAssignmentCount > 0 ? (
                  <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                    {refund.activeAssignmentCount} FMS assignment
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-brand-muted md:grid-cols-3">
              <p>
                Requested amount:
                <br />
                <span className="font-bold text-brand-text">
                  {refund.requestedAmount}
                </span>
              </p>
              <p>
                Approved amount:
                <br />
                <span className="font-bold text-brand-text">
                  {refund.approvedAmount}
                </span>
              </p>
              <p>
                Latest decision:
                <br />
                <span className="font-bold text-brand-text">
                  {refund.latestDecision || "No admin decision yet"}
                </span>
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-navy bg-white px-3 py-2 text-xs font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
                href={`${ROUTES.adminRefunds}/${encodeURIComponent(refund.refundCode)}/document`}
              >
                Document
              </Link>
              <button
                className="min-h-10 rounded-lg border border-brand-navy bg-white px-3 py-2 text-xs font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:bg-slate-100"
                disabled={mutatingId === refund.refundId}
                onClick={() =>
                  submitReview(refund.refundId, { decision: "start_review" })
                }
                type="button"
              >
                Start review
              </button>
              <button
                className="min-h-10 rounded-lg border border-brand-gold bg-brand-gold/10 px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-brand-gold/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                disabled={mutatingId === refund.refundId}
                onClick={() =>
                  submitReview(refund.refundId, {
                    customerVisibleSummary:
                      "Admin may offer FMS reassignment before refund if service can be recovered.",
                    decision: "offer_reassignment",
                  })
                }
                type="button"
              >
                Offer reassignment
              </button>
              <button
                className="min-h-10 rounded-lg bg-brand-emerald px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={mutatingId === refund.refundId}
                onClick={() =>
                  submitReview(refund.refundId, {
                    customerVisibleSummary:
                      "Full refund approved by ChinaPak ImportHub admin.",
                    decision: "approve_full",
                  })
                }
                type="button"
              >
                Approve full
              </button>
              <button
                className="min-h-10 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                disabled={mutatingId === refund.refundId}
                onClick={() =>
                  submitReview(refund.refundId, {
                    customerVisibleSummary:
                      "Refund request was rejected after admin review.",
                    decision: "reject",
                  })
                }
                type="button"
              >
                Reject
              </button>
              <button
                className="min-h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-brand-text transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                disabled={mutatingId === refund.refundId}
                onClick={() =>
                  submitReview(refund.refundId, {
                    customerVisibleSummary:
                      "Refund was processed manually/offline.",
                    decision: "mark_processed",
                  })
                }
                type="button"
              >
                Mark processed
              </button>
            </div>
            <form
              className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]"
              onSubmit={(event) => submitPartial(event, refund.refundId)}
            >
              <input
                className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                name="approvedAmount"
                placeholder="Partial amount PKR"
              />
              <input
                className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                name="internalNote"
                placeholder="Internal milestone note"
              />
              <button
                className="min-h-10 rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={mutatingId === refund.refundId}
                type="submit"
              >
                Approve partial
              </button>
            </form>
          </article>
        ))
      )}
    </div>
  );
}
