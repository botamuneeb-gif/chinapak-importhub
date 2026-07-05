import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveAdminLeadsTable } from "@/components/admin/live-admin-leads-table";

export const metadata: Metadata = {
  title: "Admin Leads & FMS Applications | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AdminLeadsPage() {
  return (
    <AdminShell
      description="Review unpaid importer leads and public FMS applications. These records are not active sourcing projects."
      title="Leads & FMS Applications"
    >
      <div className="mb-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Lead review rule</h2>
        <p className="mt-2 text-sm leading-7">
          Unpaid importer leads and public FMS applications are review records.
          They must not be assigned to sourcing work until the correct payment,
          admin approval, role, and profile setup steps are completed.
        </p>
      </div>

      <LiveAdminLeadsTable />
    </AdminShell>
  );
}
