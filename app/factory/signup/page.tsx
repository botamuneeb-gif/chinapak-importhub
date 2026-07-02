import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";

export const metadata: Metadata = {
  title: "Factory Signup | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FactorySignupPage() {
  return (
    <AuthShell
      description="Public factory signup is not active for MVP launch. Factory participation is invitation-only."
      eyebrow="Factory invitation status"
      lang="zh-CN"
      title="工厂合作申请"
    >
      <div className="mb-6">
        <SecurityNotice title="Factory signup status" tone="danger">
          Factory signup is currently invitation-only and hidden from public
          navigation.
        </SecurityNotice>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Factory participation information">
          <div className="grid gap-3 text-sm leading-7 text-brand-muted">
            {[
              "Factory name and Chinese business name",
              "City/province and main product categories",
              "Official contact person and business website",
              "Business license, certificates, and evidence files",
              "Admin invitation before account activation",
            ].map((item) => (
              <div
                className="rounded-lg border border-slate-200 bg-brand-background p-3 font-semibold text-brand-navy"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </AuthCard>

        <div className="space-y-6">
          <SecurityNotice title="Phase 1 rule">
            Factory accounts and public signup are not active yet. Factory data
            remains internal and admin-controlled until invitation activation.
          </SecurityNotice>
          <SecurityNotice title="中文说明" tone="info">
            <p lang="zh-CN">
              工厂入口目前仅限邀请和管理员审核，尚未开放公开注册。
            </p>
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}

