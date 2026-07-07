import type { Metadata } from "next";
import { LiveProjectManagerProjectDetail } from "@/components/project-manager/live-project-manager-project-detail";

type ProjectManagerProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({
  params,
}: ProjectManagerProjectDetailPageProps): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `${decodeURIComponent(projectId)} | Project Manager`,
    robots: { index: false, follow: false },
  };
}

export default async function ProjectManagerProjectDetailPage({
  params,
}: ProjectManagerProjectDetailPageProps) {
  const { projectId } = await params;

  return <LiveProjectManagerProjectDetail projectCode={projectId} />;
}
