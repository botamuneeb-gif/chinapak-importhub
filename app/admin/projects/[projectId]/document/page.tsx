import type { Metadata } from "next";
import { LiveAdminProjectSummaryDocument } from "@/components/documents/live-document-pages";

type AdminProjectDocumentPageProps = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({
  params,
}: AdminProjectDocumentPageProps): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `${decodeURIComponent(projectId)} Admin Project Document | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminProjectDocumentPage({
  params,
}: AdminProjectDocumentPageProps) {
  const { projectId } = await params;

  return (
    <main className="document-standalone min-h-screen bg-brand-background px-4 py-8 print:bg-white print:p-0 sm:px-6 lg:px-8">
      <LiveAdminProjectSummaryDocument projectCode={projectId} />
    </main>
  );
}
