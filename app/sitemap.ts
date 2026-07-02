import type { MetadataRoute } from "next";
import { publicSitemapRoutes } from "@/config/public-site";
import { getSiteUrl } from "@/config/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = Array.from(new Set(publicSitemapRoutes));
  const siteUrl = getSiteUrl();
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority:
      route === "/" ? 1 : route === "/packages" ? 0.9 : 0.7,
  }));
}
