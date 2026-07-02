import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SeoHeroProps = {
  actions?: ReactNode;
  dir?: "ltr" | "rtl";
  eyebrow: string;
  intro: string;
  lang?: string;
  supportLine?: string;
  title: string;
};

export function SeoHero({
  actions,
  dir = "ltr",
  eyebrow,
  intro,
  lang,
  supportLine,
  title,
}: SeoHeroProps) {
  return (
    <section className="border-b border-slate-200 bg-white" dir={dir} lang={lang}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className={cn("max-w-4xl", dir === "ltr" && "text-left")}>
          <p className="text-sm font-bold text-brand-emerald">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-navy sm:text-5xl">
            {title}
          </h1>
          {supportLine ? (
            <p className="mt-4 text-lg font-semibold leading-8 text-brand-navy">
              {supportLine}
            </p>
          ) : null}
          <p className="mt-4 text-base leading-8 text-brand-muted sm:text-lg">
            {intro}
          </p>
          {actions ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
