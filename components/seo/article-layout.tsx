import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ArticleLayoutProps = {
  children: ReactNode;
  dir?: "ltr" | "rtl";
  lang?: string;
  sidebar?: ReactNode;
};

export function ArticleLayout({
  children,
  dir = "ltr",
  lang,
  sidebar,
}: ArticleLayoutProps) {
  return (
    <section className="bg-brand-background" dir={dir} lang={lang}>
      <div
        className={cn(
          "mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6",
          Boolean(sidebar) && "lg:grid-cols-[minmax(0,1fr)_320px]",
        )}
      >
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {children}
        </article>
        {sidebar ? <aside className="space-y-4">{sidebar}</aside> : null}
      </div>
    </section>
  );
}
