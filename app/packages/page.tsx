import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { AddOnServiceCard } from "@/components/payments/add-on-service-card";
import { PackageCard } from "@/components/payments/package-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import {
  addOnServices,
  packageComparisonRows,
  pricingPackages,
  refundProtectionRules,
} from "@/config/pricing";
import { getSiteUrl } from "@/config/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "China Factory Access Packages | ChinaPak ImportHub",
  description:
    "Compare ChinaPak ImportHub packages for Pakistani importers: Factory Discovery, Factory Match Plus, Import Partner, add-ons, delivery timeframes, and refund protection.",
  alternates: {
    canonical: "/packages",
  },
  openGraph: {
    title: "ChinaPak ImportHub Packages",
    description:
      "Choose a factory access package with admin-reviewed factory options, add-ons, payment guidance, and refund rules.",
    type: "website",
    url: `${siteUrl}/packages`,
  },
};

export default function PackagesPage() {
  return (
    <main>
      <PageHero
        actions={
          <>
            <Button href={ROUTES.importerStart} variant="secondary">
              Start Import Project
            </Button>
            <Button href={ROUTES.payments} variant="outline">
              Payment help
            </Button>
          </>
        }
        eyebrow="Importer packages"
        intro="اپنے import budget اور ضرورت کے مطابق package منتخب کریں۔ Payment is encouraged at project submission so admin can review and prepare the project for FMS assignment."
        title="Choose the Right Factory Access Package"
      />

      <section className="bg-brand-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-3">
            {pricingPackages.map((plan) => (
              <PackageCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-brand-emerald">Optional services</p>
            <h2 className="mt-2 text-3xl font-bold text-brand-navy">
              Add-ons for translation, checks, samples, and coordination
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Add-ons are optional and should later be configurable in admin
              settings. Legal contracts, technical specifications,
              certifications, and payment terms may require human/admin review.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addOnServices.map((addOn) => (
              <AddOnServiceCard addOn={addOn} key={addOn.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-lg border border-brand-gold bg-amber-50 p-5 text-brand-navy shadow-sm">
            <h2 className="text-2xl font-bold">Refund protection</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-7">
              {refundProtectionRules.map((rule) => (
                <li className="border-s-4 border-brand-gold ps-3" key={rule}>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="text-3xl font-bold text-brand-navy">
            Package comparison
          </h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm" aria-label="Package comparison table">
                <thead className="bg-brand-navy text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold" scope="col">Feature</th>
                    {pricingPackages.map((plan) => (
                      <th className="whitespace-nowrap px-4 py-3 font-bold" key={plan.id} scope="col">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {packageComparisonRows.map((row) => (
                    <tr key={row.key}>
                      <th className="min-w-52 px-4 py-4 font-bold text-brand-navy" scope="row">
                        {row.label}
                      </th>
                      {pricingPackages.map((plan) => (
                        <td className="min-w-44 px-4 py-4 text-brand-muted" key={`${plan.id}-${row.key}`}>
                          {plan.comparison[row.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
