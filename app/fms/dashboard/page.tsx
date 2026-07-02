import type { Metadata } from "next";
import { FmsShell } from "@/components/fms/fms-shell";
import { LiveFmsDashboard } from "@/components/fms/live-fms-dashboard";

export const metadata: Metadata = {
  title: "FMS Dashboard | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FmsDashboardPage() {
  return (
    <FmsShell
      description="View assigned sourcing work, prepare factory evidence, and submit updates to admin review. Only platform-assigned projects are visible."
      title="FMS Operations Dashboard"
    >
      <LiveFmsDashboard />
    </FmsShell>
  );
}
