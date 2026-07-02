import type { Metadata } from "next";
import { ROUTES, brand } from "@/config/brand";
import { getSiteUrl } from "@/config/site-url";

export type PublicFaqItem = {
  answer: string;
  question: string;
};

export type PublicPageSection = {
  body: string;
  title: string;
};

export type PublicSeoPage = {
  canonicalPath: string;
  ctaLabel?: string;
  description: string;
  faq?: readonly PublicFaqItem[];
  h1: string;
  intro: string;
  sections: readonly PublicPageSection[];
  supportUrdu?: string;
  title: string;
};

export const publicCtas = {
  comparePackages: "Compare Packages",
  getAssistanceUrdu: "مدد کے لیے پراجیکٹ محفوظ کریں",
  howItWorks: "View How It Works",
  localSupport: "Talk to Local Support",
  startProject: "Start Import Project",
  startProjectUrdu: "اپنا امپورٹ پراجیکٹ شروع کریں",
} as const;

export const homepagePolish = {
  hero: {
    eyebrow: brand.tagline,
    headline: "چین جائے بغیر فیکٹری تک رسائی حاصل کریں",
    subheadline:
      "ChinaPak ImportHub پاکستانی shopkeepers، wholesalers، retailers اور first-time importers کو چین کی suitable factories تک پہنچنے، factory-side evidence دیکھنے، اور غیر ضروری middlemen کم کرنے میں مدد کرتا ہے۔",
    primaryCta: publicCtas.startProjectUrdu,
    secondaryCta: "پہلے ہمیں verify کریں",
    supportLine: brand.urduLine,
    trustBadges: [
      "Pakistani local support",
      "China FMS network",
      "Admin-reviewed factory options",
      "Refund rules before FMS work",
    ],
  },
  trustBanner: [
    {
      label: "Import Project ID",
      value: "Every request is tracked",
    },
    {
      label: "No direct FMS contact",
      value: "Admin controls communication",
    },
    {
      label: "Evidence review",
      value: "Photos, videos, quotes where available",
    },
    {
      label: "Payment gate",
      value: "FMS work starts after payment + admin approval",
    },
  ],
  howItWorks: [
    "Product photo, link, or details submit کریں",
    "Package choose کریں اور payment کریں، یا project save کر کے assistance لیں",
    "Admin request، payment اور requirements review کرتا ہے",
    "China میں FMS suitable factories research کرتا ہے",
    "Admin factory options اور evidence review کرتا ہے",
    "Importer کو sanitized, approved factory report دکھائی جاتی ہے",
  ],
  whyTravel: [
    "China travel cost, time, visa, hotel, translation اور local transport چھوٹے importers کے لیے heavy ہو سکتے ہیں۔",
    "ChinaPak ImportHub sourcing work کو platform کے ذریعے manage کرتا ہے تاکہ importer Pakistan میں رہ کر project track کر سکے۔",
    "یہ travel کا مکمل substitute نہیں، مگر early factory discovery اور comparison کو زیادہ accessible بناتا ہے۔",
  ],
  directFactory: [
    "Marketplace listings useful ہو سکتی ہیں، لیکن buyer اور actual factory کے درمیان کئی layers بھی ہو سکتی ہیں۔",
    "ہماری focus listing browsing نہیں بلکہ admin-reviewed factory matching, factory-side evidence, اور controlled workflow ہے۔",
    "Factory contact data sensitive رہتا ہے اور package/workflow approval کے بغیر direct release نہیں ہوتا۔",
  ],
  whoFor: [
    "Pakistani shopkeepers جو China سے پہلی بار product source کرنا چاہتے ہیں",
    "Wholesalers جو price اور factory comparison بہتر بنانا چاہتے ہیں",
    "Online sellers جنہیں product evidence اور supplier notes چاہیے",
    "Small manufacturers جو packaging, MOQ یا customization options دیکھنا چاہتے ہیں",
  ],
  whatYouGet: [
    "Import Project ID اور secure tracking",
    "Admin-reviewed requirements and package selection",
    "FMS-researched factory options in China",
    "Factory-side photos/videos/quotes where available",
    "Sanitized importer-facing report after admin review",
    "Refund and payment rules documented in platform workflow",
  ],
  notPromise: [
    "ہم ہر factory سے order acceptance guarantee نہیں کرتے۔",
    "ہم final product quality, customs, shipping delays, یا market resale success کی absolute guarantee نہیں دیتے۔",
    "ہم Alibaba, Amazon, 1688 یا کسی marketplace کے official affiliate ہونے کا claim نہیں کرتے۔",
    "Factory contact details صرف approved workflow کے تحت ہی release ہو سکتے ہیں۔",
  ],
};

