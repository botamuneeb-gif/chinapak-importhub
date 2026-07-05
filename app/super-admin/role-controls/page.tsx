import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveUserManagement } from "@/components/super-admin/live-user-management";

export const metadata: Metadata = {
  title: "Role Controls | ChinaPak ImportHub Super Admin",
  robots: { index: false, follow: false },
};

export default function SuperAdminRoleControlsPage() {
  return (
    <main className="min-h-screen bg-brand-background" dir="ltr" lang="en">
      <section className="border-b border-slate-200 bg-brand-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-sm font-semibold text-brand-gold">
            Super Admin Control
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Role Controls
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78">
            Assign, revoke, convert, and repair active role assignments from a
            dedicated high-control workspace. Last-super-admin and self-lockout
            protections remain enforced by server actions.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Suspense
          fallback={
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-brand-muted shadow-sm">
              Loading Super Admin role controls...
            </div>
          }
        >
          <LiveUserManagement mode="role-controls" />
        </Suspense>
      </div>
    </main>
  );
}
