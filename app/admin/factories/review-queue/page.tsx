import type { Metadata } from "next";
import { AdminActionPanel } from "@/components/admin/admin-action-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { FactoryReviewQueue } from "@/components/admin/factories/factory-review-queue";
import { factorySubmissions } from "@/config/factory-database";

export const metadata: Metadata = {
  title: "Factory Review Queue | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AdminFactoryReviewQueuePage() {
  return (
    <AdminShell
      description="Review factory records submitted by FMSs before they become active internal database records."
      eyebrow="Admin Factory Database"
      title="Factory Submissions Review Queue"
    >
      <div className="mb-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Importer visibility rule</h2>
        <p className="mt-2 text-sm leading-7">
          Factory submissions are not visible to importers until admin approval
          and package-based release rules are satisfied.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <FactoryReviewQueue submissions={factorySubmissions} />

        <AdminActionPanel
          actions={[
            "Open Review",
            "Approve Placeholder",
            "Request More Evidence Placeholder",
            "Merge Duplicate Placeholder",
            "Reject Placeholder",
          ]}
          note="Review queue actions are local UI placeholders. Future review decisions must write audit logs and preserve the submitted evidence history."
          title="Review Actions"
        />
      </div>
    </AdminShell>
  );
}
