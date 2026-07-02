export type FactoryStatus =
  | "Draft"
  | "Submitted by FMS"
  | "Admin Verified"
  | "Active Internal Record"
  | "Invited to Claim Profile"
  | "Claimed by Factory"
  | "Suspended"
  | "Blacklisted";

export type FactoryVerificationStatus =
  | "Unverified"
  | "Basic Checked"
  | "Evidence Reviewed"
  | "Video Verified"
  | "Document Verified"
  | "Trusted Factory";

export type FactoryRiskFlag =
  | "None"
  | "Contact Data Incomplete"
  | "Conflicting Information"
  | "Price Too Low"
  | "Complaint History"
  | "Blacklist Candidate";

export type FactoryRecord = {
  id: string;
  factoryCode: string;
  displayName: string;
  chineseLegalName: string;
  category: string;
  mainProducts: string[];
  cityProvince: string;
  yearEstablishedPlaceholder: string;
  productionCapacityPlaceholder: string;
  moqRange: string;
  priceRangeNotes: string;
  productionTimeNotes: string;
  certifications: string[];
  status: FactoryStatus;
  verificationStatus: FactoryVerificationStatus;
  trustScore: number;
  submittedByFms: string;
  submittedByFmsId: string;
  sourceAssignmentId: string;
  sourceProjectId: string;
  dateSubmitted: string;
  adminReviewer: string;
  lastVerifiedDate: string;
  matchedProjectCount: number;
  importerFeedbackPlaceholder: string;
  complaintHistoryPlaceholder: string;
  riskFlag: FactoryRiskFlag;
  sensitiveContact: {
    contactPerson: string;
    phone: string;
    wechat: string;
    email: string;
    websiteOrAlibaba: string;
    exactAddress: string;
    bankPaymentNotesPlaceholder: string;
  };
  evidence: Array<{
    label: string;
    count: string;
    note: string;
  }>;
  matching: {
    bestFitProductCategories: string[];
    typicalMoq: string;
    suitableBudgetRanges: string[];
    packageEligibility: string[];
    reliabilityScore: number;
    onTimeResponseScore: number;
    recommendedForSmallImporters: boolean;
    recommendedForRepeatImporters: boolean;
  };
  auditTimeline: Array<{
    label: string;
    date: string;
    state: "done" | "current" | "pending" | "risk";
  }>;
};

export type FactorySubmission = {
  id: string;
  assignmentId: string;
  projectId: string;
  submittedByFms: string;
  productCategory: string;
  factoryDisplayName: string;
  evidenceCount: number;
  contactInfoPresent: boolean;
  possibleDuplicateWarning: string;
  riskWarning: FactoryRiskFlag;
  submittedDate: string;
  actions: string[];
};

export const factoryStats = [
  { label: "Total Factory Records", value: "128", detail: "Internal placeholder count" },
  { label: "Verified Factories", value: "76", detail: "Basic checked or above" },
  { label: "Pending Review", value: "9", detail: "Submitted by FMS" },
  { label: "High Trust Factories", value: "21", detail: "Trust score 85+" },
  { label: "Risk Flagged", value: "6", detail: "Needs admin attention" },
  { label: "Claimed Profiles Future", value: "0", detail: "Factory portal hidden" },
] as const;

