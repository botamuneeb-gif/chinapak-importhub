import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdminReviewPanel } from "@/components/messaging/admin-review-panel";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { MessageAuditTrail } from "@/components/messaging/message-audit-trail";
import { MessageBubble } from "@/components/messaging/message-bubble";
import { MessageComposer } from "@/components/messaging/message-composer";
import { RiskFlagBadge } from "@/components/messaging/risk-flag-badge";
import { ThreadStatusBadge } from "@/components/messaging/thread-status-badge";
import { TranslationAddOnPanel } from "@/components/messaging/translation-add-on-panel";
import {
  getMessageThreadById,
  messageThreads,
  type MessageThread,
} from "@/config/messaging";

type AdminMessageThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export function generateStaticParams() {
  return messageThreads.map((thread) => ({ threadId: thread.threadId }));
}

export async function generateMetadata({
  params,
}: AdminMessageThreadPageProps): Promise<Metadata> {
  const { threadId } = await params;
  return {
    title: `${threadId} Message Review | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0">
      <dt className="text-sm font-semibold text-brand-navy">{label}</dt>
      <dd className="mt-1 text-sm leading-7 text-brand-muted">{value}</dd>
    </div>
  );
}

function ThreadHeader({ thread }: { thread: MessageThread }) {
  return (
    <AdminSectionCard id="header" title="1. Thread Header">
      <dl>
        <DetailRow label="Thread ID" value={thread.threadId} />
        <DetailRow label="Project ID" value={thread.projectId} />
        <DetailRow label="Thread type" value={thread.threadType} />
        <DetailRow
          label="Participants by role only"
          value={thread.participants
            .map((participant) => `${participant.role}: ${participant.label}`)
            .join(" | ")}
        />
        <DetailRow label="Language pair" value={thread.languagePair} />
        <DetailRow
          label="Status"
          value={<ThreadStatusBadge status={thread.status} />}
        />
        <DetailRow
          label="Risk flags"
          value={
            <div className="flex flex-wrap gap-2">
              {thread.riskFlags.map((flag) => (
                <RiskFlagBadge flag={flag} key={flag} />
              ))}
            </div>
          }
        />
      </dl>
    </AdminSectionCard>
  );
}

export default async function AdminMessageThreadPage({
  params,
}: AdminMessageThreadPageProps) {
  const { threadId } = await params;
  const thread = getMessageThreadById(threadId);

  if (!thread) {
    notFound();
  }

  const tabs = [
    { href: "#header", label: "Thread Header" },
    { href: "#timeline", label: "Timeline" },
    { href: "#review", label: "Admin Review" },
    { href: "#composer", label: "Composer" },
    { href: "#translation", label: "Translation" },
    { href: "#audit", label: "Audit Trail" },
  ];

  return (
    <AdminShell
      description="Review messages, translations, contact-info flags, attachments, and forwarding decisions before any cross-role delivery."
      eyebrow="Integrated Messaging System"
      title={`Thread Review: ${thread.threadId}`}
    >
      <div className="mb-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Admin bridge rule</h2>
        <p className="mt-2 text-sm leading-7">
          Importer and FMS messages are never direct. Admin controls edits,
          approvals, forwarding, translation review, file release, and the audit
          trail for this thread.
        </p>
      </div>

      <AdminTabs tabs={tabs} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ThreadHeader thread={thread} />

          <AdminSectionCard id="timeline" title="2. Message Timeline">
            <div className="space-y-4">
              {thread.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  view="admin"
                />
              ))}
            </div>
          </AdminSectionCard>

          <div id="review">
            <AdminReviewPanel thread={thread} />
          </div>

          <div id="composer">
            <MessageComposer
              actions={[
                "Admin internal note",
                "Send message to importer placeholder",
                "Send message to FMS placeholder",
                "Add translation placeholder",
                "Attach file placeholder",
              ]}
              helperText="Use this placeholder surface for admin notes, importer updates, FMS instructions, translation requests, and file attachments."
              placeholder="Draft an admin-controlled message. Future backend rules must decide visibility before delivery."
              title="4. Message Composer"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div id="translation">
            <TranslationAddOnPanel active={thread.translationAddOnActive} />
          </div>

          <AdminSectionCard id="audit" title="6. Audit Trail">
            <MessageAuditTrail items={thread.auditTrail} />
          </AdminSectionCard>

          <div className="rounded-lg border border-brand-error bg-red-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
            <h2 className="text-lg font-bold text-brand-error">
              Sensitive information policy
            </h2>
            <p className="mt-2">
              Phone numbers, WhatsApp, WeChat, email, bank/payment instructions,
              and direct factory contacts must be detected and held for admin
              review before release.
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
