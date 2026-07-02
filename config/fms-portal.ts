export type FmsAssignmentStatus =
  | "Assigned"
  | "Requirements Reviewed"
  | "Factory Researching"
  | "Factory Options Drafted"
  | "Submitted for Admin Review"
  | "Changes Requested"
  | "Approved by Admin"
  | "Completed by Admin";

export type FmsSubmissionStatus =
  | "Draft"
  | "Not Submitted"
  | "Pending Admin Review"
  | "Changes Requested"
  | "Approved by Admin";

export type FmsTier = "Bronze" | "Silver" | "Gold";

export type AcademyStatus = "Not Started" | "In Progress" | "Certified" | "Suspended";

export type FmsAssignment = {
  id: string;
  projectId: string;
  product: string;
  category: string;
  packageName: "Factory Discovery" | "Factory Match Plus" | "Import Partner";
  deadline: string;
  milestoneStatus: FmsAssignmentStatus;
  submissionStatus: FmsSubmissionStatus;
  adminFeedback: string;
  brief: {
    productDescription: string;
    productImagesPlaceholder: string;
    budgetRange: string;
    quantity: string;
    qualityLevel: "Normal" | "Better" | "Premium";
    addOns: string[];
  };
  milestones: Array<{ label: string; completed: boolean }>;
  factoryOptions: Array<{
    displayCode: string;
    chineseBusinessName: string;
    cityProvince: string;
    productCategory: string;
    mainProducts: string;
    moq: string;
    priceRange: string;
    productionTime: string;
    certifications: string;
    factoryNotes: string;
    verificationEvidenceNotes: string;
    contactDetailsAdminOnly: string;
  }>;
};

export type FmsEarningRecord = {
  assignmentId: string;
  projectId: string;
  tier: FmsTier;
  status: "Pending Admin Approval" | "Scheduled" | "Available" | "Paid";
  amountPkr: string;
  amountCny: string;
};

export type AcademyModule = {
  id: string;
  title: string;
  chineseTitle: string;
  description: string;
  status: AcademyStatus;
};

export const fmsStats = [
  { label: "Active Assignments", value: "5", detail: "正在进行的任务" },
  { label: "Due Soon", value: "2", detail: "Deadlines within 72 hours" },
  { label: "Submissions Pending Admin Review", value: "3", detail: "Waiting for admin approval" },
  { label: "Completed This Month", value: "4", detail: "Admin-completed assignments" },
  { label: "Estimated Earnings", value: "PKR 58,000", detail: "Placeholder estimate" },
  { label: "FMS Tier", value: "Silver", detail: "Current tier placeholder" },
  { label: "Quality Score", value: "92%", detail: "Admin-reviewed quality" },
  { label: "Academy Status", value: "In Progress", detail: "认证培训进行中" },
] as const;

export const fmsRules = [
  "Do not contact importers directly.",
  "Do not share personal contact details.",
  "Submit all evidence through the platform.",
  "Admin reviews everything before importer delivery.",
] as const;

