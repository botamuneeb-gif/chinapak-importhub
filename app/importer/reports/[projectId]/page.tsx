import type { Metadata } from "next";
import { LiveImporterReportDetail } from "@/components/importer/live-importer-report-detail";

type ImporterReportDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({
  params,
}: ImporterReportDetailPageProps): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `${decodeURIComponent(projectId)} Factory Report | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function ImporterReportDetailPage({
  params,
}: ImporterReportDetailPageProps) {
  const { projectId } = await params;

  return (
    <main
      className="urdu-text min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8"
      dir="rtl"
      lang="ur"
    >
      <div className="mx-auto max-w-6xl">
        <LiveImporterReportDetail projectCode={projectId} />
      </div>
    </main>
  );
}
