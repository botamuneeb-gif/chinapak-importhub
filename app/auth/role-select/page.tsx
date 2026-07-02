import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RoleCard } from "@/components/auth/role-card";
import { SecurityNotice } from "@/components/auth/security-notice";
import { authRoles } from "@/config/auth-roles";

export const metadata: Metadata = {
  title: "Select Role | ChinaPak ImportHub",
  description:
    "Role-based entry placeholder for importer, FMS, agent, admin, super admin, and future factory access.",
};

export default function RoleSelectPage() {
  return (
    <AuthShell
      description="Choose the portal type you need. Future authentication will route each approved role to its own protected dashboard."
      eyebrow="Role-based access"
      title="Select Your ChinaPak ImportHub Role"
    >
      <SecurityNotice title="Role routing placeholder" tone="info">
        This page only routes to UI placeholders. It does not verify identity,
        create a session, check permissions, or activate hidden factory access.
      </SecurityNotice>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {authRoles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>
    </AuthShell>
  );
}