export const fmsAssignments: FmsAssignment[] = [
  {
    id: "FMS-A-2026-014",
    projectId: "CPH-2026-0007",
    product: "School bags",
    category: "Bags and luggage",
    packageName: "Factory Match Plus",
    deadline: "2026-07-08",
    milestoneStatus: "Factory Researching",
    submissionStatus: "Draft",
    adminFeedback: "Collect factory-side stitching and zipper evidence before submission.",
    brief: {
      productDescription:
        "Medium-size school bags. Durable zippers, reinforced stitching, green and navy options.",
      productImagesPlaceholder: "3 reference images available after future file storage integration.",
      budgetRange: "PKR 300,000 – 700,000",
      quantity: "1,000 pieces",
      qualityLevel: "Better",
      addOns: ["Supplier Background Check", "Sample Coordination"],
    },
    milestones: [
      { label: "Requirements reviewed", completed: true },
      { label: "Factory research started", completed: true },
      { label: "Minimum factory options identified", completed: false },
      { label: "Factory details collected", completed: false },
      { label: "Quotations collected", completed: false },
      { label: "Evidence uploaded", completed: false },
      { label: "Submitted to admin review", completed: false },
    ],
    factoryOptions: [
      {
        displayCode: "FACT-BA-001",
        chineseBusinessName: "广州启航箱包有限公司",
        cityProvince: "Guangzhou, Guangdong",
        productCategory: "School bags",
        mainProducts: "Backpacks, school bags, travel bags",
        moq: "500 pieces",
        priceRange: "USD 3.20–4.80",
        productionTime: "20–25 days",
        certifications: "BSCI placeholder, ISO placeholder",
        factoryNotes: "Promising mid-size factory; needs zipper durability evidence.",
        verificationEvidenceNotes: "Request workshop video and stitching close-up photos.",
        contactDetailsAdminOnly: "Admin-only contact placeholder. Not visible to importer.",
      },
    ],
  },
  {
    id: "FMS-A-2026-015",
    projectId: "CPH-2026-0008",
    product: "Phone accessories",
    category: "Electronics accessories",
    packageName: "Import Partner",
    deadline: "2026-07-12",
    milestoneStatus: "Assigned",
    submissionStatus: "Not Submitted",
    adminFeedback: "Review charger compliance risks before factory shortlisting.",
    brief: {
      productDescription:
        "USB-C charging cables and fast chargers for retail resale. Premium quality required.",
      productImagesPlaceholder: "Alibaba/1688 link placeholder; product image storage pending.",
      budgetRange: "PKR 700,000 – 1,500,000",
      quantity: "5,000 units",
      qualityLevel: "Premium",
      addOns: ["Video Factory Tour Coordination", "Shipping Coordination Support"],
    },
    milestones: [
      { label: "Requirements reviewed", completed: false },
      { label: "Factory research started", completed: false },
      { label: "Minimum factory options identified", completed: false },
      { label: "Factory details collected", completed: false },
      { label: "Quotations collected", completed: false },
      { label: "Evidence uploaded", completed: false },
      { label: "Submitted to admin review", completed: false },
    ],
    factoryOptions: [],
  },
  {
    id: "FMS-A-2026-011",
    projectId: "CPH-2026-0004",
    product: "Hand tools",
    category: "Hardware",
    packageName: "Import Partner",
    deadline: "2026-07-04",
    milestoneStatus: "Submitted for Admin Review",
    submissionStatus: "Pending Admin Review",
    adminFeedback: "Admin is reviewing factory evidence before release decision.",
    brief: {
      productDescription:
        "Basic hand tool sets for hardware distribution. Normal quality, large import budget.",
      productImagesPlaceholder: "Voice note and product detail placeholders only.",
      budgetRange: "PKR 1,500,000+",
      quantity: "2 containers planned",
      qualityLevel: "Normal",
      addOns: ["Supplier Background Check"],
    },
    milestones: [
      { label: "Requirements reviewed", completed: true },
      { label: "Factory research started", completed: true },
      { label: "Minimum factory options identified", completed: true },
      { label: "Factory details collected", completed: true },
      { label: "Quotations collected", completed: true },
      { label: "Evidence uploaded", completed: true },
      { label: "Submitted to admin review", completed: true },
    ],
    factoryOptions: [
      {
        displayCode: "FACT-HW-003",
        chineseBusinessName: "义乌恒力五金工具厂",
        cityProvince: "Yiwu, Zhejiang",
        productCategory: "Hand tools",
        mainProducts: "Tool kits, screwdrivers, pliers",
        moq: "300 sets",
        priceRange: "USD 8.50–13.00/set",
        productionTime: "25–30 days",
        certifications: "Factory license placeholder",
        factoryNotes: "Good range but needs packaging confirmation.",
        verificationEvidenceNotes: "Quotation PDF and factory video placeholder submitted.",
        contactDetailsAdminOnly: "Admin-only contact placeholder. Not visible to importer.",
      },
      {
        displayCode: "FACT-HW-004",
        chineseBusinessName: "宁波百强工具有限公司",
        cityProvince: "Ningbo, Zhejiang",
        productCategory: "Hand tools",
        mainProducts: "Hardware tools and tool cases",
        moq: "500 sets",
        priceRange: "USD 7.90–11.80/set",
        productionTime: "30–35 days",
        certifications: "ISO placeholder",
        factoryNotes: "Stronger export packaging; price negotiation recommended.",
        verificationEvidenceNotes: "Factory photos and quotation placeholder submitted.",
        contactDetailsAdminOnly: "Admin-only contact placeholder. Not visible to importer.",
      },
    ],
  },
  {
    id: "FMS-A-2026-010",
    projectId: "CPH-2026-0002",
    product: "Kitchen storage boxes",
    category: "Household goods",
    packageName: "Factory Discovery",
    deadline: "2026-06-30",
    milestoneStatus: "Changes Requested",
    submissionStatus: "Changes Requested",
    adminFeedback: "Admin requested clearer MOQ and material notes for two factory options.",
    brief: {
      productDescription:
        "Plastic airtight kitchen storage boxes. Size and material requirements need confirmation.",
      productImagesPlaceholder: "Product reference photo placeholder.",
      budgetRange: "PKR 100,000 – 300,000",
      quantity: "500–1,000 pieces estimate",
      qualityLevel: "Better",
      addOns: [],
    },
    milestones: [
      { label: "Requirements reviewed", completed: true },
      { label: "Factory research started", completed: true },
      { label: "Minimum factory options identified", completed: true },
      { label: "Factory details collected", completed: true },
      { label: "Quotations collected", completed: false },
      { label: "Evidence uploaded", completed: true },
      { label: "Submitted to admin review", completed: true },
    ],
    factoryOptions: [
      {
        displayCode: "FACT-HH-002",
        chineseBusinessName: "台州新家塑料制品厂",
        cityProvince: "Taizhou, Zhejiang",
        productCategory: "Plastic household goods",
        mainProducts: "Storage boxes, food containers",
        moq: "Needs confirmation",
        priceRange: "Needs update",
        productionTime: "15–20 days",
        certifications: "Food-grade material certificate placeholder needed",
        factoryNotes: "Admin requested clearer material details.",
        verificationEvidenceNotes: "Factory photo placeholders submitted; quotation incomplete.",
        contactDetailsAdminOnly: "Admin-only contact placeholder. Not visible to importer.",
      },
    ],
  },
];

