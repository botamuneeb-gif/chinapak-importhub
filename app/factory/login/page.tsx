import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Factory Login | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FactoryLoginPage() {
  return (
    <AuthShell
      description="Factory portal is not publicly active. Access is available only by admin invitation."
      eyebrow="Factory portal status"
      lang="zh-CN"
      title="工厂账户登录"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Invitation-only factory access">
          <div className="grid gap-4 text-sm leading-7 text-brand-muted">
            <p>
              Factory accounts are not enabled as a public login flow for MVP
              launch. Approved factory participation is handled by ChinaPak
              ImportHub admin only.
            </p>
            <p>
              If you received direct instructions from ChinaPak ImportHub,
              contact support with your invitation details.
            </p>
          </div>
        </AuthCard>

        <div className="space-y-6">
          <SecurityNotice title="当前状态">
            <p lang="zh-CN">
              工厂账户暂未公开开放。仅限未来激活或管理员邀请使用。
            </p>
          </SecurityNotice>
          <SecurityNotice title="Factory signup">
            Factory signup remains hidden from public navigation. The prepared
            inquiry screen is at {ROUTES.factorySignup}.
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}
