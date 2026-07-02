import { brand } from "@/config/brand";

type DocumentFooterProps = {
  disclaimer?: string;
};

export function DocumentFooter({ disclaimer }: DocumentFooterProps) {
  return (
    <footer className="mt-8 border-t border-slate-200 pt-5 text-xs leading-6 text-brand-muted">
      <p>
        {disclaimer ??
          "This document is generated from ChinaPak ImportHub platform records. Manual payment, refund, and sourcing decisions remain subject to admin review and recorded project milestones."}
      </p>
      <p className="mt-2">
        Factory contact details, raw FMS notes, private admin notes, bank details,
        passwords, tokens, and internal system identifiers are excluded unless an
        explicit future approved workflow permits release.
      </p>
      <p className="mt-2" translate="no">
        {brand.name} | {brand.domain}
      </p>
    </footer>
  );
}
