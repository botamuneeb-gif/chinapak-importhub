import type { Metadata } from "next";
import Link from "next/link";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import {
  adminProjects,
  adminStats,
  recentAdminActivity,
  unpaidLeads,
} from "@/config/admin-projects";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Admin Project Review Center | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const newPaidProjects = adminProjects.filter(
    (project) => project.paymentStatus === "Paid",
  ).length;
  const readyProjects = adminProjects.filter(
    (project) => project.projectStatus === "Ready for FMS Assignment",
  ).length;

  return (
    <AdminShell
      description="Review paid Import Projects, monitor unpaid leads, prepare FMS assignments, and keep all communication under admin control."
      title="Admin Overview"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
          <AdminStatCard
            detail={stat.detail}
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      <div className="mt-8">
        <AdminSectionCard title="Operations Snapshot">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-brand-background p-4">
              <p className="text-sm font-semibold text-brand-muted">
                Paid review queue
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-navy">
                {newPaidProjects}
              </p>
            </div>
            <div className="rounded-lg bg-brand-background p-4">
              <p className="text-sm font-semibold text-brand-muted">
                Ready for assignment
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-navy">
                {readyProjects}
              </p>
            </div>
            <div className="rounded-lg bg-brand-background p-4">
              <p className="text-sm font-semibold text-brand-muted">
                Unpaid lead queue
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-navy">
                {unpaidLeads.length}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
            Admin reminder: no FMS work begins until payment is completed and
            admin review marks the Import Project ready for assignment.
          </div>
        </AdminSectionCard>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <AdminSectionCard title="Quick Links">
          <div className="grid gap-3">
            <Link
              className="rounded-lg border border-slate-200 bg-brand-background px-4 py-3 font-semibold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href="/admin/projects"
            >
              Open project list
            </Link>
            <Link
              className="rounded-lg border border-slate-200 bg-brand-background px-4 py-3 font-semibold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href="/admin/leads"
            >
              Open unpaid leads
            </Link>
            <Link
              className="rounded-lg border border-slate-200 bg-brand-background px-4 py-3 font-semibold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.adminFms}
            >
              Open FMS directory
            </Link>
            <Link
              className="rounded-lg border border-slate-200 bg-brand-background px-4 py-3 font-semibold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.adminPayments}
            >
              Open manual payments
            </Link>
            <Link
              className="rounded-lg border border-slate-200 bg-brand-background px-4 py-3 font-semibold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.adminRefunds}
            >
              Open refund review
            </Link>
            <Link
              className="rounded-lg border border-slate-200 bg-brand-background px-4 py-3 font-semibold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.adminFactorySubmissions}
            >
              Open factory submissions
            </Link>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Recent Activity">
          <ol className="space-y-4">
            {recentAdminActivity.map((activity) => (
              <li className="flex gap-3" key={activity.id}>
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-brand-emerald" />
                <div>
                  <p className="text-sm font-semibold text-brand-navy">
                    {activity.label}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {activity.time}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </AdminSectionCard>
      </div>

      <div className="hidden">
        <h2 className="text-xl font-bold text-brand-navy">
          Current Review Highlights
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {adminProjects.slice(0, 2).map((project) => (
            <Link
              className="rounded-lg border border-slate-200 bg-brand-background p-4 no-underline transition hover:border-brand-emerald"
              href={`/admin/projects/${project.id}`}
              key={project.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-bold text-brand-navy">{project.id}</p>
                <span className="text-sm font-semibold text-brand-muted">
                  {project.projectStatus}
                </span>
              </div>
              <p className="mt-2 text-sm text-brand-muted">
                {project.importer.name} · {project.product.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
