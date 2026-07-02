import type { ReactNode } from "react";
import { DocumentFooter } from "@/components/documents/document-footer";
import { DocumentHeader } from "@/components/documents/document-header";
import type { DocumentStatusTone } from "@/app/documents/actions";

type DocumentShellProps = {
  children: ReactNode;
  disclaimer?: string;
  documentId: string;
  eyebrow: string;
  projectCode: string;
  status: string;
  statusTone?: DocumentStatusTone;
  title: string;
};

export function DocumentShell({
  children,
  disclaimer,
  documentId,
  eyebrow,
  projectCode,
  status,
  statusTone,
  title,
}: DocumentShellProps) {
  return (
    <article className="document-page mx-auto max-w-[980px] bg-white p-5 text-brand-text shadow-sm ring-1 ring-slate-200 print:max-w-none print:p-0 print:shadow-none print:ring-0 sm:p-8">
      <DocumentHeader
        documentId={documentId}
        eyebrow={eyebrow}
        projectCode={projectCode}
        status={status}
        statusTone={statusTone}
        title={title}
      />
      <div className="mt-6 space-y-6">{children}</div>
      <DocumentFooter disclaimer={disclaimer} />
    </article>
  );
}
