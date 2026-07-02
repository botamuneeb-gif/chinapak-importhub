import Link from "next/link";
import type { ReactNode } from "react";
import { brand, ROUTES } from "@/config/brand";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  dir?: "ltr" | "rtl";
  eyebrow?: string;
  lang?: string;
  secureMode?: boolean;
  title: string;
};

export function AuthShell({
  children,
  description,
  dir = "ltr",
  eyebrow = brand.name,
  lang = "en",
  secureMode = false,
  title,
}: AuthShellProps) {
  return (
    <main
      className={cn("min-h-screen bg-brand-background", lang === "ur" && "urdu-text")}
      dir={dir}
      lang={lang}
    >
      <section
        className={cn(
          "border-b border-slate-200 text-white",
          secureMode ? "bg-[#07162A]" : "bg-brand-navy",
        )}
      >
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Link
              className="inline-flex flex-col text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
              href={ROUTES.home}
            >
              <span className="text-lg font-bold" translate="no">
                {brand.name}
              </span>
              <span className="text-xs text-white/72">{brand.domain}</span>
            </Link>
            <Link
              className="inline-flex min-h-10 items-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white no-underline hover:border-brand-gold hover:bg-white hover:text-brand-navy"
              href={ROUTES.authRoleSelect}
            >
              Role select
            </Link>
          </div>

          <div className="max-w-3xl py-10 sm:py-14">
            <p className="text-sm font-semibold text-brand-gold">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/78 sm:text-base">
              {description}
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </section>
    </main>
  );
}
