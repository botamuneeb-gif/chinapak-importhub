import { ROUTES } from "@/config/brand";

export const homeContent = {
  hero: {
    headline: "چین جائے بغیر فیکٹری تک رسائی حاصل کریں",
    subheadline:
      "ChinaPak ImportHub پاکستانی کاروباروں کو چین کی اصل فیکٹریز تک پہنچنے، product evidence دیکھنے، اور غیر ضروری middlemen کم کرنے میں مدد کرتا ہے۔",
    primaryCta: "Import Project شروع کریں",
    secondaryCta: "ہمیں Verify کریں",
    trustBadges: [
      "Pakistani Local Business",
      "China FMS Network",
      "Refund Protection",
      "Secure Project Tracking",
    ],
  },
  coreAdvantage: {
    eyebrow: "Core advantage",
    heading: "صرف listing نہیں — اصل factory matching",
    intro:
      "Traditional marketplaces and middle channels may involve multiple layers between the buyer and the actual factory. ChinaPak ImportHub helps Pakistani importers get closer to real factory-level sourcing with admin-reviewed factory options and factory-side product evidence.",
    cards: [
      {
        title: "Product evidence before shipment",
        body: "Factory-side product photos, videos, and milestone evidence can be reviewed before shipment decisions.",
      },
      {
        title: "Fewer unnecessary middlemen",
        body: "The service is designed to reduce avoidable sourcing layers while keeping admin oversight in place.",
      },
      {
        title: "Factory-side photos/videos",
        body: "Evidence is gathered from the factory side and released through controlled platform workflows.",
      },
      {
        title: "Admin-reviewed factory options",
        body: "Factory options are reviewed by admin before they are shown to importers.",
      },
      {
        title: "No China travel required",
        body: "Pakistani importers can prepare sourcing decisions without traveling to China themselves.",
      },
    ],
  },
  howItWorks: {
    eyebrow: "How it works",
    heading: "Import Project کیسے آگے بڑھے گا",
    intro:
      "ہر project ایک Import Project ID کے ساتھ منظم ہوگا تاکہ review، payment status، FMS assignment، اور approved factory options صاف طریقے سے track ہو سکیں۔",
    steps: [
      "Product کی تصویر یا details بھیجیں",
      "Payment کریں یا project save کریں",
      "Admin request review کرے گا",
      "FMS چین میں factories تلاش کرے گا",
      "Approved factory options account میں دکھائے جائیں گے",
      "Importer فیصلہ کرے گا کہ کس factory کے ساتھ آگے بڑھنا ہے",
    ],
  },
  trust: {
    eyebrow: "Verify first",
    heading: "پہلے ہمیں verify کریں، پھر order دیں",
    copy:
      "آپ order دینے سے پہلے ہماری local team یا representative سے بات کر کے مکمل تسلی کر سکتے ہیں۔",
    items: [
      "Local Pakistani business",
      "Physical verification available",
      "Agent verification system",
      "Secure payments",
      "Refund protection",
      "Transparent project tracking",
    ],
  },
  packages: {
    eyebrow: "Packages preview",
    heading: "اپنے import project کے مطابق package منتخب کریں",
    intro:
      "Packages and prices are stored in configuration so admin settings can control them later without rewriting the website.",
  },
  finalCta: {
    heading: "آج ہی اپنا پہلا Import Project شروع کریں",
    copy:
      "Product details تیار ہیں؟ ایک project شروع کریں، یا پہلے ہماری team سے بات کر کے process سمجھ لیں۔",
    primaryCta: "Import Project شروع کریں",
    secondaryCta: "ہماری team سے بات کریں",
    primaryHref: ROUTES.importerStart,
    secondaryHref: ROUTES.contact,
  },
} as const;

