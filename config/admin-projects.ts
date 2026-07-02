export type PaymentStatus =
  | "Paid"
  | "Awaiting Payment"
  | "Failed"
  | "Refunded"
  | "Partially Refunded";

export type ProjectStatus =
  | "Paid - Awaiting Review"
  | "Needs More Information"
  | "Ready for FMS Assignment"
  | "Assigned to FMS"
  | "FMS Researching"
  | "Admin Reviewing Factory Options"
  | "Results Ready for Importer"
  | "Completed"
  | "Refund Requested"
  | "Cancelled";

export type LeadStatus =
  | "New Lead"
  | "Contact Attempted"
  | "Awaiting Customer"
  | "Payment Link Sent"
  | "Payment Completed"
  | "Not Interested"
  | "Closed";

export type AdminProject = {
  id: string;
  importer: {
    name: string;
    city: string;
    businessType: string;
    contactForAdminOnly: string;
    verificationStatus: string;
    pastProjectCount: number;
  };
  product: {
    name: string;
    details: string;
    inputMethod: string;
    budget: string;
    quantity: string;
    qualityLevel: "Normal" | "Better" | "Premium";
    importerExperience: string;
  };
  package: {
    name: "Factory Discovery" | "Factory Match Plus" | "Import Partner";
    price: string;
    delivery: string;
  };
  addOns: Array<{ name: string; price: string }>;
  paymentStatus: PaymentStatus;
  projectStatus: ProjectStatus;
  createdDate: string;
  totalServiceFee: string;
  adminActions: string[];
  checklist: Array<{ label: string; checked: boolean }>;
  assignment: {
    suggestedTier: "Bronze" | "Silver" | "Gold";
    candidatePlaceholder: string;
    deadlinePlaceholder: string;
    internalNotes: string;
  };
  notesTimeline: Array<{ date: string; note: string }>;
  timeline: Array<{
    id?: string;
    eventId?: string;
    createdAt?: string;
    label: string;
    date: string;
    state: "done" | "current" | "pending";
  }>;
};

export type AdminLead = {
  id: string;
  importerName: string;
  city: string;
  product: string;
  packageSelected: string;
  reasonPaymentNotCompleted: string;
  createdDate: string;
  followUpStatus: LeadStatus;
  assignedLocalAgentPlaceholder: string;
  actions: string[];
};

export const adminStats = [
  { label: "New Paid Projects", value: "8", detail: "Paid projects waiting in the queue" },
  { label: "Unpaid Leads", value: "14", detail: "Saved projects awaiting payment help" },
  { label: "Awaiting Admin Review", value: "6", detail: "Need product and package review" },
  { label: "Ready for FMS Assignment", value: "4", detail: "Payment received and admin-ready" },
  { label: "In Progress", value: "11", detail: "Assigned or under factory research" },
  { label: "Refund Requests", value: "2", detail: "Need milestone review" },
  { label: "Completed Projects", value: "27", detail: "Closed project count" },
  { label: "FMS Pending Payout", value: "5", detail: "Payout review queue" },
] as const;

export const recentAdminActivity = [
  {
    id: "act-001",
    time: "Today 10:30",
    label: "Project CPH-2026-0007 moved to Ready for FMS Assignment.",
  },
  {
    id: "act-002",
    time: "Today 09:45",
    label: "Lead LEAD-2026-0021 marked Payment Link Sent.",
  },
  {
    id: "act-003",
    time: "Yesterday 16:10",
    label: "Refund request opened for CPH-2026-0004.",
  },
  {
    id: "act-004",
    time: "Yesterday 13:20",
    label: "Admin requested more information for CPH-2026-0009.",
  },
] as const;

