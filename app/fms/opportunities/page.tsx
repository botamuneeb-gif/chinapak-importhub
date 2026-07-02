import type { Metadata } from "next";
import { ContentCard } from "@/components/seo/content-card";
import { SeoArticlePage } from "@/components/seo/seo-article-page";
import { ROUTES } from "@/config/brand";
import { fmsOpportunityPages } from "@/config/seo-content";

const content = fmsOpportunityPages.hub;

export const metadata: Metadata = {
  title: content.metadataTitle,
  description: content.metadataDescription,
};

export default function FmsOpportunitiesPage() {
  return (
    <>
      <SeoArticlePage
        content={content}
        dir="ltr"
        faqTitle="FMS platform rules"
        lang="en"
        languageNoteTitle="English and Chinese support"
        relatedLinks={[
          {
            href: ROUTES.fmsOpportunityChinaSourcingJobs,
            label: "China sourcing jobs",
          },
          {
            href: ROUTES.fmsOpportunityPakistaniImporters,
            label: "Work with Pakistani importers",
          },
          { href: ROUTES.authInvite, label: "Invitation access placeholder" },
        ]}
      />

      <section className="bg-brand-background" dir="ltr" lang="en">
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ContentCard
              body="Flexible sourcing assignments, admin-reviewed milestones, and confidentiality rules for China-based sourcing specialists."
              href={ROUTES.fmsOpportunityChinaSourcingJobs}
              title="China sourcing jobs"
            />
            <ContentCard
              body="How FMS candidates can support Pakistani shopkeepers and importers through a controlled platform workflow."
              href={ROUTES.fmsOpportunityPakistaniImporters}
              title="Work with Pakistani importers"
            />
          </div>
        </div>
      </section>
    </>
  );
}
