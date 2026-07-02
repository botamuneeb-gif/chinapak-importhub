"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  listAdminImportProjectsAction,
  type AdminLiveProjectListItem,
} from "@/app/admin/projects/actions";
import { AdminActionPanel } from "@/components/admin/admin-action-panel";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminTable } from "@/components/admin/admin-table";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const columns = [
  "Project ID",
  "Importer Name",
  "City",
  "Product",
  "Package",
  "Payment Status",
  "Project Status",
  "Admin Review",
  "Readiness",
  "Created Date",
  "Admin Action",
];

type ProjectQueueFilter =
  | "all"
  | "awaiting_payment"
  | "payment_verified"
  | "admin_review_not_started"
  | "approved"
  | "needs_information"
  | "rejected"
  | "ready_for_fms_assignment";

const filterLabels: Record<ProjectQueueFilter, string> = {
  admin_review_not_started: "Review Not Started",
  all: "All",
  approved: "Approved",
  awaiting_payment: "Awaiting Payment",
  needs_information: "Needs Info",
  payment_verified: "Payment Verified",
  ready_for_fms_assignment: "Ready for FMS",
  rejected: "Rejected",
};

export function LiveAdminProjectsTable() {
  const [projects, setProjects] = useState<AdminLiveProjectListItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<ProjectQueueFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (activeFilter === "all") {
          return true;
        }

        if (activeFilter === "awaiting_payment") {
          return project.paymentStatusRaw === "awaiting_payment";
        }

        if (activeFilter === "payment_verified") {
          return project.paymentStatusRaw === "paid";
        }

        if (activeFilter === "admin_review_not_started") {
          return project.adminReviewStatusRaw === "not_started";
        }

        if (activeFilter === "approved") {
          return project.adminReviewStatusRaw === "ready_for_fms_assignment";
        }

        if (activeFilter === "needs_information") {
          return project.adminReviewStatusRaw === "needs_information";
        }

        if (activeFilter === "rejected") {
          return project.adminReviewStatusRaw === "rejected";
        }

        return project.readinessStatus === "ready_for_fms_assignment";
      }),
    [activeFilter, projects],
  );

  const filterCounts = useMemo(
    () =>
      ({
        admin_review_not_started: projects.filter(
          (project) => project.adminReviewStatusRaw === "not_started",
        ).length,
        all: projects.length,
        approved: projects.filter(
          (project) =>
            project.adminReviewStatusRaw === "ready_for_fms_assignment",
        ).length,
        awaiting_payment: projects.filter(
          (project) => project.paymentStatusRaw === "awaiting_payment",
        ).length,
        needs_information: projects.filter(
          (project) => project.adminReviewStatusRaw === "needs_information",
        ).length,
        payment_verified: projects.filter(
          (project) => project.paymentStatusRaw === "paid",
        ).length,
        ready_for_fms_assignment: projects.filter(
          (project) => project.readinessStatus === "ready_for_fms_assignment",
        ).length,
        rejected: projects.filter(
          (project) => project.adminReviewStatusRaw === "rejected",
        ).length,
      }) satisfies Record<ProjectQueueFilter, number>,
    [projects],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (isMounted) {
            setMessage("Please login as an admin to view live projects.");
            setIsLoading(false);
          }
          return;
        }

        const result = await listAdminImportProjectsAction(
          session.access_token,
        );

        if (!isMounted) {
          return;
        }

        if (!result.ok) {
          setMessage(result.message);
          setIsLoading(false);
          return;
        }

        setProjects(result.data);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "Live project loading is not configured yet.",
        );
        setIsLoading(false);
      }
    }

    void loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
        Loading live Import Projects from Supabase...
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
    <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          {(Object.keys(filterLabels) as ProjectQueueFilter[]).map((filter) => (
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
        </div>

        <AdminTable columns={columns} label="Live Import projects">
          {projects.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-brand-muted" colSpan={columns.length}>
                No live Import Projects have been submitted yet.
              </td>
            </tr>
          ) : filteredProjects.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-brand-muted" colSpan={columns.length}>
                No projects match this filter.
              </td>
            </tr>
          ) : (
            filteredProjects.map((project) => (
              <tr className="align-top hover:bg-brand-background" key={project.id}>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-navy">
                  {project.projectCode}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-text">
                  {project.importerName}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {project.city}
                </td>
                <td className="min-w-48 px-4 py-4 text-brand-text">
                  <span className="block">{project.product}</span>
                  <span className="mt-1 block text-xs text-brand-muted">
                    Budget: {project.budgetRange}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  <span className="block">{project.packageName}</span>
                  <span className="text-xs">{project.packagePrice}</span>
                </td>
                <td className="px-4 py-4">
                  <AdminStatusBadge status={project.paymentStatus} />
                </td>
                <td className="px-4 py-4">
                  <AdminStatusBadge status={project.projectStatus} />
                </td>
                <td className="px-4 py-4">
                  <AdminStatusBadge status={project.adminReviewStatus} />
                </td>
                <td className="min-w-48 px-4 py-4">
                  <AdminStatusBadge status={project.readinessLabel} />
                  <span className="mt-2 block text-xs leading-5 text-brand-muted">
                    {project.readinessDescription}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-brand-muted">
                  {project.createdDate}
                </td>
                <td className="min-w-56 px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white no-underline hover:bg-brand-emerald"
                      href={`/admin/projects/${project.projectCode}`}
                    >
                      Review Project
                    </Link>
                    <button
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-brand-navy opacity-70"
                      disabled
                      type="button"
                    >
                      Prepare Assignment Placeholder
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      </div>

      <div className="min-w-0">
        <AdminActionPanel
          actions={["Mark Needs Info", "Prepare Assignment", "View Timeline"]}
          note="Use each project detail page for live payment and admin review actions. Bulk actions and FMS assignment remain placeholders."
          title="Bulk Action Placeholder"
        />
      </div>
    </div>
  );
}
