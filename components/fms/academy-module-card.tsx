import { FmsStatusBadge } from "@/components/fms/fms-status-badge";
import type { AcademyModule } from "@/config/fms-portal";

type AcademyModuleCardProps = {
  module: AcademyModule;
};

export function AcademyModuleCard({ module }: AcademyModuleCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-brand-navy">{module.title}</h2>
          <p className="mt-1 text-sm font-semibold text-brand-emerald" lang="zh-CN">
            {module.chineseTitle}
          </p>
        </div>
        <FmsStatusBadge status={module.status} />
      </div>
      <p className="mt-4 text-sm leading-7 text-brand-muted">
        {module.description}
      </p>
      <button
        className="mt-5 min-h-11 rounded-lg border border-brand-navy bg-brand-background px-4 py-2 text-sm font-semibold text-brand-navy"
        type="button"
      >
        Open module placeholder
      </button>
    </article>
  );
}
