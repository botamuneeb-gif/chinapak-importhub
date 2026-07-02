import { Button } from "@/components/ui/button";

const fields = [
  { id: "factory-name", label: "Factory name" },
  { id: "chinese-business-name", label: "Chinese business name" },
  { id: "city-province", label: "City/province" },
  { id: "product-categories", label: "Product categories" },
  { id: "contact-person", label: "Contact person" },
  { id: "phone-wechat", label: "Phone/WeChat" },
  { id: "website-link", label: "Website/Alibaba link" },
] as const;

export function PartnershipFormPlaceholder() {
  return (
    <form
      aria-label="Factory partnership inquiry placeholder"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      dir="ltr"
      lang="en"
    >
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
        Factory accounts are not publicly active in Phase 1. This form is a
        partnership inquiry placeholder only.
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <label
            className="block text-sm font-semibold text-brand-navy"
            htmlFor={field.id}
            key={field.id}
          >
            {field.label}
            <input
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-brand-muted"
              disabled
              id={field.id}
              placeholder="Future input"
              type="text"
            />
          </label>
        ))}
      </div>

      <label
        className="mt-4 block text-sm font-semibold text-brand-navy"
        htmlFor="partnership-interest"
      >
        Partnership interest
        <textarea
          className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-brand-muted"
          disabled
          id="partnership-interest"
          placeholder="Future inquiry details"
        />
      </label>

      <Button className="mt-5 w-full sm:w-auto" disabled type="button">
        Submit inquiry placeholder
      </Button>
    </form>
  );
}
