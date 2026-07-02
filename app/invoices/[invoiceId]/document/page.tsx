import type { Metadata } from "next";
import { LiveInvoiceDocument } from "@/components/documents/live-document-pages";

type InvoiceDocumentPageProps = {
  params: Promise<{ invoiceId: string }>;
};

export async function generateMetadata({
  params,
}: InvoiceDocumentPageProps): Promise<Metadata> {
  const { invoiceId } = await params;

  return {
    title: `${decodeURIComponent(invoiceId)} Invoice Document | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function InvoiceDocumentPage({
  params,
}: InvoiceDocumentPageProps) {
  const { invoiceId } = await params;

  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 print:bg-white print:p-0 sm:px-6 lg:px-8">
      <LiveInvoiceDocument invoiceId={invoiceId} />
    </main>
  );
}
