import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import { homeContent } from "@/config/home";

export function HomeHero() {
  const { hero } = homeContent;

  return (
    <section
      className="urdu-text relative isolate overflow-hidden bg-brand-navy text-white"
      dir="rtl"
      lang="ur"
    >
      <Image
        alt="Pakistani importer reviewing factory-side product evidence on a laptop"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        height={1024}
        priority
        src="/images/homepage-hero.png"
        width={1792}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-navy/95 via-brand-navy/82 to-brand-navy/58 lg:bg-gradient-to-l lg:from-brand-navy/96 lg:via-brand-navy/82 lg:to-brand-navy/30" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p
            className="text-sm font-semibold text-brand-gold"
            dir="ltr"
            lang="en"
          >
            Direct China Factory Access for Pakistani Importers
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-9 text-white/90">
            {hero.subheadline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.importerStart} variant="gold">
              {hero.primaryCta}
            </Button>
            <Button href={ROUTES.verify} variant="lightOutline">
              {hero.secondaryCta}
            </Button>
          </div>

          <ul
            className="mt-8 grid gap-3 sm:grid-cols-2"
            aria-label="Trust badges"
            dir="ltr"
            lang="en"
          >
            {hero.trustBadges.map((badge) => (
              <li
                className="rounded-lg border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur"
                key={badge}
              >
                {badge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
