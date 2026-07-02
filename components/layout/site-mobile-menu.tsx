"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PublicAuthStatus } from "@/components/auth/public-auth-status";
import { cn } from "@/lib/utils";

export type PublicHeaderNavLink = {
  href: string;
  label: string;
};

type SiteMobileMenuProps = {
  links: PublicHeaderNavLink[];
};

export function SiteMobileMenu({ links }: SiteMobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        aria-controls="public-mobile-menu"
        aria-expanded={isOpen}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{isOpen ? "Close" : "Menu"}</span>
        <span aria-hidden="true" className="grid gap-1">
          <span className="block h-0.5 w-4 rounded-full bg-current" />
          <span className="block h-0.5 w-4 rounded-full bg-current" />
          <span className="block h-0.5 w-4 rounded-full bg-current" />
        </span>
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 right-0 top-full z-40 border-b border-slate-200 bg-white px-4 py-4 shadow-lg sm:px-6"
          id="public-mobile-menu"
        >
          <nav aria-label="Mobile public navigation">
            <ul className="grid gap-1">
              {links.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      className={cn(
                        "flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-bold no-underline transition",
                        isActive
                          ? "bg-brand-background text-brand-emerald"
                          : "text-brand-navy hover:bg-brand-background hover:text-brand-emerald",
                      )}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="my-4 h-px bg-slate-200" />

          <PublicAuthStatus variant="mobile" />
        </div>
      ) : null}
    </div>
  );
}
