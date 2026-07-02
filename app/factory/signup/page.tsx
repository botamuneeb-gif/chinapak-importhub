import type { Metadata } from "next";
import { AuthActionButton } from "@/components/auth/auth-action-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";

export const metadata: Metadata = {
  title: "Factory Signup Future | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FactorySignupPage() {
  return (
    <AuthShell
      description="Public factory signup is not active in Phase 1. This page is prepared for future activation."
      eyebrow="Factory future activation"
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
        <AuthCard title="Future factory inquiry placeholder">
          <form aria-label="Factory signup placeholder form" className="grid gap-4">
            <AuthInput
              id="factory-name"
              label="Factory name"
              placeholder="Factory display name"
            />
            <AuthInput
              id="factory-chinese-name"
              label="Chinese business name"
              placeholder="中文营业名称"
            />
            <AuthInput
              id="factory-city"
              label="City/province"
              placeholder="Guangzhou, Guangdong"
            />
            <AuthInput
              id="factory-products"
              label="Main products"
              placeholder="Bags, electronics, tools..."
            />
            <AuthInput
              id="factory-contact-person"
              label="Contact person"
              placeholder="Contact person"
            />
            <AuthInput
              id="factory-phone-wechat"
              label="Phone/WeChat"
              placeholder="Phone or WeChat ID"
            />
            <AuthInput
              id="factory-website"
              label="Website/Alibaba link"
              placeholder="https://..."
            />
            <AuthActionButton disabled variant="secondary">
              Submit inquiry placeholder
            </AuthActionButton>
          </form>
        </AuthCard>

        <div className="space-y-6">
          <SecurityNotice title="Phase 1 rule">
            Factory accounts and public signup are not active yet. Factory data
            remains internal and admin-controlled until future activation.
          </SecurityNotice>
          <SecurityNotice title="中文说明" tone="info">
            <p lang="zh-CN">
              工厂入口目前仅为未来系统结构预留，尚未开放公开注册。
            </p>
          </SecurityNotice>
        </div>
      </div>
    </AuthShell>
  );
}