export const recentFmsSubmissions = [
  {
    id: "SUB-2026-031",
    assignmentId: "FMS-A-2026-011",
    label: "Hand tools factory options submitted",
    status: "Pending Admin Review",
  },
  {
    id: "SUB-2026-030",
    assignmentId: "FMS-A-2026-010",
    label: "Kitchen storage options need MOQ updates",
    status: "Changes Requested",
  },
  {
    id: "SUB-2026-029",
    assignmentId: "FMS-A-2026-008",
    label: "Textile sample evidence approved",
    status: "Approved by Admin",
  },
] as const;

export const evidenceUploadTypes = [
  "Product photos",
  "Factory photos",
  "Factory videos",
  "Quotation documents",
  "Certificates",
  "Voice notes",
  "Other files",
] as const;

export const earningsSummary = {
  availableBalance: "PKR 18,000",
  pendingAdminApproval: "PKR 27,000",
  scheduledPayout: "PKR 13,000",
  completedAssignments: "4",
  currentTier: "Silver",
  bonusEligibility: "Eligible after 2 more approved submissions",
} as const;

export const compensationRanges = [
  {
    tier: "Bronze",
    pkr: "PKR 5,000–7,000",
    cny: "¥120–170",
    useCase: "Starter/simple projects",
  },
  {
    tier: "Silver",
    pkr: "PKR 9,000–12,000",
    cny: "¥220–290",
    useCase: "Business/medium projects",
  },
  {
    tier: "Gold",
    pkr: "PKR 15,000–25,000",
    cny: "¥370–610",
    useCase: "Import Partner/complex projects",
  },
] as const;

export const earningRecords: FmsEarningRecord[] = [
  {
    assignmentId: "FMS-A-2026-011",
    projectId: "CPH-2026-0004",
    tier: "Gold",
    status: "Pending Admin Approval",
    amountPkr: "PKR 20,000",
    amountCny: "¥490",
  },
  {
    assignmentId: "FMS-A-2026-008",
    projectId: "CPH-2026-0001",
    tier: "Silver",
    status: "Scheduled",
    amountPkr: "PKR 11,000",
    amountCny: "¥265",
  },
  {
    assignmentId: "FMS-A-2026-006",
    projectId: "CPH-2026-0003",
    tier: "Bronze",
    status: "Available",
    amountPkr: "PKR 6,000",
    amountCny: "¥145",
  },
];

export const academyModules: AcademyModule[] = [
  {
    id: "workflow",
    title: "Platform workflow",
    chineseTitle: "平台工作流程",
    description: "Understand assignment, evidence, admin review, and completion boundaries.",
    status: "In Progress",
  },
  {
    id: "communication-firewall",
    title: "Communication firewall",
    chineseTitle: "沟通防火墙",
    description: "No direct importer contact. All communication moves through admin/platform review.",
    status: "In Progress",
  },
  {
    id: "factory-verification",
    title: "Factory verification basics",
    chineseTitle: "工厂核验基础",
    description: "Collect reliable factory identity, production, quotation, and evidence details.",
    status: "Not Started",
  },
  {
    id: "evidence-standards",
    title: "Evidence collection standards",
    chineseTitle: "证据收集标准",
    description: "Prepare photos, videos, quotations, certificates, and notes for admin review.",
    status: "Not Started",
  },
  {
    id: "confidentiality",
    title: "Confidentiality and anti-bypass rules",
    chineseTitle: "保密与反绕过规则",
    description: "Protect importer data, platform data, and factory contact release rules.",
    status: "Not Started",
  },
  {
    id: "submission-quality",
    title: "Submission quality checklist",
    chineseTitle: "提交质量清单",
    description: "Improve clarity, completeness, and comparison quality before admin review.",
    status: "Not Started",
  },
  {
    id: "refund-awareness",
    title: "Dispute and refund awareness",
    chineseTitle: "争议与退款意识",
    description: "Understand milestone documentation and admin-reviewed refund decisions.",
    status: "Not Started",
  },
  {
    id: "ethics",
    title: "Ethics and conflict-of-interest policy",
    chineseTitle: "职业道德与利益冲突政策",
    description: "Avoid undisclosed relationships, side deals, and off-platform communication.",
    status: "Not Started",
  },
];

export function getFmsAssignmentById(assignmentId: string) {
  return fmsAssignments.find((assignment) => assignment.id === assignmentId);
}
