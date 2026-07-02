import type { Metadata } from "next";
import { SeoArticlePage } from "@/components/seo/seo-article-page";
import { ROUTES } from "@/config/brand";
import { fmsOpportunityPages } from "@/config/seo-content";

const content = fmsOpportunityPages.sourcingJobs;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function ChinaSourcingJobsPage() {
  return (
    <SeoArticlePage
      content={content}
      dir="ltr"
      lang="en"
      languageNoteTitle="For China-based sourcing specialists"
      relatedLinks={[
        { href: ROUTES.fmsOpportunities, label: "FMS opportunities hub" },
        {
          href: ROUTES.fmsOpportunityPakistaniImporters,
          label: "Work with Pakistani importers",
        },
        { href: ROUTES.fmsAcademy, label: "FMS Academy placeholder" },
      ]}
    />
  );
}
