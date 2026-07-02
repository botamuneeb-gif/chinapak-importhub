import type { Metadata } from "next";
import { AuthActionButton } from "@/components/auth/auth-action-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
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
      description="Factory portal is not publicly active yet. Access is available only by invitation or future activation."
      eyebrow="Factory portal future"
      lang="zh-CN"
      title="工厂账户登录"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <AuthCard title="Invitation-only factory access">
          <form aria-label="Factory login placeholder form" className="grid gap-4">
            <AuthInput
              id="factory-login-contact"
              label="Factory email/phone placeholder"
              placeholder="factory@example.cn or phone"
            />
            <AuthInput
              id="factory-login-invite"
              label="Invitation code placeholder"
              placeholder="FACT-INV-XXXX"
            />
            <AuthActionButton disabled variant="secondary">
              Login placeholder
            </AuthActionButton>
          </form>
        </AuthCard>

        <div className="space-y-6">
          <SecurityNotice title="当前状态">
            <p lang="zh-CN">
              工厂账户暂未公开开放。仅限未来激活或管理员邀请使用。
            </p>
          </SecurityNotice>
          <SecurityNotice title="Future signup">
            Factory signup remains hidden from public navigation. The prepared
            inquiry screen is at {ROUTES.factorySignup}.
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}
