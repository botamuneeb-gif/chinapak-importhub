import type { FactoryRecord } from "@/config/factory-database";

type FactorySensitivePanelProps = {
  factory: FactoryRecord;
};

function SensitiveRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-red-200 py-3 last:border-b-0">
      <dt className="text-sm font-semibold text-brand-error">{label}</dt>
      <dd className="mt-1 text-sm leading-7 text-brand-navy">{value}</dd>
    </div>
  );
}

export function FactorySensitivePanel({ factory }: FactorySensitivePanelProps) {
  const contact = factory.sensitiveContact;

  return (
    <section className="rounded-lg border-2 border-brand-error bg-red-50 p-5 shadow-sm" id="sensitive">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-error">
            2. Sensitive Contact Information
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-navy">
            Admin-only. Never expose to importer without approved package workflow.
          </p>
        </div>
        <span className="rounded-lg bg-brand-error px-3 py-1 text-xs font-bold text-white">
          Sensitive
        </span>
      </div>

      <dl className="mt-5">
        <SensitiveRow label="Contact person" value={contact.contactPerson} />
        <SensitiveRow label="Phone" value={contact.phone} />
        <SensitiveRow label="WeChat" value={contact.wechat} />
        <SensitiveRow label="Email" value={contact.email} />
        <SensitiveRow label="Website/Alibaba link" value={contact.websiteOrAlibaba} />
        <SensitiveRow label="Exact address" value={contact.exactAddress} />
        <SensitiveRow
          label="Bank/payment notes placeholder"
          value={contact.bankPaymentNotesPlaceholder}
        />
      </dl>
    </section>
  );
}
