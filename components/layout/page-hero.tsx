import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  actions?: ReactNode;
  eyebrow?: string;
  intro: string;
  title: string;
  dir?: "ltr" | "rtl";
  lang?: string;
};

export function PageHero({
  actions,
  dir,
  eyebrow,
  intro,
  lang,
  title,
}: PageHeroProps) {
  return (
    <section className="border-b border-slate-200 bg-white" dir={dir} lang={lang}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className={cn("max-w-3xl", dir === "ltr" && "text-left")}>
          {eyebrow ? (
            <p className="mb-3 text-sm font-semibold text-brand-emerald">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-8 text-brand-muted sm:text-lg">
            {intro}
          </p>
          {actions ? <div className="mt-6 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
