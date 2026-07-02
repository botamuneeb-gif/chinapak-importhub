import type { Metadata } from "next";
import { MessageShell } from "@/components/messaging/message-shell";
import { ThreadList } from "@/components/messaging/thread-list";
import { getThreadsForView } from "@/config/messaging";

export const metadata: Metadata = {
  title: "Importer Messages | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function ImporterMessagesPage() {
  const threads = getThreadsForView("importer");

  return (
    <MessageShell
      description="آپ کے Import Project messages یہاں admin-approved form میں دکھائے جائیں گے۔"
      dir="rtl"
      eyebrow="ChinaPak ImportHub Messages"
      lang="ur"
      title="Project Messages"
    >
      <div className="mb-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">محفوظ communication</h2>
        <p className="mt-2 text-sm leading-7">
          Importer کو صرف ChinaPak ImportHub کی approved messages دکھائی جاتی
          ہیں۔ FMS کی personal details یا internal admin notes یہاں show نہیں
          ہوتیں۔
        </p>
      </div>

      <ThreadList
        basePath="/importer/messages"
        threads={threads}
        view="importer"
      />
    </MessageShell>
  );
}
