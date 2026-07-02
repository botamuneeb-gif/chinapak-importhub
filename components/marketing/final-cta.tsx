import { Button } from "@/components/ui/button";
import { homeContent } from "@/config/home";

export function FinalCta() {
  const { finalCta } = homeContent;

  return (
    <section className="urdu-text bg-brand-navy text-white" dir="rtl" lang="ur">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16">
        <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
          {finalCta.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/82">
          {finalCta.copy}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href={finalCta.primaryHref} variant="gold">
            {finalCta.primaryCta}
          </Button>
          <Button href={finalCta.secondaryHref} variant="lightOutline">
            {finalCta.secondaryCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
