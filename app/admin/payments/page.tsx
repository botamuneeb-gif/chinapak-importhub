import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveAdminManualPaymentsPanel } from "@/components/admin/live-admin-billing-panels";

export const metadata: Metadata = {
  title: "Manual Payment Review | ChinaPak ImportHub Admin",
  robots: { index: false, follow: false },
};

export default function AdminPaymentsPage() {
  return (
    <AdminShell
      description="Review importer-submitted manual payment references, verify or reject them, and keep FMS assignment blocked until payment and admin review gates are complete."
      eyebrow="Admin Billing Center"
      title="Manual Payment Review"
    >
      <LiveAdminManualPaymentsPanel />
    </AdminShell>
  );
}

