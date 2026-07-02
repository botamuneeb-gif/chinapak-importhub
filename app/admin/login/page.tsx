import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RoleLoginForm } from "@/components/auth/role-login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Admin Login | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <AuthShell
      description="Internal operations access for authorized ChinaPak ImportHub staff. Auth now verifies Supabase email/password and active admin role assignment."
      eyebrow="Internal Staff Portal"
      secureMode
      title="Admin Login"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Authorized staff login">
          <RoleLoginForm
            allowedRoles={[USER_ROLES.admin, USER_ROLES.superAdmin]}
            notice="Admin login uses Supabase email/password now, then checks active admin or super admin role assignment before redirect."
            submitLabel="Login to admin portal"
          />
        </AuthCard>

        <SecurityNotice title="Security notice" tone="danger">
          This portal is for authorized ChinaPak ImportHub staff only. 2FA is
          planned for a later security hardening phase.
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}
