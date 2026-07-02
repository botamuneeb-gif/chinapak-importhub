"use client";

import { useEffect, useState } from "react";
import {
  listAdminUnpaidLeadsAction,
  type AdminLiveLeadListItem,
} from "@/app/admin/projects/actions";
import { AdminActionPanel } from "@/components/admin/admin-action-panel";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminTable } from "@/components/admin/admin-table";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const columns = [
  "Lead ID",
  "Importer Name",
  "City",
  "Contact For Admin Only",
  "Product",
  "Package Selected",
  "Reason Payment Was Not Completed",
  "Created Date",
  "Lead Status",
  "Action",
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
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
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
                  Unpaid lead - not assignable to FMS
                </span>
              </td>
              <td className="min-w-64 px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Mark Contact Attempted",
                    "Send Payment Help Placeholder",
                    "Assign Local Agent Placeholder",
                    "Close Lead",
                  ].map((action) => (
                    <button
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-brand-navy opacity-70"
                      disabled
                      key={action}
                      type="button"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>

      <AdminActionPanel
        actions={[
          "Mark Contact Attempted",
          "Send Payment Help Placeholder",
          "Assign Local Agent Placeholder",
          "Convert to Paid Project Placeholder",
          "Close Lead",
        ]}
        note="Lead actions remain placeholders. Conversion can only happen later after verified payment and admin review."
        title="Lead Detail Actions"
      />
    </div>
  );
}
