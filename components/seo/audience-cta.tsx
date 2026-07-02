import { Button } from "@/components/ui/button";

type AudienceCtaProps = {
  body: string;
  dir?: "ltr" | "rtl";
  lang?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
};

export function AudienceCta({
  body,
  dir = "ltr",
  lang,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
}: AudienceCtaProps) {
  return (
    <section className="bg-white" dir={dir} lang={lang}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-lg bg-brand-navy p-6 text-white shadow-sm sm:p-8">
          <h2 className="text-3xl font-bold leading-tight">{title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
            {body}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={primaryHref} variant="gold">
              {primaryLabel}
            </Button>
            {secondaryHref && secondaryLabel ? (
              <Button href={secondaryHref} variant="lightOutline">
                {secondaryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
