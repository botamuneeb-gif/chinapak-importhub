import { Button } from "@/components/ui/button";
import { PlaceholderNotice } from "@/components/ui/placeholder-notice";
import { ROUTES } from "@/config/brand";

type PortalPlaceholderProps = {
  audience: string;
  notes: string[];
  portalName: string;
  status: string;
  dir?: "ltr" | "rtl";
  lang?: string;
};

export function PortalPlaceholder({
  audience,
  dir = "ltr",
  lang = "en",
  notes,
  portalName,
  status,
}: PortalPlaceholderProps) {
  return (
    <main dir={dir} lang={lang}>
      <section className="bg-brand-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-brand-emerald">
              Reserved route
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
              {portalName}
            </h1>
            <p className="mt-4 text-base leading-8 text-brand-muted">
              {audience}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_0.9fr]">
            <PlaceholderNotice title={status} body="This page exists so routing, metadata, and future role protection can be added cleanly. It does not provide access to private data." />

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-brand-navy">Future scope</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-muted">
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.home}>Back to home</Button>
            <Button href={ROUTES.contact} variant="outline">
              Contact admin
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
