import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    title: "Import Project ID",
    body: "Every inquiry starts with one project reference so admin, payment, FMS assignment, and evidence can stay organized later.",
  },
  {
    title: "Admin-reviewed factory options",
    body: "Factory database access remains internal and private while the platform prepares suitable options for importer review.",
  },
  {
    title: "Factory-side evidence",
    body: "Photos, videos, and milestone notes are designed to flow through admin-controlled project updates before shipment.",
  },
];

export function ProjectProcess() {
  return (
    <section className="bg-brand-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="Controlled workflow"
          intro="The first version keeps the business boundaries clear: no direct importer-FMS messaging and no private contact exchange."
          title="درآمدی پروجیکٹ کیسے منظم ہوگا"
        />

        <ol className="mt-8 grid gap-4 md:grid-cols-3" dir="ltr" lang="en">
          {steps.map((step, index) => (
            <li
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={step.title}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy text-base font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold text-brand-navy">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
