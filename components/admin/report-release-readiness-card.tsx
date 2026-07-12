import type { FactoryReportReadiness } from "@/config/factory-report-quality";

type ReportReleaseReadinessCardProps = {
  readiness: FactoryReportReadiness;
};

const toneByStatus = {
  needs_admin_review: "border-brand-gold bg-amber-50 text-brand-navy",
  not_ready: "border-brand-error bg-red-50 text-brand-error",
  ready_to_release: "border-brand-emerald bg-emerald-50 text-brand-emerald",
} as const;

export function ReportReleaseReadinessCard({
  readiness,
}: ReportReleaseReadinessCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        toneByStatus[readiness.status]
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide opacity-80">
            Release readiness
          </p>
          <h3 className="mt-1 text-lg font-black">{readiness.statusLabel}</h3>
        </div>
        <span className="w-fit rounded-lg border border-current bg-white/70 px-3 py-1 text-xs font-black">
          {readiness.missingItems.length === 0
            ? "Checklist complete"
            : `${readiness.missingItems.length} item(s) need review`}
        </span>
      </div>

      <ul className="mt-4 grid gap-2">
        {readiness.items.map((item) => (
          <li
            className="flex items-start gap-3 rounded-lg border border-current/20 bg-white/70 p-3 text-sm font-semibold leading-6"
            key={item.key}
          >
            <span
              aria-hidden="true"
              className={`mt-1 h-3 w-3 flex-none rounded-full ${
                item.checked ? "bg-brand-emerald" : "bg-brand-gold"
              }`}
            />
            <span>
              {item.label}
              {item.severity === "required" ? (
                <span className="ml-2 text-xs font-black uppercase opacity-70">
                  Required
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      {readiness.status !== "ready_to_release" ? (
        <p className="mt-4 text-sm font-semibold leading-6">
          Review missing items before release. Report release remains an Admin
          action; no report is auto-released by this checklist.
        </p>
      ) : (
        <p className="mt-4 text-sm font-semibold leading-6">
          The report has the expected importer-safe summary, reviewed options,
          risk review, and recommendation context for release.
        </p>
      )}
    </div>
  );
}
