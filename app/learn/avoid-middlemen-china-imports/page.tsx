import type { Metadata } from "next";
import { SeoArticlePage } from "@/components/seo/seo-article-page";
import { ROUTES } from "@/config/brand";
import { importerLearnArticles } from "@/config/seo-content";

const content = importerLearnArticles.avoidMiddlemen;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function AvoidMiddlemenChinaImportsPage() {
  return (
    <SeoArticlePage
      content={content}
      dir="rtl"
      faqTitle="عام سوالات"
      lang="ur"
      languageNoteTitle="Language note"
      relatedLinks={[
        { href: ROUTES.learnFindChineseFactories, label: "Chinese factory access" },
        { href: ROUTES.learnVerifyProductsBeforeShipping, label: "Shipment evidence guide" },
        { href: ROUTES.verifyRepresentative, label: "Representative verification" },
      ]}
    />
  );
}
