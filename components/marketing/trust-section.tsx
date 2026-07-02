import { SectionHeading } from "@/components/ui/section-heading";
import { homeContent } from "@/config/home";

export function TrustSection() {
  const { trust } = homeContent;

  return (
    <section
      className="urdu-text bg-white"
      dir="rtl"
      id="verify-us"
      lang="ur"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <SectionHeading
          eyebrow={trust.eyebrow}
          intro={trust.copy}
          title={trust.heading}
        />

        <ul className="grid gap-3 sm:grid-cols-2" dir="ltr" lang="en">
          {trust.items.map((item) => (
            <li
              className="rounded-lg border border-slate-200 bg-brand-background p-4 text-sm font-semibold text-brand-navy shadow-sm"
              key={item}
            >
              <span className="me-2 text-brand-emerald" aria-hidden="true">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

