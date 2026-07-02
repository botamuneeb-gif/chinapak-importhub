import Link from "next/link";
import { brand, ROUTES } from "@/config/brand";

export function SiteFooter() {
  const publicLinks = [
    { href: "/how-it-works", label: "How It Works" },
    { href: ROUTES.packages, label: "Packages" },
    { href: "/trust-safety", label: "Trust & Safety" },
    { href: "/faq", label: "FAQ" },
    { href: "/about", label: "About" },
  ];
  const learningLinks = [
    {
      href: "/import-from-china-to-pakistan",
      label: "Import from China to Pakistan",
    },
    {
      href: "/find-chinese-factories",
      label: "Find Chinese Factories",
    },
    {
      href: "/verify-chinese-supplier-before-payment",
      label: "Verify Chinese Supplier",
    },
    {
      href: "/china-import-help-for-small-business",
      label: "Small Business Import Help",
    },
  ];
  const legalLinks = [
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms" },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.25fr_0.8fr_0.9fr_0.8fr]">
        <div>
          <p className="text-lg font-bold text-brand-navy" translate="no">
            {brand.name}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-brand-muted">
            {brand.promise}
          </p>
          <p
            className="urdu-text mt-3 text-sm text-brand-muted"
            dir="rtl"
            lang="ur"
          >
            {brand.urduLine}
          </p>
        </div>

        <div>
          <p className="font-semibold text-brand-navy">Public pages</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-muted">
            {publicLinks.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-brand-emerald" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-brand-navy">Importer guides</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-muted">
            {learningLinks.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-brand-emerald" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-brand-navy">Portals & legal</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-muted">
            <li>
              <Link
                className="hover:text-brand-emerald"
                href={ROUTES.importerStart}
              >
                Start Import Project
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand-emerald" href={ROUTES.fms}>
                FMS candidates
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand-emerald" href={ROUTES.contact}>
                Contact
              </Link>
            </li>
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-brand-emerald" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 font-semibold text-brand-navy">Languages</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-muted">
            {brand.locales.map((locale) => (
              <li key={locale.code}>
                <span
                  className={locale.code === "ur" ? "urdu-text" : ""}
                  dir={locale.direction}
                  lang={locale.code}
                >
                  {locale.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
