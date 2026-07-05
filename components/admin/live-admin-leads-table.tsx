"use client";

import { useEffect, useState } from "react";
import {
  listAdminUnpaidLeadsAction,
  type AdminLiveLeadListItem,
} from "@/app/admin/projects/actions";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminTable } from "@/components/admin/admin-table";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const columns = [
  "Lead ID",
  "Lead Type",
  "Name",
  "City",
  "Contact For Admin Only",
  "Product / Categories",
  "Package / Review Track",
  "Reason / Experience Notes",
  "Created Date",
  "Lead Status",
];

export function LiveAdminLeadsTable() {
  const [leads, setLeads] = useState<AdminLiveLeadListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Please login as an admin to view unpaid leads.");
            setIsLoading(false);
          }
          return;
        }

        const result = await listAdminUnpaidLeadsAction(session.access_token);

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setLeads(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Live lead loading is not configured yet.",
        );
        setIsLoading(false);
      }
    }

    void loadLeads();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading live unpaid leads from Supabase...
      </div>
    );
  }

  if (message) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        {message}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <AdminTable columns={columns} label="Live unpaid leads">
        {leads.length === 0 ? (
          <tr>
            <td className="px-4 py-8 text-center text-brand-muted" colSpan={columns.length}>
              No unpaid leads have been saved yet.
            </td>
          </tr>
        ) : (
          leads.map((lead) => (
            <tr className="align-top hover:bg-brand-background" key={lead.id}>
              <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                {lead.leadCode}
              </td>
              <td className="whitespace-nowrap px-4 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    lead.isFmsApplication
                      ? "bg-emerald-50 text-brand-emerald"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {lead.leadTypeLabel}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-brand-text">
                {lead.importerName}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                {lead.city}
              </td>
              <td className="min-w-48 px-4 py-4 text-brand-muted">
                {lead.contactForAdminOnly}
              </td>
              <td className="min-w-44 px-4 py-4 text-brand-text">
                {lead.product}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                {lead.packageSelected}
              </td>
              <td className="min-w-56 px-4 py-4 text-brand-muted">
                {lead.paymentIssue}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                {lead.createdDate}
              </td>
              <td className="px-4 py-4">
                <AdminStatusBadge status={lead.leadStatus} />
                <span className="mt-2 block rounded-lg border border-brand-gold bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                  {lead.isFmsApplication
                    ? "Application only - not an FMS account"
                    : "Unpaid lead - not assignable to FMS"}
                </span>
                <span className="mt-2 block text-xs leading-5 text-brand-muted">
                  {lead.adminReviewNote}
                </span>
              </td>
            </tr>
          ))
        )}
      </AdminTable>

      <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy shadow-sm">
        Lead conversion workflow will be added after launch. For MVP launch,
        unpaid leads remain admin follow-up records and are not assignable to FMS.
      </div>
    </div>
  );
}
