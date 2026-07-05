import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Super Admin Portal | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function SuperAdminPage() {
  return (
    <main className="min-h-screen bg-brand-background" dir="ltr" lang="en">
      <section className="border-b border-slate-200 bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-sm font-semibold text-brand-gold">
            Restricted Platform Control
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Super Admin Portal
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78">
            Highest-privilege workspace for platform settings, users, pricing,
            permissions, and audit-sensitive operations.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            User Management
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Search users by safe identity/profile fields and reset passwords
            through the controlled Super Admin flow.
          </p>
          <Link
            className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-brand-emerald px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-brand-navy"
            href={ROUTES.superAdminUsers}
          >
            Open User Management
          </Link>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            FMS Applications
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Final-review FMS applications forwarded by Admin. Approval uses
            invite-based setup when possible and never creates default
            passwords.
          </p>
          <Link
            className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-brand-gold px-5 py-3 text-sm font-bold text-brand-navy no-underline transition hover:bg-brand-navy hover:text-white"
            href={ROUTES.superAdminFmsApplications}
          >
            Open FMS Applications
          </Link>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-brand-navy">
            Future Platform Settings
          </h2>
          <p className="mt-2 text-sm leading-7 text-brand-muted">
            Pricing, business rules, package settings, and permissions remain
            future modules. Do not hard-code settings that should become
            configurable.
          </p>
        </article>
      </section>
    </main>
  );
}
