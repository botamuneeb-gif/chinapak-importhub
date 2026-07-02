import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FmsSectionCard } from "@/components/fms/fms-section-card";
import { FmsShell } from "@/components/fms/fms-shell";
import { MessageBubble } from "@/components/messaging/message-bubble";
import { MessageComposer } from "@/components/messaging/message-composer";
import { ThreadStatusBadge } from "@/components/messaging/thread-status-badge";
import {
  getThreadForView,
  getThreadsForView,
  getVisibleMessages,
} from "@/config/messaging";

type FmsMessageThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export function generateStaticParams() {
  return getThreadsForView("fms").map((thread) => ({
    threadId: thread.threadId,
  }));
}

export async function generateMetadata({
  params,
}: FmsMessageThreadPageProps): Promise<Metadata> {
  const { threadId } = await params;
  return {
    title: `${threadId} FMS Messages | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function FmsMessageThreadPage({
  params,
}: FmsMessageThreadPageProps) {
  const { threadId } = await params;
  const thread = getThreadForView(threadId, "fms");

  if (!thread) {
    notFound();
  }

  const messages = getVisibleMessages(thread, "fms");

  return (
    <FmsShell
      description="Message Admin about assigned sourcing work, evidence, translation questions, and review feedback. No importer direct contact is allowed."
      title={`FMS Thread: ${thread.threadId}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <FmsSectionCard id="context" title="Assignment/project context">
            <dl>
              <div className="border-b border-slate-200 py-3">
                <dt className="text-sm font-semibold text-brand-navy">
                  Assignment ID
                </dt>
                <dd className="mt-1 text-sm text-brand-muted">
                  {thread.assignmentId ?? "No assignment linked"}
                </dd>
              </div>
              <div className="border-b border-slate-200 py-3">
                <dt className="text-sm font-semibold text-brand-navy">
                  Project ID
                </dt>
                <dd className="mt-1 text-sm text-brand-muted">
                  {thread.projectId}
                </dd>
              </div>
              <div className="border-b border-slate-200 py-3">
                <dt className="text-sm font-semibold text-brand-navy">Topic</dt>
                <dd className="mt-1 text-sm text-brand-muted">
                  {thread.topic}
                </dd>
              </div>
              <div className="py-3">
                <dt className="text-sm font-semibold text-brand-navy">Status</dt>
                <dd className="mt-1">
                  <ThreadStatusBadge status={thread.status} />
                </dd>
              </div>
            </dl>
          </FmsSectionCard>

          <FmsSectionCard id="messages" title="Admin messages and FMS replies">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} view="fms" />
              ))}
            </div>
          </FmsSectionCard>

          <MessageComposer
            actions={[
              "Attach photos/documents placeholder",
              "Attach voice note placeholder",
              "Send to Admin Placeholder",
            ]}
            helperText="Use this placeholder composer for admin-only replies about sourcing evidence, factory options, quotations, and clarification requests."
            placeholder="Write a message to ChinaPak Admin. Do not include importer contact requests or direct contact exchange."
            title="FMS reply to admin"
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-brand-error bg-red-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
            <h2 className="text-lg font-bold text-brand-error">
              Sensitive info warning
            </h2>
            <p className="mt-2">
              Do not include importer contact requests, direct communication
              attempts, or unapproved contact exchange.
            </p>
          </div>

          <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
            <h2 className="text-lg font-bold">Chinese support note</h2>
            <p className="mt-2" lang="zh-CN">
              所有与进口商相关的沟通必须通过 ChinaPak ImportHub 平台进行。
            </p>
          </div>

          <FmsSectionCard id="attachments" title="Attachment placeholders">
            <div className="grid gap-3">
              {[
                "Factory photos",
                "Product photos",
                "Quotation documents",
                "Certificates",
                "Voice notes",
              ].map((label) => (
                <div
                  className="rounded-lg border border-dashed border-slate-300 bg-brand-background p-4 text-sm font-semibold text-brand-navy"
                  key={label}
                >
                  {label}
                </div>
              ))}
            </div>
          </FmsSectionCard>
        </div>
      </div>
    </FmsShell>
  );
}
