import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveAdminLeadsTable } from "@/components/admin/live-admin-leads-table";

export const metadata: Metadata = {
  title: "Admin Unpaid Leads | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AdminLeadsPage() {
  return (
    <AdminShell
      description="Follow up with users who saved an Import Project draft without payment. These leads are not active sourcing projects."
      title="Unpaid Leads"
    >
      <div className="mb-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Unpaid lead rule</h2>
        <p className="mt-2 text-sm leading-7">
          Unpaid leads are not Import Projects in active sourcing. They must not
          be assigned to an FMS until payment is completed and admin review is
          done.
        </p>
      </div>

      <LiveAdminLeadsTable />
    </AdminShell>
  );
}
