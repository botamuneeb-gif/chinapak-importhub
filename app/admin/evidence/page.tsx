import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminEvidenceReviewPanel } from "@/components/files/file-panels";

export const metadata: Metadata = {
  title: "Evidence Review | ChinaPak ImportHub Admin",
  robots: { index: false, follow: false },
};

export default function AdminEvidencePage() {
  return (
    <AdminShell
      description="Review importer uploads and FMS evidence, keep private files admin-only, and release only selected safe evidence to importer reports."
      eyebrow="Admin Evidence Center"
      title="File & Evidence Review"
    >
      <AdminEvidenceReviewPanel />
    </AdminShell>
  );
}
