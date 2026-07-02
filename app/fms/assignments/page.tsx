import type { Metadata } from "next";
import { FmsSectionCard } from "@/components/fms/fms-section-card";
import { FmsShell } from "@/components/fms/fms-shell";
import { LiveFmsAssignmentsTable } from "@/components/fms/live-fms-assignments-table";

export const metadata: Metadata = {
  title: "FMS Assignments | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FmsAssignmentsPage() {
  return (
    <FmsShell
      description="Assigned sourcing projects only. Importer contact information is hidden by platform policy."
      title="Assignments"
    >
      <FmsSectionCard title="Assigned Projects">
        <LiveFmsAssignmentsTable />
      </FmsSectionCard>

      <div className="mt-6 rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
        FMS users can work only on assigned projects. All factory options,
        quotations, evidence, and notes must go to admin review before importer
        delivery.
      </div>
    </FmsShell>
  );
}
