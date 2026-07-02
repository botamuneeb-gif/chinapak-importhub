import type { Metadata } from "next";
import { LiveInvoiceDocument } from "@/components/documents/live-document-pages";
import { ROUTES } from "@/config/brand";

type AdminInvoiceDocumentPageProps = {
  params: Promise<{ invoiceId: string }>;
};

export async function generateMetadata({
  params,
}: AdminInvoiceDocumentPageProps): Promise<Metadata> {
  const { invoiceId } = await params;

  return {
    title: `${decodeURIComponent(invoiceId)} Admin Invoice Document | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminInvoiceDocumentPage({
  params,
}: AdminInvoiceDocumentPageProps) {
  const { invoiceId } = await params;

  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 print:bg-white print:p-0 sm:px-6 lg:px-8">
      <LiveInvoiceDocument
        backHref={ROUTES.adminPayments}
        backLabel="Back to admin payments"
        invoiceId={invoiceId}
      />
    </main>
  );
}