export const adminProjects: AdminProject[] = [
  {
    id: "CPH-2026-0007",
    importer: {
      name: "Ahmed Traders",
      city: "Lahore",
      businessType: "Wholesale retailer",
      contactForAdminOnly: "+92 300 111 2200",
      verificationStatus: "Local verification pending",
      pastProjectCount: 1,
    },
    product: {
      name: "School bags",
      details: "Medium-size school bags, durable zippers, green and navy color options.",
      inputMethod: "Product details + reference photo placeholder",
      budget: "PKR 300,000 – 700,000",
      quantity: "1,000 pieces",
      qualityLevel: "Better",
      importerExperience: "پہلے 1–5 بار import کیا ہے",
    },
    package: {
      name: "Factory Match Plus",
      price: "PKR 35,000",
      delivery: "7–10 business days",
    },
    addOns: [
      { name: "Supplier Background Check", price: "PKR 12,000" },
      { name: "Sample Coordination", price: "PKR 15,000" },
    ],
    paymentStatus: "Paid",
    projectStatus: "Ready for FMS Assignment",
    createdDate: "2026-06-28",
    totalServiceFee: "PKR 62,000",
    adminActions: ["Review Project", "Prepare Assignment", "View Timeline"],
    checklist: [
      { label: "Product details are understandable", checked: true },
      { label: "Budget range selected", checked: true },
      { label: "Quantity provided", checked: true },
      { label: "Package selected", checked: true },
      { label: "Add-ons reviewed", checked: true },
      { label: "Risk or missing information checked", checked: true },
      { label: "Ready for FMS assignment", checked: true },
    ],
    assignment: {
      suggestedTier: "Silver",
      candidatePlaceholder: "Approved Silver FMS placeholder",
      deadlinePlaceholder: "2026-07-08",
      internalNotes: "Ask for factory evidence on zipper durability and stitching quality.",
    },
    notesTimeline: [
      { date: "2026-06-28", note: "Payment received. Admin review started." },
      { date: "2026-06-29", note: "Package and add-ons reviewed. Ready for FMS preparation." },
    ],
    timeline: [
      { label: "Project Created", date: "2026-06-28", state: "done" },
      { label: "Payment Received", date: "2026-06-28", state: "done" },
      { label: "Admin Review Started", date: "2026-06-28", state: "done" },
      { label: "Ready for FMS Assignment", date: "2026-06-29", state: "current" },
      { label: "FMS Assigned", date: "Pending", state: "pending" },
      { label: "Factory Research Started", date: "Pending", state: "pending" },
      { label: "Factory Options Submitted", date: "Pending", state: "pending" },
      { label: "Admin Approved Results", date: "Pending", state: "pending" },
      { label: "Results Delivered to Importer", date: "Pending", state: "pending" },
      { label: "Project Completed", date: "Pending", state: "pending" },
    ],
  },
  {
    id: "CPH-2026-0008",
    importer: {
      name: "Karachi Mobile Hub",
      city: "Karachi",
      businessType: "Retail shop",
      contactForAdminOnly: "+92 321 555 7810",
      verificationStatus: "Verified by local agent placeholder",
      pastProjectCount: 0,
    },
    product: {
      name: "Phone accessories",
      details: "USB-C cables and fast chargers for retail resale.",
      inputMethod: "Alibaba/1688 link placeholder",
      budget: "PKR 700,000 – 1,500,000",
      quantity: "5,000 units",
      qualityLevel: "Premium",
      importerExperience: "Experienced importer ہوں",
    },
    package: {
      name: "Import Partner",
      price: "PKR 75,000",
      delivery: "10–15 business days",
    },
    addOns: [
      { name: "Video Factory Tour Coordination", price: "PKR 20,000–35,000" },
      { name: "Shipping Coordination Support", price: "PKR 15,000" },
    ],
    paymentStatus: "Paid",
    projectStatus: "Paid - Awaiting Review",
    createdDate: "2026-06-29",
    totalServiceFee: "PKR 110,000 estimate",
    adminActions: ["Review Project", "Mark Needs Info", "View Timeline"],
    checklist: [
      { label: "Product details are understandable", checked: true },
      { label: "Budget range selected", checked: true },
      { label: "Quantity provided", checked: true },
      { label: "Package selected", checked: true },
      { label: "Add-ons reviewed", checked: false },
      { label: "Risk or missing information checked", checked: false },
      { label: "Ready for FMS assignment", checked: false },
    ],
    assignment: {
      suggestedTier: "Gold",
      candidatePlaceholder: "Gold FMS placeholder after admin review",
      deadlinePlaceholder: "Not selected",
      internalNotes: "Check certification requirements for chargers before assignment.",
    },
    notesTimeline: [
      { date: "2026-06-29", note: "New paid project received." },
    ],
    timeline: [
      { label: "Project Created", date: "2026-06-29", state: "done" },
      { label: "Payment Received", date: "2026-06-29", state: "done" },
      { label: "Admin Review Started", date: "Pending", state: "current" },
      { label: "Ready for FMS Assignment", date: "Pending", state: "pending" },
      { label: "FMS Assigned", date: "Pending", state: "pending" },
      { label: "Factory Research Started", date: "Pending", state: "pending" },
      { label: "Factory Options Submitted", date: "Pending", state: "pending" },
      { label: "Admin Approved Results", date: "Pending", state: "pending" },
      { label: "Results Delivered to Importer", date: "Pending", state: "pending" },
      { label: "Project Completed", date: "Pending", state: "pending" },
    ],
  },
  {
    id: "CPH-2026-0004",
    importer: {
      name: "Peshawar Tools Market",
      city: "Peshawar",
      businessType: "Market distributor",
      contactForAdminOnly: "+92 333 908 4410",
      verificationStatus: "Business documents received",
      pastProjectCount: 2,
    },
    product: {
      name: "Hand tools",
      details: "Basic hand tool sets for hardware market distribution.",
      inputMethod: "Voice note placeholder + product details",
      budget: "PKR 1,500,000+",
      quantity: "2 containers planned",
      qualityLevel: "Normal",
      importerExperience: "Experienced importer ہوں",
    },
    package: {
      name: "Import Partner",
      price: "PKR 75,000",
      delivery: "10–15 business days",
    },
    addOns: [{ name: "Supplier Background Check", price: "PKR 12,000" }],
    paymentStatus: "Paid",
    projectStatus: "Refund Requested",
    createdDate: "2026-06-20",
    totalServiceFee: "PKR 87,000",
    adminActions: ["Review Project", "View Timeline"],
    checklist: [
      { label: "Product details are understandable", checked: true },
      { label: "Budget range selected", checked: true },
      { label: "Quantity provided", checked: true },
      { label: "Package selected", checked: true },
      { label: "Add-ons reviewed", checked: true },
      { label: "Risk or missing information checked", checked: true },
      { label: "Ready for FMS assignment", checked: true },
    ],
    assignment: {
      suggestedTier: "Gold",
      candidatePlaceholder: "Assigned Gold FMS placeholder",
      deadlinePlaceholder: "2026-07-04",
      internalNotes: "Refund review must consider completed factory research milestone.",
    },
    notesTimeline: [
      { date: "2026-06-21", note: "FMS assignment placeholder recorded." },
      { date: "2026-06-29", note: "Refund requested. Milestone review required." },
    ],
    timeline: [
      { label: "Project Created", date: "2026-06-20", state: "done" },
      { label: "Payment Received", date: "2026-06-20", state: "done" },
      { label: "Admin Review Started", date: "2026-06-20", state: "done" },
      { label: "Ready for FMS Assignment", date: "2026-06-21", state: "done" },
      { label: "FMS Assigned", date: "2026-06-21", state: "done" },
      { label: "Factory Research Started", date: "2026-06-22", state: "current" },
      { label: "Factory Options Submitted", date: "Pending", state: "pending" },
      { label: "Admin Approved Results", date: "Pending", state: "pending" },
      { label: "Results Delivered to Importer", date: "Pending", state: "pending" },
      { label: "Project Completed", date: "Pending", state: "pending" },
    ],
  },
  {
    id: "CPH-2026-0009",
    importer: {
      name: "Multan Home Store",
      city: "Multan",
      businessType: "Retail and online seller",
      contactForAdminOnly: "+92 300 778 1002",
      verificationStatus: "Not verified",
      pastProjectCount: 0,
    },
    product: {
      name: "Kitchen storage boxes",
      details: "Plastic airtight storage boxes. Size and material unclear.",
      inputMethod: "Product details only",
      budget: "PKR 100,000 – 300,000",
      quantity: "Not clear",
      qualityLevel: "Better",
      importerExperience: "پہلی بار import کر رہا ہوں",
    },
    package: {
      name: "Factory Discovery",
      price: "PKR 18,000",
      delivery: "5–7 business days",
    },
    addOns: [],
    paymentStatus: "Paid",
    projectStatus: "Needs More Information",
    createdDate: "2026-06-27",
    totalServiceFee: "PKR 18,000",
    adminActions: ["Review Project", "Mark Needs Info", "View Timeline"],
    checklist: [
      { label: "Product details are understandable", checked: false },
      { label: "Budget range selected", checked: true },
      { label: "Quantity provided", checked: false },
      { label: "Package selected", checked: true },
      { label: "Add-ons reviewed", checked: true },
      { label: "Risk or missing information checked", checked: false },
      { label: "Ready for FMS assignment", checked: false },
    ],
    assignment: {
      suggestedTier: "Bronze",
      candidatePlaceholder: "Not ready for FMS",
      deadlinePlaceholder: "Not selected",
      internalNotes: "Ask importer for target quantity, plastic grade, and reference photo.",
    },
    notesTimeline: [
      { date: "2026-06-27", note: "Admin marked project as needing more information." },
    ],
    timeline: [
      { label: "Project Created", date: "2026-06-27", state: "done" },
      { label: "Payment Received", date: "2026-06-27", state: "done" },
      { label: "Admin Review Started", date: "2026-06-27", state: "current" },
      { label: "Ready for FMS Assignment", date: "Pending", state: "pending" },
      { label: "FMS Assigned", date: "Pending", state: "pending" },
      { label: "Factory Research Started", date: "Pending", state: "pending" },
      { label: "Factory Options Submitted", date: "Pending", state: "pending" },
      { label: "Admin Approved Results", date: "Pending", state: "pending" },
      { label: "Results Delivered to Importer", date: "Pending", state: "pending" },
      { label: "Project Completed", date: "Pending", state: "pending" },
    ],
  },
];

