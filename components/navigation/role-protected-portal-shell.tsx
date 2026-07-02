"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { RoleProtectedShell } from "@/components/auth/role-protected-shell";
import { PortalShell } from "@/components/navigation/portal-shell";
import type { UserRole } from "@/lib/auth/roles";

type RoleProtectedPortalShellProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  loginHref: string;
  protectedPrefixes: string[];
  publicPrefixes?: string[];
  role: Exclude<UserRole, "factory_future">;
  title: string;
};

export function RoleProtectedPortalShell({
  allowedRoles,
  children,
  loginHref,
  protectedPrefixes,
  publicPrefixes = [],
  role,
  title,
}: RoleProtectedPortalShellProps) {
  const pathname = usePathname();
  const showPortalChrome = useMemo(() => {
    if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return false;
    }

    return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  }, [pathname, protectedPrefixes, publicPrefixes]);

  return (
    <RoleProtectedShell
      allowedRoles={allowedRoles}
      loginHref={loginHref}
      protectedPrefixes={protectedPrefixes}
      publicPrefixes={publicPrefixes}
      title={title}
    >
      {showPortalChrome ? (
        <PortalShell role={role}>{children}</PortalShell>
      ) : (
        children
      )}
    </RoleProtectedShell>
  );
}
