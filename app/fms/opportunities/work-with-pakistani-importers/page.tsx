import type { Metadata } from "next";
import { SeoArticlePage } from "@/components/seo/seo-article-page";
import { ROUTES } from "@/config/brand";
import { fmsOpportunityPages } from "@/config/seo-content";

const content = fmsOpportunityPages.pakistaniImporters;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function WorkWithPakistaniImportersPage() {
  return (
    <SeoArticlePage
      content={content}
      dir="ltr"
      lang="en"
      languageNoteTitle="Pakistan-focused sourcing work"
      relatedLinks={[
        { href: ROUTES.fmsOpportunities, label: "FMS opportunities hub" },
        {
          href: ROUTES.fmsOpportunityChinaSourcingJobs,
          label: "China sourcing jobs",
        },
        { href: ROUTES.authInvite, label: "Invitation access placeholder" },
      ]}
    />
  );
}
