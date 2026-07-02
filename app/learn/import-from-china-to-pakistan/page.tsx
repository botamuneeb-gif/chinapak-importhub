import type { Metadata } from "next";
import { SeoArticlePage } from "@/components/seo/seo-article-page";
import { ROUTES } from "@/config/brand";
import { importerLearnArticles } from "@/config/seo-content";

const content = importerLearnArticles.importFromChinaToPakistan;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function ImportFromChinaToPakistanPage() {
  return (
    <SeoArticlePage
      content={content}
      dir="rtl"
      faqTitle="عام سوالات"
      lang="ur"
      languageNoteTitle="Language note"
      relatedLinks={[
        { href: ROUTES.learnFindChineseFactories, label: "Chinese factories کیسے find کریں؟" },
        { href: ROUTES.learnVerifyProductsBeforeShipping, label: "Product evidence guide" },
        { href: ROUTES.verify, label: "Verify ChinaPak ImportHub" },
      ]}
    />
  );
}
