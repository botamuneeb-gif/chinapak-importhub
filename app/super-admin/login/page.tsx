import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RoleLoginForm } from "@/components/auth/role-login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Super Admin Login | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function SuperAdminLoginPage() {
  return (
    <AuthShell
      description="Restricted platform-control entry for founders and highest-privilege system owners. Auth now requires Supabase email/password and active super_admin role assignment."
      eyebrow="Restricted Platform Control"
      secureMode
      title="Super Admin Login"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <AuthCard className="border-brand-error" title="Highest privilege access">
          <RoleLoginForm
            allowedRoles={[USER_ROLES.superAdmin]}
            notice="Super Admin login requires an active super_admin role assignment. Recovery and 2FA controls remain planned security features."
            submitLabel="Login as Super Admin"
          />
        </AuthCard>

        <SecurityNotice title="Security warning" tone="danger">
          Super Admin access controls platform settings, users, pricing,
          permissions, and audit records. Do not create Super Admin users from
          public forms.
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}
