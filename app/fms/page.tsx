import type { Metadata } from "next";
import Link from "next/link";
import { CopyLinkButton } from "@/components/fms/copy-link-button";
import { FmsTrustNotice } from "@/components/fms/fms-acquisition-page";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { ROUTES, brand } from "@/config/brand";
import {
  buildFmsApplyTrackingHref,
  fmsAcquisitionKeywords,
  fmsSeoPages,
} from "@/config/fms-acquisition";

export const metadata: Metadata = {
  alternates: {
    canonical: ROUTES.fms,
  },
  description:
    "成为 ChinaPak ImportHub 工厂对接专员，帮助巴基斯坦进口商对接中国工厂、收集报价、照片、视频和供应商资料。人工审核，不开放公开注册。",
  openGraph: {
    description:
      "Chinese-first FMS acquisition hub for China-based sourcing specialists. Applications are reviewed manually by admin.",
    locale: "zh_CN",
    title: "成为 ChinaPak ImportHub 工厂对接专员",
    type: "website",
    url: ROUTES.fms,
  },
  keywords: [...fmsAcquisitionKeywords],
  twitter: {
    card: "summary",
    description:
      "Chinese-first FMS acquisition hub for China-based sourcing specialists. Manual approval only; public FMS signup is disabled.",
    title: "ChinaPak ImportHub FMS",
  },
  title: "成为 ChinaPak ImportHub 工厂对接专员",
};

const tasks = [
  "根据 Import Project 要求寻找合适中国工厂",
  "收集报价、MOQ、交期、照片、视频和供应商资料",
  "整理产品匹配度、质量风险和谈判备注",
  "把工厂选项提交给管理员审核，而不是直接发给进口商",
];

const processSteps = [
  "候选人提交 FMS 申请",
  "管理员人工审核城市、类别和经验",
  "合格候选人完成后续沟通或邀请流程",
  "通过审核的 FMS 才能收到平台分配的任务",
  "所有提交先由管理员审核，再决定是否整理给进口商",
];

const earningNotes = [
  "平台以项目、难度、里程碑和质量来评估工作，不承诺固定收入。",
  "不同 FMS 等级和任务复杂度会影响后续合作范围。",
  "未经管理员批准，不允许向进口商或工厂收取平台外费用。",
];

export default function FmsPage() {
  const applyHref = buildFmsApplyTrackingHref({
    pageType: "hub",
    sourcePage: ROUTES.fms,
  });
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brand.name,
      url: `https://${brand.domain}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      description: metadata.description,
      inLanguage: "zh-CN",
      name: metadata.title,
      publisher: {
        "@type": "Organization",
        name: brand.name,
        url: `https://${brand.domain}`,
      },
      url: `https://${brand.domain}${ROUTES.fms}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: "不会。FMS 申请只会创建管理员审核线索，不会创建账号、角色或 FMS 档案。",
          },
          name: "申请后会自动开通 FMS 账号吗？",
        },
        {
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: "不可以。FMS 不会看到进口商私人联系方式，也不能私下联系进口商。",
          },
          name: "FMS 可以直接联系进口商吗？",
        },
      ],
    },
  ];

  return (
    <main className="bg-brand-background" lang="zh-CN">
      <JsonLd data={jsonLd} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.78fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-emerald">
              Factory Match Specialist
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-navy sm:text-5xl">
              成为 ChinaPak ImportHub 工厂对接专员
            </h1>
            <p className="mt-5 text-lg leading-9 text-brand-muted">
              帮助巴基斯坦进口商对接中国工厂、收集报价、照片、视频和供应商资料。
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-muted" lang="en">
              ChinaPak ImportHub helps Pakistani importers find suitable Chinese
              factories through an admin-reviewed platform workflow. Public FMS
              signup remains disabled; candidates apply for manual review only.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href={applyHref} variant="secondary">
                Apply as FMS
              </Button>
              <Button href={ROUTES.fmsFactoryMatchSpecialist} variant="outline">
                Learn how FMS work
              </Button>
            </div>
            <p className="mt-4 text-sm text-brand-muted">
              已获批准的 FMS 可使用{" "}
              <Link
                className="font-semibold text-brand-emerald hover:text-brand-navy"
                href={ROUTES.fmsLogin}
              >
                FMS Login
              </Link>
              进入受保护门户。
            </p>
          </div>
          <FmsTrustNotice />
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-2xl font-bold text-brand-navy">
              ChinaPak ImportHub 做什么？
            </h2>
            <div className="mt-4 space-y-3 text-base leading-8 text-brand-muted">
              <p>
                平台服务巴基斯坦 shopkeepers、wholesalers、retailers 和第一次进口的中小企业。他们提交 Import Project，管理员审核需求和付款状态，然后把合适项目分配给经过审核的 FMS。
              </p>
              <p>
                FMS 在中国侧寻找合适工厂，收集工厂报价、照片、视频、产品资料和风险说明。提交内容先给管理员审核，进口商只会看到经过整理和脱敏的安全报告。
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-brand-navy">
              微信分享
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              适合熟悉中国供应链、1688、阿里巴巴供应商或产业带资源的朋友。保存此页面或复制链接后可分享到微信。
            </p>
            <div className="mt-4">
              <CopyLinkButton />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-5">
              <h2 className="text-xl font-bold text-brand-navy">
                FMS 主要任务
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-muted">
                {tasks.map((task) => (
                  <li className="border-l-4 border-brand-emerald pl-3" key={task}>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-5">
              <h2 className="text-xl font-bold text-brand-navy">
                审核流程
              </h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-brand-muted">
                {processSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-lg border border-slate-200 p-5">
              <h2 className="text-xl font-bold text-brand-navy">
                收入和合作说明
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-brand-muted">
                {earningNotes.map((note) => (
                  <li className="border-l-4 border-brand-gold pl-3" key={note}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-navy">
              FMS 关键词与适合背景
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              如果你正在寻找中国采购代理兼职、外贸采购兼职、供应商资料收集兼职或外贸自由职业机会，可以先了解平台规则再提交申请。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {fmsAcquisitionKeywords.map((keyword) => (
                <span
                  className="rounded-full border border-slate-200 bg-brand-background px-3 py-1 text-xs font-semibold text-brand-muted"
                  key={keyword}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-navy">
              SEO learning pages
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              阅读更多关于城市、类别和 FMS 工作边界的中文说明。
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {fmsSeoPages.slice(0, 8).map((page) => (
                <Link
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-emerald hover:border-brand-emerald hover:text-brand-navy"
                  href={page.canonicalPath}
                  key={page.canonicalPath}
                >
                  {page.h1}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6">
          <h2 className="text-3xl font-bold">
            准备申请成为 FMS 候选人？
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80">
            提交申请后，管理员会审核你的城市、类别经验、语言能力和合规意识。申请不会自动开通账号。
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={applyHref} variant="gold">
              Apply as FMS
            </Button>
            <Button href={ROUTES.fmsLogin} variant="lightOutline">
              Approved FMS Login
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
