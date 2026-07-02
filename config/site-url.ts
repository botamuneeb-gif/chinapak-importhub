import { brand } from "@/config/brand";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallbackUrl = `https://${brand.domain}`;
  const siteUrl =
    configuredUrl && /^https?:\/\//i.test(configuredUrl)
      ? configuredUrl
      : fallbackUrl;

  return siteUrl.replace(/\/+$/, "");
}
