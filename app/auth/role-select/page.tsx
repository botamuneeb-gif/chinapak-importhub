import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RoleCard } from "@/components/auth/role-card";
import { SecurityNotice } from "@/components/auth/security-notice";
import { authRoles } from "@/config/auth-roles";

export const metadata: Metadata = {
  title: "Select Role | ChinaPak ImportHub",
  description:
    "Role-based entry for importer, FMS, agent, admin, super admin, and invitation-only factory access.",
};

export default function RoleSelectPage() {
  return (
    <AuthShell
      description="Choose the portal type you need. Approved roles route to their protected dashboards after login."
      eyebrow="Role-based access"
      title="Select Your ChinaPak ImportHub Role"
    >
      <SecurityNotice title="Role routing" tone="info">
        Public importer access starts from login/signup. FMS, Agent, Admin,
        Super Admin, and Factory access require approved role assignments.
      </SecurityNotice>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {authRoles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
    </AuthShell>
  );
}
