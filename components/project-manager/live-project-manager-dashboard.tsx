"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getProjectManagerDashboardAction,
  type ProjectManagerDashboardData,
  type ProjectManagerProjectListItem,
} from "@/app/project-manager/projects/actions";
import { ProjectManagerStatus } from "@/components/project-manager/project-manager-status";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login as a Project Manager to view the dashboard.");
  }

  return session.access_token;
}

function ProjectList({
  emptyText,
  projects,
  title,
}: {
  emptyText: string;
  projects: ProjectManagerProjectListItem[];
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
        <Link
          className="text-sm font-bold text-brand-emerald no-underline hover:text-brand-navy"
          href={ROUTES.projectManagerProjects}
        >
          View all projects
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {projects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-brand-muted">
            {emptyText}
          </p>
        ) : (
          projects.map((project) => (
            <Link
              className="block rounded-lg border border-slate-200 bg-white p-4 no-underline transition hover:border-brand-emerald hover:shadow-sm"
              href={`${ROUTES.projectManagerProjects}/${project.projectCode}`}
              key={project.id}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-gold" translate="no">
                    {project.projectCode}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-brand-navy">
                    {project.product}
                  </h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    {project.importerName} | {project.packageName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ProjectManagerStatus value={project.managerWorkflowLabel} />
                  <ProjectManagerStatus value={project.projectStatus} />
                  <ProjectManagerStatus value={project.adminReviewStatus} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

export function LiveProjectManagerDashboard() {
  const [data, setData] = useState<ProjectManagerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await getProjectManagerDashboardAction(accessToken);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setData(result.data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Project Manager dashboard could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading Project Manager dashboard...
      </div>
    );
  }

  if (message || !data) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        {message || "Project Manager dashboard data is unavailable."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Projects", data.counts.total],
          ["Needs Importer Info", data.counts.needsImporterInfo],
          ["Pending Admin Action", data.counts.pendingAdminAction],
          ["Escalated", data.counts.escalated],
        ].map(([label, count]) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={label}
          >
            <p className="text-sm font-semibold text-brand-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold text-brand-navy">{count}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Project-flow focus",
            body: "Use the queue to identify missing importer details, stale reviews, and projects ready for Admin review.",
          },
          {
            title: "Escalate safely",
            body: "Escalate restricted payment, FMS assignment, report release, or refund decisions to Admin instead of taking them here.",
          },
          {
            title: "Mobile operations",
            body: "Open a project card to add internal notes, set safe markers, and keep the timeline clear from the field.",
          },
        ].map((item) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={item.title}
          >
            <h2 className="text-base font-bold text-brand-navy">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              {item.body}
            </p>
          </div>
        ))}
      </section>

      <ProjectList
        emptyText="No projects currently need Project Manager attention."
        projects={data.needsAttention}
        title="Projects Needing Attention"
      />
      <ProjectList
        emptyText="No recent projects are available yet."
        projects={data.recentProjects}
        title="Recently Updated Projects"
      />
    </div>
  );
}
