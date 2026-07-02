export type AgentStatus = "Active" | "Inactive" | "Suspended" | "Pending Review";

export type AgentLeadStatus =
  | "New Lead"
  | "Contact Attempted"
  | "Interested"
  | "Payment Help Needed"
  | "Payment Link Sent"
  | "Payment Completed"
  | "Not Interested"
  | "Closed";

export type TrainingStatus = "Not Started" | "In Progress" | "Certified" | "Suspended";

export type Representative = {
  id: string;
  name: string;
  agentCode: string;
  cityMarket: string;
  status: AgentStatus;
  role: string;
  verifiedBy: string;
  lastVerificationDate: string;
  allowedActivities: string[];
  notAllowed: string[];
};

export type AgentLead = {
  id: string;
  importerName: string;
  city: string;
  product: string;
  budgetRange: string;
  packageSelected: string;
  paymentIssue: string;
  paymentProblemReason: string;
  leadStatus: AgentLeadStatus;
  lastContact: string;
  followUpDue: string;
  createdDate: string;
  notes: string[];
};

export const trustCards = [
  {
    title: "Pakistani local business",
    body: "Verify the local presence and support path before starting an Import Project.",
  },
  {
    title: "Representative verification",
    body: "Check an agent code before sharing information or discussing payment.",
  },
  {
    title: "Secure project tracking",
    body: "Every paid project should move through admin-reviewed project tracking.",
  },
  {
    title: "Refund protection before FMS assignment",
    body: "Full refund is available before FMS assignment according to platform rules.",
  },
  {
    title: "Platform-controlled communication",
    body: "Importer, FMS, and future factory communication stays under admin control.",
  },
  {
    title: "No direct importer-FMS contact",
    body: "Private contact details are not shared across importer and FMS roles.",
  },
] as const;

export const verificationOptions = [
  {
    title: "Verify Representative",
    body: "Enter an Agent Code or Representative ID before sharing information or discussing payment.",
    href: "/verify/representative",
  },
  {
    title: "Contact Support",
    body: "Ask ChinaPak ImportHub support before trusting unknown payment requests.",
    href: "/contact",
  },
  {
    title: "Confirm official support channel",
    body: "Use official ChinaPak ImportHub routes before trusting payment or representative requests.",
    href: "/verify",
  },
  {
    title: "Check invoice/project ID",
    body: "Use your portal invoice or project record to confirm the official payment context.",
    href: "/invoices",
  },
] as const;

export const exampleRepresentative: Representative = {
  id: "agent-lhr-014",
  name: "Ali Raza",
  agentCode: "CPH-LHR-014",
  cityMarket: "Lahore / Shah Alam Market",
  status: "Active",
  role: "Local Representative",
  verifiedBy: "ChinaPak ImportHub",
  lastVerificationDate: "2026-06-29",
  allowedActivities: [
    "Explain service",
    "Help submit import request",
    "Help with approved payment process",
    "Guide user to official portal",
  ],
  notAllowed: [
    "Take unofficial payments",
    "Promise guaranteed imports",
    "Share FMS/factory private contact outside approved workflow",
  ],
};

export const agentStats = [
  { label: "Assigned Leads", value: "18", detail: "Unpaid or assisted importer leads" },
  { label: "Contacted Today", value: "6", detail: "Follow-up count" },
  { label: "Payment Help Needed", value: "7", detail: "Needs approved payment support" },
  { label: "Converted to Paid Projects", value: "4", detail: "After payment verification" },
  { label: "Pending Commissions", value: "PKR 9,000", detail: "Configurable rule" },
  { label: "Paid Commissions", value: "PKR 21,000", detail: "Commission history" },
  { label: "Agent Status", value: "Active", detail: "Representative account state" },
  { label: "Training Status", value: "In Progress", detail: "Certification status" },
] as const;

export const agentComplianceRules = [
  "Do not collect unofficial payments.",
  "Do not promise outcomes beyond official package terms.",
  "Use approved scripts and official payment methods.",
  "Never bypass ChinaPak ImportHub platform.",
] as const;

