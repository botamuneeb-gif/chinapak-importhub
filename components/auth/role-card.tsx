import { AuthActionButton } from "@/components/auth/auth-action-button";
import type { AuthRole } from "@/config/auth-roles";

type RoleCardProps = {
  role: AuthRole;
};

export function RoleCard({ role }: RoleCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-emerald">
            {role.subtitle}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">
            {role.title}
          </h2>
        </div>
        <span className="rounded-lg bg-brand-background px-3 py-1 text-xs font-bold text-brand-muted">
          {role.statusLabel}
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-brand-muted">
        {role.description}
      </p>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="rounded-lg bg-brand-background p-3">
          <dt className="font-semibold text-brand-navy">Access model</dt>
          <dd className="mt-1 text-brand-muted">{role.accessModel}</dd>
        </div>
        <div className="rounded-lg bg-brand-background p-3">
          <dt className="font-semibold text-brand-navy">Future dashboard</dt>
          <dd className="mt-1 text-brand-muted">{role.futureDashboard}</dd>
        </div>
      </dl>
      <div className="mt-5">
        <AuthActionButton href={role.href} variant="outline">
          Continue
        </AuthActionButton>
      </div>
    </article>
  );
}