export const publicFaqs: PublicFaqItem[] = [
  {
    question: "Is ChinaPak ImportHub a marketplace?",
    answer:
      "No. It is a project-based sourcing support platform. Importers submit an Import Project, admins review it, FMSs research factories in China, and importer-facing reports are released only after admin review.",
  },
  {
    question: "Can I talk directly to the FMS?",
    answer:
      "No. Importers and FMSs do not communicate directly. Admin controls communication so importer contact details and FMS contact details stay protected.",
  },
  {
    question: "When does FMS work begin?",
    answer:
      "FMS work begins only after payment is verified and admin approves the Import Project for assignment. Unpaid leads are follow-up records only.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "A full refund is available before FMS assignment. After FMS assignment, refund requests are reviewed by admin based on completed milestones and evidence.",
  },
  {
    question: "Will I see factory contact details?",
    answer:
      "Not automatically. Factory contact details are sensitive and admin-only unless a future approved package/workflow explicitly allows release.",
  },
];

export const publicPackages = [
  {
    budget: "PKR 100k-300k",
    delivery: "5-7 business days",
    features: ["Up to 3 factory options", "Basic comparison", "Admin-reviewed report"],
    name: "Factory Discovery",
    price: "PKR 18,000",
  },
  {
    budget: "PKR 300k-700k",
    delivery: "7-10 business days",
    features: [
      "Up to 5 factory options",
      "Better comparison",
      "Basic negotiation support",
      "Factory reliability notes",
    ],
    name: "Factory Match Plus",
    price: "PKR 35,000",
    recommended: true,
  },
  {
    budget: "PKR 700k-1.5m+",
    delivery: "10-15 business days",
    features: [
      "8-10 factory options",
      "Dedicated FMS",
      "Negotiation support",
      "Sample coordination guidance",
      "Priority admin support",
    ],
    name: "Import Partner",
    price: "PKR 75,000",
  },
] as const;

export const publicAddOns = [
  "AI Trade Translation - PKR 5,000/project",
  "Voice Note Translation - PKR 8,000-12,000/project",
  "Document Translation - PKR 2,000-5,000/document",
  "Live Factory Call Translation - PKR 15,000-30,000/session",
  "Supplier Background Check - PKR 12,000",
  "Video Factory Tour Coordination - PKR 20,000-35,000",
  "Sample Coordination - PKR 15,000",
  "Shipping Coordination Support - PKR 15,000",
  "Urgent Processing - +40%",
] as const;

const standardFaq: PublicFaqItem[] = [
  publicFaqs[0],
  publicFaqs[1],
  publicFaqs[2],
  publicFaqs[3],
];

