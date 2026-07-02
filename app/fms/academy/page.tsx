import type { Metadata } from "next";
import { AcademyModuleCard } from "@/components/fms/academy-module-card";
import { FmsSectionCard } from "@/components/fms/fms-section-card";
import { FmsShell } from "@/components/fms/fms-shell";
import { FmsStatusBadge } from "@/components/fms/fms-status-badge";
import { academyModules, type AcademyStatus } from "@/config/fms-portal";

export const metadata: Metadata = {
  title: "FMS Academy | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

const certificationStatuses: AcademyStatus[] = [
  "Not Started",
  "In Progress",
  "Certified",
  "Suspended",
];

export default function FmsAcademyPage() {
  return (
    <FmsShell
      description="Onboarding and certification modules for sourcing quality, confidentiality, evidence standards, and anti-bypass rules."
      title="FMS Academy"
    >
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-muted">
              Certification status placeholder
            </p>
            <h2 className="mt-2 text-2xl font-bold text-brand-navy">
              In Progress
            </h2>
            <p className="mt-2 text-sm text-brand-muted" lang="zh-CN">
              完成认证后才可获得正式付费任务。
            </p>
          </div>
          <FmsStatusBadge status="In Progress" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Certification status options">
          {certificationStatuses.map((status) => (
            <FmsStatusBadge key={status} status={status} />
          ))}
        </div>
      </div>

      <FmsSectionCard title="Onboarding Modules">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {academyModules.map((module) => (
            <AcademyModuleCard key={module.id} module={module} />
          ))}
        </div>
      </FmsSectionCard>
    </FmsShell>
  );
}
