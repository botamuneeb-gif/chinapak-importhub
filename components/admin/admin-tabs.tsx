import Link from "next/link";

type AdminTabsProps = {
  tabs: Array<{ href: string; label: string }>;
};

export function AdminTabs({ tabs }: AdminTabsProps) {
  return (
    <nav aria-label="Admin detail sections" className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <ul className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              className="inline-flex min-h-10 items-center rounded-lg bg-brand-background px-3 py-2 text-sm font-semibold text-brand-navy no-underline transition hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
              href={tab.href}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
