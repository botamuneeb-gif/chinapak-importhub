import { ROUTES } from "@/config/brand";

export type SeoArticleSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoPageContent = {
  title: string;
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  supportLine?: string;
  intro: string;
  languageNote: string;
  sections: SeoArticleSection[];
  faqs?: SeoFaqItem[];
  cta: {
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
};

export const learnHubCards = [
  {
    title: "China سے Pakistan import کیسے کریں؟",
    body: "Import process، budget، verification، payment، اور admin review کو آسان زبان میں سمجھیں۔",
    href: ROUTES.learnImportFromChinaToPakistan,
  },
  {
    title: "Chinese factories کیسے find کریں؟",
    body: "Listing pages اور factory-level matching کے فرق کو practical انداز میں سمجھیں۔",
    href: ROUTES.learnFindChineseFactories,
  },
  {
    title: "غیر ضروری middlemen کیسے کم کریں؟",
    body: "Middle layers، platform-controlled communication، اور local verification کا کردار دیکھیں۔",
    href: ROUTES.learnAvoidMiddlemenChinaImports,
  },
  {
    title: "Shipment سے پہلے product evidence کیسے دیکھیں؟",
    body: "Factory photos، product videos، quotations، certificates، اور add-ons کا overview۔",
    href: ROUTES.learnVerifyProductsBeforeShipping,
  },
] as const;

export const importerLearnArticles = {
  importFromChinaToPakistan: {
    title: "China سے Pakistan import کیسے کریں؟",
    metadataTitle: "How to Import from China to Pakistan | ChinaPak ImportHub",
    metadataDescription:
      "Urdu-first guide for Pakistani importers learning how to import from China with factory matching, payment, verification, and refund protection basics.",
    eyebrow: "Importer learning guide",
    supportLine:
      "How to import from China to Pakistan, explained for Pakistani shopkeepers and first-time importers.",
    intro:
      "China سے import کرنا صرف supplier search کا کام نہیں۔ Product requirement، budget، factory access، payment، verification، shipment evidence، اور admin review سب کو ایک clear Import Project میں manage کرنا ضروری ہے۔",
    languageNote:
      "یہ guide Pakistani importers کے لیے Urdu-first لکھی گئی ہے۔ English trade words صرف وہاں استعمال ہوئے ہیں جہاں market میں عام فہم ہیں۔",
    sections: [
      {
        heading: "China سے import کرنے کا simple process",
        body: [
          "سب سے پہلے product کی تصویر، link، quantity، quality level، اور approximate budget clear کریں۔ اس کے بعد package choose کیا جاتا ہے، payment یا unpaid lead option select ہوتا ہے، اور admin project review کرتا ہے۔",
          "Paid project admin review کے بعد FMS assignment کے لیے prepare ہوتا ہے۔ FMS China میں suitable factory options research کرتا ہے، مگر importer سے direct communication نہیں کرتا۔",
        ],
        bullets: [
          "Product details submit کریں",
          "Import budget اور quantity select کریں",
          "Factory access package choose کریں",
          "Payment complete کریں یا unpaid lead save کریں",
          "Admin review کے بعد sourcing workflow شروع ہوتا ہے",
        ],
      },
      {
        heading: "Small Pakistani importers کو کیا problems آتی ہیں",
        body: [
          "چھوٹے shopkeepers اور online sellers کو reliable factory contact، language، MOQ، sample coordination، اور payment trust جیسے issues آتے ہیں۔ بہت سے importers کو یہ بھی معلوم نہیں ہوتا کہ listing کے پیچھے actual factory ہے یا trading layer۔",
          "ChinaPak ImportHub اس confusion کو Import Project structure، admin review، اور factory-side evidence کے ذریعے کم کرنے کی کوشش کرتا ہے۔",
        ],
      },
      {
        heading: "China جانے کے اخراجات اور risk",
        body: [
          "China visit میں travel, hotel, interpreter, local transport, market visits, and time cost شامل ہو سکتے ہیں۔ First-time importer کے لیے یہ cost product order سے بھی زیادہ محسوس ہو سکتی ہے۔",
          "Platform کا مقصد یہ ہے کہ importer کو China جائے بغیر suitable Chinese factories تک structured access ملے، مگر final trade decision پھر بھی responsible review کے ساتھ ہونا چاہیے۔",
        ],
      },
      {
        heading: "Factory تک access کیوں important ہے",
        body: [
          "Traditional marketplaces and middle channels may involve multiple layers between the buyer and the actual factory. ہر layer price، response time، اور product clarity پر اثر ڈال سکتی ہے۔",
          "Factory-level visibility سے importer کو یہ سمجھنے میں مدد ملتی ہے کہ product کہاں بن سکتا ہے، MOQ کیا ہو سکتا ہے، اور factory-side evidence کیا دکھا رہا ہے۔",
        ],
      },
      {
        heading: "ChinaPak ImportHub کیسے help کرتا ہے",
        body: [
          "Platform importer سے requirements لیتا ہے، admin request review کرتا ہے، پھر approved workflow کے مطابق FMS China میں factory options research کرتا ہے۔ Admin factory options اور evidence review کر کے importer-facing result prepare کرتا ہے۔",
          "Importer اور FMS کے درمیان direct chat یا contact exchange نہیں ہوتا۔ Communication platform/admin کے ذریعے controlled رہتی ہے۔",
        ],
      },
      {
        heading: "Payment, verification, refund protection summary",
        body: [
          "Payment project submission پر encouraged ہے تاکہ admin review شروع ہو سکے۔ اگر payment complete نہیں ہو سکتی تو project unpaid lead کے طور پر save ہو سکتا ہے، لیکن unpaid lead پر FMS work شروع نہیں ہوتا۔",
          "FMS assignment سے پہلے full refund available ہے۔ FMS assignment کے بعد refund admin review اور completed milestones کی بنیاد پر decide ہوتا ہے۔",
        ],
      },
    ],
    faqs: [
      {
        question: "کیا مجھے China جانا ضروری ہے؟",
        answer:
          "نہیں، platform کا مقصد China جائے بغیر factory-level sourcing visibility دینا ہے۔ Complex trade decisions کے لیے پھر بھی admin guidance اور responsible review ضروری ہے۔",
      },
      {
        question: "کیا unpaid lead پر sourcing شروع ہوتی ہے؟",
        answer:
          "نہیں۔ Unpaid leads پر FMS assignment یا sourcing work شروع نہیں ہوتا جب تک payment complete نہ ہو اور admin project review نہ کرے۔",
      },
    ],
    cta: {
      title: "اپنا Import Project شروع کریں",
      body: "Product کی تصویر، link، یا details دیں۔ ہماری team اسے project structure میں review کرنے کے لیے تیار کرے گی۔",
      primaryLabel: "Import Project شروع کریں",
      primaryHref: ROUTES.importerStart,
      secondaryLabel: "Packages دیکھیں",
      secondaryHref: ROUTES.packages,
    },
  },
  findChineseFactories: {
    title: "Chinese factories کیسے find کریں؟",
    metadataTitle: "How to Find Chinese Factories | ChinaPak ImportHub",
    metadataDescription:
      "Urdu-first guide explaining marketplace listings, factory access, FMS research, admin-reviewed factory options, and factory-side product evidence.",
    eyebrow: "Factory access guide",
    supportLine:
      "Marketplace listings, middle channels, and factory-level matching explained carefully.",
    intro:
      "Chinese factories find کرنے کے لیے صرف online listing دیکھنا کافی نہیں ہوتا۔ Importer کو یہ سمجھنا ہوتا ہے کہ supplier actual factory ہے، trading company ہے، یا کسی middle layer کے ذریعے کام کر رہا ہے۔",
    languageNote:
      "یہ content Pakistani importers کے practical سوالات کے مطابق لکھا گیا ہے، نہ کہ mechanically translated blog copy۔",
    sections: [
      {
        heading: "Marketplace listings vs actual factory access",
        body: [
          "Marketplaces product discovery کے لیے useful ہو سکتے ہیں، لیکن ہر listing actual factory-level relationship نہیں دکھاتی۔ کچھ listings trading companies، agents، یا resellers کے ذریعے manage ہو سکتی ہیں۔",
          "ChinaPak ImportHub کا focus listing browse کرنے کے بجائے Import Project requirement کے مطابق factory options identify کرنے پر ہے۔",
        ],
      },
      {
        heading: "Middle layers and price impact",
        body: [
          "Traditional marketplaces and middle channels may involve multiple layers between buyer and factory. یہ layers sometimes service value دیتی ہیں، لیکن unnecessary layers price، response clarity، اور factory evidence کو complicated کر سکتی ہیں۔",
          "Goal یہ نہیں کہ ہر middle channel کو غلط کہا جائے۔ Goal یہ ہے کہ importer کو factory-level visibility ملے تاکہ وہ better decision لے سکے۔",
        ],
      },
      {
        heading: "Factory Match Specialist role",
        body: [
          "FMS یعنی Factory Match Specialist China میں assigned project کے مطابق suitable factories research کرتا ہے۔ FMS importer سے direct بات نہیں کرتا اور importer contact details نہیں دیکھتا۔",
          "FMS factory data، quotations، photos/videos، and notes platform میں submit کرتا ہے تاکہ admin review کر سکے۔",
        ],
      },
      {
        heading: "Admin-reviewed factory options",
        body: [
          "Factory options directly importer کو raw form میں نہیں بھیجے جاتے۔ Admin review workflow information کو check کرتا ہے، missing details identify کرتا ہے، اور package rules کے مطابق importer-facing summary prepare کرتا ہے۔",
        ],
      },
      {
        heading: "Factory-side evidence before shipment",
        body: [
          "Product photos، factory photos، quotation documents، certificates، and video tour coordination جیسے evidence options importer کو decision support دیتے ہیں۔ Evidence final guarantee نہیں، مگر blind ordering سے بہتر review structure فراہم کرتا ہے۔",
        ],
      },
    ],
    faqs: [
      {
        question: "کیا ChinaPak ImportHub factory contact directly دے گا؟",
        answer:
          "Factory contact details sensitive ہیں۔ Release صرف package workflow اور admin approval کے مطابق ہو سکتی ہے۔",
      },
      {
        question: "FMS importer سے بات کیوں نہیں کرتا؟",
        answer:
          "Platform firewall importer اور FMS دونوں کی privacy، quality control، and audit trail کو protect کرتا ہے۔",
      },
    ],
    cta: {
      title: "Factory matching کے لیے project submit کریں",
      body: "Product details دیں تاکہ admin-reviewed factory search workflow کے لیے project prepare ہو سکے۔",
      primaryLabel: "Import Project شروع کریں",
      primaryHref: ROUTES.importerStart,
      secondaryLabel: "Verify Us",
      secondaryHref: ROUTES.verify,
    },
  },
  avoidMiddlemen: {
    title: "China imports میں غیر ضروری middlemen کیسے کم کریں؟",
    metadataTitle:
      "Avoid Unnecessary Middlemen in China Imports | ChinaPak ImportHub",
    metadataDescription:
      "Urdu-first guide for Pakistani importers on reducing unnecessary middle layers with factory matching, local verification, and admin-controlled communication.",
    eyebrow: "Safer sourcing structure",
    supportLine: "Fewer unnecessary middlemen, not careless direct dealing.",
    intro:
      "China imports میں middlemen کم کرنے کا مطلب یہ نہیں کہ importer بغیر review کے risky deal کرے۔ اصل مقصد یہ ہے کہ unnecessary layers کم ہوں، factory-level visibility بڑھے، اور communication platform کے ذریعے controlled رہے۔",
    languageNote:
      "یہ guide aggressive marketplace comparison کے بجائے safe and practical sourcing education پر based ہے۔",
    sections: [
      {
        heading: "Middle layers pricing پر کیا اثر ڈال سکتی ہیں",
        body: [
          "ہر layer اپنی service یا margin شامل کر سکتی ہے۔ بعض اوقات یہ useful ہوتا ہے، جیسے documentation support یا logistics coordination۔ لیکن جب layers unnecessary ہوں تو importer کو actual factory price، MOQ، and production clarity سمجھنا مشکل ہو سکتا ہے۔",
        ],
      },
      {
        heading: "Direct factory matching کیوں matter کرتا ہے",
        body: [
          "Factory matching سے importer کو product بنانے والی side کے قریب information ملتی ہے۔ Factory capacity، MOQ، production time، and evidence دیکھ کر importer زیادہ informed decision لے سکتا ہے۔",
          "ChinaPak ImportHub direct uncontrolled contact کے بجائے admin-reviewed factory options پر focus کرتا ہے۔",
        ],
      },
      {
        heading: "Local Pakistani verification کیوں help کرتی ہے",
        body: [
          "Pakistani importer online service پر trust کرنے سے پہلے local representative یا support channel سے verify کر سکتا ہے۔ یہ especially first-time importers کے لیے important ہے۔",
          "Official payment workflow اور representative verification unnecessary fraud risk کو کم کرنے میں مدد دیتے ہیں۔",
        ],
      },
      {
        heading: "Admin-controlled communication users کو کیسے protect کرتی ہے",
        body: [
          "Importer اور FMS کے درمیان direct messaging نہیں ہوتی۔ Admin message review، translation support، sensitive contact flagging، and audit trail کے ذریعے platform workflow کو control کرتا ہے۔",
          "یہ structure bypass attempts، private contact exchange، and undocumented commitments کو کم کرنے کے لیے بنایا گیا ہے۔",
        ],
      },
    ],
    faqs: [
      {
        question: "کیا ہر middleman برا ہوتا ہے؟",
        answer:
          "نہیں۔ کچھ service layers useful ہو سکتی ہیں۔ ChinaPak ImportHub کا focus unnecessary layers کم کرنے اور factory-level visibility بڑھانے پر ہے۔",
      },
      {
        question: "کیا direct factory access کا مطلب direct chat ہے؟",
        answer:
          "نہیں۔ Factory-level visibility admin-reviewed workflow کے ذریعے دی جاتی ہے۔ Direct importer-FMS chat allowed نہیں۔",
      },
    ],
    cta: {
      title: "Unnecessary layers کم کرنے کے لیے structured project بنائیں",
      body: "Admin-reviewed factory options اور product evidence کے ساتھ sourcing decision کو زیادہ clear بنائیں۔",
      primaryLabel: "Import Project شروع کریں",
      primaryHref: ROUTES.importerStart,
      secondaryLabel: "Refund rules دیکھیں",
      secondaryHref: ROUTES.refunds,
    },
  },
  verifyProducts: {
    title: "Shipment سے پہلے product evidence کیسے دیکھیں؟",
    metadataTitle: "Verify Products Before Shipping from China | ChinaPak ImportHub",
    metadataDescription:
      "Urdu-first guide on factory photos, product videos, quotations, certificates, video factory tour coordination, and AI Trade Translation support.",
    eyebrow: "Product evidence guide",
    supportLine:
      "Factory-side photos, videos, quotations, and certificates as decision support before shipment.",
    intro:
      "Shipment سے پہلے product evidence دیکھنا importer کو blind decision سے بچاتا ہے۔ Evidence final guarantee نہیں ہوتا، مگر photos، videos، quotations، and certificates کے ذریعے importer بہتر questions پوچھ سکتا ہے۔",
    languageNote:
      "یہ page evidence کو decision support کے طور پر explain کرتا ہے، final trade risk guarantee کے طور پر نہیں۔",
    sections: [
      {
        heading: "Factory photos/videos",
        body: [
          "Factory-side photos اور videos سے importer کو production environment، machinery، packing area، یا sample handling کا basic view مل سکتا ہے۔ Admin review کے بعد relevant evidence importer-facing summary میں شامل کیا جا سکتا ہے۔",
        ],
      },
      {
        heading: "Product photos/videos",
        body: [
          "Product evidence میں sample images، material details، size، color، packaging، and visible quality indicators شامل ہو سکتے ہیں۔ Importer کو اپنی exact requirement پہلے clear دینی چاہیے تاکہ evidence useful ہو۔",
        ],
      },
      {
        heading: "Quotations/certificates",
        body: [
          "Quotation documents price، MOQ، production time، and terms clarify کرنے میں مدد دیتے ہیں۔ Certificates useful ہو سکتے ہیں، مگر legal or technical reliance کے لیے admin یا human review کی ضرورت ہو سکتی ہے۔",
        ],
      },
      {
        heading: "Video factory tour add-on",
        body: [
          "Video Factory Tour Coordination add-on factory-side visibility کو improve کر سکتا ہے جہاں package and factory cooperation allow کرے۔ یہ real-time guarantee نہیں، بلکہ structured evidence collection support ہے۔",
        ],
      },
      {
        heading: "AI Trade Translation add-on",
        body: [
          "AI Trade Translation Urdu, English, and Chinese communication کو سمجھنے میں مدد دے سکتا ہے۔ Legal contracts، technical specifications، certifications، اور payment terms کے لیے admin یا human review required ہو سکتا ہے۔",
        ],
      },
      {
        heading: "Important disclaimer",
        body: [
          "Product evidence decision-making کو support کرتا ہے، لیکن final trade, payment, customs, shipping, and import risks کو importer/admin workflow کے ساتھ separately review کرنا چاہیے۔",
        ],
      },
    ],
    faqs: [
      {
        question: "کیا evidence shipment guarantee ہے؟",
        answer:
          "نہیں۔ Evidence decision support ہے۔ Final order, quality, shipping, and import risks کو separately review کرنا ضروری ہے۔",
      },
      {
        question: "کیا translation automatically legally valid ہے؟",
        answer:
          "نہیں۔ AI translation support communication کے لیے ہے۔ Legal, technical, certification, and payment terms human/admin review require کر سکتے ہیں۔",
      },
    ],
    cta: {
      title: "Product evidence کے ساتھ sourcing شروع کریں",
      body: "Product details submit کریں تاکہ package کے مطابق evidence collection workflow prepare ہو سکے۔",
      primaryLabel: "Import Project شروع کریں",
      primaryHref: ROUTES.importerStart,
      secondaryLabel: "Add-ons دیکھیں",
      secondaryHref: ROUTES.packages,
    },
  },
} satisfies Record<string, SeoPageContent>;

export const fmsOpportunityPages = {
  hub: {
    title: "Work With Pakistani Importers as a Factory Match Specialist",
    metadataTitle: "FMS Opportunities | ChinaPak ImportHub",
    metadataDescription:
      "Learn how Factory Match Specialists in China can support Pakistani importers through admin-reviewed sourcing assignments and FMS Academy certification.",
    eyebrow: "FMS opportunities",
    supportLine:
      "成为 ChinaPak ImportHub 的工厂匹配专家，帮助巴基斯坦进口商寻找合适的中国工厂。",
    intro:
      "ChinaPak ImportHub works with approved Factory Match Specialists who research suitable Chinese factories, collect sourcing evidence, and submit structured results for admin review.",
    languageNote:
      "This opportunity content is English-first for international sourcing specialists, with Simplified Chinese support for China-based candidates.",
    sections: [
      {
        heading: "What is an FMS?",
        body: [
          "An FMS is a Factory Match Specialist. FMSs help find suitable factories for assigned Import Projects, collect quotations and evidence, and submit factory options to the platform.",
          "FMSs do not communicate directly with importers and do not receive importer personal contact details.",
        ],
      },
      {
        heading: "What work FMSs do",
        body: [
          "FMS work may include reviewing product requirements, researching factories, checking basic reliability signals, collecting factory-side photos/videos, preparing quotation notes, and submitting evidence for admin review.",
        ],
        bullets: [
          "Review assigned project requirements",
          "Research relevant Chinese factories",
          "Collect factory data and product evidence",
          "Submit structured options through the platform",
          "Respond to admin feedback and revision requests",
        ],
      },
      {
        heading: "Why join ChinaPak ImportHub",
        body: [
          "The platform brings structured Pakistani importer demand into a controlled workflow. FMSs receive assigned projects instead of finding every foreign client independently.",
          "Admin review protects quality, privacy, and communication boundaries for both sides.",
        ],
      },
      {
        heading: "FMS Academy and certification",
        body: [
          "Before paid work, FMS candidates should complete onboarding covering platform workflow, confidentiality, anti-bypass rules, factory verification basics, and evidence standards.",
        ],
      },
      {
        heading: "Compensation tiers",
        body: [
          "Compensation is milestone and quality based, not a direct percentage of customer price. Initial tiers include Bronze, Silver, and Gold ranges aligned with assignment difficulty.",
        ],
        bullets: [
          "Bronze: PKR 5,000-7,000, approx. ¥120-170",
          "Silver: PKR 9,000-12,000, approx. ¥220-290",
          "Gold: PKR 15,000-25,000, approx. ¥370-610",
        ],
      },
      {
        heading: "Invitation and admin approval notice",
        body: [
          "FMS access is invitation-only or admin-approved. Submitting interest does not activate portal access or paid assignments automatically.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can an FMS contact importers directly?",
        answer:
          "No. All importer communication is controlled by ChinaPak ImportHub admin and platform workflow.",
      },
      {
        question: "Can an FMS share factory contact details with an importer?",
        answer:
          "No. Factory contact information is sensitive and can only be released through admin-approved package workflow.",
      },
    ],
    cta: {
      title: "Apply through invitation workflow",
      body: "Use the invite placeholder to register interest as an FMS candidate. Approval and dashboard access will connect later.",
      primaryLabel: "Open invite page",
      primaryHref: ROUTES.authInvite,
      secondaryLabel: "View FMS Academy",
      secondaryHref: ROUTES.fmsAcademy,
    },
  },
  sourcingJobs: {
    title: "China Sourcing Jobs and Factory Matching Opportunities",
    metadataTitle: "China Sourcing Jobs | ChinaPak ImportHub FMS Opportunities",
    metadataDescription:
      "Explore invitation-only sourcing consultant and Factory Match Specialist opportunities for China-based sourcing professionals.",
    eyebrow: "Sourcing consultant opportunities",
    supportLine:
      "中国采购顾问可以通过平台化流程服务巴基斯坦进口项目。",
    intro:
      "ChinaPak ImportHub is preparing a structured way for China-based sourcing specialists to work on assigned projects for Pakistani importers, with admin review and milestone-based quality control.",
    languageNote:
      "This page is written for sourcing professionals in China who want a clear platform workflow instead of informal buyer matching.",
    sections: [
      {
        heading: "Flexible sourcing work",
        body: [
          "FMS assignments can fit specialists who understand factories, quotations, MOQ, evidence collection, and supplier communication. Work scope depends on package, category, timeline, and FMS tier.",
        ],
      },
      {
        heading: "Assigned projects",
        body: [
          "FMSs work only on assigned Import Projects. The platform controls assignment, project brief visibility, milestone status, and admin review.",
        ],
      },
      {
        heading: "No need to find your own foreign clients",
        body: [
          "The platform brings approved demand into one project system. FMSs focus on sourcing research and evidence quality rather than negotiating private client relationships.",
        ],
      },
      {
        heading: "Admin-reviewed workflow",
        body: [
          "All submissions are reviewed by admin before importer delivery. This keeps the platform firewall intact and supports consistent customer-facing quality.",
        ],
      },
      {
        heading: "Milestone-based payouts",
        body: [
          "FMS earnings are credited after admin verifies completed milestones and project quality. Payout timing follows the agreed payout schedule.",
        ],
      },
      {
        heading: "Anti-bypass and confidentiality rules",
        body: [
          "FMSs must not bypass the platform, request importer contact details, release factory contact details directly, or move communication outside ChinaPak ImportHub workflow.",
        ],
      },
    ],
    cta: {
      title: "Start with invitation review",
      body: "FMS registration is not open as a self-serve public signup. Candidate access is admin-approved.",
      primaryLabel: "Open invite page",
      primaryHref: ROUTES.authInvite,
      secondaryLabel: "Read FMS rules",
      secondaryHref: ROUTES.fmsDashboard,
    },
  },
  pakistaniImporters: {
    title: "Work With Pakistani Buyers Through a Controlled Platform",
    metadataTitle: "Work With Pakistani Importers | ChinaPak ImportHub",
    metadataDescription:
      "Learn how China-based FMS candidates can support Pakistani importers with factory matching, evidence collection, translation support, and tier growth.",
    eyebrow: "Pakistani importer sourcing demand",
    supportLine:
      "帮助巴基斯坦中小进口商更清楚地了解中国工厂选择。",
    intro:
      "Pakistani shopkeepers, wholesalers, and online sellers often need practical support finding suitable Chinese factories without traveling to China. FMSs help turn those requests into structured factory options.",
    languageNote:
      "This content is for China-based sourcing specialists interested in Pakistan-focused cross-border trade support.",
    sections: [
      {
        heading: "Pakistani importer demand",
        body: [
          "Many Pakistani importers are small and medium businesses looking for clearer access to factory options, MOQ, quotations, and product evidence. The platform organizes this demand around Import Project IDs.",
        ],
      },
      {
        heading: "Helping small businesses access Chinese factories",
        body: [
          "FMSs support the research side in China, while admin controls importer communication and final result release. This helps non-technical importers receive organized information without direct cross-border confusion.",
        ],
      },
      {
        heading: "Professional platform-controlled workflow",
        body: [
          "Importer contact details are hidden from FMSs. FMS contact details are hidden from importers. Messages, evidence, and factory options move through admin review.",
        ],
      },
      {
        heading: "Translation support future",
        body: [
          "The platform is designed for Urdu, English, and Simplified Chinese support. AI Trade Translation, voice note translation, document translation, and live call translation are planned as controlled add-ons.",
        ],
      },
      {
        heading: "FMS tier growth",
        body: [
          "FMSs can grow through Bronze, Silver, and Gold tiers based on project complexity, milestone quality, reliability, and admin-reviewed performance.",
        ],
      },
    ],
    cta: {
      title: "Join the approved FMS pathway",
      body: "Use the invite placeholder to begin the future review path for FMS or sourcing specialist access.",
      primaryLabel: "Open invite page",
      primaryHref: ROUTES.authInvite,
      secondaryLabel: "FMS opportunities hub",
      secondaryHref: ROUTES.fmsOpportunities,
    },
  },
} satisfies Record<string, SeoPageContent>;

export const factorySeoPages = {
  exportToPakistan: {
    title: "向巴基斯坦买家出口您的产品",
    metadataTitle:
      "Export to Pakistan | ChinaPak ImportHub for Chinese Factories",
    metadataDescription:
      "Chinese-first factory export page explaining Pakistan buyer opportunities, verified sourcing requests, platform-managed communication, and future invitation-only factory profiles.",
    eyebrow: "中国工厂出口机会",
    supportLine:
      "Reach Pakistani importers looking for suitable Chinese factories.",
    intro:
      "ChinaPak ImportHub 正在为中国工厂和巴基斯坦进口商建立更清晰的项目化对接流程。第一阶段工厂账号暂不公开开放，平台会先通过内部工厂数据库和管理员审核流程管理信息。",
    languageNote:
      "本页面面向中国工厂，不是公开注册入口。工厂账号将在未来阶段或通过邀请方式启用。",
    sections: [
      {
        heading: "巴基斯坦买家机会",
        body: [
          "巴基斯坦的店主、批发商、线上卖家和中小企业经常寻找适合自己预算和数量的中国工厂。平台通过 Import Project ID 收集买家需求，减少零散沟通。",
        ],
      },
      {
        heading: "经过整理的采购需求",
        body: [
          "平台会收集产品图片、链接、数量、预算、质量要求和套餐信息。管理员审核后，合适的工厂信息才会进入项目匹配流程。",
        ],
      },
      {
        heading: "平台管理沟通",
        body: [
          "进口商、FMS 和工厂之间的沟通需要通过 ChinaPak ImportHub 平台和管理员流程管理。敏感联系方式不会随意公开给进口商。",
        ],
      },
      {
        heading: "未来工厂档案",
        body: [
          "每个内部工厂记录都会为未来工厂账号和资料页预留结构，包括公司名称、产品类别、城市省份、证据、认证、风险标记和审核状态。",
        ],
      },
      {
        heading: "当前状态",
        body: [
          "Factory portal is future/invitation-only. Public factory signup is not active in Phase 1, and this content page does not create a factory account.",
        ],
      },
    ],
    cta: {
      title: "提交未来合作意向",
      body: "如果您的工厂希望未来接触巴基斯坦进口需求，可以查看合作意向占位页面。提交功能尚未连接后台。",
      primaryLabel: "查看合作意向页面",
      primaryHref: ROUTES.factoriesPartnership,
      secondaryLabel: "了解巴基斯坦买家",
      secondaryHref: ROUTES.factoriesFindPakistaniBuyers,
    },
  },
  findPakistaniBuyers: {
    title: "寻找巴基斯坦批发买家和进口商",
    metadataTitle: "Find Pakistani Buyers | ChinaPak ImportHub for Factories",
    metadataDescription:
      "Chinese-first SEO page for factories interested in Pakistani wholesale buyers, verified demand, structured buyer requests, and future partnership inquiry workflow.",
    eyebrow: "巴基斯坦买家渠道",
    supportLine:
      "Structured sourcing requests can help factories understand real buyer demand before spending time on scattered inquiries.",
    intro:
      "很多中国工厂希望接触新的海外批发买家，但零散询盘质量不稳定。ChinaPak ImportHub 的目标是把巴基斯坦进口商需求整理成项目，让工厂看到更清楚的产品、数量和预算信息。",
    languageNote:
      "本页面为工厂教育内容。公开工厂注册尚未启用，合作表单只是未来流程的前端占位。",
    sections: [
      {
        heading: "为什么巴基斯坦是值得关注的买家市场",
        body: [
          "巴基斯坦有大量本地店主、批发商、线上卖家和中小制造商，他们需要价格合适、数量灵活、信息清楚的中国供应选择。",
          "这些买家通常需要更简单的沟通、更明确的 MOQ、产品证据和付款前信任流程。",
        ],
      },
      {
        heading: "ChinaPak ImportHub 如何介绍经过验证的需求",
        body: [
          "平台通过 Import Project 收集买家需求，管理员先审核项目，再通过 FMS 和内部工厂数据库寻找合适选项。这样可以减少无效询盘和不清楚的需求。",
        ],
      },
      {
        heading: "结构化买家请求对工厂的价值",
        body: [
          "工厂可以更快了解产品类别、目标价格区间、数量、交期和证据需求。未来工厂档案启用后，管理员审核过的工厂记录可以帮助匹配更多合适项目。",
        ],
      },
      {
        heading: "当前不是公开注册",
        body: [
          "No public factory signup is active yet. Partnership interest pages are placeholders for future admin invitation and factory profile activation.",
        ],
      },
    ],
    cta: {
      title: "了解未来工厂合作流程",
      body: "查看合作意向页面。当前不会创建真实账号，也不会提交到数据库。",
      primaryLabel: "合作意向占位页面",
      primaryHref: ROUTES.factoriesPartnership,
      secondaryLabel: "出口到巴基斯坦",
      secondaryHref: ROUTES.factoriesExportToPakistan,
    },
  },
  partnership: {
    title: "工厂合作申请",
    metadataTitle: "Factory Partnership Inquiry | ChinaPak ImportHub",
    metadataDescription:
      "Future factory partnership inquiry placeholder for Chinese factories interested in Pakistan buyer demand through ChinaPak ImportHub.",
    eyebrow: "未来合作意向",
    supportLine: "Factory accounts are not publicly active in Phase 1.",
    intro:
      "此页面只是未来工厂合作和邀请流程的前端占位。ChinaPak ImportHub 第一阶段会保持工厂数据库为内部私有资产，工厂账号和公开注册暂不开放。",
    languageNote:
      "请不要把此页面理解为已启用的工厂注册系统。表单不会提交真实数据。",
    sections: [
      {
        heading: "合作意向范围",
        body: [
          "未来工厂资料可能用于管理员审核、项目匹配、证据管理和工厂档案认领。当前阶段，任何工厂信息仍需管理员审核后才能进入内部数据库。",
        ],
      },
      {
        heading: "隐私和联系方式",
        body: [
          "Factory contact details are sensitive. They are admin-only unless released through an approved package workflow in the future.",
        ],
      },
    ],
    cta: {
      title: "先了解平台如何服务巴基斯坦买家",
      body: "阅读工厂出口页面，了解平台管理沟通和未来工厂档案方向。",
      primaryLabel: "出口到巴基斯坦",
      primaryHref: ROUTES.factoriesExportToPakistan,
      secondaryLabel: "寻找巴基斯坦买家",
      secondaryHref: ROUTES.factoriesFindPakistaniBuyers,
    },
  },
} satisfies Record<string, SeoPageContent>;
