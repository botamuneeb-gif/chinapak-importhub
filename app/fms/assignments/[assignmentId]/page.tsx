import type { Metadata } from "next";
import { FmsShell } from "@/components/fms/fms-shell";
import { LiveFmsAssignmentDetail } from "@/components/fms/live-fms-assignment-detail";

type AssignmentDetailPageProps = {
  params: Promise<{ assignmentId: string }>;
};

export async function generateMetadata({
  params,
}: AssignmentDetailPageProps): Promise<Metadata> {
  const { assignmentId } = await params;

  return {
    title: `${assignmentId} Workspace | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function FmsAssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const { assignmentId } = await params;

  return (
    <FmsShell
      description="Prepare factory options, quotations, evidence, and admin-only notes. Importer contact details are hidden."
      title={`Assignment Workspace: ${decodeURIComponent(assignmentId)}`}
    >
      <LiveFmsAssignmentDetail assignmentCode={assignmentId} />
    </FmsShell>
  );
}
