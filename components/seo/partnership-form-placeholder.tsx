import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";

export function PartnershipFormPlaceholder() {
  return (
    <section
      aria-label="Factory partnership inquiry status"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      dir="ltr"
      lang="en"
    >
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
        Factory accounts are invitation-only for MVP launch. Public factory
        signup is not active.
      </div>

      <h2 className="mt-6 text-2xl font-bold text-brand-navy">
        Partnership information to prepare
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          "Factory name and Chinese business name",
          "City/province and product categories",
          "Main products and production capability",
          "Contact person and official website/Alibaba link",
          "Business license and certification evidence",
          "Export interest for Pakistani buyer requests",
        ].map((item) => (
          <div
            className="rounded-lg border border-slate-200 bg-brand-background p-4 text-sm font-semibold leading-7 text-brand-muted"
            key={item}
          >
            {item}
          </div>
        ))}
      </div>

      <Button className="mt-5 w-full sm:w-auto" href={ROUTES.contact}>
        Contact ChinaPak ImportHub
      </Button>
    </section>
  );
}
