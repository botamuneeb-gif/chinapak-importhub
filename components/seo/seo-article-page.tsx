import Link from "next/link";
import { ArticleLayout } from "@/components/seo/article-layout";
import { ArticleSection } from "@/components/seo/article-section";
import { AudienceCta } from "@/components/seo/audience-cta";
import { LanguageSupportNote } from "@/components/seo/language-support-note";
import { SeoFaq } from "@/components/seo/seo-faq";
import { SeoHero } from "@/components/seo/seo-hero";
import { Button } from "@/components/ui/button";
import type { SeoPageContent } from "@/config/seo-content";

type RelatedLink = {
  href: string;
  label: string;
};

type SeoArticlePageProps = {
  content: SeoPageContent;
  dir?: "ltr" | "rtl";
  faqTitle?: string;
  lang?: string;
  languageNoteTitle?: string;
  relatedLinks?: RelatedLink[];
};

export function SeoArticlePage({
  content,
  dir = "ltr",
  faqTitle,
  lang,
  languageNoteTitle,
  relatedLinks = [],
}: SeoArticlePageProps) {
  return (
    <main>
      <SeoHero
        actions={
          <>
            <Button href={content.cta.primaryHref} variant="secondary">
              {content.cta.primaryLabel}
            </Button>
            {content.cta.secondaryHref && content.cta.secondaryLabel ? (
              <Button href={content.cta.secondaryHref} variant="outline">
                {content.cta.secondaryLabel}
              </Button>
            ) : null}
          </>
        }
        dir={dir}
        eyebrow={content.eyebrow}
        intro={content.intro}
        lang={lang}
        supportLine={content.supportLine}
        title={content.title}
      />

      <ArticleLayout
        dir={dir}
        lang={lang}
        sidebar={
          <>
            <LanguageSupportNote title={languageNoteTitle}>
              {content.languageNote}
            </LanguageSupportNote>
            {relatedLinks.length > 0 ? (
              <nav
                aria-label="Related content"
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-bold text-brand-navy">Related pages</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-brand-emerald">
                  {relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link className="hover:text-brand-navy" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </>
        }
      >
        {content.sections.map((section) => (
          <ArticleSection key={section.heading} section={section} />
        ))}
        {content.faqs ? <SeoFaq items={content.faqs} title={faqTitle} /> : null}
      </ArticleLayout>

      <AudienceCta
        body={content.cta.body}
        dir={dir}
        lang={lang}
        primaryHref={content.cta.primaryHref}
        primaryLabel={content.cta.primaryLabel}
        secondaryHref={content.cta.secondaryHref}
        secondaryLabel={content.cta.secondaryLabel}
        title={content.cta.title}
      />
    </main>
  );
}
