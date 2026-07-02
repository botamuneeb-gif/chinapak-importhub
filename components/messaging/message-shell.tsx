import Link from "next/link";
import type { ReactNode } from "react";
import { brand, ROUTES } from "@/config/brand";
import { cn } from "@/lib/utils";

type MessageShellProps = {
  children: ReactNode;
  description: string;
  dir?: "ltr" | "rtl";
  eyebrow?: string;
  lang?: string;
  title: string;
};

const importerNav = [
  { label: "Messages", href: ROUTES.importerMessages },
  { label: "Start Project", href: ROUTES.importerStart },
  { label: "Verify Us", href: ROUTES.verify },
] as const;

export function MessageShell({
  children,
  description,
  dir = "ltr",
  eyebrow = brand.name,
  lang = "en",
  title,
}: MessageShellProps) {
  return (
    <main className="bg-brand-background" dir={dir} lang={lang}>
      <section className="border-b border-slate-200 bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-sm font-semibold text-brand-gold">{eyebrow}</p>
          <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className={cn(dir === "rtl" && "text-right")}>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78 sm:text-base">
                {description}
              </p>
            </div>
            <nav aria-label="Importer message navigation">
              <ul className="flex flex-wrap gap-2">
                {importerNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="inline-flex min-h-11 items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:border-brand-gold hover:bg-white hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </main>
  );
}
