import type { Metadata } from "next";
import { LiveAdminProjectDetail } from "@/components/admin/live-admin-project-detail";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `${decodeURIComponent(projectId)} Admin Review | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;

  return <LiveAdminProjectDetail projectCode={projectId} />;
}
