"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  portalRoleConfigs,
  type PortalNavItem,
  type PortalQuickAction,
} from "@/components/navigation/role-nav-items";
import { PortalNotificationTray } from "@/components/notifications/portal-notification-tray";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth/roles";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type PortalShellProps = {
  children: ReactNode;
  role: Exclude<UserRole, "factory_future">;
};

function isNavigable(item: PortalNavItem | PortalQuickAction) {
  return !item.disabled && !item.href.startsWith("#");
}

function getActiveItem(pathname: string, items: PortalNavItem[]) {
  return [...items]
    .filter((item) => isNavigable(item))
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/" ? pathname === item.href : pathname.startsWith(item.href),
    );
}

function getUserLabelFromMetadata(
  metadata: Record<string, unknown>,
  email: string | null | undefined,
) {
  const displayName =
    metadata.display_name ?? metadata.full_name ?? metadata.name ?? email;

  return typeof displayName === "string" && displayName.trim()
    ? displayName
    : "Signed-in user";
}

function NavLink({
  item,
  mobile = false,
  pathname,
}: {
  item: PortalNavItem;
  mobile?: boolean;
  pathname: string;
}) {
  const active =
    isNavigable(item) &&
    (item.href === "/" ? pathname === item.href : pathname.startsWith(item.href));
  const baseClass = mobile
    ? "inline-flex min-h-11 shrink-0 flex-col justify-center rounded-lg border px-4 py-2 text-sm font-bold no-underline transition"
    : "flex min-h-11 flex-col justify-center rounded-lg border px-4 py-2 text-sm font-bold no-underline transition";

  if (item.disabled) {
    return (
      <span
        className={cn(
          baseClass,
          "cursor-not-allowed border-white/10 bg-white/5 text-white/45",
        )}
      >
        <span>{item.label}</span>
        <span className="mt-1 text-xs font-semibold text-brand-gold">
          {item.badge ?? "Future"}
        </span>
      </span>
    );
  }

  return (
    <Link
      className={cn(
        baseClass,
        active
          ? "border-brand-gold bg-white text-brand-navy"
          : "border-white/15 bg-white/8 text-white hover:border-brand-gold hover:bg-white hover:text-brand-navy",
      )}
      href={item.href}
    >
      <span>{item.label}</span>
      {item.supportLabel || item.badge ? (
        <span
          className={cn(
            "mt-1 text-xs font-semibold",
            active ? "text-brand-muted" : "text-white/65",
          )}
        >
          {item.supportLabel ?? item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function QuickActions({
  actions,
  pathname,
}: {
  actions: PortalQuickAction[];
  pathname: string;
}) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
      {actions.map((action) => {
        const active =
          isNavigable(action) &&
          (action.href === pathname ||
            (action.href !== "/" && pathname.startsWith(action.href)));

        if (action.disabled) {
          return (
            <div
              className="rounded-lg border border-dashed border-slate-300 bg-white p-4 opacity-75 shadow-sm"
              key={action.label}
            >
              <p className="text-sm font-bold text-brand-navy">
                {action.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {action.description}
              </p>
              <span className="mt-3 inline-flex rounded-lg border border-brand-gold bg-amber-50 px-2.5 py-1 text-xs font-bold text-brand-navy">
                Future
              </span>
            </div>
          );
        }

        return (
          <Link
            className={cn(
              "rounded-lg border bg-white p-4 no-underline shadow-sm transition hover:border-brand-emerald",
              active ? "border-brand-emerald" : "border-slate-200",
            )}
            href={action.href}
            key={action.label}
          >
            <p className="text-sm font-bold text-brand-navy">{action.label}</p>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {action.description}
            </p>
          </Link>
        );
      })}
    </section>
  );
}

function MobileBottomNav({
  ariaLabel,
  items,
  pathname,
}: {
  ariaLabel: string;
  items: PortalNavItem[];
  pathname: string;
}) {
  const mobileItems = items.filter(isNavigable);

  if (mobileItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 shadow-[0_-10px_30px_rgba(11,31,58,0.12)] backdrop-blur print:hidden lg:hidden"
    >
      <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto pb-1">
        {mobileItems.map((item) => {
          const active =
            item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "inline-flex min-h-12 min-w-[5.75rem] shrink-0 flex-col items-center justify-center rounded-lg border px-3 py-2 text-center text-[11px] font-bold leading-tight no-underline transition",
                active
                  ? "border-brand-emerald bg-emerald-50 text-brand-emerald"
                  : "border-slate-200 bg-white text-brand-navy hover:border-brand-gold",
              )}
              href={item.href}
              key={`${item.label}-${item.href}-bottom`}
            >
              <span className="line-clamp-2">{item.label}</span>
              {item.badge ? (
                <span className="mt-1 text-[10px] text-brand-muted">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PortalShell({ children, role }: PortalShellProps) {
  const config = portalRoleConfigs[role];
  const pathname = usePathname();
  const router = useRouter();
  const [userLabel, setUserLabel] = useState("Signed-in user");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const activeItem = useMemo(
    () => getActiveItem(pathname, config.navItems),
    [config.navItems, pathname],
  );
  const lastSegment = decodeURIComponent(
    pathname.split("/").filter(Boolean).at(-1) ?? "",
  );
  const showDetailCrumb =
    activeItem && pathname !== activeItem.href && lastSegment.length > 0;
  const showQuickActions = pathname === config.dashboardHref;
  const notificationsHref =
    config.navItems.find((item) => item.label === "Notifications")?.href ??
    config.dashboardHref;

  useEffect(() => {
    let isMounted = true;

    async function loadUserLabel() {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted || !session?.user) {
        return;
      }

      setUserLabel(
        getUserLabelFromMetadata(
          session.user.user_metadata as Record<string, unknown>,
          session.user.email,
        ),
      );
    }

    void loadUserLabel();

    return () => {
      isMounted = false;
    };
  }, []);

  async function logout() {
    setIsSigningOut(true);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace(config.loginHref);
  }

  return (
    <div className="min-h-screen bg-brand-background print:bg-white" dir="ltr" lang="en">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)] print:block print:min-h-0">
        <aside className="hidden bg-brand-navy text-white print:hidden lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-5 py-6">
            <p className="text-sm font-semibold text-brand-gold" translate="no">
              ChinaPak ImportHub
            </p>
            <h1 className="mt-2 text-xl font-bold">{config.roleLabel}</h1>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {config.supportLabel}
            </p>
          </div>
          <nav
            aria-label={`${config.roleLabel} navigation`}
            className="flex-1 space-y-2 overflow-y-auto px-4 py-5"
          >
            {config.navItems.map((item) => (
              <NavLink item={item} key={`${item.label}-${item.href}`} pathname={pathname} />
            ))}
          </nav>
          <div className="border-t border-white/10 p-4">
            <button
              className="min-h-11 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-brand-gold hover:bg-white hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSigningOut}
              onClick={() => void logout()}
              type="button"
            >
              {isSigningOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </aside>

        <div className="min-w-0 overflow-x-hidden">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur print:hidden">
            <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-gold">
                  {config.roleLabel}
                </p>
                <nav
                  aria-label="Breadcrumb"
                  className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-muted"
                >
                  <Link
                    className="text-brand-navy no-underline hover:text-brand-emerald"
                    href={config.dashboardHref}
                  >
                    Dashboard
                  </Link>
                  {activeItem ? (
                    <>
                      <span>/</span>
                      <Link
                        className="text-brand-navy no-underline hover:text-brand-emerald"
                        href={activeItem.href}
                      >
                        {activeItem.label}
                      </Link>
                    </>
                  ) : null}
                  {showDetailCrumb ? (
                    <>
                      <span>/</span>
                      <span className="max-w-[18rem] truncate" translate="no">
                        {lastSegment}
                      </span>
                    </>
                  ) : null}
                </nav>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <PortalNotificationTray
                  notificationsHref={notificationsHref}
                  role={role}
                />
                <div className="rounded-lg border border-slate-200 bg-brand-background px-3 py-2">
                  <p className="text-xs font-semibold text-brand-muted">
                    Signed in
                  </p>
                  <p className="max-w-[14rem] truncate text-sm font-bold text-brand-navy">
                    {userLabel}
                  </p>
                </div>
                <button
                  className="min-h-11 rounded-lg bg-brand-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSigningOut}
                  onClick={() => void logout()}
                  type="button"
                >
                  {isSigningOut ? "Signing out..." : "Logout"}
                </button>
              </div>
            </div>
          </header>

          <div className="w-full min-w-0 px-3 py-5 pb-28 print:p-0 sm:px-4 lg:px-5 lg:pb-5">
            {showQuickActions ? (
              <QuickActions actions={config.quickActions} pathname={pathname} />
            ) : null}
            {children}
          </div>

          <MobileBottomNav
            ariaLabel={`${config.roleLabel} mobile app navigation`}
            items={config.navItems}
            pathname={pathname}
          />
        </div>
      </div>
    </div>
  );
}
