import type { Metadata } from "next";
import { LiveRefundDecisionDocument } from "@/components/documents/live-document-pages";
import { ROUTES } from "@/config/brand";

type AdminRefundDocumentPageProps = {
  params: Promise<{ refundId: string }>;
};

export async function generateMetadata({
  params,
}: AdminRefundDocumentPageProps): Promise<Metadata> {
  const { refundId } = await params;

  return {
    title: `${decodeURIComponent(refundId)} Admin Refund Document | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminRefundDocumentPage({
  params,
}: AdminRefundDocumentPageProps) {
  const { refundId } = await params;

  return (
    <main className="document-standalone min-h-screen bg-brand-background px-4 py-8 print:bg-white print:p-0 sm:px-6 lg:px-8">
      <LiveRefundDecisionDocument
        backHref={ROUTES.adminRefunds}
        backLabel="Back to admin refunds"
        refundId={refundId}
      />
    </main>
  );
}