export const factoryRecords: FactoryRecord[] = [
  {
    id: "factory-ba-001",
    factoryCode: "FACT-BA-001",
    displayName: "Guangzhou Qihang Bag Factory",
    chineseLegalName: "广州启航箱包有限公司",
    category: "Bags and luggage",
    mainProducts: ["School bags", "Backpacks", "Travel bags"],
    cityProvince: "Guangzhou, Guangdong",
    yearEstablishedPlaceholder: "2014 placeholder",
    productionCapacityPlaceholder: "80,000 bags/month placeholder",
    moqRange: "500–1,000 pieces",
    priceRangeNotes: "USD 3.20–4.80 for school bag styles reviewed.",
    productionTimeNotes: "20–25 days after deposit and sample confirmation.",
    certifications: ["BSCI placeholder", "ISO placeholder"],
    status: "Active Internal Record",
    verificationStatus: "Evidence Reviewed",
    trustScore: 84,
    submittedByFms: "Li Wei",
    submittedByFmsId: "FMS-CN-014",
    sourceAssignmentId: "FMS-A-2026-014",
    sourceProjectId: "CPH-2026-0007",
    dateSubmitted: "2026-06-29",
    adminReviewer: "Admin Ops",
    lastVerifiedDate: "2026-06-29",
    matchedProjectCount: 2,
    importerFeedbackPlaceholder: "No importer feedback released yet.",
    complaintHistoryPlaceholder: "No complaint history in placeholder data.",
    riskFlag: "None",
    sensitiveContact: {
      contactPerson: "Ms. Chen placeholder",
      phone: "+86 000 0000 1001",
      wechat: "qh-bags-admin-only",
      email: "factory-contact-admin-only@example.cn",
      websiteOrAlibaba: "https://1688.example/fact-ba-001",
      exactAddress: "Baiyun District, Guangzhou placeholder address",
      bankPaymentNotesPlaceholder: "Admin-only payment notes placeholder.",
    },
    evidence: [
      { label: "Factory photos", count: "8", note: "Workshop and sample room placeholders." },
      { label: "Factory videos", count: "2", note: "Production line video placeholders." },
      { label: "Product photos", count: "12", note: "School bag sample evidence." },
      { label: "Quotations", count: "1", note: "PDF quotation placeholder." },
      { label: "Business license", count: "1", note: "Needs document verification." },
      { label: "Certificates", count: "2", note: "BSCI/ISO placeholders." },
      { label: "FMS notes", count: "4", note: "Stitching and zipper notes." },
      { label: "Admin notes", count: "2", note: "Admin review placeholders." },
    ],
    matching: {
      bestFitProductCategories: ["School bags", "Backpacks", "Soft luggage"],
      typicalMoq: "500–1,000 pieces",
      suitableBudgetRanges: ["PKR 300,000–700,000", "PKR 700,000–1,500,000"],
      packageEligibility: ["Factory Match Plus", "Import Partner"],
      reliabilityScore: 82,
      onTimeResponseScore: 88,
      recommendedForSmallImporters: true,
      recommendedForRepeatImporters: true,
    },
    auditTimeline: [
      { label: "Submitted by FMS", date: "2026-06-28", state: "done" },
      { label: "Evidence uploaded", date: "2026-06-28", state: "done" },
      { label: "Admin reviewed", date: "2026-06-29", state: "done" },
      { label: "Verification updated", date: "2026-06-29", state: "current" },
      { label: "Used in project", date: "Pending", state: "pending" },
      { label: "Feedback received", date: "Pending", state: "pending" },
      { label: "Status changed", date: "Pending", state: "pending" },
    ],
  },
  {
    id: "factory-hw-003",
    factoryCode: "FACT-HW-003",
    displayName: "Yiwu Hengli Hardware Tools",
    chineseLegalName: "义乌恒力五金工具厂",
    category: "Hardware",
    mainProducts: ["Tool kits", "Screwdrivers", "Pliers"],
    cityProvince: "Yiwu, Zhejiang",
    yearEstablishedPlaceholder: "2011 placeholder",
    productionCapacityPlaceholder: "45,000 tool sets/month placeholder",
    moqRange: "300–500 sets",
    priceRangeNotes: "USD 8.50–13.00 per set depending on packaging.",
    productionTimeNotes: "25–30 days for standard tool kits.",
    certifications: ["Factory license placeholder"],
    status: "Submitted by FMS",
    verificationStatus: "Basic Checked",
    trustScore: 68,
    submittedByFms: "Zhang Min",
    submittedByFmsId: "FMS-CN-009",
    sourceAssignmentId: "FMS-A-2026-011",
    sourceProjectId: "CPH-2026-0004",
    dateSubmitted: "2026-06-27",
    adminReviewer: "Pending review",
    lastVerifiedDate: "Not verified",
    matchedProjectCount: 1,
    importerFeedbackPlaceholder: "Pending admin approval before importer release.",
    complaintHistoryPlaceholder: "No complaints recorded in placeholder data.",
    riskFlag: "Contact Data Incomplete",
    sensitiveContact: {
      contactPerson: "Mr. Huang placeholder",
      phone: "+86 000 0000 2003",
      wechat: "hengli-tools-admin-only",
      email: "tools-admin-only@example.cn",
      websiteOrAlibaba: "https://1688.example/fact-hw-003",
      exactAddress: "Yiwu industrial zone placeholder address",
      bankPaymentNotesPlaceholder: "Payment notes not collected.",
    },
    evidence: [
      { label: "Factory photos", count: "5", note: "Workshop placeholders." },
      { label: "Factory videos", count: "1", note: "Short production clip placeholder." },
      { label: "Product photos", count: "10", note: "Tool kit sample placeholders." },
      { label: "Quotations", count: "1", note: "Needs packaging detail." },
      { label: "Business license", count: "0", note: "Request required." },
      { label: "Certificates", count: "0", note: "Not supplied." },
      { label: "FMS notes", count: "3", note: "Packaging risk notes." },
      { label: "Admin notes", count: "1", note: "Needs more evidence." },
    ],
    matching: {
      bestFitProductCategories: ["Hand tools", "Tool kits"],
      typicalMoq: "300–500 sets",
      suitableBudgetRanges: ["PKR 1,500,000+"],
      packageEligibility: ["Import Partner"],
      reliabilityScore: 64,
      onTimeResponseScore: 70,
      recommendedForSmallImporters: false,
      recommendedForRepeatImporters: true,
    },
    auditTimeline: [
      { label: "Submitted by FMS", date: "2026-06-27", state: "done" },
      { label: "Evidence uploaded", date: "2026-06-27", state: "current" },
      { label: "Admin reviewed", date: "Pending", state: "pending" },
      { label: "Verification updated", date: "Pending", state: "pending" },
      { label: "Used in project", date: "Pending", state: "pending" },
      { label: "Feedback received", date: "Pending", state: "pending" },
      { label: "Status changed", date: "Pending", state: "pending" },
    ],
  },
  {
    id: "factory-el-008",
    factoryCode: "FACT-EL-008",
    displayName: "Shenzhen BrightLink Electronics",
    chineseLegalName: "深圳市亮联电子有限公司",
    category: "Electronics accessories",
    mainProducts: ["USB-C cables", "Chargers", "LED accessories"],
    cityProvince: "Shenzhen, Guangdong",
    yearEstablishedPlaceholder: "2016 placeholder",
    productionCapacityPlaceholder: "120,000 accessories/month placeholder",
    moqRange: "1,000–5,000 units",
    priceRangeNotes: "Pricing varies by certification and packaging.",
    productionTimeNotes: "18–28 days depending on certification documents.",
    certifications: ["CE placeholder", "RoHS placeholder"],
    status: "Admin Verified",
    verificationStatus: "Document Verified",
    trustScore: 89,
    submittedByFms: "Chen Yu",
    submittedByFmsId: "FMS-CN-021",
    sourceAssignmentId: "FMS-A-2026-015",
    sourceProjectId: "CPH-2026-0008",
    dateSubmitted: "2026-06-29",
    adminReviewer: "Admin Ops",
    lastVerifiedDate: "2026-06-29",
    matchedProjectCount: 3,
    importerFeedbackPlaceholder: "Positive sample response placeholder.",
    complaintHistoryPlaceholder: "No disputes recorded.",
    riskFlag: "None",
    sensitiveContact: {
      contactPerson: "Ms. Liu placeholder",
      phone: "+86 000 0000 8008",
      wechat: "brightlink-admin-only",
      email: "electronics-admin-only@example.cn",
      websiteOrAlibaba: "https://1688.example/fact-el-008",
      exactAddress: "Bao'an District, Shenzhen placeholder address",
      bankPaymentNotesPlaceholder: "Admin-only bank terms placeholder.",
    },
    evidence: [
      { label: "Factory photos", count: "11", note: "Assembly and testing photos." },
      { label: "Factory videos", count: "3", note: "Testing line placeholders." },
      { label: "Product photos", count: "16", note: "Cable and charger samples." },
      { label: "Quotations", count: "2", note: "Standard and premium quotation placeholders." },
      { label: "Business license", count: "1", note: "Document verified placeholder." },
      { label: "Certificates", count: "3", note: "CE/RoHS placeholders." },
      { label: "FMS notes", count: "5", note: "Certification checklist notes." },
      { label: "Admin notes", count: "3", note: "Good candidate for repeat importers." },
    ],
    matching: {
      bestFitProductCategories: ["Phone accessories", "USB-C cables", "Chargers"],
      typicalMoq: "1,000–5,000 units",
      suitableBudgetRanges: ["PKR 700,000–1,500,000", "PKR 1,500,000+"],
      packageEligibility: ["Factory Match Plus", "Import Partner"],
      reliabilityScore: 90,
      onTimeResponseScore: 86,
      recommendedForSmallImporters: false,
      recommendedForRepeatImporters: true,
    },
    auditTimeline: [
      { label: "Submitted by FMS", date: "2026-06-29", state: "done" },
      { label: "Evidence uploaded", date: "2026-06-29", state: "done" },
      { label: "Admin reviewed", date: "2026-06-29", state: "done" },
      { label: "Verification updated", date: "2026-06-29", state: "done" },
      { label: "Used in project", date: "2026-06-29", state: "current" },
      { label: "Feedback received", date: "Pending", state: "pending" },
      { label: "Status changed", date: "Pending", state: "pending" },
    ],
  },
  {
    id: "factory-hh-002",
    factoryCode: "FACT-HH-002",
    displayName: "Taizhou Xinjia Plastics",
    chineseLegalName: "台州新家塑料制品厂",
    category: "Household goods",
    mainProducts: ["Storage boxes", "Food containers", "Plastic household items"],
    cityProvince: "Taizhou, Zhejiang",
    yearEstablishedPlaceholder: "2018 placeholder",
    productionCapacityPlaceholder: "60,000 boxes/month placeholder",
    moqRange: "Needs confirmation",
    priceRangeNotes: "Price data incomplete.",
    productionTimeNotes: "15–20 days placeholder.",
    certifications: ["Food-grade certificate requested"],
    status: "Submitted by FMS",
    verificationStatus: "Unverified",
    trustScore: 42,
    submittedByFms: "Li Wei",
    submittedByFmsId: "FMS-CN-014",
    sourceAssignmentId: "FMS-A-2026-010",
    sourceProjectId: "CPH-2026-0002",
    dateSubmitted: "2026-06-26",
    adminReviewer: "Pending review",
    lastVerifiedDate: "Not verified",
    matchedProjectCount: 0,
    importerFeedbackPlaceholder: "No feedback; not released.",
    complaintHistoryPlaceholder: "No complaint record, but data incomplete.",
    riskFlag: "Conflicting Information",
    sensitiveContact: {
      contactPerson: "Contact unclear",
      phone: "Incomplete",
      wechat: "Incomplete",
      email: "Not supplied",
      websiteOrAlibaba: "https://1688.example/fact-hh-002",
      exactAddress: "Taizhou placeholder district only",
      bankPaymentNotesPlaceholder: "No payment notes.",
    },
    evidence: [
      { label: "Factory photos", count: "3", note: "Low detail photos." },
      { label: "Factory videos", count: "0", note: "Video requested." },
      { label: "Product photos", count: "6", note: "Container samples." },
      { label: "Quotations", count: "0", note: "Quotation missing." },
      { label: "Business license", count: "0", note: "Required." },
      { label: "Certificates", count: "0", note: "Food-grade certificate needed." },
      { label: "FMS notes", count: "2", note: "Conflicting MOQ notes." },
      { label: "Admin notes", count: "1", note: "Needs verification before use." },
    ],
    matching: {
      bestFitProductCategories: ["Kitchen storage", "Plastic household goods"],
      typicalMoq: "Unknown",
      suitableBudgetRanges: ["PKR 100,000–300,000"],
      packageEligibility: ["Factory Discovery only after verification"],
      reliabilityScore: 40,
      onTimeResponseScore: 45,
      recommendedForSmallImporters: false,
      recommendedForRepeatImporters: false,
    },
    auditTimeline: [
      { label: "Submitted by FMS", date: "2026-06-26", state: "done" },
      { label: "Evidence uploaded", date: "2026-06-26", state: "risk" },
      { label: "Admin reviewed", date: "Pending", state: "pending" },
      { label: "Verification updated", date: "Pending", state: "pending" },
      { label: "Used in project", date: "Not allowed yet", state: "pending" },
      { label: "Feedback received", date: "Pending", state: "pending" },
      { label: "Status changed", date: "Pending", state: "pending" },
    ],
  },
];