export const unpaidLeads: AdminLead[] = [
  {
    id: "LEAD-2026-0021",
    importerName: "Sialkot Sports Buyer",
    city: "Sialkot",
    product: "Sports gloves",
    packageSelected: "Factory Discovery",
    reasonPaymentNotCompleted: "Online payment پر trust نہیں ہے",
    createdDate: "2026-06-29",
    followUpStatus: "Payment Link Sent",
    assignedLocalAgentPlaceholder: "Lahore/Sialkot agent placeholder",
    actions: [
      "Mark Contact Attempted",
      "Send Payment Help Placeholder",
      "Assign Local Agent Placeholder",
      "Convert to Paid Project Placeholder",
      "Close Lead",
    ],
  },
  {
    id: "LEAD-2026-0022",
    importerName: "Rawalpindi Electronics",
    city: "Rawalpindi",
    product: "LED strip lights",
    packageSelected: "Factory Match Plus",
    reasonPaymentNotCompleted: "Funds arrange کرنے ہیں",
    createdDate: "2026-06-28",
    followUpStatus: "Awaiting Customer",
    assignedLocalAgentPlaceholder: "Islamabad agent placeholder",
    actions: [
      "Mark Contact Attempted",
      "Send Payment Help Placeholder",
      "Assign Local Agent Placeholder",
      "Convert to Paid Project Placeholder",
      "Close Lead",
    ],
  },
  {
    id: "LEAD-2026-0023",
    importerName: "Faisalabad Garments",
    city: "Faisalabad",
    product: "Garment trims",
    packageSelected: "Import Partner",
    reasonPaymentNotCompleted: "مجھے مزید معلومات چاہیے",
    createdDate: "2026-06-27",
    followUpStatus: "New Lead",
    assignedLocalAgentPlaceholder: "Not assigned",
    actions: [
      "Mark Contact Attempted",
      "Send Payment Help Placeholder",
      "Assign Local Agent Placeholder",
      "Convert to Paid Project Placeholder",
      "Close Lead",
    ],
  },
  {
    id: "LEAD-2026-0018",
    importerName: "Hyderabad Home Goods",
    city: "Hyderabad",
    product: "Wall clocks",
    packageSelected: "Factory Discovery",
    reasonPaymentNotCompleted: "Payment failed",
    createdDate: "2026-06-25",
    followUpStatus: "Contact Attempted",
    assignedLocalAgentPlaceholder: "Karachi agent placeholder",
    actions: [
      "Mark Contact Attempted",
      "Send Payment Help Placeholder",
      "Assign Local Agent Placeholder",
      "Convert to Paid Project Placeholder",
      "Close Lead",
    ],
  },
];

export function getProjectById(projectId: string) {
  return adminProjects.find((project) => project.id === projectId);
}