export const publicSeoPages = {
  about: {
    canonicalPath: "/about",
    title: "About ChinaPak ImportHub | Direct China Factory Access",
    description:
      "Learn how ChinaPak ImportHub helps Pakistani importers create tracked Import Projects, access China-based factory research, and review admin-approved factory evidence.",
    h1: "About ChinaPak ImportHub",
    supportUrdu:
      "ChinaPak ImportHub پاکستانی importers کو China factory sourcing کے لیے ایک محفوظ، admin-controlled platform دیتا ہے۔",
    intro:
      "ChinaPak ImportHub is built for Pakistani shopkeepers, wholesalers, retailers, online sellers, and first-time importers who need a clearer path from product idea to suitable Chinese factory options.",
    sections: [
      {
        title: "A project-based sourcing platform",
        body: "Every request becomes an Import Project ID. The platform tracks package selection, payment status, admin review, FMS assignment, factory submissions, evidence review, reports, feedback, invoices, refunds, and future notifications.",
      },
      {
        title: "China-side sourcing with Pakistani trust",
        body: "Factory Match Specialists in China research options, but importers do not communicate with FMSs directly. Admin controls the workflow and releases only reviewed, importer-safe information.",
      },
      {
        title: "Private factory intelligence",
        body: "Factory submissions and contact details remain internal and private unless a future approved package workflow allows controlled release. The aim is factory-level visibility without unsafe contact leakage.",
      },
    ],
    faq: standardFaq,
  },
  contact: {
    canonicalPath: "/contact",
    title: "Contact ChinaPak ImportHub | Import Project Support",
    description:
      "Contact ChinaPak ImportHub for Import Project questions, package guidance, representative verification, FMS candidate interest, or future factory partnership inquiries.",
    h1: "Contact ChinaPak ImportHub",
    supportUrdu:
      "سوال ہے؟ پہلے verify کریں، پھر اپنا Import Project شروع کریں۔",
    intro:
      "Contact is platform-controlled. Importers, FMSs, agents, and future factory partners should use official routes instead of private contact exchange.",
    sections: [
      {
        title: "Importer project help",
        body: "Pakistani importers can ask about packages, payment help, refund rules, product evidence, and how the Import Project workflow works before submitting details.",
      },
      {
        title: "Representative verification",
        body: "Before sharing information or making payment, users can verify a ChinaPak ImportHub representative or agent code through the representative verification route.",
      },
      {
        title: "Controlled communication",
        body: "The platform does not create direct importer-FMS chat. Admin remains the communication bridge for project questions and sourcing clarification.",
      },
    ],
    faq: standardFaq,
  },
  faq: {
    canonicalPath: "/faq",
    title: "ChinaPak ImportHub FAQ | Import from China to Pakistan",
    description:
      "Answers to common questions about ChinaPak ImportHub packages, FMS workflow, payment verification, refunds, factory reports, and no direct importer-FMS contact.",
    h1: "Frequently Asked Questions",
    supportUrdu:
      "China سے import شروع کرنے سے پہلے عام سوالات کے آسان جواب۔",
    intro:
      "These answers explain the public-facing workflow in plain language. Exact operational decisions are handled through your Import Project ID and admin review.",
    sections: [
      {
        title: "Before you start",
        body: "You can compare packages, verify the platform or representative, and then submit product details through the Importer Start flow.",
      },
      {
        title: "During sourcing",
        body: "FMS work starts only after payment is verified and admin approves the project. Importers do not directly message FMSs.",
      },
      {
        title: "After reports",
        body: "Importer-facing reports contain sanitized, admin-approved information. Raw submissions, factory contact details, and admin-only notes remain private.",
      },
    ],
    faq: publicFaqs,
  },
  terms: {
    canonicalPath: "/terms",
    title: "Terms of Service | ChinaPak ImportHub",
    description:
      "ChinaPak ImportHub terms overview for Import Projects, packages, admin review, FMS workflow, factory evidence, refund handling, and platform-controlled communication.",
    h1: "Terms of Service",
    supportUrdu:
      "یہ page plain-language terms overview ہے؛ commercial launch سے پہلے formal legal review ضروری ہے۔",
    intro:
      "These terms explain the current platform workflow and boundaries. They are written for clarity and should later be reviewed as formal legal terms before full commercial launch.",
    sections: [
      {
        title: "Import Project workflow",
        body: "Users submit product requirements and package choices as Import Projects. No FMS sourcing work begins until payment is verified and admin review approves the project.",
      },
      {
        title: "No direct contact bypass",
        body: "Importers must not bypass the platform to contact FMSs directly. FMSs must not request or share importer contact details. Factory contacts remain admin-only unless an approved future workflow allows release.",
      },
      {
        title: "Service limits",
        body: "ChinaPak ImportHub helps with sourcing visibility and reviewed factory options. It does not guarantee that every factory will accept every order, price, sample request, shipping route, or payment term.",
      },
      {
        title: "Legal review notice",
        body: "This plain-language policy overview should be reviewed by qualified counsel before full commercial launch. Payment gateways, automated notifications, and public factory signup are not active for MVP launch.",
      },
    ],
    faq: standardFaq,
  },
  "how-it-works": {
    canonicalPath: "/how-it-works",
    title: "How ChinaPak ImportHub Works | Factory Matching for Pakistani Importers",
    description:
      "Learn how ChinaPak ImportHub turns a product request into an admin-reviewed Import Project with FMS factory research and importer-safe reports.",
    h1: "How ChinaPak ImportHub Works",
    supportUrdu: "پروڈکٹ کی detail دیں، package منتخب کریں، admin review کے بعد China FMS factory options research کرتا ہے۔",
    intro:
      "ChinaPak ImportHub is built around an Import Project ID. Every project moves through payment, admin review, FMS research, admin quality review, and importer-facing report release.",
    ctaLabel: publicCtas.startProject,
    sections: [
      {
        title: "Step 1: Submit product details",
        body: "Importer shares product photos, links, quantity, budget, quality preference, and notes. This creates the foundation for one trackable Import Project.",
      },
      {
        title: "Step 2: Payment or saved lead",
        body: "Payment is encouraged at submission. If the importer cannot pay yet, the request can be saved as an unpaid lead for follow-up only.",
      },
      {
        title: "Step 3: Admin and FMS workflow",
        body: "Admin verifies payment and reviews the project. FMS work starts only after both gates are complete. The FMS never sees importer contact details.",
      },
      {
        title: "Step 4: Approved report",
        body: "Factory submissions go to admin review first. The importer sees only sanitized, admin-approved factory information according to package rules.",
      },
    ],
    faq: standardFaq,
  },
  "trust-safety": {
    canonicalPath: "/trust-safety",
    title: "Trust & Safety | ChinaPak ImportHub",
    description:
      "How ChinaPak ImportHub protects importer-FMS communication, factory contact details, evidence review, unpaid leads, and refund workflows.",
    h1: "Trust & Safety",
    supportUrdu: "پہلے verify کریں، پھر Import Project شروع کریں۔",
    intro:
      "Trust is built through local verification, admin-controlled communication, private factory contact handling, and clear payment/refund rules.",
    sections: [
      {
        title: "Admin-controlled communication",
        body: "Importers do not contact FMSs directly. FMSs submit sourcing updates to admin, and admin controls what becomes importer-facing.",
      },
      {
        title: "Protected factory contacts",
        body: "Factory phone, email, WeChat, address, and bank/payment notes are sensitive and admin-only unless a future approved workflow permits release.",
      },
      {
        title: "Payment and sourcing gate",
        body: "Unpaid leads do not start sourcing. FMS work begins only after payment is verified and admin review approves the Import Project.",
      },
      {
        title: "Clear limits",
        body: "ChinaPak ImportHub does not guarantee that every factory will accept every order, that every supplier will meet every target price, or that external logistics/customs risks disappear.",
      },
    ],
    faq: standardFaq,
  },
  "refund-policy": {
    canonicalPath: "/refund-policy",
    title: "Refund Policy | ChinaPak ImportHub",
    description:
      "ChinaPak ImportHub refund rules: full refund before FMS assignment and admin-reviewed milestone refunds after FMS assignment.",
    h1: "Refund Policy",
    supportUrdu: "FMS assignment سے پہلے full refund؛ assignment کے بعد admin milestone review۔",
    intro:
      "Refund handling is tied to Import Project status, payment verification, FMS assignment, milestones, and admin review.",
    sections: [
      {
        title: "Before FMS assignment",
        body: "If the project has not been assigned to an FMS, the importer may request a full refund according to platform rules.",
      },
      {
        title: "After FMS assignment",
        body: "After FMS assignment or work started, admin reviews completed milestones, evidence, and service delivery before approving full, partial, or rejected refunds.",
      },
      {
        title: "Reassignment before refund",
        body: "Admin may offer FMS reassignment before issuing a refund if the service can be continued through another specialist.",
      },
      {
        title: "Manual/offline payments",
        body: "Until a payment gateway is connected, payment and refund tracking remains manual/offline and documented inside the platform.",
      },
    ],
    faq: [publicFaqs[3], publicFaqs[2]],
  },
  "privacy-policy": {
    canonicalPath: "/privacy-policy",
    title: "Privacy Policy | ChinaPak ImportHub",
    description:
      "ChinaPak ImportHub privacy principles for importer profiles, FMS data, factory contacts, project files, messages, payments, and documents.",
    h1: "Privacy Policy",
    supportUrdu: "Importer، FMS اور factory contact data platform firewall کے تحت محفوظ رکھا جاتا ہے۔",
    intro:
      "This page explains the platform privacy direction. Final legal language should be reviewed before public launch.",
    sections: [
      {
        title: "Information we collect",
        body: "The platform may collect account details, importer business details, product requirements, files, messages, payment references, refund records, and operational audit logs.",
      },
      {
        title: "Role-based visibility",
        body: "Importers see their own projects. FMSs see assigned work without importer contact details. Admins manage operational data. Factory contact details stay admin-only.",
      },
      {
        title: "Files and evidence",
        body: "Files are private by default. Importer-visible evidence is released only after admin review through controlled access rules.",
      },
      {
        title: "Legal review note",
        body: "This policy should be reviewed for Pakistani business law, data protection expectations, and payment-provider requirements before full commercial rollout.",
      },
    ],
  },
  "import-from-china-to-pakistan": {
    canonicalPath: "/import-from-china-to-pakistan",
    title: "Import from China to Pakistan | Factory Access Help",
    description:
      "Learn how Pakistani importers can start an Import Project, compare Chinese factory options, and review evidence without traveling to China.",
    h1: "Import from China to Pakistan",
    supportUrdu: "China سے Pakistan import شروع کرنے کا آسان، project-based طریقہ۔",
    intro:
      "Importing from China becomes easier when the process is organized around product requirements, budget, factory research, admin review, and documented evidence.",
    sections: [
      {
        title: "Start with product requirements",
        body: "A strong import project begins with product photos, links, budget range, quantity, quality level, and any packaging or customization needs.",
      },
      {
        title: "Understand factory options",
        body: "Factory matching helps compare possible suppliers by category, MOQ, estimated pricing, production time, evidence, and reliability notes.",
      },
      {
        title: "Avoid unnecessary travel early",
        body: "Many Pakistani importers can begin factory discovery and comparison without immediately spending on China travel, hotel, translation, and local transport.",
      },
      {
        title: "Use platform rules",
        body: "Payment verification, admin review, FMS assignment, report release, and refund requests are tracked inside the platform.",
      },
    ],
    faq: standardFaq,
  },
  "find-chinese-factories": {
    canonicalPath: "/find-chinese-factories",
    title: "Find Chinese Factories from Pakistan | ChinaPak ImportHub",
    description:
      "Find suitable Chinese factories through admin-reviewed FMS sourcing instead of relying only on listings or middle channels.",
    h1: "Find Chinese Factories from Pakistan",
    supportUrdu: "صرف listing نہیں، admin-reviewed factory matching۔",
    intro:
      "Finding factories is not just collecting names. Importers need suitable matches, factory-side evidence, risk notes, and a controlled process.",
    sections: [
      {
        title: "Listings vs factory matching",
        body: "Marketplace listings can be useful, but they may include trading companies, agents, or multiple layers. Factory matching focuses on getting closer to actual production sources where possible.",
      },
      {
        title: "FMS research in China",
        body: "Factory Match Specialists research assigned projects in China and submit options, evidence, notes, and quotations to admin review.",
      },
      {
        title: "Admin review before importer release",
        body: "Importer-facing reports show sanitized, approved fields only. Raw FMS notes and sensitive factory contacts stay internal.",
      },
    ],
    faq: standardFaq,
  },
  "china-factory-verification-pakistan": {
    canonicalPath: "/china-factory-verification-pakistan",
    title: "China Factory Verification for Pakistani Importers",
    description:
      "Understand how factory-side evidence, supplier checks, photos, videos, quotations, and admin review support China sourcing decisions.",
    h1: "China Factory Verification for Pakistani Importers",
    supportUrdu: "Shipment یا payment decision سے پہلے factory-side evidence دیکھیں جہاں available ہو۔",
    intro:
      "Factory verification is not one magic certificate. It is a set of evidence, checks, review notes, and admin-controlled release decisions.",
    sections: [
      {
        title: "Evidence types",
        body: "Evidence may include factory photos, product photos, videos, quotation documents, certificates, catalog images, packaging photos, and FMS notes.",
      },
      {
        title: "What evidence can and cannot do",
        body: "Evidence supports decision-making, but importers should still review product quality, legal terms, certifications, payments, logistics, and customs risks carefully.",
      },
      {
        title: "Admin release controls",
        body: "Raw evidence from FMS remains admin-only until selected files are reviewed and released to the importer.",
      },
    ],
    faq: [publicFaqs[4], publicFaqs[1], publicFaqs[2]],
  },
  "avoid-middlemen-china-imports": {
    canonicalPath: "/avoid-middlemen-china-imports",
    title: "Avoid Unnecessary Middlemen in China Imports | Pakistan",
    description:
      "Learn how Pakistani importers can reduce unnecessary middle layers through factory-level visibility, admin-reviewed options, and FMS research.",
    h1: "Avoid Unnecessary Middlemen in China Imports",
    supportUrdu: "غیر ضروری middlemen کم کریں، مگر admin oversight برقرار رکھیں۔",
    intro:
      "Some middle channels provide value, but extra layers can add confusion, cost, and less factory visibility. The goal is fewer unnecessary layers, not reckless direct dealing.",
    sections: [
      {
        title: "Why layers matter",
        body: "Each additional sourcing layer may affect pricing, communication speed, evidence quality, and accountability.",
      },
      {
        title: "Factory-level visibility",
        body: "ChinaPak ImportHub focuses on admin-reviewed factory options and factory-side evidence so importers can compare more intelligently.",
      },
      {
        title: "Safety still matters",
        body: "The platform does not bypass controls. Admin reviews communication and protects sensitive contact details to reduce misuse and confusion.",
      },
    ],
    faq: standardFaq,
  },
  "pakistan-import-business-guide": {
    canonicalPath: "/pakistan-import-business-guide",
    title: "Pakistan Import Business Guide | China Sourcing Basics",
    description:
      "A practical guide for Pakistani shopkeepers, wholesalers, retailers, and online sellers who want to start importing from China.",
    h1: "Pakistan Import Business Guide",
    supportUrdu: "Shopkeepers اور small businesses کے لیے China sourcing basics۔",
    intro:
      "Import business decisions should start with product demand, budget, MOQ, quality level, supplier reliability, payment safety, shipping, and documentation.",
    sections: [
      {
        title: "Choose a product carefully",
        body: "Study local demand, target selling price, packaging needs, MOQ, and whether the product needs certifications or special import handling.",
      },
      {
        title: "Start with a realistic budget",
        body: "Smaller budgets need simpler factory discovery. Larger or repeat importers may need deeper comparison, negotiation support, and sample coordination.",
      },
      {
        title: "Track everything",
        body: "Use an Import Project ID to keep product requirements, payment, admin review, factory options, files, reports, and refunds in one place.",
      },
    ],
    faq: standardFaq,
  },
  "how-to-import-from-china-to-pakistan": {
    canonicalPath: "/how-to-import-from-china-to-pakistan",
    title: "How to Import from China to Pakistan | Step-by-Step",
    description:
      "Step-by-step China import guidance for Pakistani importers, from product details to factory matching, evidence review, and admin-approved reports.",
    h1: "How to Import from China to Pakistan",
    supportUrdu: "Product detail سے لے کر factory report تک، step-by-step process۔",
    intro:
      "The practical path is to define the product, choose a budget, select a package, complete payment or request assistance, and let admin-controlled sourcing begin.",
    sections: [
      {
        title: "Prepare product inputs",
        body: "Collect photos, links, model numbers, quantity, quality expectations, packaging details, and any special compliance requirements.",
      },
      {
        title: "Choose a package",
        body: "Factory Discovery suits smaller budgets, Factory Match Plus suits established importers, and Import Partner suits serious importers needing deeper support.",
      },
      {
        title: "Review evidence before decisions",
        body: "Factory-side photos, videos, quotations, and admin notes can support your decision before moving further in the import process.",
      },
    ],
    faq: standardFaq,
  },
  "china-factory-sourcing-pakistan": {
    canonicalPath: "/china-factory-sourcing-pakistan",
    title: "China Factory Sourcing for Pakistan | Admin-Reviewed Options",
    description:
      "China factory sourcing service for Pakistani businesses needing FMS research, admin-reviewed factory options, and product evidence.",
    h1: "China Factory Sourcing for Pakistan",
    supportUrdu: "Pakistan businesses کے لیے China factory sourcing support۔",
    intro:
      "ChinaPak ImportHub turns product requirements into a structured sourcing project with admin review, FMS research, and importer-safe reports.",
    sections: [
      {
        title: "Sourcing is more than a supplier name",
        body: "Good sourcing compares MOQ, price range, production time, evidence, reliability notes, and whether the factory fits the importer budget.",
      },
      {
        title: "Admin-reviewed workflow",
        body: "FMS submissions are reviewed by admin before any importer-facing report is released. This protects communication and reduces confusion.",
      },
      {
        title: "Built for Pakistani budgets",
        body: "Packages are designed for PKR 100k to 1.5m+ import budgets, with clear factory-option limits and delivery targets.",
      },
    ],
    faq: standardFaq,
  },
  "find-factory-in-china-from-pakistan": {
    canonicalPath: "/find-factory-in-china-from-pakistan",
    title: "Find a Factory in China from Pakistan | No China Travel Required",
    description:
      "Pakistani importers can start factory discovery from Pakistan through ChinaPak ImportHub Import Projects and FMS research.",
    h1: "Find a Factory in China from Pakistan",
    supportUrdu: "Pakistan میں رہ کر China factory options دیکھیں۔",
    intro:
      "You can begin with product photos, links, and requirements. The platform organizes sourcing work through admin-controlled project steps.",
    sections: [
      {
        title: "No early travel requirement",
        body: "Many importers can evaluate factory options and evidence before deciding whether deeper travel, samples, or further trade steps are worth it.",
      },
      {
        title: "Factory options, not random contacts",
        body: "Importer-facing options are sanitized and admin-reviewed. Direct contact details are not automatically released.",
      },
      {
        title: "Project tracking",
        body: "Your project ID keeps package, payment, report, feedback, invoice, refund, and evidence status connected.",
      },
    ],
    faq: standardFaq,
  },
  "verify-chinese-supplier-before-payment": {
    canonicalPath: "/verify-chinese-supplier-before-payment",
    title: "Verify Chinese Supplier Before Payment | Pakistan Importers",
    description:
      "Use factory-side evidence, background checks, admin review, and controlled communication before making China sourcing decisions.",
    h1: "Verify Chinese Supplier Before Payment",
    supportUrdu: "Payment decision سے پہلے supplier evidence اور admin review دیکھیں۔",
    intro:
      "Supplier verification should combine documents, photos, videos, quotations, checks, communication review, and realistic risk assessment.",
    sections: [
      {
        title: "Ask for useful evidence",
        body: "Product photos, factory photos, videos, certificates, and quotations can help clarify whether a supplier fits the project.",
      },
      {
        title: "Use admin review",
        body: "Admin review helps screen what becomes importer-facing and keeps factory contact details protected unless a future workflow allows release.",
      },
      {
        title: "No absolute guarantees",
        body: "Verification reduces uncertainty, but importers should still assess contracts, payment terms, logistics, product quality, and legal requirements.",
      },
    ],
    faq: [publicFaqs[4], publicFaqs[3]],
  },
  "china-product-sourcing-for-pakistani-shopkeepers": {
    canonicalPath: "/china-product-sourcing-for-pakistani-shopkeepers",
    title: "China Product Sourcing for Pakistani Shopkeepers",
    description:
      "Simple China sourcing help for Pakistani shopkeepers who want factory options, evidence, and admin-reviewed project support.",
    h1: "China Product Sourcing for Pakistani Shopkeepers",
    supportUrdu: "Shopkeeper کے لیے آسان China sourcing process۔",
    intro:
      "Shopkeepers often need practical help: what product to submit, how much budget is realistic, what MOQ means, and how to compare factory options.",
    sections: [
      {
        title: "Simple project intake",
        body: "Submit a product photo, product link, or typed details. The wizard collects budget, quantity, quality level, and package choice.",
      },
      {
        title: "Clear package levels",
        body: "Start small with Factory Discovery or choose deeper support with Factory Match Plus or Import Partner as your import budget grows.",
      },
      {
        title: "Local trust first",
        body: "You can verify the platform or a representative before ordering and use official platform payment/help routes.",
      },
    ],
    faq: standardFaq,
  },
  "china-import-help-for-small-business": {
    canonicalPath: "/china-import-help-for-small-business",
    title: "China Import Help for Small Business in Pakistan",
    description:
      "ChinaPak ImportHub helps small Pakistani businesses start import projects, compare factory options, and review evidence through admin-controlled sourcing.",
    h1: "China Import Help for Small Business",
    supportUrdu: "Small business کے لیے China import assistance۔",
    intro:
      "Small businesses need clarity before spending heavily on travel or large orders. A structured Import Project helps keep early sourcing decisions organized.",
    sections: [
      {
        title: "Budget-aware sourcing",
        body: "Packages align with common small-to-medium import budgets and show expected factory option counts and delivery targets.",
      },
      {
        title: "Evidence-led comparison",
        body: "Admin-reviewed factory reports can include safe summaries, estimated pricing, MOQ, sample availability, lead time, and risk notes.",
      },
      {
        title: "Assistance if payment is not ready",
        body: "If you cannot pay immediately, the project can be saved as an unpaid lead for follow-up. No sourcing begins from an unpaid lead.",
      },
    ],
    faq: standardFaq,
  },
  "import-products-from-china-without-travel": {
    canonicalPath: "/import-products-from-china-without-travel",
    title: "Import Products from China Without Travel | Pakistan",
    description:
      "Start a China sourcing project from Pakistan with FMS research, admin-reviewed factory options, and factory-side evidence.",
    h1: "Import Products from China Without Traveling",
    supportUrdu: "China جائے بغیر sourcing شروع کریں۔",
    intro:
      "Travel can be useful for large or complex deals, but many importers first need a lower-friction way to understand factory options and evidence.",
    sections: [
      {
        title: "Reduce early travel burden",
        body: "Avoid early costs such as flights, hotel, transport, translation, and time away from your business while you are still exploring supplier fit.",
      },
      {
        title: "Use a China-based FMS network",
        body: "FMSs research assigned projects in China, but communicate through the platform so importer contact details remain protected.",
      },
      {
        title: "Review before moving ahead",
        body: "Factory-side evidence can help decide whether a supplier deserves deeper negotiation, sample coordination, or shipping planning.",
      },
    ],
    faq: standardFaq,
  },
  "china-factory-agent-for-pakistan": {
    canonicalPath: "/china-factory-agent-for-pakistan",
    title: "China Factory Agent for Pakistan | FMS-Based Sourcing",
    description:
      "ChinaPak ImportHub uses Factory Match Specialists and admin review to help Pakistani importers find suitable Chinese factory options.",
    h1: "China Factory Agent for Pakistan",
    supportUrdu: "Factory agent نہیں، platform-controlled FMS workflow۔",
    intro:
      "Instead of a single opaque agent, ChinaPak ImportHub uses project tracking, admin review, FMS assignment, evidence review, and importer-safe reports.",
    sections: [
      {
        title: "Factory Match Specialist model",
        body: "FMSs are China-based sourcing specialists assigned by admin to suitable paid and approved Import Projects.",
      },
      {
        title: "Admin as the communication bridge",
        body: "Admin controls all importer-FMS communication. This protects contact details and keeps reporting consistent.",
      },
      {
        title: "Factory database growth",
        body: "Each reviewed factory submission can improve the internal factory database, which remains private in Phase 1.",
      },
    ],
    faq: standardFaq,
  },
  "china-sourcing-service-pakistan": {
    canonicalPath: "/china-sourcing-service-pakistan",
    title: "China Sourcing Service Pakistan | ChinaPak ImportHub",
    description:
      "Professional China sourcing service for Pakistani importers with packages, FMS research, admin-reviewed reports, and refund rules.",
    h1: "China Sourcing Service for Pakistan",
    supportUrdu: "Pakistan importers کے لیے professional China sourcing service۔",
    intro:
      "ChinaPak ImportHub combines local Pakistani trust, China-based factory research, admin review, secure project tracking, and professional documents.",
    sections: [
      {
        title: "Service packages",
        body: "Choose Factory Discovery, Factory Match Plus, or Import Partner depending on budget, option count, and required support depth.",
      },
      {
        title: "Controlled evidence release",
        body: "FMS evidence and factory submissions are not automatically importer-facing. Admin approves and sanitizes reports first.",
      },
      {
        title: "Designed for repeat operation",
        body: "The platform connects projects, payments, invoices, refunds, files, reports, feedback, notifications, and future email/document workflows.",
      },
    ],
    faq: standardFaq,
  },
} as const satisfies Record<string, PublicSeoPage>;

