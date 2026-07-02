import type { Metadata } from "next";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveAdminFmsDirectory } from "@/components/admin/live-admin-fms-directory";

export const metadata: Metadata = {
  title: "Admin FMS Directory | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AdminFmsPage() {
  return (
    <AdminShell
      description="View approved Factory Match Specialists, assignment readiness, and setup guidance. FMS assignment decisions remain admin-controlled."
      title="FMS Directory"
    >
      <div className="mb-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
        FMS accounts are invitation/admin-approved only. Public users cannot
        create FMS roles, and FMS users never receive importer contact details.
      </div>

      <AdminSectionCard title="Available FMS Profiles">
        <LiveAdminFmsDirectory />
      </AdminSectionCard>
    </AdminShell>
  );
}
