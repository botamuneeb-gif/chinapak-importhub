import type { Metadata } from "next";
import { AudienceCta } from "@/components/seo/audience-cta";
import { ContentCard } from "@/components/seo/content-card";
import { SeoHero } from "@/components/seo/seo-hero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import { learnHubCards } from "@/config/seo-content";

export const metadata: Metadata = {
  title: "China Import Learning Hub | ChinaPak ImportHub",
  description:
    "Urdu-first learning hub for Pakistani shopkeepers, wholesalers, online sellers, and first-time importers learning China sourcing and factory matching.",
};

export default function LearnPage() {
  return (
    <main>
      <SeoHero
        actions={
          <>
            <Button href={ROUTES.importerStart} variant="secondary">
              اپنا Import Project شروع کریں
            </Button>
            <Button href={ROUTES.packages} variant="outline">
              Packages دیکھیں
            </Button>
          </>
        }
        dir="rtl"
        eyebrow="Importer learning hub"
        intro="ChinaPak ImportHub پاکستانی shopkeepers، wholesalers، online sellers، اور first-time importers کے لیے China sourcing اور factory matching کو آسان بناتا ہے۔"
        lang="ur"
        supportLine="Simple Urdu-first guides for practical China sourcing decisions."
        title="China سے import سیکھیں — آسان زبان میں"
      />

      <section className="bg-brand-background" dir="rtl" lang="ur">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-brand-navy">
              Importer guides
            </h2>
            <p className="mt-3 text-base leading-8 text-brand-muted">
              ہر guide practical sourcing، admin review، product evidence، اور
              platform-controlled communication کو simple زبان میں explain کرتی ہے۔
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {learnHubCards.map((card) => (
              <ContentCard
                body={card.body}
                href={card.href}
                key={card.href}
                title={card.title}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" dir="rtl" lang="ur">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
          {[
            "Factory-level visibility",
            "Admin-reviewed factory options",
            "No China travel required",
          ].map((item) => (
            <div className="rounded-lg border border-slate-200 bg-brand-background p-5" key={item}>
              <h2 className="text-xl font-bold text-brand-navy">{item}</h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                ChinaPak ImportHub ہر Import Project کو structured workflow میں
                رکھتا ہے تاکہ importer کو clearer sourcing decision مل سکے۔
              </p>
            </div>
          ))}
        </div>
      </section>

      <AudienceCta
        body="Product کی تصویر، link، یا details دیں۔ Payment کر کے project start کریں، یا payment help کے لیے unpaid lead save کریں۔"
        dir="rtl"
        lang="ur"
        primaryHref={ROUTES.importerStart}
        primaryLabel="اپنا Import Project شروع کریں"
        secondaryHref={ROUTES.verify}
        secondaryLabel="پہلے ہمیں verify کریں"
        title="China sourcing کو ایک clear Import Project میں شروع کریں"
      />
    </main>
  );
}
