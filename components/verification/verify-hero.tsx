import type { ReactNode } from "react";

type VerifyHeroProps = {
  actions?: ReactNode;
  englishSupport: string;
  headline: string;
};

export function VerifyHero({ actions, englishSupport, headline }: VerifyHeroProps) {
  return (
    <section className="border-b border-slate-200 bg-white" dir="rtl" lang="ur">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-brand-emerald">
            ChinaPak ImportHub Verification
          </p>
          <h1 className="text-3xl font-bold leading-tight text-brand-navy sm:text-4xl">
            {headline}
          </h1>
          <p className="mt-4 text-base leading-8 text-brand-muted sm:text-lg" dir="ltr" lang="en">
            {englishSupport}
          </p>
          {actions ? <div className="mt-6 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
