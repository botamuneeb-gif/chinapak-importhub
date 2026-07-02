import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";
import { publicSitemapRoutes } from "@/config/public-site";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = Array.from(new Set(publicSitemapRoutes));
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `https://${brand.domain}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority:
      route === "/" ? 1 : route === "/packages" ? 0.9 : 0.7,
  }));
}
