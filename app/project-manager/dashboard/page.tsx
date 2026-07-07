import type { Metadata } from "next";
import { LiveProjectManagerDashboard } from "@/components/project-manager/live-project-manager-dashboard";

export const metadata: Metadata = {
  title: "Project Manager Dashboard | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function ProjectManagerDashboardPage() {
  return (
    <main className="space-y-6" dir="ltr" lang="en">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-brand-gold">
          Project Flow Operations
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy">
          Project Manager Dashboard
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
          Monitor Import Projects, identify projects needing attention, and
          escalate restricted operational decisions to Admin.
        </p>
      </section>
      <LiveProjectManagerDashboard />
    </main>
  );
}
