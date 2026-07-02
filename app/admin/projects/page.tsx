import type { Metadata } from "next";
import { LiveAdminProjectsTable } from "@/components/admin/live-admin-projects-table";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin Projects | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AdminProjectsPage() {
  return (
    <AdminShell
      description="Import Project submissions appear here for payment checks, admin review, clarification, assignment preparation, and timeline inspection."
      title="Import Projects"
    >
      <LiveAdminProjectsTable />
    </AdminShell>
  );
}
