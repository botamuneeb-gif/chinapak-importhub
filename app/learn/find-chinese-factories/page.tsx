import type { Metadata } from "next";
import { SeoArticlePage } from "@/components/seo/seo-article-page";
import { ROUTES } from "@/config/brand";
import { importerLearnArticles } from "@/config/seo-content";

const content = importerLearnArticles.findChineseFactories;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function FindChineseFactoriesPage() {
  return (
    <SeoArticlePage
      content={content}
      dir="rtl"
      faqTitle="عام سوالات"
      lang="ur"
      languageNoteTitle="Language note"
      relatedLinks={[
        { href: ROUTES.learnImportFromChinaToPakistan, label: "China سے Pakistan import کیسے کریں؟" },
        { href: ROUTES.learnAvoidMiddlemenChinaImports, label: "Middlemen کم کرنے کی guide" },
        { href: ROUTES.packages, label: "Factory access packages" },
      ]}
    />
  );
}
