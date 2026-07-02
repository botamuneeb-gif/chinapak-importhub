import type { Metadata } from "next";
import { SeoArticlePage } from "@/components/seo/seo-article-page";
import { ROUTES } from "@/config/brand";
import { factorySeoPages } from "@/config/seo-content";

const content = factorySeoPages.findPakistaniBuyers;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function FindPakistaniBuyersPage() {
  return (
    <SeoArticlePage
      content={content}
      dir="ltr"
      lang="zh-CN"
      languageNoteTitle="工厂页面说明"
      relatedLinks={[
        { href: ROUTES.factoriesExportToPakistan, label: "向巴基斯坦买家出口" },
        { href: ROUTES.factoriesPartnership, label: "合作意向占位页面" },
        { href: ROUTES.learn, label: "Pakistani importer learning hub" },
      ]}
    />
  );
}
