"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

type SiteChromeProps = {
  children: ReactNode;
};

const protectedPortalPrefixes = [
  "/importer",
  "/invoices",
  "/payments",
  "/refunds",
  "/admin",
  "/super-admin",
  "/project-manager",
  "/agent/dashboard",
  "/agent/leads",
  "/agent/commissions",
  "/agent/training",
  "/agent/notifications",
  "/fms/dashboard",
  "/fms/assignments",
  "/fms/academy",
  "/fms/earnings",
  "/fms/messages",
  "/fms/notifications",
];

const publicAuthPrefixes = [
  "/admin/login",
  "/super-admin/login",
  "/project-manager/login",
  "/agent/login",
  "/fms/login",
];

function shouldShowPublicChrome(pathname: string) {
  if (publicAuthPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return !protectedPortalPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const showPublicChrome = shouldShowPublicChrome(pathname);

  return (
    <>
      {showPublicChrome ? <SiteHeader /> : null}
      {children}
      {showPublicChrome ? <SiteFooter /> : null}
    </>
  );
}
