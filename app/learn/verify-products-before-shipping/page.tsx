import type { Metadata } from "next";
import { SeoArticlePage } from "@/components/seo/seo-article-page";
import { ROUTES } from "@/config/brand";
import { importerLearnArticles } from "@/config/seo-content";

const content = importerLearnArticles.verifyProducts;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function VerifyProductsBeforeShippingPage() {
  return (
    <SeoArticlePage
      content={content}
      dir="rtl"
      faqTitle="عام سوالات"
      lang="ur"
      languageNoteTitle="Evidence note"
      relatedLinks={[
        { href: ROUTES.learnImportFromChinaToPakistan, label: "Import process guide" },
        { href: ROUTES.learnFindChineseFactories, label: "Factory finding guide" },
        { href: ROUTES.packages, label: "Packages and add-ons" },
      ]}
    />
  );
}
