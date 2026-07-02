import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageBubble } from "@/components/messaging/message-bubble";
import { MessageComposer } from "@/components/messaging/message-composer";
import { MessageShell } from "@/components/messaging/message-shell";
import { ThreadStatusBadge } from "@/components/messaging/thread-status-badge";
import { TranslationAddOnPanel } from "@/components/messaging/translation-add-on-panel";
import {
  getThreadForView,
  getThreadsForView,
  getVisibleMessages,
} from "@/config/messaging";

type ImporterMessageThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export function generateStaticParams() {
  return getThreadsForView("importer").map((thread) => ({
    threadId: thread.threadId,
  }));
}

export async function generateMetadata({
  params,
}: ImporterMessageThreadPageProps): Promise<Metadata> {
  const { threadId } = await params;
  return {
    title: `${threadId} Importer Messages | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

export default async function ImporterMessageThreadPage({
  params,
}: ImporterMessageThreadPageProps) {
  const { threadId } = await params;
  const thread = getThreadForView(threadId, "importer");

  if (!thread) {
    notFound();
  }

  const messages = getVisibleMessages(thread, "importer");

  return (
    <MessageShell
      description="ہماری team سے بات کریں۔ Messages platform کے ذریعے review اور manage کی جاتی ہیں۔"
      dir="rtl"
      eyebrow={thread.projectId}
      lang="ur"
      title="Project Messages"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-brand-emerald">
                  {thread.projectId}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-brand-navy">
                  ہماری team سے بات کریں
                </h2>
                <p className="mt-2 text-sm leading-7 text-brand-muted">
                  {thread.topic}
                </p>
              </div>
              <ThreadStatusBadge status={thread.status} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-brand-emerald">
                Message approved by ChinaPak ImportHub
              </span>
              <span className="rounded-lg bg-brand-background px-3 py-1 text-xs font-bold text-brand-navy">
                {thread.translationAddOnActive ? "Translation Active" : "Translation available"}
              </span>
            </div>
          </section>

          <section className="space-y-4" aria-label="Importer approved messages">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                view="importer"
              />
            ))}
          </section>

          <MessageComposer
            actions={[
              "Attach photo/document placeholder",
              "Voice note placeholder",
              "Send to ChinaPak Team placeholder",
            ]}
            dir="rtl"
            helperText="یہ message ChinaPak team کو جائے گا۔ FMS یا factory کو direct message نہیں کیا جاتا۔"
            lang="ur"
            placeholder="اپنا سوال یا project update یہاں لکھیں..."
            title="Message composer"
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
            <h2 className="text-lg font-bold">Trust note</h2>
            <p className="mt-2 text-sm leading-7">
              آپ کی communication ChinaPak ImportHub platform کے ذریعے محفوظ
              طریقے سے manage کی جاتی ہے۔ FMS یا factory کی personal contact
              information صرف approved workflow کے تحت share کی جاتی ہے۔
            </p>
          </div>

          <TranslationAddOnPanel active={thread.translationAddOnActive} />
        </div>
      </div>
    </MessageShell>
  );
}
