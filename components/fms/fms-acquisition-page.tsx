import Link from "next/link";
import { CopyLinkButton } from "@/components/fms/copy-link-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { ROUTES, brand } from "@/config/brand";
import type { FmsSeoPage } from "@/config/fms-acquisition";
import {
  buildFmsApplyTrackingHref,
  buildFmsPageUrl,
  fmsAcquisitionKeywords,
} from "@/config/fms-acquisition";

type FmsSeoLandingPageProps = {
  page: FmsSeoPage;
};

const applicationBullets = [
  "管理员人工审核后才可能开通 FMS 账号",
  "FMS 不会看到进口商私人联系方式",
  "工厂联系方式和敏感资料保持管理员控制",
  "申请不代表保证收入、固定任务或自动录用",
];

export function FmsTrustNotice() {
  return (
    <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
      <h2 className="text-lg font-bold" lang="zh-CN">
        重要边界说明
      </h2>
      <ul className="mt-3 space-y-2" lang="zh-CN">
        {applicationBullets.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-brand-muted" lang="en">
        Public FMS signup remains disabled. Applications create admin-review
        leads only.
      </p>
    </div>
  );
}

export function FmsWeChatShareNote() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-brand-navy" lang="zh-CN">
        适合微信分享
      </h2>
      <p className="mt-3 text-sm leading-7 text-brand-muted" lang="zh-CN">
        如果你认识熟悉中国工厂、1688、阿里巴巴供应商或外贸采购兼职的朋友，可以保存此页面并通过微信分享。当前没有公开微信二维码，申请请使用网站表格。
      </p>
      <div className="mt-4">
        <CopyLinkButton />
      </div>
    </div>
  );
}

export function FmsSeoLandingPage({ page }: FmsSeoLandingPageProps) {
  const pageUrl = buildFmsPageUrl(page.canonicalPath);
  const applyHref = buildFmsApplyTrackingHref({
    pageType: page.kind,
    sourcePage: page.canonicalPath,
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
      name: item.question,
    })),
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: `https://${brand.domain}`,
  };
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    description: page.description,
    inLanguage: "zh-CN",
    name: page.title,
    publisher: {
      "@type": "Organization",
      name: brand.name,
      url: `https://${brand.domain}`,
    },
    url: pageUrl,
  };

  return (
    <main className="bg-brand-background" lang="zh-CN">
      <JsonLd data={[organizationJsonLd, webPageJsonLd, faqJsonLd]} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-emerald">
              {page.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-brand-navy sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-5 text-lg leading-9 text-brand-muted">
              {page.intro}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href={applyHref} variant="secondary">
                Apply as FMS
              </Button>
              <Button href={ROUTES.fms} variant="outline">
                Learn how FMS work
              </Button>
            </div>
            <p className="mt-4 text-sm text-brand-muted" lang="en">
              Manual approval required. No public account creation.
            </p>
          </div>
          <FmsTrustNotice />
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
          <article className="space-y-6">
            {page.sections.map((section) => (
              <section
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                key={section.title}
              >
                <h2 className="text-2xl font-bold text-brand-navy">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3 text-base leading-8 text-brand-muted">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-4 grid gap-2 text-sm font-semibold text-brand-navy sm:grid-cols-2">
                    {section.bullets.map((bullet) => (
                      <li
                        className="rounded-lg border border-slate-200 bg-brand-background px-3 py-2"
                        key={bullet}
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-bold text-brand-navy">常见问题</h2>
              <div className="mt-4 divide-y divide-slate-200">
                {page.faqs.map((item) => (
                  <div className="py-4" key={item.question}>
                    <h3 className="font-bold text-brand-navy">{item.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-brand-muted">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <aside className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-brand-navy">
                FMS 关键词
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
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
            <FmsWeChatShareNote />
            <div className="rounded-lg border border-brand-emerald bg-emerald-50 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-brand-navy">
                准备申请？
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                请提交真实城市、类别、语言和采购经验。管理员会先审核申请，再决定是否联系候选人。
              </p>
              <div className="mt-4">
                <Button href={applyHref} variant="secondary">
                  Apply as FMS
                </Button>
              </div>
            </div>
            <nav
              aria-label="FMS public links"
              className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold shadow-sm"
            >
              <p className="text-brand-navy">相关页面</p>
              <ul className="mt-3 space-y-2 text-brand-emerald">
                <li>
                  <Link href={ROUTES.fms}>FMS public hub</Link>
                </li>
                <li>
                  <Link href={applyHref}>FMS application</Link>
                </li>
                <li>
                  <a href={pageUrl} translate="no">
                    Canonical page URL
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      </section>
    </main>
  );
}
