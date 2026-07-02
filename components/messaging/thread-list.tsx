import Link from "next/link";
import { RiskFlagBadge } from "@/components/messaging/risk-flag-badge";
import { ThreadStatusBadge } from "@/components/messaging/thread-status-badge";
import type { MessageThread, MessagingView } from "@/config/messaging";

type ThreadListProps = {
  basePath: string;
  threads: MessageThread[];
  view: MessagingView;
};

function participantText(thread: MessageThread) {
  return thread.participants.map((participant) => participant.role).join(", ");
}

function riskFlags(thread: MessageThread) {
  return (
    <div className="flex min-w-44 flex-wrap gap-2">
      {thread.riskFlags.map((flag) => (
        <RiskFlagBadge flag={flag} key={flag} />
      ))}
    </div>
  );
}

function AdminThreadList({ basePath, threads }: Omit<ThreadListProps, "view">) {
  const columns = [
    "Thread ID",
    "Project ID",
    "Participants",
    "Thread Type",
    "Latest Message Preview",
    "Language Pair",
    "Risk Flags",
    "Status",
    "Last Updated",
    "Action",
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm" aria-label="Admin message threads">
          <thead className="bg-brand-navy text-white">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap px-4 py-3 font-semibold" key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {threads.map((thread) => (
              <tr className="align-top hover:bg-brand-background" key={thread.threadId}>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {thread.threadId}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {thread.projectId}
                </td>
                <td className="min-w-40 px-4 py-4 text-brand-muted">
                  {participantText(thread)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {thread.threadType}
                </td>
                <td className="min-w-72 px-4 py-4 text-brand-text">
                  {thread.latestMessagePreview}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {thread.languagePair}
                </td>
                <td className="px-4 py-4">{riskFlags(thread)}</td>
                <td className="px-4 py-4">
                  <ThreadStatusBadge status={thread.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {thread.lastUpdated}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <Link
                    className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white no-underline hover:bg-brand-emerald"
                    href={`${basePath}/${thread.threadId}`}
                  >
                    Review Thread
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImporterThreadList({ basePath, threads }: Omit<ThreadListProps, "view">) {
  return (
    <div className="grid gap-4">
      {threads.map((thread) => (
        <article
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          key={thread.threadId}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-brand-emerald">
                {thread.projectId}
              </p>
              <h2 className="mt-2 text-xl font-bold text-brand-navy">
                {thread.topic}
              </h2>
            </div>
            <ThreadStatusBadge status={thread.status} />
          </div>
          <p className="mt-4 text-sm leading-7 text-brand-muted">
            {thread.latestMessagePreview}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg bg-brand-background px-3 py-1 text-xs font-bold text-brand-navy">
              Unread: {thread.importerUnreadCount}
            </span>
            <span className="rounded-lg bg-brand-background px-3 py-1 text-xs font-bold text-brand-navy">
              {thread.translationAddOnActive ? "Translation Active" : "Translation available"}
            </span>
          </div>
          <Link
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline hover:bg-brand-navy"
            href={`${basePath}/${thread.threadId}`}
          >
            Message دیکھیں
          </Link>
        </article>
      ))}
    </div>
  );
}

function FmsThreadList({ basePath, threads }: Omit<ThreadListProps, "view">) {
  const columns = [
    "Assignment ID",
    "Project ID",
    "Topic",
    "Latest Admin Message",
    "Status",
    "Admin Feedback Needed",
    "Action",
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm" aria-label="FMS internal message threads">
          <thead className="bg-brand-navy text-white">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap px-4 py-3 font-semibold" key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {threads.map((thread) => (
              <tr className="align-top hover:bg-brand-background" key={thread.threadId}>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {thread.assignmentId ?? "No assignment"}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {thread.projectId}
                </td>
                <td className="min-w-56 px-4 py-4 text-brand-text">
                  {thread.topic}
                </td>
                <td className="min-w-72 px-4 py-4 text-brand-muted">
                  {thread.latestMessagePreview}
                </td>
                <td className="px-4 py-4">
                  <ThreadStatusBadge status={thread.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-semibold text-brand-navy">
                  {thread.fmsAdminFeedbackNeeded ? "Yes" : "No"}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <Link
                    className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white no-underline hover:bg-brand-emerald"
                    href={`${basePath}/${thread.threadId}`}
                  >
                    Open Thread
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ThreadList({ basePath, threads, view }: ThreadListProps) {
  if (view === "importer") {
    return <ImporterThreadList basePath={basePath} threads={threads} />;
  }

  if (view === "fms") {
    return <FmsThreadList basePath={basePath} threads={threads} />;
  }

  return <AdminThreadList basePath={basePath} threads={threads} />;
}
