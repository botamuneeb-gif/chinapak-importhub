import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { AddOnServiceCard } from "@/components/payments/add-on-service-card";
import { PackageCard } from "@/components/payments/package-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/brand";
import { getImporterPackageDetail } from "@/config/importer-packages";
import {
  addOnServices,
  packageComparisonRows,
  pricingPackages,
  refundProtectionRules,
} from "@/config/pricing";
import { getSiteUrl } from "@/config/site-url";

const siteUrl = getSiteUrl();

const packageFaqs = [
  {
    answer:
      "Factory matching starts only after Admin verifies payment and the project passes Admin review. Until then, the project remains in payment/admin review status.",
    question: "When does factory search start?",
  },
  {
    answer:
      "No. FMS users submit factory options and evidence to ChinaPak Admin. Importers do not directly contact FMS users through the platform.",
    question: "Can I contact the FMS directly?",
  },
  {
    answer:
      "You can submit text, a product URL, photos, screenshots, catalog/spec files, or a voice note. Admin may ask for more information if the requirement is not clear enough.",
    question: "What if my product details are incomplete?",
  },
  {
    answer:
      "Submit the payment method, amount, payer name, date, and transaction/reference number. Do not share card numbers, banking passwords, OTPs, or private account credentials.",
    question: "What payment proof do I submit?",
  },
  {
    answer:
      "No. Factory quotes, availability, MOQ, lead time, and acceptance can change. ChinaPak provides platform-assisted sourcing and admin-reviewed information, not a guaranteed final factory deal.",
    question: "Can ChinaPak guarantee exact factory price?",
  },
  {
    answer:
      "Refunds follow platform rules: full refund before FMS assignment, and Admin-reviewed refund decisions after work starts based on completed milestones.",
    question: "Can I request a refund?",
  },
];

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

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                body: "Share product details, URL, photos/catalog files, or a voice note so Admin can understand the sourcing request.",
                title: "1. Submit project details",
              },
              {
                body: "Manual payment references are reviewed by Admin. FMS work does not start before payment is verified.",
                title: "2. Complete payment verification",
              },
              {
                body: "Factory options are gathered by FMS and released only after Admin prepares a sanitized importer-safe report.",
                title: "3. Receive admin-reviewed report",
              },
            ].map((item) => (
              <article
                className="rounded-lg border border-slate-200 bg-brand-background p-4 shadow-sm"
                key={item.title}
              >
                <h2 className="text-base font-bold text-brand-navy">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-brand-muted">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
          <div className="rounded-lg border border-slate-200 bg-brand-background p-5">
            <p className="text-sm font-bold text-brand-emerald">
              Payment and service boundaries
            </p>
            <h2 className="mt-2 text-2xl font-bold text-brand-navy">
              What happens after you choose a package
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {pricingPackages.map((plan) => {
                const detail = getImporterPackageDetail(plan.id);

                return (
                  <article
                    className="rounded-lg border border-slate-200 bg-white p-4"
                    key={`${plan.id}-next-step`}
                  >
                    <h3 className="font-bold text-brand-navy">{plan.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-brand-muted">
                      {detail.expectedNextStep}
                    </p>
                    <Button
                      className="mt-4"
                      href={detail.startHref}
                      variant={plan.recommended ? "secondary" : "outline"}
                    >
                      Start with this package
                    </Button>
                  </article>
                );
              })}
            </div>
            <div className="mt-5 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm font-semibold leading-7 text-brand-navy">
              ChinaPak ImportHub does not guarantee factory acceptance, fixed
              prices, customs clearance, shipment delivery, or any off-platform
              factory deal. Payment is verified by Admin before FMS sourcing
              work starts.
            </div>
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

      <section className="bg-brand-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <p className="text-sm font-bold text-brand-emerald">Importer FAQ</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-navy">
            Before you start an Import Project
          </h2>
          <div className="mt-6 grid gap-4">
            {packageFaqs.map((item) => (
              <details
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                key={item.question}
              >
                <summary className="cursor-pointer text-base font-bold text-brand-navy">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
