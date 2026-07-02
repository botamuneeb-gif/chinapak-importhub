import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { authSecurityPrinciples } from "@/config/auth-roles";

export const metadata: Metadata = {
  title: "Account Security | ChinaPak ImportHub",
  description:
    "Security principles for future ChinaPak ImportHub OTP login, role-based portals, communication control, and audit history.",
};

export default function AuthSecurityPage() {
  return (
    <AuthShell
      description="ChinaPak ImportHub authentication will protect project data, role access, contact details, factory data, and admin-controlled communication."
      eyebrow="Security information"
      title="How Account Access Will Stay Protected"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {authSecurityPrinciples.map((principle) => (
          <SecurityNotice key={principle.title} title={principle.title} tone="info">
            {principle.body}
          </SecurityNotice>
        ))}
      </div>
    </AuthShell>
  );
}
