import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { AgentComplianceNotice } from "@/components/agent/agent-compliance-notice";
import { Button } from "@/components/ui/button";
import { agentComplianceRules } from "@/config/agents";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "Pakistani Local Agent Portal | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AgentPage() {
  return (
    <main>
      <PageHero
        actions={
          <>
            <Button href={ROUTES.authInvite} variant="secondary">
              Agent invitation access
            </Button>
            <Button href={ROUTES.agentDashboard} variant="outline">
              View Agent Dashboard
            </Button>
          </>
        }
        eyebrow="Pakistani Local Agents"
        intro="Agents help local importers understand ChinaPak ImportHub, submit product details, complete approved payment, and follow up on unpaid leads. Agents do not perform FMS sourcing work."
        title="Local Trust and Importer Support"
        dir="ltr"
        lang="en"
      />

      <section className="bg-brand-background">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-navy">
              Agent role
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Pakistani Local Agents educate shopkeepers, wholesalers, and
              first-time importers. They help users verify the platform, prepare
              Import Project details, and complete approved payment workflows.
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted" dir="rtl" lang="ur">
              Agent کا کام customer کو guide کرنا ہے، China میں factory sourcing
              کرنا نہیں۔
            </p>
          </article>

          <AgentComplianceNotice rules={agentComplianceRules} />
        </div>
      </section>
    </main>
  );
}