export const agentLeads: AgentLead[] = [
  {
    id: "LEAD-2026-031",
    importerName: "Ahmed Traders",
    city: "Lahore",
    product: "School bags",
    budgetRange: "PKR 300,000-700,000",
    packageSelected: "Factory Match Plus",
    paymentIssue: "Online payment trust concern",
    paymentProblemReason: "Online payment پر trust نہیں ہے",
    leadStatus: "Payment Help Needed",
    lastContact: "2026-06-29 10:30",
    followUpDue: "2026-06-30",
    createdDate: "2026-06-29",
    notes: [
      "Importer wants representative verification before payment.",
      "Needs explanation of refund before FMS assignment.",
    ],
  },
  {
    id: "LEAD-2026-032",
    importerName: "Karachi Mobile Hub",
    city: "Karachi",
    product: "USB-C cables",
    budgetRange: "PKR 700,000-1,500,000",
    packageSelected: "Import Partner",
    paymentIssue: "Funds arrange کرنے ہیں",
    paymentProblemReason: "Funds arrange کرنے ہیں",
    leadStatus: "Interested",
    lastContact: "2026-06-29 12:15",
    followUpDue: "2026-07-01",
    createdDate: "2026-06-28",
    notes: [
      "Importer asked about factory-side evidence and certifications.",
      "Agent should keep claims within official package terms.",
    ],
  },
  {
    id: "LEAD-2026-033",
    importerName: "Faisalabad Home Store",
    city: "Faisalabad",
    product: "Plastic storage boxes",
    budgetRange: "PKR 100,000-300,000",
    packageSelected: "Factory Discovery",
    paymentIssue: "Payment failed",
    paymentProblemReason: "Payment failed",
    leadStatus: "Payment Link Sent",
    lastContact: "2026-06-28 16:40",
    followUpDue: "2026-06-30",
    createdDate: "2026-06-28",
    notes: [
      "Needs manual payment help if online payment fails again.",
      "Unpaid lead must not be assigned to FMS.",
    ],
  },
  {
    id: "LEAD-2026-034",
    importerName: "Multan Tools Market",
    city: "Multan",
    product: "Tool kits",
    budgetRange: "PKR 1,500,000+",
    packageSelected: "Import Partner",
    paymentIssue: "Needs more information",
    paymentProblemReason: "مجھے مزید معلومات چاہیے",
    leadStatus: "Contact Attempted",
    lastContact: "2026-06-27 11:20",
    followUpDue: "2026-06-30",
    createdDate: "2026-06-27",
    notes: [
      "Explain package delivery timeframe and admin review process.",
      "Avoid promising guaranteed product price.",
    ],
  },
];

export const conversionActivity = [
  "LEAD-2026-028 converted after bank transfer verification.",
  "LEAD-2026-029 requested admin support before payment.",
  "LEAD-2026-030 closed as not interested.",
] as const;

export const approvedTalkingPoints = [
  "ChinaPak ImportHub helps Pakistani importers find suitable Chinese factories.",
  "Product evidence may be reviewed before shipment where package/workflow supports it.",
  "Payment must be completed before FMS assignment.",
  "Full refund is available before FMS assignment.",
  "After FMS assignment, refunds are admin-reviewed based on milestones.",
] as const;

export const agentRestrictions = [
  "Do not collect unofficial payment.",
  "Do not promise guaranteed product price.",
  "Do not promise guaranteed import success.",
  "Do not share private FMS/factory contacts.",
] as const;

export const commissionSummary = {
  pending: "PKR 9,000",
  approved: "PKR 12,000",
  paid: "PKR 21,000",
  rule:
    "Agent commission is credited only after payment is verified and project is accepted for admin review.",
  packageExamples: [
    "Factory Discovery referral commission - configurable",
    "Factory Match Plus referral commission - configurable",
    "Import Partner referral commission - configurable",
  ],
  history: [
    {
      id: "COM-2026-011",
      leadId: "LEAD-2026-028",
      packageName: "Factory Match Plus",
      status: "Paid",
      amount: "Configurable",
      date: "2026-06-27",
    },
    {
      id: "COM-2026-012",
      leadId: "LEAD-2026-031",
      packageName: "Factory Match Plus",
      status: "Pending",
      amount: "Configurable",
      date: "Pending payment verification",
    },
    {
      id: "COM-2026-013",
      leadId: "LEAD-2026-032",
      packageName: "Import Partner",
      status: "Approved",
      amount: "Configurable",
      date: "2026-06-29",
    },
  ],
};

export const trainingModules = [
  {
    title: "ChinaPak ImportHub business model",
    body: "Understand factory matching, admin review, payments, and project-centered workflows.",
    status: "Certified" as TrainingStatus,
  },
  {
    title: "How to explain factory matching",
    body: "Explain factory options, evidence, and package scope without overpromising.",
    status: "In Progress" as TrainingStatus,
  },
  {
    title: "Payment and refund rules",
    body: "Learn official payment flow, unpaid lead handling, and refund boundaries.",
    status: "In Progress" as TrainingStatus,
  },
  {
    title: "Unpaid lead follow-up",
    body: "Help importers complete payment while keeping leads out of FMS sourcing.",
    status: "Not Started" as TrainingStatus,
  },
  {
    title: "Representative verification rules",
    body: "Know how users verify a representative and what inactive status means.",
    status: "Certified" as TrainingStatus,
  },
  {
    title: "Anti-fraud and official payment policy",
    body: "Never collect unofficial payments or route users outside approved workflows.",
    status: "In Progress" as TrainingStatus,
  },
  {
    title: "What agents must never promise",
    body: "No guaranteed price, import success, or private FMS/factory contact sharing.",
    status: "Not Started" as TrainingStatus,
  },
  {
    title: "Customer trust-building script",
    body: "Use approved language for verification, package explanation, and next steps.",
    status: "Not Started" as TrainingStatus,
  },
] as const;

export function getAgentLeadById(leadId: string) {
  return agentLeads.find((lead) => lead.id === leadId);
}
