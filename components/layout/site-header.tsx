import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand, ROUTES } from "@/config/brand";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start justify-between gap-4">
          <Link
            className="inline-flex flex-col text-start no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
            href={ROUTES.home}
          >
            <span className="text-xl font-bold text-brand-navy" translate="no">
              {brand.name}
            </span>
            <span
              className="urdu-text text-sm text-brand-muted"
              dir="rtl"
              lang="ur"
            >
              {brand.urduLine}
            </span>
          </Link>
        </div>

        <nav aria-label="Primary navigation" className="xl:ms-auto">
          <ul className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {brand.navigation.primary.map((item) => (
              <li key={item.href}>
                <Link
                  className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy no-underline hover:bg-brand-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
                  href={item.href}
                >
                  <span
                    className={item.englishLabel === "Packages" ? "urdu-text" : ""}
                    dir={item.englishLabel === "Packages" ? "rtl" : "ltr"}
                    lang={item.englishLabel === "Packages" ? "ur" : "en"}
                  >
                    {item.label}
                  </span>
                  <span className="sr-only"> {item.englishLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:min-w-fit">
          <div
            aria-label="Language selector placeholder"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-brand-background px-3 text-sm font-semibold text-brand-navy"
            role="group"
          >
            <span className="urdu-text" dir="rtl" lang="ur">
              اردو
            </span>
            <span className="mx-2 text-brand-muted">|</span>
            <span lang="en">English</span>
            <span className="mx-2 text-brand-muted">|</span>
            <span lang="zh-CN">中文</span>
          </div>
          <Button
            className="min-h-11 px-4 py-2 text-sm"
            href={ROUTES.importerStart}
            variant="secondary"
          >
            <span className="mixed-language" dir="rtl" lang="ur">
              Import Project شروع کریں
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}

