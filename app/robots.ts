import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site-url";

const privateRoutes = [
  "/admin",
  "/admin/",
  "/super-admin",
  "/super-admin/",
  "/agent/dashboard",
  "/agent/leads",
  "/agent/commissions",
  "/agent/training",
  "/importer",
  "/importer/dashboard",
  "/importer/messages",
  "/importer/notifications",
  "/importer/projects",
  "/importer/reports",
  "/importer/start",
  "/fms/dashboard",
  "/fms/assignments",
  "/fms/messages",
  "/fms/notifications",
  "/fms/earnings",
  "/fms/academy",
  "/factory",
  "/factory/",
  "/invoices",
  "/payments",
  "/refunds",
  "/refunds/request",
  "/notifications",
  "/documents",
  "/files",
  "/api/",
] satisfies string[];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
