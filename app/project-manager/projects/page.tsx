import type { Metadata } from "next";
import { LiveProjectManagerProjectsTable } from "@/components/project-manager/live-project-manager-projects-table";

export const metadata: Metadata = {
  title: "Project Manager Projects | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function ProjectManagerProjectsPage() {
  return (
    <main className="space-y-6" dir="ltr" lang="en">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-brand-gold">
          Limited Project Queue
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-navy">
          Project Manager Projects
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
          Search by Project ID, review safe project-flow status, add internal
          notes, set Project Manager markers, or escalate to Admin.
        </p>
      </section>
      <LiveProjectManagerProjectsTable />
    </main>
  );
}
