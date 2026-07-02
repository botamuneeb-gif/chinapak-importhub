import type { Metadata } from "next";
import { LiveImporterReportDocument } from "@/components/documents/live-document-pages";

type ImporterReportDocumentPageProps = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({
  params,
}: ImporterReportDocumentPageProps): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `${decodeURIComponent(projectId)} Factory Report Document | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function ImporterReportDocumentPage({
  params,
}: ImporterReportDocumentPageProps) {
  const { projectId } = await params;

  return (
    <main
      className="min-h-screen bg-brand-background px-4 py-8 print:bg-white print:p-0 sm:px-6 lg:px-8"
      lang="en"
    >
      <LiveImporterReportDocument projectCode={projectId} />
    </main>
  );
}
