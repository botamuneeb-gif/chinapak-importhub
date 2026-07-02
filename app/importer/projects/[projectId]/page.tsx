import type { Metadata } from "next";
import { LiveImporterProjectDetail } from "@/components/importer/live-importer-project-detail";

type ImporterProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function generateMetadata({
  params,
}: ImporterProjectDetailPageProps): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `${decodeURIComponent(projectId)} Project Tracking | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function ImporterProjectDetailPage({
  params,
}: ImporterProjectDetailPageProps) {
  const { projectId } = await params;

  return (
    <main
      className="urdu-text min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8"
      dir="rtl"
      lang="ur"
    >
      <div className="mx-auto max-w-6xl">
        <LiveImporterProjectDetail projectCode={projectId} />
      </div>
    </main>
  );
}
