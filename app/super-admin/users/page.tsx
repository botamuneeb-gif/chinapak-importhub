import type { Metadata } from "next";
import { LiveUserManagement } from "@/components/super-admin/live-user-management";

export const metadata: Metadata = {
  title: "User Management | ChinaPak ImportHub Super Admin",
  robots: { index: false, follow: false },
};

export default function SuperAdminUsersPage() {
  return (
    <main className="min-h-screen bg-brand-background" dir="ltr" lang="en">
      <section className="border-b border-slate-200 bg-brand-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-sm font-semibold text-brand-gold">
            Super Admin Control
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            User Management
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78">
            Search safe identity/profile records by name, email, role, FMS code,
            business name, or status. Password reset is restricted to active
            Super Admin users and uses Supabase Admin Auth server-side only.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <LiveUserManagement />
      </div>
    </main>
  );
}
