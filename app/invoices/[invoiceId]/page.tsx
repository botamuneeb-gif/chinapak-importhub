import Link from "next/link";
import type { Metadata } from "next";
import { LiveImporterInvoiceDetail } from "@/components/payments/live-billing-panels";
import { ROUTES } from "@/config/brand";

type InvoicePageProps = {
  params: Promise<{ invoiceId: string }>;
};

export async function generateMetadata({
  params,
}: InvoicePageProps): Promise<Metadata> {
  const { invoiceId } = await params;

  return {
    title: `${decodeURIComponent(invoiceId)} | ChinaPak ImportHub Invoice`,
    robots: { index: false, follow: false },
  };
}

export default async function InvoiceDetailPage({ params }: InvoicePageProps) {
  const { invoiceId } = await params;

  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-brand-emerald">
                Professional invoice
              </p>
              <h1 className="mt-2 text-3xl font-bold text-brand-navy">
                {decodeURIComponent(invoiceId)}
              </h1>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.invoices}
            >
              Back to invoices
            </Link>
          </div>
        </section>

        <LiveImporterInvoiceDetail invoiceCode={invoiceId} />
      </div>
    </main>
  );
}

