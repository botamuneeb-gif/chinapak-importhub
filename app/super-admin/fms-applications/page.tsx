import type { Metadata } from "next";
import { LiveFmsApplications } from "@/components/super-admin/live-fms-applications";

export const metadata: Metadata = {
  title: "FMS Applications | ChinaPak ImportHub Super Admin",
  robots: { index: false, follow: false },
};

export default function SuperAdminFmsApplicationsPage() {
  return (
    <main className="min-h-screen bg-brand-background" dir="ltr" lang="en">
      <section className="border-b border-slate-200 bg-brand-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-sm font-semibold text-brand-gold">
            Super Admin Final Approval
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            FMS Applications
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78">
            Review FMS applications forwarded by Admin. Only Super Admin can
            approve FMS onboarding, create secure invite-based access, or mark
            applications as declined.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <LiveFmsApplications />
      </div>
    </main>
  );
}
