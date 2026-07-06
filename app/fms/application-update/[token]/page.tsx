import type { Metadata } from "next";
import Link from "next/link";
import {
  getFmsApplicationUpdateView,
} from "@/app/fms/application-update/[token]/actions";
import { FmsApplicationUpdateForm } from "@/components/fms/fms-application-update-form";
import { ROUTES, brand } from "@/config/brand";

type FmsApplicationUpdatePageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Update FMS Application | ChinaPak ImportHub",
  description:
    "Secure token-scoped update page for existing ChinaPak ImportHub FMS applications.",
  robots: { index: false, follow: false },
};

export default async function FmsApplicationUpdatePage({
  params,
}: FmsApplicationUpdatePageProps) {
  const { token } = await params;
  const view = await getFmsApplicationUpdateView(token);

  if (!view.ok) {
    return (
      <main className="min-h-screen bg-brand-background px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-error">
            Application update link
          </p>
          <h1 className="mt-3 text-3xl font-bold text-brand-navy">
            This application update link is invalid or expired.
          </h1>
          <p className="mt-4 text-sm leading-7 text-brand-muted">
            For your privacy, we cannot confirm whether an application exists
            from this page. Please use the latest secure update link sent by{" "}
            <span translate="no">{brand.name}</span>, contact support, or submit
            a new FMS application if you were asked to reapply.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy bg-brand-navy px-4 py-2 text-sm font-bold text-white no-underline transition hover:border-brand-emerald hover:bg-brand-emerald"
              href={ROUTES.fmsApply}
            >
              Submit a new application
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-navy bg-white px-4 py-2 text-sm font-bold text-brand-navy no-underline transition hover:border-brand-emerald hover:text-brand-emerald"
              href={ROUTES.contact}
            >
              Contact support
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
        <FmsApplicationUpdateForm data={view.data} />

        <aside className="space-y-4 rounded-lg border border-brand-emerald bg-emerald-50 p-5 text-sm leading-7 text-brand-navy">
          <div>
            <p className="font-semibold uppercase tracking-wide text-brand-emerald">
              Secure update link
            </p>
            <h1 className="mt-2 text-2xl font-bold">
              Update your existing FMS application
            </h1>
          </div>
          <p>
            This page updates your existing application only. It does not create
            a duplicate FMS application and it does not create an FMS account.
          </p>
          <p>
            Only the application fields in this form are visible here. Internal
            admin notes, review decisions, and platform workflow metadata are
            not shown to candidates.
          </p>
          <p>
            This update link expires on{" "}
            <span className="font-semibold" translate="no">
              {new Date(view.data.updateExpiresAt).toLocaleString("en", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            .
          </p>
        </aside>
      </div>
    </main>
  );
}
