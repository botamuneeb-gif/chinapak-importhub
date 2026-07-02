import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveAdminRefundsPanel } from "@/components/admin/live-admin-billing-panels";

export const metadata: Metadata = {
  title: "Refund Review | ChinaPak ImportHub Admin",
  robots: { index: false, follow: false },
};

export default function AdminRefundsPage() {
  return (
    <AdminShell
      description="Review importer refund requests, document reassignment options, approve full or partial refunds, and mark manual refunds processed."
      eyebrow="Admin Billing Center"
      title="Refund Review"
    >
      <LiveAdminRefundsPanel />
    </AdminShell>
  );
}

