import { ROUTES } from "@/config/brand";
import type { PackageId } from "@/config/pricing";

export type ImporterPackageDetail = {
  expectedNextStep: string;
  notIncluded: string[];
  recommendedUseCase: string;
  startHref: string;
  whatImporterGets: string[];
};

export const importerPackageDetails: Record<PackageId, ImporterPackageDetail> = {
  "factory-discovery": {
    expectedNextStep:
      "Submit product details and complete manual payment verification so Admin can prepare the project for sourcing review.",
    notIncluded: [
      "Guaranteed factory acceptance or fixed factory price",
      "Sample coordination, live negotiation, customs clearance, or shipping delivery",
      "Direct importer contact with FMS or factories",
    ],
    recommendedUseCase:
      "First-time importers or small shopkeepers who need a practical first look at suitable China factory options.",
    startHref: `${ROUTES.importerStart}?package=factory-discovery`,
    whatImporterGets: [
      "Project ID and private importer tracking",
      "Admin-reviewed product requirement check",
      "A small shortlist of factory options when payment and review gates pass",
    ],
  },
  "factory-match-plus": {
    expectedNextStep:
      "Start the project, upload any photos/catalogs, then submit payment reference for Admin verification before FMS work begins.",
    notIncluded: [
      "Guaranteed final factory deal, stock availability, or price stability",
      "Importer-to-FMS direct communication",
      "Customs, shipment delivery, or payment to factories outside a separate approved workflow",
    ],
    recommendedUseCase:
      "Established shopkeepers who want stronger comparison, clearer evidence, and admin-reviewed supplier notes.",
    startHref: `${ROUTES.importerStart}?package=factory-match-plus`,
    whatImporterGets: [
      "Five factory options where suitable options are available",
      "Better comparison notes and factory reliability signals",
      "Basic negotiation support through platform-controlled workflow",
    ],
  },
  "import-partner": {
    expectedNextStep:
      "Share a complete requirement brief and payment reference; Admin verifies payment and controls FMS assignment before deeper sourcing starts.",
    notIncluded: [
      "Guaranteed factory contract, shipment delivery, or customs outcome",
      "Release of private factory contact details without an approved future workflow",
      "Any direct FMS/importer messaging or off-platform payment collection",
    ],
    recommendedUseCase:
      "Larger or more complex import decisions where the importer needs a wider reviewed comparison and priority admin oversight.",
    startHref: `${ROUTES.importerStart}?package=import-partner`,
    whatImporterGets: [
      "Wider factory option search and priority admin handling",
      "Dedicated FMS workflow where operationally suitable",
      "Sample coordination guidance and stronger comparison support",
    ],
  },
};

export function getImporterPackageDetail(packageId: PackageId) {
  return importerPackageDetails[packageId];
}
