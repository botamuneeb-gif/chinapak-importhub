import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { LiveFactorySubmissionDetail } from "@/components/admin/live-factory-submission-detail";

type AdminFactorySubmissionDetailPageProps = {
  params: Promise<{ submissionId: string }>;
};

export const metadata: Metadata = {
  title: "Factory Submission Review | ChinaPak ImportHub Admin",
  robots: { index: false, follow: false },
};

export default async function AdminFactorySubmissionDetailPage({
  params,
}: AdminFactorySubmissionDetailPageProps) {
  const { submissionId } = await params;

  return (
    <AdminShell
      description="Review importer-safe summary, admin-only factory contact details, risk notes, and private factory database linkage."
      title={`Factory Submission Review: ${decodeURIComponent(submissionId)}`}
    >
      <LiveFactorySubmissionDetail submissionId={submissionId} />
    </AdminShell>
  );
}
