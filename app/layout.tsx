import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/site-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { brand } from "@/config/brand";
import { getSiteUrl } from "@/config/site-url";
import { getWebmasterVerificationMetadata } from "@/config/webmaster-verification";
import "@/styles/globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title:
    "ChinaPak ImportHub | Direct China Factory Access for Pakistani Importers",
  description:
    "ChinaPak ImportHub helps Pakistani importers find suitable Chinese factories, review factory-side product evidence, reduce unnecessary middlemen, and import from China without traveling to China.",
  applicationName: brand.name,
  openGraph: {
    title:
      "ChinaPak ImportHub | Direct China Factory Access for Pakistani Importers",
    description:
      "Factory-level visibility and admin-reviewed import project support for Pakistani importers.",
    siteName: brand.name,
    locale: "en_US",
    type: "website",
  },
  verification: getWebmasterVerificationMetadata(),
};

export const viewport: Viewport = {
  themeColor: brand.colors.primary,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: siteUrl,
    slogan: brand.tagline,
    description: brand.promise,
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
    url: siteUrl,
    inLanguage: ["en", "ur", "zh-CN"],
  };

  return (
    <html
      lang="en"
      dir="ltr"
      data-supported-locales={brand.locales.map((locale) => locale.code).join(",")}
    >
      <body className="min-h-screen bg-brand-background text-brand-text antialiased">
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
