import type { Metadata } from "next";
import { LivePaymentConfirmationDocument } from "@/components/documents/live-document-pages";
import { ROUTES } from "@/config/brand";

type AdminPaymentDocumentPageProps = {
  params: Promise<{ paymentId: string }>;
};

export async function generateMetadata({
  params,
}: AdminPaymentDocumentPageProps): Promise<Metadata> {
  const { paymentId } = await params;

  return {
    title: `${decodeURIComponent(paymentId)} Admin Payment Document | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminPaymentDocumentPage({
  params,
}: AdminPaymentDocumentPageProps) {
  const { paymentId } = await params;

  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 print:bg-white print:p-0 sm:px-6 lg:px-8">
      <LivePaymentConfirmationDocument
        backHref={ROUTES.adminPayments}
        backLabel="Back to admin payments"
        paymentId={paymentId}
      />
    </main>
  );
}
