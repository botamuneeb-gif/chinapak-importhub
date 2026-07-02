import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ThreadList } from "@/components/messaging/thread-list";
import { launchFlags } from "@/config/launch-flags";
import { messageStats, getThreadsForView } from "@/config/messaging";

export const metadata: Metadata = {
  title: "Admin Unified Inbox | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AdminMessagesPage() {
  if (!launchFlags.enableMessages) {
    return (
      <AdminShell
        description="Use project review, report feedback, evidence review, and notifications for launch operations."
        eyebrow="Integrated Messaging System"
        title="Messaging Disabled for Launch"
      >
        <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
          Direct platform messaging is not enabled in the MVP launch. Admin
          communication stays inside the active project review, report feedback,
          evidence, payment, refund, and notification workflows.
        </div>
      </AdminShell>
    );
  }

  const threads = getThreadsForView("admin");

  return (
    <AdminShell
      description="Review platform-controlled messages, contact-info flags, translation needs, and forwarding approvals across Import Projects."
      eyebrow="Integrated Messaging System"
      title="Admin Unified Inbox"
    >
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Communication firewall</h2>
        <p className="mt-2 text-sm leading-7">
          Importers and FMSs must never directly message each other. Admin
          reviews, edits, approves, forwards, or rejects messages before
          another role can see them.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {messageStats.map((stat) => (
          <AdminStatCard
            detail={stat.detail}
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-brand-navy">Thread List</h2>
        <ThreadList basePath="/admin/messages" threads={threads} view="admin" />
      </div>
    </AdminShell>
  );
}