export const publicSitemapRoutes = [
  ROUTES.home,
  "/how-it-works",
  ROUTES.packages,
  "/about",
  ROUTES.contact,
  "/faq",
  "/trust-safety",
  "/refund-policy",
  "/privacy-policy",
  "/terms",
  ...Object.values(publicSeoPages).map((page) => page.canonicalPath),
  ROUTES.verify,
  ROUTES.verifyRepresentative,
  ROUTES.fms,
  ROUTES.fmsOpportunities,
  ROUTES.fmsOpportunityChinaSourcingJobs,
  ROUTES.fmsOpportunityPakistaniImporters,
  ROUTES.factoriesExportToPakistan,
  ROUTES.factoriesFindPakistaniBuyers,
  ROUTES.factoriesPartnership,
  ROUTES.learn,
  ROUTES.learnImportFromChinaToPakistan,
  ROUTES.learnFindChineseFactories,
  ROUTES.learnAvoidMiddlemenChinaImports,
  ROUTES.learnVerifyProductsBeforeShipping,
] as const;

export type PublicSeoPageKey = keyof typeof publicSeoPages;

export function getPublicPageMetadata(pageKey: PublicSeoPageKey): Metadata {
  const page = publicSeoPages[pageKey];
  const siteUrl = getSiteUrl();

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.canonicalPath,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: brand.name,
      type: "website",
      url: `${siteUrl}${page.canonicalPath}`,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export function buildServiceJsonLd(page: PublicSeoPage) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.h1,
    description: page.description,
    provider: {
      "@type": "Organization",
      name: brand.name,
      url: siteUrl,
    },
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    serviceType: "China factory sourcing support for Pakistani importers",
    url: `${siteUrl}${page.canonicalPath}`,
  };
}

export function buildFaqJsonLd(faq: readonly PublicFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
