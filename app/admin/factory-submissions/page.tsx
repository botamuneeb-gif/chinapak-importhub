import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveFactorySubmissionsTable } from "@/components/admin/live-factory-submissions-table";

export const metadata: Metadata = {
  title: "FMS Factory Submissions | ChinaPak ImportHub Admin",
  robots: { index: false, follow: false },
};

export default function AdminFactorySubmissionsPage() {
  return (
    <AdminShell
      description="Review FMS-submitted factory options before anything can become importer-facing. Factory contact details remain admin-only."
      title="FMS Factory Submissions"
    >
      <div className="mb-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
        FMS submissions are internal review records. They are not visible to
        importers until a future admin-approved release workflow is connected.
      </div>
      <LiveFactorySubmissionsTable />
    </AdminShell>
  );
}
