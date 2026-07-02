export type PackageId =
  | "factory-discovery"
  | "factory-match-plus"
  | "import-partner";

export type PricingPackage = {
  id: PackageId;
  name: string;
  price: string;
  numericPrice: number;
  bestForBudget: string;
  bestForSummary: string;
  deliveryTimeframe: string;
  deliverables: string[];
  recommended: boolean;
  comparison: {
    factoryOptions: string;
    negotiationSupport: string;
    dedicatedFms: string;
    sampleCoordinationGuidance: string;
    prioritySupport: string;
    translationAvailability: string;
  };
};

export type AddOnService = {
  id: string;
  name: string;
  price: string;
  highlighted?: boolean;
  note: string;
};

export const pricingPackages: PricingPackage[] = [
  {
    id: "factory-discovery",
    name: "Factory Discovery",
    price: "PKR 18,000",
    numericPrice: 18000,
    bestForBudget: "PKR 100,000-300,000",
    bestForSummary: "Best for first-time and smaller import budgets.",
    deliveryTimeframe: "5-7 business days",
    deliverables: [
      "Up to 3 factory options",
      "Basic comparison",
      "Admin-reviewed report",
      "Delivery: 5-7 business days",
    ],
    recommended: false,
    comparison: {
      factoryOptions: "Up to 3",
      negotiationSupport: "Not included",
      dedicatedFms: "Assigned by admin workflow",
      sampleCoordinationGuidance: "Not included",
      prioritySupport: "Standard",
      translationAvailability: "Available as add-on",
    },
  },
  {
    id: "factory-match-plus",
    name: "Factory Match Plus",
    price: "PKR 35,000",
    numericPrice: 35000,
    bestForBudget: "PKR 300,000-700,000",
    bestForSummary: "Recommended for established shopkeepers and repeat buyers.",
    deliveryTimeframe: "7-10 business days",
    deliverables: [
      "5 factory options",
      "Better comparison",
      "Basic negotiation support",
      "Factory reliability notes",
      "Delivery: 7-10 business days",
    ],
    recommended: true,
    comparison: {
      factoryOptions: "5",
      negotiationSupport: "Basic",
      dedicatedFms: "Assigned by admin workflow",
      sampleCoordinationGuidance: "Guidance as needed",
      prioritySupport: "Standard",
      translationAvailability: "Available as add-on",
    },
  },
  {
    id: "import-partner",
    name: "Import Partner",
    price: "PKR 75,000",
    numericPrice: 75000,
    bestForBudget: "PKR 700,000-1,500,000+",
    bestForSummary: "Best for larger or more complex sourcing decisions.",
    deliveryTimeframe: "10-15 business days",
    deliverables: [
      "8-10 factory options",
      "Dedicated FMS",
      "Negotiation support",
      "Sample coordination guidance",
      "Priority admin support",
      "Delivery: 10-15 business days",
    ],
    recommended: false,
    comparison: {
      factoryOptions: "8-10",
      negotiationSupport: "Included",
      dedicatedFms: "Dedicated FMS",
      sampleCoordinationGuidance: "Included",
      prioritySupport: "Priority",
      translationAvailability: "Available as add-on",
    },
  },
];

export const addOnServices: AddOnService[] = [
  {
    id: "ai-trade-translation",
    name: "AI Trade Translation",
    price: "PKR 5,000/project",
    highlighted: true,
    note: "Chat translation support for Urdu, English, and Chinese project communication.",
  },
  {
    id: "voice-note-translation",
    name: "Voice Note Translation",
    price: "PKR 8,000-12,000/project",
    note: "Future voice note translation workflow for importer and FMS communication.",
  },
  {
    id: "document-translation",
    name: "Document Translation",
    price: "PKR 2,000-5,000/document",
    note: "Future document translation with admin or human review where needed.",
  },
  {
    id: "live-factory-call-translation",
    name: "Live Factory Call Translation",
    price: "PKR 15,000-30,000/session",
    note: "Future live interpretation support through an approved platform workflow.",
  },
  {
    id: "supplier-background-check",
    name: "Supplier Background Check",
    price: "PKR 12,000",
    note: "Extra admin-reviewed supplier background research.",
  },
  {
    id: "video-factory-tour",
    name: "Video Factory Tour Coordination",
    price: "PKR 20,000-35,000",
    note: "Coordination support for factory-side video evidence.",
  },
  {
    id: "sample-coordination",
    name: "Sample Coordination",
    price: "PKR 15,000",
    note: "Guidance for sample coordination through the platform workflow.",
  },
  {
    id: "shipping-coordination",
    name: "Shipping Coordination Support",
    price: "PKR 15,000",
    note: "Support for shipping coordination questions and next steps.",
  },
  {
    id: "urgent-processing",
    name: "Urgent Processing",
    price: "+40%",
    note: "Priority handling where operational capacity allows.",
  },
];

export const packageComparisonRows = [
  {
    label: "Factory options",
    key: "factoryOptions",
  },
  {
    label: "Negotiation support",
    key: "negotiationSupport",
  },
  {
    label: "Dedicated FMS",
    key: "dedicatedFms",
  },
  {
    label: "Sample coordination guidance",
    key: "sampleCoordinationGuidance",
  },
  {
    label: "Priority support",
    key: "prioritySupport",
  },
  {
    label: "Translation availability",
    key: "translationAvailability",
  },
] as const;

export const refundProtectionRules = [
  "Full refund before FMS assignment.",
  "After FMS assignment, refund is admin-reviewed based on completed milestones.",
  "If the promised service is not delivered within the package timeframe, full refund applies subject to documented exceptions.",
] as const;
