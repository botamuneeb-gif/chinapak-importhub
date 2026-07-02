import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ROUTES } from "@/config/brand";

const paths = [
  {
    title: "Pakistani importers",
    body: "Start an Import Project ID, describe the product, and prepare for admin-reviewed factory options.",
    href: ROUTES.importerStart,
    action: "Start project",
  },
  {
    title: "Chinese FMS candidates",
    body: "Apply for a future Factory Match Specialist role with platform-controlled communication rules.",
    href: ROUTES.fms,
    action: "View FMS page",
  },
  {
    title: "Admin contact",
    body: "Use a controlled contact route for project questions, partnership interest, and future onboarding.",
    href: ROUTES.contact,
    action: "Contact",
  },
];

export function AudiencePaths() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="Three audiences"
          intro="The platform foundation is prepared for importer, FMS, and factory-facing content while keeping private operational data protected."
          title="ہر audience کے لیے الگ راستہ"
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3" dir="ltr" lang="en">
          {paths.map((path) => (
            <article
              className="flex flex-col rounded-lg border border-slate-200 bg-brand-background p-5 shadow-sm"
              key={path.title}
            >
              <h3 className="text-xl font-bold text-brand-navy">{path.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-brand-muted">
                {path.body}
              </p>
              <Button className="mt-5" href={path.href} variant="outline">
                {path.action}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
