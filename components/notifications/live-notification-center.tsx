"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationCenterData,
  type NotificationCenterRole,
} from "@/app/notifications/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LoadState = "loading" | "ready" | "error";

type LiveNotificationCenterProps = {
  description: string;
  role: NotificationCenterRole;
  title: string;
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

function NotificationBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const classes = normalized.includes("urgent") || normalized.includes("failed")
    ? "border-red-200 bg-red-50 text-red-700"
    : normalized.includes("high") || normalized.includes("queued")
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : normalized.includes("read")
        ? "border-slate-200 bg-slate-50 text-brand-muted"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${classes}`}>
      {value}
    </span>
  );
}

export function LiveNotificationCenter({
  description,
  role,
  title,
}: LiveNotificationCenterProps) {
  const [data, setData] = useState<NotificationCenterData>({
    items: [],
    unreadCount: 0,
  });
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [isMutating, setIsMutating] = useState(false);

  const loadNotifications = useCallback(async () => {
    setState("loading");
    setError("");

    try {
      const accessToken = await getAccessToken();
      const result = await listNotificationsAction(accessToken, role);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setData(result.data);
      setState("ready");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Notifications could not be loaded.",
      );
      setState("error");
    }
  }, [role]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

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

      setData(result.data);
      setState("ready");
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

      setData(result.data);
      setState("ready");
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

  return (
    <main className="min-h-screen bg-brand-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-bold text-brand-emerald">
                Notification Center
              </p>
              <h1 className="mt-2 text-3xl font-bold text-brand-navy">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
                {description}
              </p>
            </div>
            <div className="rounded-lg border border-brand-gold bg-amber-50 px-4 py-3 text-sm font-bold text-brand-navy">
              {data.unreadCount} unread
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isMutating}
              onClick={() => void loadNotifications()}
              type="button"
            >
              Refresh
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isMutating || data.unreadCount === 0}
              onClick={() => void markAllRead()}
              type="button"
            >
              Mark all read
            </button>
          </div>
        </section>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        {state === "loading" ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-brand-muted shadow-sm">
            Loading notifications...
          </div>
        ) : null}

        {state === "ready" && data.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm font-semibold text-brand-muted shadow-sm">
            No notifications yet. New operational events will appear here after
            Phase 12 hooks create records.
          </div>
        ) : null}

        {state === "ready" && data.items.length > 0 ? (
          <section className="grid gap-4">
            {data.items.map((notification) => {
              const unread = !notification.readAt || notification.readAt === "Not set";

              return (
                <article
                  className={`rounded-lg border bg-white p-5 shadow-sm ${
                    unread ? "border-brand-emerald" : "border-slate-200"
                  }`}
                  key={notification.id}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-emerald">
                        {notification.type.replaceAll("_", " ")}
                        {notification.projectCode
                          ? ` | ${notification.projectCode}`
                          : ""}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-brand-navy">
                        {notification.title}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-brand-muted">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-brand-muted">
                        {notification.createdAt}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <NotificationBadge value={notification.priority} />
                      <NotificationBadge value={unread ? "unread" : "read"} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {notification.actionUrl ? (
                      <Link
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-emerald px-3 py-2 text-xs font-bold text-white no-underline transition hover:bg-brand-navy"
                        href={notification.actionUrl}
                      >
                        Open
                      </Link>
                    ) : null}
                    {unread ? (
                      <button
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald disabled:cursor-not-allowed disabled:opacity-60"
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
          </section>
        ) : null}
      </div>
    </main>
  );
}
