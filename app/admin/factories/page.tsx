import type { Metadata } from "next";
import { AdminActionPanel } from "@/components/admin/admin-action-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { FactoryStatsCard } from "@/components/admin/factories/factory-stats-card";
import { FactoryTable } from "@/components/admin/factories/factory-table";
import { factoryRecords, factoryStats } from "@/config/factory-database";

export const metadata: Metadata = {
  title: "Factory Database | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

const categoryFilters = [
  "All categories",
  "Bags and luggage",
  "Hardware",
  "Electronics accessories",
  "Household goods",
];

const cityFilters = [
  "All cities/provinces",
  "Guangdong",
  "Zhejiang",
  "Yiwu",
  "Shenzhen",
  "Guangzhou",
];

const verificationFilters = [
  "All verification statuses",
  "Unverified",
  "Basic Checked",
  "Evidence Reviewed",
  "Video Verified",
  "Document Verified",
  "Trusted Factory",
];

const trustScoreFilters = [
  "All trust scores",
  "85+ high trust",
  "70-84 usable",
  "50-69 needs caution",
  "Below 50 risk review",
];

const riskFilters = [
  "All risk flags",
  "None",
  "Contact Data Incomplete",
  "Conflicting Information",
  "Price Too Low",
  "Complaint History",
  "Blacklist Candidate",
];

function FilterSelect({
  id,
  label,
  options,
}: {
  id: string;
  label: string;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brand-navy" htmlFor={id}>
        {label}
      </label>
      <select
        className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-brand-muted"
        disabled
        id={id}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default function AdminFactoriesPage() {
  return (
    <AdminShell
      description="Internal verified sourcing intelligence for ChinaPak ImportHub."
      eyebrow="Admin Factory Database"
      title="Factory Database"
    >
      <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
        <h2 className="text-xl font-bold">Private factory data rule</h2>
        <p className="mt-2 text-sm leading-7">
          Factory data is private. Contact details must never be released to
          importers except through an admin-approved package workflow.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {factoryStats.map((stat) => (
          <FactoryStatsCard
            detail={stat.detail}
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">
              Search and Filters
            </h2>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              Placeholder controls for future Supabase-backed search, review
              queues, and role-protected database filtering.
            </p>
          </div>
          <span className="rounded-lg bg-brand-background px-3 py-1 text-xs font-bold text-brand-muted">
            UI placeholder
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label
              className="block text-sm font-semibold text-brand-navy"
              htmlFor="factory-search"
            >
              Search by factory name/code
            </label>
            <input
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 text-brand-muted"
              disabled
              id="factory-search"
              placeholder="FACT-BA-001 or factory display name"
              type="search"
            />
          </div>
          <FilterSelect
            id="factory-category"
            label="Category filter"
            options={categoryFilters}
          />
          <FilterSelect
            id="factory-city"
            label="Province/city filter"
            options={cityFilters}
          />
          <FilterSelect
            id="factory-verification"
            label="Verification status filter"
            options={verificationFilters}
          />
          <FilterSelect
            id="factory-trust"
            label="Trust score filter"
            options={trustScoreFilters}
          />
          <FilterSelect
            id="factory-risk"
            label="Risk flag filter"
            options={riskFilters}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
        <FactoryTable factories={factoryRecords} />

        <AdminActionPanel
          actions={[
            "Review Evidence",
            "Mark Needs Verification Placeholder",
            "Suspend Placeholder",
            "Open Review Queue",
          ]}
          note="Factory actions are UI placeholders only. Future mutations must be role-protected, audited, and connected to the internal database."
          title="Factory Actions"
        />
      </div>
    </AdminShell>
  );
}
