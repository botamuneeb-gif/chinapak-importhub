import { InvoiceLineItemTable } from "@/components/payments/invoice-line-item-table";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { brand } from "@/config/brand";
import type { InvoiceRecord } from "@/config/payments";

type InvoiceDocumentProps = {
  invoice: InvoiceRecord;
};

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 text-sm leading-6 text-brand-text">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  return (
    <article className="bg-white p-5 text-brand-text shadow-sm ring-1 ring-slate-200 print:shadow-none print:ring-0 sm:p-8">
      <header className="border-b-4 border-brand-gold pb-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-2xl font-bold text-brand-navy">{brand.name}</p>
            <p className="mt-1 text-sm text-brand-muted">{brand.domain}</p>
          </div>
          <div className="text-left sm:text-right">
            <h1 className="text-3xl font-bold text-brand-navy">Invoice</h1>
            <div className="mt-3">
              <PaymentStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-bold text-brand-navy">Invoice ID</dt>
            <dd className="mt-1 text-brand-text">{invoice.invoiceId}</dd>
          </div>
          <div>
            <dt className="font-bold text-brand-navy">Document ID</dt>
            <dd className="mt-1 text-brand-text">{invoice.documentId}</dd>
          </div>
          <div>
            <dt className="font-bold text-brand-navy">Project ID</dt>
            <dd className="mt-1 text-brand-text">{invoice.projectId}</dd>
          </div>
          <div>
            <dt className="font-bold text-brand-navy">Issue date</dt>
            <dd className="mt-1 text-brand-text">{invoice.issueDate}</dd>
          </div>
        </dl>
      </header>

      <section className="grid gap-6 border-b border-slate-200 py-6 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">
            Company details
          </h2>
          <div className="mt-3">
            <DetailList items={invoice.companyDetailsPlaceholder} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">
            Customer details
          </h2>
          <div className="mt-3">
            <DetailList items={invoice.customerDetailsPlaceholder} />
          </div>
        </div>
      </section>

      <section className="py-6">
        <InvoiceLineItemTable items={invoice.lineItems} />
      </section>

      <section className="grid gap-6 border-t border-slate-200 pt-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">
              Payment details
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="font-semibold text-brand-navy">Method</dt>
                <dd className="text-brand-muted">{invoice.paymentMethod}</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-navy">
                  Transaction/reference ID
                </dt>
                <dd className="text-brand-muted">
                  {invoice.transactionReferencePlaceholder}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-navy">Support contact</dt>
                <dd className="text-brand-muted">
                  {invoice.supportContactPlaceholder}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">
              QR verification
            </h2>
            <div className="mt-3 flex aspect-square max-w-36 items-center justify-center border border-dashed border-slate-400 bg-slate-50 p-4 text-center text-xs font-bold text-brand-muted">
              QR verification placeholder
            </div>
          </div>
        </div>

        <dl className="space-y-3 border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand-navy">Subtotal</dt>
            <dd>{invoice.subtotal}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand-navy">Discount</dt>
            <dd>{invoice.discountPlaceholder}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-brand-navy">Tax</dt>
            <dd>{invoice.taxPlaceholder}</dd>
          </div>
          <div className="border-t border-slate-300 pt-3">
            <div className="flex justify-between gap-4 text-lg font-bold text-brand-navy">
              <dt>Total paid/due</dt>
              <dd>{invoice.totalPaidOrDue}</dd>
            </div>
          </div>
        </dl>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-5 text-xs leading-6 text-brand-muted">
        <p>{invoice.legalRefundNote}</p>
        <p className="mt-2">
          This document is a frontend placeholder prepared for future verified
          invoice generation, QR validation, and audit logging.
        </p>
      </footer>
    </article>
  );
}
