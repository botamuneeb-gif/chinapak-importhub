import type { Metadata } from "next";
import { SeoArticlePage } from "@/components/seo/seo-article-page";
import { ROUTES } from "@/config/brand";
import { factorySeoPages } from "@/config/seo-content";

const content = factorySeoPages.exportToPakistan;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function ExportToPakistanPage() {
  return (
    <SeoArticlePage
      content={content}
      dir="ltr"
      lang="zh-CN"
      languageNoteTitle="当前状态"
      relatedLinks={[
        { href: ROUTES.factoriesFindPakistaniBuyers, label: "寻找巴基斯坦买家" },
        { href: ROUTES.factoriesPartnership, label: "工厂合作意向" },
        { href: ROUTES.fmsOpportunities, label: "FMS opportunities" },
      ]}
    />
  );
}
