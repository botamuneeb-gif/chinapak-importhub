"use client";

import { useEffect, useState } from "react";
import {
  listAdminFmsDirectoryAction,
  type AdminFmsDirectoryItem,
} from "@/app/admin/fms/actions";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminTable } from "@/components/admin/admin-table";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const columns = [
  "FMS Code",
  "Name",
  "Tier",
  "Languages",
  "Specialties",
  "City/Province",
  "Quality",
  "Status",
  "Assignments",
] as const;

export function LiveAdminFmsDirectory() {
  const [items, setItems] = useState<AdminFmsDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadFmsProfiles() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Please login as an admin to view FMS profiles.");
            setIsLoading(false);
          }
          return;
        }

        const result = await listAdminFmsDirectoryAction(session.access_token);

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setItems(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Live FMS directory loading is not configured yet.",
        );
        setIsLoading(false);
      }
    }

    void loadFmsProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading live FMS profiles from Supabase...
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

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">No FMS profiles found</h2>
        <p className="mt-2">
          Create a test FMS manually in Supabase: add an auth user, create a
          `user_profiles` row, add an active `fms` role assignment, then create
          an active `fms_profiles` row with tier, code, location, and
          categories. Public FMS self-registration remains disabled.
        </p>
      </div>
    );
  }

  return (
    <AdminTable columns={[...columns]} label="Live FMS directory">
      {items.map((item) => (
        <tr className="align-top hover:bg-brand-background" key={item.fmsProfileId}>
          <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
            {item.fmsCode}
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-brand-text">
            {item.displayName}
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
            {item.tier}
          </td>
          <td className="min-w-40 px-4 py-4 text-brand-muted">
            {item.languages}
          </td>
          <td className="min-w-56 px-4 py-4 text-brand-muted">
            {item.specialties}
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
            {item.cityProvince}
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
            {item.qualityScore}
          </td>
          <td className="px-4 py-4">
            <AdminStatusBadge status={item.status} />
          </td>
          <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
            {item.assignmentCount}
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
