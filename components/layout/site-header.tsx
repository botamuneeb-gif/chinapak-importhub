import Link from "next/link";
import { PublicAuthStatus } from "@/components/auth/public-auth-status";
import {
  SiteMobileMenu,
  type PublicHeaderNavLink,
} from "@/components/layout/site-mobile-menu";
import { brand, ROUTES } from "@/config/brand";

const publicHeaderLinks: PublicHeaderNavLink[] = [
  { href: ROUTES.packages, label: "Packages" },
  { href: ROUTES.learn, label: "Learn" },
  { href: "/how-it-works", label: "How It Works" },
  { href: ROUTES.contact, label: "Contact" },
  { href: ROUTES.fms, label: "Work as FMS" },
];

export function SiteHeader() {
  return (
    <header className="relative z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:gap-6">
        <Link
          className="flex min-w-0 flex-none flex-col text-start no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
          href={ROUTES.home}
        >
          <span
            className="truncate text-lg font-bold leading-6 text-brand-navy sm:text-xl"
            translate="no"
          >
            {brand.name}
          </span>
          <span
            className="urdu-text hidden text-xs text-brand-muted sm:block"
            dir="rtl"
            lang="ur"
          >
            {brand.urduLine}
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden min-w-0 flex-1 justify-center lg:flex"
        >
          <ul className="flex items-center gap-1 xl:gap-2">
            {publicHeaderLinks.map((item) => (
              <li key={item.href}>
                <Link
                  className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy no-underline transition hover:bg-brand-background hover:text-brand-emerald focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden flex-none lg:block">
          <PublicAuthStatus />
        </div>
        <SiteMobileMenu links={publicHeaderLinks} />
      </div>
    </header>
  );
}
