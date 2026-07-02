import { SectionHeading } from "@/components/ui/section-heading";
import { homeContent } from "@/config/home";

export function HowItWorks() {
  const { howItWorks } = homeContent;

  return (
    <section
      className="urdu-text bg-brand-background"
      dir="rtl"
      id="how-it-works"
      lang="ur"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionHeading
          eyebrow={howItWorks.eyebrow}
          intro={howItWorks.intro}
          title={howItWorks.heading}
        />

        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <li
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={step}
            >
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy text-lg font-bold text-white"
                dir="ltr"
                translate="no"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold leading-9 text-brand-navy">
                {step}
              </h3>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

