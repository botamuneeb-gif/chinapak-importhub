import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveAdminReportFeedbackInbox } from "@/components/admin/live-admin-report-feedback-inbox";

export const metadata: Metadata = {
  title: "Report Feedback | ChinaPak ImportHub Admin",
  robots: { index: false, follow: false },
};

export default function AdminReportFeedbackPage() {
  return (
    <AdminShell
      description="Review importer questions about released factory reports and open the linked project to respond through admin-controlled clarification."
      title="Report Feedback"
    >
      <LiveAdminReportFeedbackInbox />
    </AdminShell>
  );
}
