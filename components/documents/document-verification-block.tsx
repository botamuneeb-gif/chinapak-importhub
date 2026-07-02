import type { DocumentVerification } from "@/app/documents/actions";
import { QrCode } from "@/components/qr/qr-code";

type DocumentVerificationBlockProps = {
  verification: DocumentVerification;
};

export function DocumentVerificationBlock({
  verification,
}: DocumentVerificationBlockProps) {
  return (
    <section className="document-avoid-break rounded-lg border border-slate-300 bg-slate-50 p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_132px] md:items-center">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-brand-navy">
            Document Verification
          </h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-bold text-brand-muted">Document ID</dt>
              <dd className="mt-1 font-semibold text-brand-text" translate="no">
                {verification.documentId}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-brand-muted">Project ID</dt>
              <dd className="mt-1 font-semibold text-brand-text" translate="no">
                {verification.projectCode}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-brand-muted">Generated</dt>
              <dd className="mt-1 font-semibold text-brand-text">
                {verification.generatedAt}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-brand-muted">Status</dt>
              <dd className="mt-1 font-semibold text-brand-text">
                {verification.status}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs font-semibold leading-5 text-brand-muted">
            {verification.verificationNote}
          </p>
          <p className="mt-1 break-all text-xs font-semibold text-brand-muted" translate="no">
            {verification.verificationUrl}
          </p>
        </div>
        <div className="grid justify-items-center gap-2">
          <QrCode
            label={`Scan to verify document reference ${verification.documentId}`}
            size={132}
            value={verification.verificationUrl}
          />
          <p className="max-w-32 text-center text-[11px] font-bold leading-4 text-brand-muted">
            Scan to verify this document reference
          </p>
        </div>
      </div>
    </section>
  );
}
