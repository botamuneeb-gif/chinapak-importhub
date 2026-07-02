import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveAdminRepresentatives } from "@/components/admin/live-admin-representatives";

export const metadata: Metadata = {
  title: "Representative Verification | ChinaPak ImportHub Admin",
  robots: { index: false, follow: false },
};

export default function AdminRepresentativesPage() {
  return (
    <AdminShell
      description="Create and manage public-safe representative verification codes for offline Pakistani local representatives. Public lookup never exposes private contact, CNIC, address, banking, or internal note details."
      eyebrow="Admin Trust Center"
      title="Representatives"
    >
      <LiveAdminRepresentatives />
    </AdminShell>
  );
}
