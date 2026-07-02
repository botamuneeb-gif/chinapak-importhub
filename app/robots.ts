import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

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
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes,
      },
    ],
    sitemap: `https://${brand.domain}/sitemap.xml`,
    host: `https://${brand.domain}`,
  };
}
