"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import {
  searchAdminImportProjectsAction,
  type AdminLiveProjectListItem,
} from "@/app/admin/projects/actions";
import { ROUTES } from "@/config/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function projectMatches(
  project: AdminLiveProjectListItem,
  normalizedQuery: string,
) {
  return [
    project.projectCode,
    project.id,
    project.product,
    project.importerName,
    project.paymentStatus,
    project.projectStatus,
    project.adminReviewStatus,
    project.readinessLabel,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

async function getAccessToken() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error("Please login as admin before searching projects.");
  }

  return session.access_token;
}

export function AdminProjectLookup() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<AdminLiveProjectListItem[]>([]);
  const [message, setMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  async function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim().toLowerCase();
    setMessage("");
    setMatches([]);

    if (!normalizedQuery) {
      setMessage("Enter a Project ID or internal UUID.");
      return;
    }

    setIsSearching(true);

    try {
      const accessToken = await getAccessToken();
      const result = await searchAdminImportProjectsAction(
        accessToken,
        query.trim(),
      );

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      const exactMatch = result.data.find(
        (project) =>
          project.projectCode.toLowerCase() === normalizedQuery ||
          project.id.toLowerCase() === normalizedQuery,
      );

      if (exactMatch) {
        router.push(
          `${ROUTES.admin}/projects/${encodeURIComponent(
            exactMatch.projectCode,
          )}`,
        );
        return;
      }

      const nextMatches = result.data
        .filter((project) => projectMatches(project, normalizedQuery))
        .slice(0, 8);

      setMatches(nextMatches);
      setMessage(
        nextMatches.length > 0
          ? "Partial matches found. Choose a project below."
          : "No matching Import Project found by Project ID or UUID.",
      );
    } catch (lookupError) {
      setMessage(
        lookupError instanceof Error
          ? lookupError.message
          : "Project lookup could not be completed.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-emerald">Find Project</p>
          <h2 className="mt-1 text-2xl font-bold text-brand-navy">
            Search by Project ID
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Use the global Import Project ID when an importer contacts support
            about payment, reports, invoices, refunds, or FMS progress. Use
            the full Project ID for exact navigation.
          </p>
        </div>
      </div>
      <form
        className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]"
        onSubmit={submitLookup}
      >
        <label className="sr-only" htmlFor="admin-project-lookup">
          Project lookup
        </label>
        <input
          className="min-h-12 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-brand-text"
          id="admin-project-lookup"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="CPH-2026-0007 or internal UUID"
          translate="no"
          value={query}
        />
        <button
          className="min-h-12 rounded-lg bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-emerald disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSearching}
          type="submit"
        >
          {isSearching ? "Searching..." : "Find Project"}
        </button>
      </form>

      {message ? (
        <p className="mt-4 rounded-lg border border-brand-gold bg-amber-50 p-3 text-sm font-semibold text-brand-navy">
          {message}
        </p>
      ) : null}

      {matches.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {matches.map((project) => (
            <Link
              className="rounded-lg border border-slate-200 bg-brand-background p-3 no-underline transition hover:border-brand-emerald"
              href={`${ROUTES.admin}/projects/${encodeURIComponent(
                project.projectCode,
              )}`}
              key={project.id}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-bold text-brand-navy" translate="no">
                  {project.projectCode}
                </span>
                <span className="text-xs font-bold text-brand-muted">
                  {project.paymentStatus} | {project.adminReviewStatus}
                </span>
              </div>
              <p className="mt-1 text-sm text-brand-muted">
                {project.importerName} | {project.product}
              </p>
            </Link>
          ))}
          <Link
            className="text-sm font-bold text-brand-emerald underline"
            href={`${ROUTES.admin}/projects?q=${encodeURIComponent(query)}`}
          >
            Open full project list with this search
          </Link>
        </div>
      ) : null}
    </section>
  );
}
