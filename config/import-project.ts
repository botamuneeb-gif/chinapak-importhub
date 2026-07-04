export const importProjectFlow = {
  totalSteps: 8,
  productMethods: [
    {
      id: "photo",
      icon: "photo",
      title: "Upload Product Photos / Catalog",
      body: "Upload product photos, WhatsApp screenshots, catalog pages, supplier screenshots, or a simple spec document.",
    },
    {
      id: "details",
      icon: "text",
      title: "Product name/details",
      body: "Product کا نام، model، size، material یا market use لکھیں۔",
    },
    {
      id: "link",
      icon: "link",
      title: "Alibaba / 1688 / product link",
      body: "اگر link موجود ہے تو paste کریں تاکہ team بہتر review کر سکے۔",
    },
    {
      id: "voice",
      icon: "mic",
      title: "Upload Voice Note",
      body: "Upload a short voice note explaining the product you want to import. Our team will review it manually.",
    },
  ],
  budgets: [
    { id: "100k-300k", label: "PKR 100,000 – 300,000" },
    { id: "300k-700k", label: "PKR 300,000 – 700,000" },
    { id: "700k-1500k", label: "PKR 700,000 – 1,500,000" },
    { id: "1500k-plus", label: "PKR 1,500,000+" },
  ],
  qualityLevels: [
    { id: "normal", label: "Normal" },
    { id: "better", label: "Better" },
    { id: "premium", label: "Premium" },
  ],
  experienceLevels: [
    { id: "first-time", label: "پہلی بار import کر رہا ہوں" },
    { id: "some-experience", label: "پہلے 1–5 بار import کیا ہے" },
    { id: "experienced", label: "Experienced importer ہوں" },
  ],
  packages: [
    {
      id: "factory-discovery",
      name: "Factory Discovery",
      price: "PKR 18,000",
      bestFor: "Best for PKR 100,000–300,000 import budgets.",
      includes: [
        "Up to 3 factory options",
        "Basic comparison",
        "Admin-reviewed report",
      ],
      delivery: "5–7 business days",
      recommended: false,
    },
    {
      id: "factory-match-plus",
      name: "Factory Match Plus",
      price: "PKR 35,000",
      bestFor: "Best for PKR 300,000–700,000 import budgets.",
      includes: [
        "5 factory options",
        "Better comparison",
        "Basic negotiation support",
        "Factory reliability notes",
      ],
      delivery: "7–10 business days",
      recommended: true,
    },
    {
      id: "import-partner",
      name: "Import Partner",
      price: "PKR 75,000",
      bestFor: "Best for serious importers.",
      includes: [
        "8–10 factory options",
        "Dedicated FMS",
        "Negotiation support",
        "Sample coordination guidance",
        "Priority admin support",
      ],
      delivery: "10–15 business days",
      recommended: false,
    },
  ],
  addOns: [
    {
      id: "ai-trade-translation",
      name: "AI Trade Translation",
      price: "PKR 5,000/project",
    },
    {
      id: "voice-note-translation",
      name: "Voice Note Translation",
      price: "PKR 8,000–12,000/project",
    },
    {
      id: "document-translation",
      name: "Document Translation",
      price: "PKR 2,000–5,000/document",
    },
    {
      id: "live-factory-call-translation",
      name: "Live Factory Call Translation",
      price: "PKR 15,000–30,000/session",
    },
    {
      id: "supplier-background-check",
      name: "Supplier Background Check",
      price: "PKR 12,000",
    },
    {
      id: "video-factory-tour",
      name: "Video Factory Tour Coordination",
      price: "PKR 20,000–35,000",
    },
    {
      id: "sample-coordination",
      name: "Sample Coordination",
      price: "PKR 15,000",
    },
    {
      id: "shipping-coordination",
      name: "Shipping Coordination Support",
      price: "PKR 15,000",
    },
    {
      id: "urgent-processing",
      name: "Urgent Processing",
      price: "+40%",
    },
  ],
  leadReasons: [
    { id: "need-more-info", label: "مجھے مزید معلومات چاہیے" },
    { id: "payment-trust", label: "Online payment پر trust نہیں ہے" },
    { id: "payment-failed", label: "Payment failed" },
    { id: "arrange-funds", label: "Funds arrange کرنے ہیں" },
    { id: "call-request", label: "میں چاہتا ہوں team مجھے call کرے" },
    { id: "other", label: "Other" },
  ],
} as const;

export type ImportPackage = (typeof importProjectFlow.packages)[number];
export type ImportAddOn = (typeof importProjectFlow.addOns)[number];
