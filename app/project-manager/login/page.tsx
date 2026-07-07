import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RoleLoginForm } from "@/components/auth/role-login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Project Manager Login | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function ProjectManagerLoginPage() {
  return (
    <AuthShell
      description="Limited internal project-flow access for authorized ChinaPak ImportHub Project Managers."
      eyebrow="Internal Operations Portal"
      secureMode
      title="Project Manager Login"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Project Manager login">
          <RoleLoginForm
            allowedRoles={[USER_ROLES.projectManager]}
            notice="Project Manager login checks Supabase email/password and an active project_manager role assignment before opening the limited project-flow portal."
            submitLabel="Login to Project Manager portal"
          />
        </AuthCard>

        <SecurityNotice title="Access boundary" tone="warning">
          Project Managers can track project flow and escalate issues, but cannot
          verify payments, assign FMS, release reports, approve submissions, issue
          refunds, or manage users.
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}
