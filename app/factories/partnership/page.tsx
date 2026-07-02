import type { Metadata } from "next";
import { ArticleLayout } from "@/components/seo/article-layout";
import { ArticleSection } from "@/components/seo/article-section";
import { AudienceCta } from "@/components/seo/audience-cta";
import { LanguageSupportNote } from "@/components/seo/language-support-note";
import { PartnershipFormPlaceholder } from "@/components/seo/partnership-form-placeholder";
import { SeoHero } from "@/components/seo/seo-hero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import { factorySeoPages } from "@/config/seo-content";

const content = factorySeoPages.partnership;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function FactoryPartnershipPage() {
  return (
    <main>
      <SeoHero
        actions={
          <>
            <Button href={ROUTES.factoriesExportToPakistan} variant="secondary">
              出口到巴基斯坦
            </Button>
            <Button href={ROUTES.factoriesFindPakistaniBuyers} variant="outline">
              寻找巴基斯坦买家
            </Button>
          </>
        }
        dir="ltr"
        eyebrow={content.eyebrow}
        intro={content.intro}
        lang="zh-CN"
        supportLine={content.supportLine}
        title={content.title}
      />

      <section className="bg-brand-background" dir="ltr" lang="zh-CN">
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
            <h2 className="text-2xl font-bold">Factory signup status</h2>
            <p className="mt-3 text-sm leading-7">
              Factory accounts are invitation-only for MVP launch. Public
              factory signup is not active.
            </p>
          </div>
        </div>
      </section>

      <ArticleLayout
        dir="ltr"
        lang="zh-CN"
        sidebar={
          <LanguageSupportNote title="当前状态">
            {content.languageNote}
          </LanguageSupportNote>
        }
      >
        {content.sections.map((section) => (
          <ArticleSection key={section.heading} section={section} />
        ))}
      </ArticleLayout>

      <section className="bg-brand-background" dir="ltr" lang="zh-CN">
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <PartnershipFormPlaceholder />
        </div>
      </section>

      <AudienceCta
        body={content.cta.body}
        dir="ltr"
        lang="zh-CN"
        primaryHref={content.cta.primaryHref}
        primaryLabel={content.cta.primaryLabel}
        secondaryHref={content.cta.secondaryHref}
        secondaryLabel={content.cta.secondaryLabel}
        title={content.cta.title}
      />
    </main>
  );
}
