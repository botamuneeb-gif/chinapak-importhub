import type { Metadata } from "next";
import { FmsShell } from "@/components/fms/fms-shell";
import { ThreadList } from "@/components/messaging/thread-list";
import { getThreadsForView } from "@/config/messaging";

export const metadata: Metadata = {
  title: "FMS Messages | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FmsMessagesPage() {
  const threads = getThreadsForView("fms");

  return (
    <FmsShell
      description="Internal admin-facing messages for assigned sourcing work. FMS users do not message importers directly and do not see importer contact details."
      title="FMS Internal Messages"
    >
      <div className="mb-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Communication rule</h2>
        <p className="mt-2 text-sm leading-7">
          FMS messages Admin only. No direct importer messaging. No importer
          contact details are shown in this inbox.
        </p>
      </div>

      <ThreadList basePath="/fms/messages" threads={threads} view="fms" />
    </FmsShell>
  );
}
