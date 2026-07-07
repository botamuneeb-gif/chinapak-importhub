"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  listProjectManagerProjectsAction,
  type ProjectManagerProjectListItem,
} from "@/app/project-manager/projects/actions";
import { ProjectManagerStatus } from "@/components/project-manager/project-manager-status";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type QueueFilter =
  | "all"
  | "needs_attention"
  | "needs_importer_info"
  | "ready_for_admin_review"
  | "escalated_to_admin"
  | "awaiting_payment";

const filterLabels: Record<QueueFilter, string> = {
  all: "All",
  awaiting_payment: "Awaiting Payment",
  escalated_to_admin: "Escalated",
  needs_attention: "Needs Attention",
  needs_importer_info: "Needs Importer Info",
  ready_for_admin_review: "Ready for Admin",
};

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login as a Project Manager to view projects.");
  }

  return session.access_token;
}

function matchesAttention(project: ProjectManagerProjectListItem) {
  return (
    project.managerWorkflowState === "needs_importer_info" ||
    project.managerWorkflowState === "ready_for_admin_review" ||
    project.managerWorkflowState === "escalated_to_admin" ||
    project.adminReviewStatusRaw === "needs_information" ||
    project.projectStatusRaw === "admin_quality_review" ||
    project.projectStatusRaw === "factory_options_submitted"
  );
}

export function LiveProjectManagerProjectsTable() {
  const [projects, setProjects] = useState<ProjectManagerProjectListItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<QueueFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const statusMatches = (() => {
        if (activeFilter === "all") {
          return true;
        }

        if (activeFilter === "needs_attention") {
          return matchesAttention(project);
        }

        if (activeFilter === "awaiting_payment") {
          return project.paymentStatusRaw === "awaiting_payment";
        }

        return project.managerWorkflowState === activeFilter;
      })();

      if (!statusMatches) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        project.projectCode,
        project.id,
        project.product,
        project.importerName,
        project.importerCity,
        project.packageName,
        project.paymentStatus,
        project.adminReviewStatus,
        project.projectStatus,
        project.managerWorkflowLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeFilter, projects, searchQuery]);

  const filterCounts = useMemo(
    () =>
      ({
        all: projects.length,
        awaiting_payment: projects.filter(
          (project) => project.paymentStatusRaw === "awaiting_payment",
        ).length,
        escalated_to_admin: projects.filter(
          (project) => project.managerWorkflowState === "escalated_to_admin",
        ).length,
        needs_attention: projects.filter(matchesAttention).length,
        needs_importer_info: projects.filter(
          (project) => project.managerWorkflowState === "needs_importer_info",
        ).length,
        ready_for_admin_review: projects.filter(
          (project) => project.managerWorkflowState === "ready_for_admin_review",
        ).length,
      }) satisfies Record<QueueFilter, number>,
    [projects],
  );

  async function loadProjects() {
    setIsLoading(true);
    setMessage("");

    try {
      const accessToken = await getAccessToken();
      const result = await listProjectManagerProjectsAction(accessToken);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setProjects(result.data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Project Manager projects could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const urlQuery = new URLSearchParams(window.location.search).get("q");

    if (urlQuery) {
      setSearchQuery(urlQuery);
    }

    void loadProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading Project Manager project queue...
      </div>
    );
  }

  if (message) {
    return (
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-6 text-sm leading-7 text-brand-navy shadow-sm">
        {message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="grid gap-2 text-sm font-semibold text-brand-navy">
          Search projects
          <input
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-brand-text"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Project ID, UUID, product, importer, city, or status"
            translate="no"
            value={searchQuery}
          />
        </label>
      </section>

      <section className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        {(Object.keys(filterLabels) as QueueFilter[]).map((filter) => (
          <button
            className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
              activeFilter === filter
                ? "border-brand-emerald bg-emerald-50 text-brand-emerald"
                : "border-slate-300 bg-white text-brand-navy hover:border-brand-gold"
            }`}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filterLabels[filter]} ({filterCounts[filter]})
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                {[
                  "Project ID",
                  "Product",
                  "Importer",
                  "Package",
                  "Payment",
                  "Project Status",
                  "Admin Review",
                  "PM Marker",
                  "Updated",
                  "Action",
                ].map((column) => (
                  <th className="px-4 py-3 font-bold" key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-brand-muted"
                    colSpan={10}
                  >
                    No projects match this Project Manager filter.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-4 py-4 font-bold text-brand-navy" translate="no">
                      {project.projectCode}
                    </td>
                    <td className="px-4 py-4 text-brand-text">{project.product}</td>
                    <td className="px-4 py-4 text-brand-muted">
                      {project.importerName}
                      <span className="block text-xs">{project.importerCity}</span>
                    </td>
                    <td className="px-4 py-4 text-brand-muted">
                      {project.packageName}
                    </td>
                    <td className="px-4 py-4">
                      <ProjectManagerStatus value={project.paymentStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <ProjectManagerStatus value={project.projectStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <ProjectManagerStatus value={project.adminReviewStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <ProjectManagerStatus value={project.managerWorkflowLabel} />
                    </td>
                    <td className="px-4 py-4 text-brand-muted">
                      {project.updatedAt}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        className="inline-flex min-h-10 items-center rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white no-underline transition hover:bg-brand-emerald"
                        href={`${ROUTES.projectManagerProjects}/${project.projectCode}`}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
