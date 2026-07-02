import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";

export const metadata: Metadata = {
  title: "FMS Candidates | ChinaPak ImportHub",
  description:
    "Invitation-only entry for China-based Factory Match Specialists working through ChinaPak ImportHub.",
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
        intro="FMS users handle assigned projects only through ChinaPak ImportHub and never communicate directly with importers."
        lang="en"
        title="Factory Match Specialist Entry"
      />

      <section className="bg-brand-background" dir="ltr" lang="en">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-brand-navy">
              Responsibility scope
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

          <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-sm leading-7 text-brand-navy shadow-sm">
            <h2 className="text-xl font-bold">Invitation-only access</h2>
            <p className="mt-3">
              FMS accounts are approved by ChinaPak ImportHub before
              activation. If you already have an approved account, use FMS
              Login. New sourcing specialists should review the opportunity
              pages and wait for admin approval before account access.
            </p>
            <p className="mt-3" lang="zh-CN">
              FMS 账户需要通过 ChinaPak ImportHub 审核或邀请后才能使用。
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button href={ROUTES.fmsLogin} variant="secondary">
                FMS Login
              </Button>
              <Button href={ROUTES.fmsOpportunities} variant="outline">
                Opportunities
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
