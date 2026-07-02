import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdminActionPanel } from "@/components/admin/admin-action-panel";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { FactoryAuditTimeline } from "@/components/admin/factories/factory-audit-timeline";
import { FactoryEvidenceGrid } from "@/components/admin/factories/factory-evidence-grid";
import { FactoryMatchingPanel } from "@/components/admin/factories/factory-matching-panel";
import { FactorySensitivePanel } from "@/components/admin/factories/factory-sensitive-panel";
import { FactoryStatusBadge } from "@/components/admin/factories/factory-status-badge";
import {
  factoryRecords,
  getFactoryById,
  type FactoryRecord,
} from "@/config/factory-database";

type FactoryDetailPageProps = {
  params: Promise<{ factoryId: string }>;
};

export function generateStaticParams() {
  return factoryRecords.map((factory) => ({ factoryId: factory.id }));
}

export async function generateMetadata({
  params,
}: FactoryDetailPageProps): Promise<Metadata> {
  const { factoryId } = await params;
  const factory = getFactoryById(factoryId);

  return {
    title: `${factory?.factoryCode ?? factoryId} Factory Record | ChinaPak ImportHub`,
    robots: { index: false, follow: false },
  };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0">
      <dt className="text-sm font-semibold text-brand-navy">{label}</dt>
      <dd className="mt-1 text-sm leading-7 text-brand-muted">{value}</dd>
    </div>
  );
}

function AdminControls({ factory }: { factory: FactoryRecord }) {
  const controls = [
    "Approve as Active Internal Record",
    "Request More Evidence",
    "Merge Duplicate Factory",
    "Mark Trusted",
    "Suspend",
    "Blacklist",
    "Invite Factory to Claim Profile Future",
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {controls.map((control) => (
          <button
            className="min-h-12 rounded-lg border border-slate-300 bg-brand-background px-4 py-3 text-sm font-bold text-brand-navy transition hover:border-brand-emerald hover:text-brand-emerald focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
            key={control}
            type="button"
          >
            {control}
          </button>
        ))}
      </div>
      <p className="mt-4 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
        Placeholder only: these controls do not edit {factory.factoryCode},
        notify an FMS, expose contacts, create a factory account, or update the
        future database yet.
      </p>
    </div>
  );
}

export default async function AdminFactoryDetailPage({
  params,
}: FactoryDetailPageProps) {
  const { factoryId } = await params;
  const factory = getFactoryById(factoryId);

  if (!factory) {
    notFound();
  }

  const tabs = [
    { href: "#profile", label: "Factory Profile" },
    { href: "#sensitive", label: "Sensitive Contact" },
    { href: "#evidence", label: "Evidence & Files" },
    { href: "#source", label: "Source & History" },
    { href: "#controls", label: "Review Controls" },
    { href: "#matching", label: "Matching Intelligence" },
    { href: "#audit", label: "Audit Timeline" },
  ];

  return (
    <AdminShell
      description="Review and manage an internal factory record without exposing sensitive contact details outside the admin-approved workflow."
      eyebrow="Admin Factory Database"
      title={`Factory Record: ${factory.factoryCode}`}
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Status</p>
          <div className="mt-2">
            <FactoryStatusBadge status={factory.status} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">
            Verification
          </p>
          <div className="mt-2">
            <FactoryStatusBadge status={factory.verificationStatus} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Trust Score</p>
          <p className="mt-2 text-2xl font-bold text-brand-navy">
            {factory.trustScore}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-brand-muted">Risk</p>
          <div className="mt-2">
            <FactoryStatusBadge status={factory.riskFlag} />
          </div>
        </div>
      </div>

      <AdminTabs tabs={tabs} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <AdminSectionCard id="profile" title="1. Factory Profile">
            <dl>
              <DetailRow label="Factory code" value={factory.factoryCode} />
              <DetailRow label="Display name" value={factory.displayName} />
              <DetailRow
                label="Chinese legal/business name"
                value={<span lang="zh-CN">{factory.chineseLegalName}</span>}
              />
              <DetailRow label="Category" value={factory.category} />
              <DetailRow
                label="Main products"
                value={factory.mainProducts.join(", ")}
              />
              <DetailRow
                label="City/province"
                value={factory.cityProvince}
              />
              <DetailRow
                label="Year established placeholder"
                value={factory.yearEstablishedPlaceholder}
              />
              <DetailRow
                label="Production capacity placeholder"
                value={factory.productionCapacityPlaceholder}
              />
              <DetailRow label="MOQ range" value={factory.moqRange} />
              <DetailRow
                label="Price range notes"
                value={factory.priceRangeNotes}
              />
              <DetailRow
                label="Production time notes"
                value={factory.productionTimeNotes}
              />
              <DetailRow
                label="Certifications"
                value={factory.certifications.join(", ")}
              />
              <DetailRow
                label="Status"
                value={<FactoryStatusBadge status={factory.status} />}
              />
              <DetailRow
                label="Verification status"
                value={<FactoryStatusBadge status={factory.verificationStatus} />}
              />
              <DetailRow label="Trust score" value={factory.trustScore} />
            </dl>
          </AdminSectionCard>

          <FactorySensitivePanel factory={factory} />

          <AdminSectionCard id="evidence" title="3. Evidence & Files">
            <FactoryEvidenceGrid evidence={factory.evidence} />
          </AdminSectionCard>

          <AdminSectionCard id="source" title="4. Source & History">
            <dl>
              <DetailRow
                label="Submitted by FMS"
                value={`${factory.submittedByFms} (${factory.submittedByFmsId})`}
              />
              <DetailRow
                label="Source assignment/project"
                value={`${factory.sourceAssignmentId} / ${factory.sourceProjectId}`}
              />
              <DetailRow
                label="Date submitted"
                value={factory.dateSubmitted}
              />
              <DetailRow
                label="Admin reviewer"
                value={factory.adminReviewer}
              />
              <DetailRow
                label="Last verified date"
                value={factory.lastVerifiedDate}
              />
              <DetailRow
                label="Number of matched projects"
                value={factory.matchedProjectCount}
              />
              <DetailRow
                label="Importer feedback placeholder"
                value={factory.importerFeedbackPlaceholder}
              />
              <DetailRow
                label="Complaint/dispute history placeholder"
                value={factory.complaintHistoryPlaceholder}
              />
            </dl>
          </AdminSectionCard>

          <AdminSectionCard id="controls" title="5. Admin Review Controls">
            <AdminControls factory={factory} />
          </AdminSectionCard>

          <AdminSectionCard id="matching" title="6. Matching Intelligence">
            <FactoryMatchingPanel factory={factory} />
          </AdminSectionCard>

          <AdminSectionCard id="audit" title="7. Audit Timeline">
            <FactoryAuditTimeline items={factory.auditTimeline} />
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <AdminActionPanel
            actions={[
              "Review Evidence",
              "Mark Needs Verification Placeholder",
              "Suspend Placeholder",
              "Open Matching Notes Placeholder",
            ]}
            note="All factory record actions are placeholders. Future implementation must enforce admin permissions, audit logs, and sensitive data controls."
            title="Record Actions"
          />

          <div className="rounded-lg border border-brand-error bg-red-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
            <h2 className="text-lg font-bold text-brand-error">
              Sensitive data policy
            </h2>
            <p className="mt-2">
              Factory contact details are admin-only. FMS cannot release them to
              importers directly, and importers may see only admin-approved
              factory information according to package rules.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-brand-navy">
              Future factory profile readiness
            </h2>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              This record shape is prepared so an admin-approved internal
              factory can later become a claimed factory profile when the hidden
              factory portal is activated.
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
