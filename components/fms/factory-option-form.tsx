import type { FmsAssignment } from "@/config/fms-portal";

type FactoryOptionFormProps = {
  assignment: FmsAssignment;
};

const fieldLabels = [
  "Factory display code/name",
  "Chinese business name",
  "City/province",
  "Product category",
  "Main products",
  "MOQ",
  "Price range",
  "Production time",
  "Certifications",
] as const;

function fieldValue(
  label: (typeof fieldLabels)[number],
  option?: FmsAssignment["factoryOptions"][number],
) {
  if (!option) {
    return "";
  }

  const values = {
    "Factory display code/name": option.displayCode,
    "Chinese business name": option.chineseBusinessName,
    "City/province": option.cityProvince,
    "Product category": option.productCategory,
    "Main products": option.mainProducts,
    MOQ: option.moq,
    "Price range": option.priceRange,
    "Production time": option.productionTime,
    Certifications: option.certifications,
  };

  return values[label];
}

export function FactoryOptionForm({ assignment }: FactoryOptionFormProps) {
  const option = assignment.factoryOptions[0];

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {fieldLabels.map((label) => {
          const fieldId = label
            .toLowerCase()
            .replaceAll(" ", "-")
            .replaceAll("/", "-");

          return (
            <div key={label}>
              <label
                className="block text-sm font-semibold text-brand-navy"
                htmlFor={fieldId}
              >
                {label}
              </label>
              <input
                className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-brand-muted"
                id={fieldId}
                placeholder={`${label} placeholder`}
                readOnly
                value={fieldValue(label, option)}
              />
            </div>
          );
        })}

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-brand-navy" htmlFor="factory-notes">
            Factory notes
          </label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-brand-muted"
            id="factory-notes"
            placeholder="Factory notes placeholder"
            readOnly
            rows={3}
            value={option?.factoryNotes ?? ""}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-brand-navy" htmlFor="verification-notes">
            Verification evidence notes
          </label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-brand-muted"
            id="verification-notes"
            placeholder="Evidence notes placeholder"
            readOnly
            rows={3}
            value={option?.verificationEvidenceNotes ?? ""}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-brand-navy" htmlFor="admin-only-contact">
            Contact details field marked admin-only
          </label>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-brand-gold bg-amber-50 px-4 text-brand-navy"
            id="admin-only-contact"
            readOnly
            value={option?.contactDetailsAdminOnly ?? "Admin-only contact placeholder"}
          />
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
        Factory contact details are admin-only and are never shown directly to
        importer unless admin approves according to package workflow.
      </div>
    </div>
  );
}
