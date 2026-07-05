"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getNotificationTrayAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  updateNotificationTrayPreferencesAction,
  type NotificationCenterRole,
  type NotificationTrayData,
} from "@/app/notifications/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type PortalNotificationTrayProps = {
  notificationsHref: string;
  role: NotificationCenterRole;
};

const emptyTrayData: NotificationTrayData = {
  hiddenCategories: [],
  items: [],
  preferenceOptions: [],
  totalUnreadCount: 0,
  unreadCount: 0,
};

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login again to view notifications.");
  }

  return session.access_token;
}

function isUnread(readAt: string, status: string) {
  return status !== "read" && (!readAt || readAt === "Not set");
}

export function PortalNotificationTray({
  notificationsHref,
  role,
}: PortalNotificationTrayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [data, setData] = useState<NotificationTrayData>(emptyTrayData);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState("");

  const hiddenCategorySet = useMemo(
    () => new Set(data.hiddenCategories),
    [data.hiddenCategories],
  );

  const loadTray = useCallback(async () => {
    try {
      setError("");
      const accessToken = await getAccessToken();
      const result = await getNotificationTrayAction(accessToken, role);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setData(result.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Notification tray could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void loadTray();
    const intervalId = window.setInterval(() => {
      void loadTray();
    }, 45_000);

    return () => window.clearInterval(intervalId);
  }, [loadTray]);

  async function markRead(notificationId: string) {
    setIsMutating(true);
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await markNotificationReadAction(
        accessToken,
        role,
        notificationId,
      );

      if (!result.ok) {
        throw new Error(result.message);
      }

      await loadTray();
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : "Notification could not be marked read.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function markAllRead() {
    setIsMutating(true);
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await markAllNotificationsReadAction(accessToken, role);

      if (!result.ok) {
        throw new Error(result.message);
      }

      await loadTray();
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : "Notifications could not be marked read.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function toggleCategory(category: string, checked: boolean) {
    const nextHidden = checked
      ? data.hiddenCategories.filter((item) => item !== category)
      : [...data.hiddenCategories, category];

    setIsMutating(true);
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await updateNotificationTrayPreferencesAction(
        accessToken,
        role,
        nextHidden,
      );

      if (!result.ok) {
        throw new Error(result.message);
      }

      setData(result.data);
    } catch (preferenceError) {
      setError(
        preferenceError instanceof Error
          ? preferenceError.message
          : "Notification preferences could not be updated.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        className="relative inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-brand-navy shadow-sm transition hover:border-brand-emerald hover:text-brand-emerald"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        Notifications
        {data.unreadCount > 0 ? (
          <span className="ml-2 rounded-full bg-brand-error px-2 py-0.5 text-xs font-bold text-white">
            {data.unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,24rem)] rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-brand-navy">
                Latest notifications
              </p>
              <p className="mt-1 text-xs font-semibold text-brand-muted">
                {data.totalUnreadCount} unread total
              </p>
            </div>
            <button
              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald"
              disabled={isMutating}
              onClick={() => void loadTray()}
              type="button"
            >
              Refresh
            </button>
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-brand-muted">
                Loading notifications...
              </p>
            ) : null}

            {!isLoading && data.items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm font-semibold text-brand-muted">
                No tray notifications match your current settings.
              </p>
            ) : null}

            {data.items.map((notification) => {
              const unread = isUnread(notification.readAt, notification.status);

              return (
                <article
                  className={`rounded-lg border p-3 ${
                    unread
                      ? "border-brand-emerald bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                  key={notification.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-emerald">
                        {notification.category.replaceAll("_", " ")}
                        {notification.projectCode
                          ? ` | ${notification.projectCode}`
                          : ""}
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-brand-navy">
                        {notification.title}
                      </h3>
                    </div>
                    {unread ? (
                      <span className="rounded-full bg-brand-emerald px-2 py-0.5 text-[11px] font-bold text-white">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-brand-muted">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-brand-muted">
                    {notification.createdAt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {notification.actionUrl ? (
                      <Link
                        className="rounded-lg bg-brand-emerald px-2.5 py-1.5 text-xs font-bold text-white no-underline transition hover:bg-brand-navy"
                        href={notification.actionUrl}
                        onClick={() => setIsOpen(false)}
                      >
                        Open
                      </Link>
                    ) : null}
                    {unread ? (
                      <button
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isMutating}
                        onClick={() => void markRead(notification.id)}
                        type="button"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
            <Link
              className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white no-underline transition hover:bg-brand-emerald"
              href={notificationsHref}
              onClick={() => setIsOpen(false)}
            >
              View all
            </Link>
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isMutating || data.totalUnreadCount === 0}
              onClick={() => void markAllRead()}
              type="button"
            >
              Mark all read
            </button>
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-brand-navy transition hover:border-brand-gold hover:text-brand-gold"
              onClick={() => setIsSettingsOpen((current) => !current)}
              type="button"
            >
              Settings
            </button>
          </div>

          {isSettingsOpen ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
                Tray categories
              </p>
              <div className="mt-3 space-y-2">
                {data.preferenceOptions.map((option) => {
                  const checked =
                    option.alwaysShown || !hiddenCategorySet.has(option.category);

                  return (
                    <label
                      className="flex gap-3 rounded-lg bg-white p-2 text-xs leading-5 text-brand-muted"
                      key={option.category}
                    >
                      <input
                        checked={checked}
                        className="mt-1 h-4 w-4 accent-brand-emerald"
                        disabled={isMutating || option.alwaysShown}
                        onChange={(event) =>
                          void toggleCategory(
                            option.category,
                            event.target.checked,
                          )
                        }
                        type="checkbox"
                      />
                      <span>
                        <span className="block font-bold text-brand-navy">
                          {option.label}
                          {option.alwaysShown ? " (always shown)" : ""}
                        </span>
                        {option.description}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
