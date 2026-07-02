"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listImporterProjectsAction,
  type ImporterProjectListItem,
} from "@/app/importer/projects/actions";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LiveImporterProjectsListProps = {
  compact?: boolean;
};

function getToneClasses(tone: ImporterProjectListItem["statusSummary"]["tone"]) {
  if (tone === "success") {
    return "border-brand-emerald bg-emerald-50 text-brand-emerald";
  }

  if (tone === "danger") {
    return "border-brand-error bg-red-50 text-brand-error";
  }

  if (tone === "attention") {
    return "border-brand-gold bg-amber-50 text-amber-800";
  }

  return "border-slate-300 bg-slate-50 text-brand-navy";
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm font-semibold leading-7 text-brand-navy shadow-sm">
      {children}
    </div>
  );
}

export function LiveImporterProjectsList({
  compact = false,
}: LiveImporterProjectsListProps) {
  const [projects, setProjects] = useState<ImporterProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

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
            setMessage("Login to your importer account to view Import Projects.");
            setIsLoading(false);
          }
          return;
        }

        const result = await listImporterProjectsAction(session.access_token);

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
            : "Import Projects could not be loaded.",
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
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-brand-muted shadow-sm">
        Loading your Import Projects...
      </div>
    );
  }

  if (message) {
    return <Notice>{message}</Notice>;
  }

  if (projects.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy">
          No import projects yet
        </h2>
        <p className="mt-2 text-sm leading-7 text-brand-muted">
          Start an Import Project to track payment, admin review, factory
          matching, reports, invoices, and refunds from one place.
        </p>
        <Link
          className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
          href={ROUTES.importerStart}
        >
          Start New Project
        </Link>
      </section>
    );
  }

  const visibleProjects = compact ? projects.slice(0, 5) : projects;

  return (
    <section className="space-y-4">
      <div className="grid gap-4">
        {visibleProjects.map((project) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={project.projectCode}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide text-brand-emerald"
                  translate="no"
                >
                  {project.projectCode}
                </p>
                <h2 className="mt-1 text-xl font-bold text-brand-navy">
                  {project.productTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  {project.productCategory} | {project.packageName}
                </p>
              </div>
              <span
                className={`w-fit rounded-lg border px-3 py-1 text-xs font-bold ${getToneClasses(
                  project.statusSummary.tone,
                )}`}
              >
                {project.statusSummary.label}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Payment
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {project.paymentStatus}
                </dd>
              </div>
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Admin Review
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {project.adminReviewStatus}
                </dd>
              </div>
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Report
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {project.reportStatus}
                </dd>
              </div>
              <div className="rounded-lg bg-brand-background p-3">
                <dt className="text-xs font-bold uppercase text-brand-muted">
                  Updated
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-navy">
                  {project.updatedAt}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-sm leading-7 text-brand-muted">
              {project.statusSummary.description}
            </p>

            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
              href={`${ROUTES.importerProjects}/${encodeURIComponent(
                project.projectCode,
              )}`}
            >
              View Details
            </Link>
          </article>
        ))}
      </div>

      {compact ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
            href={ROUTES.importerProjects}
          >
            View All Projects
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-emerald px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
            href={ROUTES.importerStart}
          >
            Start New Project
          </Link>
        </div>
      ) : null}
    </section>
  );
}
