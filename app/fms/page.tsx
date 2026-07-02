import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { PlaceholderNotice } from "@/components/ui/placeholder-notice";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "FMS Candidates | ChinaPak ImportHub",
  description:
    "Chinese-first FMS candidate route for future Factory Match Specialist onboarding.",
};

const expectations = [
  "Receive assigned sourcing work through the platform and admin only.",
  "Never contact Pakistani importers directly or request their personal contact details.",
  "Research suitable Chinese factory options based on structured project requirements.",
  "Submit factory-side photos, videos, quotations, and evidence for admin review.",
];

export default function FmsPage() {
  return (
    <main>
      <PageHero
        actions={
          <>
            <Button href={ROUTES.fmsLogin} variant="secondary">
              FMS Login
            </Button>
            <Button href={ROUTES.fmsOpportunities} variant="outline">
              View FMS Opportunities
            </Button>
          </>
        }
        dir="ltr"
        eyebrow="Factory Match Specialist"
        intro="This public FMS entry explains the future specialist workflow. FMS users handle assigned projects only through ChinaPak ImportHub and never communicate directly with importers."
        lang="en"
        title="Factory Match Specialist Entry"
      />

      <section className="bg-brand-background" dir="ltr" lang="en">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-navy">
              Future responsibility scope
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-brand-muted">
              {expectations.map((item) => (
                <li className="border-l-4 border-brand-emerald pl-3" key={item}>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-7 text-brand-muted" lang="zh-CN">
              FMS 账户需要通过 ChinaPak ImportHub 审核或邀请后才能使用。
            </p>
          </div>

          <PlaceholderNotice
            title="FMS onboarding placeholder"
            body="Applications, identity review, task assignment, and dashboard access are not self-service yet. Future implementation must keep importer contact details hidden from FMS users."
          />
        </div>
      </section>
    </main>
  );
}
