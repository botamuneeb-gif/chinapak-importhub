import type { Metadata } from "next";
import Link from "next/link";
import { FmsApplicationForm } from "@/components/fms/fms-application-form";
import { FmsTrustNotice, FmsWeChatShareNote } from "@/components/fms/fms-acquisition-page";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { ROUTES, brand } from "@/config/brand";
import { buildFmsPageUrl } from "@/config/fms-acquisition";

export const metadata: Metadata = {
  alternates: {
    canonical: ROUTES.fmsApply,
  },
  description:
    "Apply for manual admin review as a ChinaPak ImportHub Factory Match Specialist. This is an application lead only, not public FMS signup.",
  openGraph: {
    description:
      "Submit an FMS application for admin review. Public FMS signup remains disabled.",
    title: "Apply as FMS | ChinaPak ImportHub",
    url: ROUTES.fmsApply,
  },
  title: "Apply as FMS | ChinaPak ImportHub",
};

export default function FmsApplyPage() {
  const pageUrl = buildFmsPageUrl(ROUTES.fmsApply);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    description:
      "Manual application page for China-based Factory Match Specialist candidates.",
    name: "Apply as Factory Match Specialist",
    publisher: {
      "@type": "Organization",
      name: brand.name,
      url: `https://${brand.domain}`,
    },
    url: pageUrl,
  };

  return (
    <main className="bg-brand-background" lang="zh-CN">
      <JsonLd data={jsonLd} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-emerald">
            FMS application
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-brand-navy sm:text-5xl">
            申请成为 ChinaPak ImportHub 工厂对接专员
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-9 text-brand-muted">
            请提交你的城市、产品类别、采购经验和联系方式。管理员会人工审核申请，符合条件的候选人才会收到后续联系。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.fms} variant="outline">
              Back to FMS overview
            </Button>
            <Button href={ROUTES.fmsFactoryMatchSpecialist} variant="outline">
              Learn FMS role
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
          <FmsApplicationForm />
          <aside className="space-y-5">
            <FmsTrustNotice />
            <FmsWeChatShareNote />
            <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7 text-brand-muted shadow-sm">
              <h2 className="text-lg font-bold text-brand-navy">
                What happens next?
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                <li>Your application becomes an admin-review lead.</li>
                <li>No auth user, role assignment, or FMS profile is created.</li>
                <li>Admin reviews experience, location, and category fit.</li>
                <li>Approved candidates may be contacted manually later.</li>
              </ol>
              <p className="mt-4">
                Already approved?{" "}
                <Link
                  className="font-semibold text-brand-emerald hover:text-brand-navy"
                  href={ROUTES.fmsLogin}
                >
                  Use FMS Login
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
