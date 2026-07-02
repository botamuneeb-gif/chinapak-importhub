import type { Metadata } from "next";
import { LivePaymentConfirmationDocument } from "@/components/documents/live-document-pages";

type PaymentDocumentPageProps = {
  params: Promise<{ paymentId: string }>;
};

export async function generateMetadata({
  params,
}: PaymentDocumentPageProps): Promise<Metadata> {
  const { paymentId } = await params;

  return {
    title: `${decodeURIComponent(paymentId)} Payment Confirmation | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function PaymentDocumentPage({
  params,
}: PaymentDocumentPageProps) {
  const { paymentId } = await params;

  return (
    <main className="document-standalone min-h-screen bg-brand-background px-4 py-8 print:bg-white print:p-0 sm:px-6 lg:px-8">
      <LivePaymentConfirmationDocument paymentId={paymentId} />
    </main>
  );
}
