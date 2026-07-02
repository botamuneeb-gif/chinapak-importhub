import { DocumentStatusStamp } from "@/components/documents/document-status-stamp";
import { brand } from "@/config/brand";
import type { DocumentStatusTone } from "@/app/documents/actions";

type DocumentHeaderProps = {
  documentId: string;
  eyebrow: string;
  projectCode: string;
  status: string;
  statusTone?: DocumentStatusTone;
  title: string;
};

export function DocumentHeader({
  documentId,
  eyebrow,
  projectCode,
  status,
  statusTone = "neutral",
  title,
}: DocumentHeaderProps) {
  return (
    <header className="document-avoid-break border-b-4 border-brand-gold pb-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-brand-navy">
            {title}
          </h1>
          <p className="mt-3 text-sm font-semibold text-brand-muted">
            {brand.tagline}
          </p>
          <p className="urdu-text mt-2 text-sm text-brand-navy" dir="rtl" lang="ur">
            {brand.urduLine}
          </p>
        </div>
        <div className="space-y-3 text-left sm:text-right">
          <p className="text-2xl font-black text-brand-navy" translate="no">
            {brand.name}
          </p>
          <p className="text-sm font-semibold text-brand-muted" translate="no">
            {brand.domain}
          </p>
          <DocumentStatusStamp label={status} tone={statusTone} />
        </div>
      </div>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-bold text-brand-muted">Document ID</dt>
          <dd className="mt-1 font-bold text-brand-text" translate="no">
            {documentId}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-brand-muted">Project ID</dt>
          <dd className="mt-1 font-bold text-brand-text" translate="no">
            {projectCode}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-brand-muted">Company</dt>
          <dd className="mt-1 font-bold text-brand-text" translate="no">
            {brand.name}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-brand-muted">Domain</dt>
          <dd className="mt-1 font-bold text-brand-text" translate="no">
            {brand.domain}
          </dd>
        </div>
      </dl>
    </header>
  );
}
