import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityNotice } from "@/components/auth/security-notice";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Factory Portal | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FactoryPage() {
  return (
    <AuthShell
      description="Factory portal access is invitation-only and hidden from public navigation for MVP launch."
      eyebrow="Factory portal status"
      lang="zh-CN"
      title="工厂入口"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-bold text-brand-navy">
            Invitation-only factory access
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            ChinaPak ImportHub keeps the factory database internal and private.
            Factory accounts are activated only after admin review and explicit
            invitation.
          </p>
          <p className="mt-3 text-sm leading-7 text-brand-muted" lang="zh-CN">
            工厂数据目前属于内部私有资料，公开注册暂未开放。
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.factoryLogin} variant="secondary">
              Factory login status
            </Button>
            <Button href={ROUTES.factoriesPartnership} variant="outline">
              Partnership information
            </Button>
          </div>
        </div>

        <SecurityNotice title="Private data rule" tone="danger">
          Factory contact details, bank/payment notes, importer contact details,
          and raw sourcing evidence remain admin-controlled.
        </SecurityNotice>
      </div>
    </AuthShell>
  );
}

