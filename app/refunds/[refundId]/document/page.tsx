import type { Metadata } from "next";
import { LiveRefundDecisionDocument } from "@/components/documents/live-document-pages";

type RefundDocumentPageProps = {
  params: Promise<{ refundId: string }>;
};

export async function generateMetadata({
  params,
}: RefundDocumentPageProps): Promise<Metadata> {
  const { refundId } = await params;

  return {
    title: `${decodeURIComponent(refundId)} Refund Document | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function RefundDocumentPage({
  params,
}: RefundDocumentPageProps) {
  const { refundId } = await params;

  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 print:bg-white print:p-0 sm:px-6 lg:px-8">
      <LiveRefundDecisionDocument refundId={refundId} />
    </main>
  );
}