export const factorySubmissions: FactorySubmission[] = [
  {
    id: "FSUB-2026-044",
    assignmentId: "FMS-A-2026-010",
    projectId: "CPH-2026-0002",
    submittedByFms: "Li Wei",
    productCategory: "Household goods",
    factoryDisplayName: "Taizhou Xinjia Plastics",
    evidenceCount: 11,
    contactInfoPresent: false,
    possibleDuplicateWarning: "Possible duplicate of FACT-HH-001",
    riskWarning: "Conflicting Information",
    submittedDate: "2026-06-26",
    actions: [
      "Open Review",
      "Approve Placeholder",
      "Request More Evidence Placeholder",
      "Merge Duplicate Placeholder",
      "Reject Placeholder",
    ],
  },
  {
    id: "FSUB-2026-045",
    assignmentId: "FMS-A-2026-011",
    projectId: "CPH-2026-0004",
    submittedByFms: "Zhang Min",
    productCategory: "Hardware",
    factoryDisplayName: "Yiwu Hengli Hardware Tools",
    evidenceCount: 20,
    contactInfoPresent: true,
    possibleDuplicateWarning: "No duplicate detected",
    riskWarning: "Contact Data Incomplete",
    submittedDate: "2026-06-27",
    actions: [
      "Open Review",
      "Approve Placeholder",
      "Request More Evidence Placeholder",
      "Merge Duplicate Placeholder",
      "Reject Placeholder",
    ],
  },
  {
    id: "FSUB-2026-046",
    assignmentId: "FMS-A-2026-015",
    projectId: "CPH-2026-0008",
    submittedByFms: "Chen Yu",
    productCategory: "Electronics accessories",
    factoryDisplayName: "Shenzhen BrightLink Electronics",
    evidenceCount: 43,
    contactInfoPresent: true,
    possibleDuplicateWarning: "Potential match with older electronics record",
    riskWarning: "None",
    submittedDate: "2026-06-29",
    actions: [
      "Open Review",
      "Approve Placeholder",
      "Request More Evidence Placeholder",
      "Merge Duplicate Placeholder",
      "Reject Placeholder",
    ],
  },
];

export function getFactoryById(factoryId: string) {
  return factoryRecords.find((factory) => factory.id === factoryId);
}
