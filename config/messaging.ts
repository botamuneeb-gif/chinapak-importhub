export type MessagingRole = "Admin" | "Importer" | "FMS" | "System" | "Factory Future";

export type MessagingView = "admin" | "importer" | "fms";

export type ThreadType =
  | "Importer Support"
  | "Project Update"
  | "FMS Internal"
  | "Translation Review"
  | "Factory Communication Future"
  | "Refund/Dispute";

export type ThreadStatus =
  | "Open"
  | "Pending Admin Review"
  | "Waiting for Importer"
  | "Waiting for FMS"
  | "Translation Needed"
  | "Approved for Forwarding"
  | "Closed";

export type RiskFlag =
  | "None"
  | "Contact Info Detected"
  | "Payment Instruction Detected"
  | "Factory Contact Detected"
  | "Unapproved Direct Contact Attempt"
  | "Sensitive Document Shared";

export type MessageAttachment = {
  id: string;
  label: string;
  kind: "Image" | "Document" | "Voice Note" | "Video" | "Other";
  storageStatus: "Placeholder only" | "Future object storage";
};

export type MessageItem = {
  id: string;
  senderRole: MessagingRole;
  originalLanguage: "Urdu" | "English" | "Simplified Chinese" | "System";
  originalText: string;
  translatedText: string;
  adminApprovedText: string;
  timestamp: string;
  riskFlags: RiskFlag[];
  attachments: MessageAttachment[];
  visibleTo: MessagingView[];
};

export type MessageThread = {
  threadId: string;
  projectId: string;
  assignmentId?: string;
  topic: string;
  participants: Array<{
    role: MessagingRole;
    label: string;
  }>;
  threadType: ThreadType;
  latestMessagePreview: string;
  languagePair: "Urdu ↔ Chinese" | "English ↔ Chinese" | "Urdu ↔ English" | "Future factory language";
  riskFlags: RiskFlag[];
  status: ThreadStatus;
  lastUpdated: string;
  unreadImporterMessages: number;
  unreadFmsMessages: number;
  unreadAdminMessages: number;
  importerUnreadCount: number;
  fmsAdminFeedbackNeeded: boolean;
  translationAddOnActive: boolean;
  messages: MessageItem[];
  auditTrail: Array<{
    label: string;
    timestamp: string;
    state: "done" | "current" | "pending" | "risk";
  }>;
};

export const messageStats = [
  { label: "Open Threads", value: "5", detail: "Project-linked conversations" },
  { label: "Pending Review", value: "2", detail: "Awaiting admin decision" },
  { label: "Contact Info Flags", value: "2", detail: "Needs firewall review" },
  { label: "Translation Needed", value: "3", detail: "AI/human review planned" },
  { label: "Unread Importer Messages", value: "4", detail: "Customer-side queue" },
  { label: "Unread FMS Messages", value: "3", detail: "China team queue" },
] as const;

export const translationAddOns = [
  {
    name: "Text Chat Translation",
    price: "PKR 5,000/project",
  },
  {
    name: "Voice Note Translation",
    price: "PKR 8,000-12,000/project",
  },
  {
    name: "Document Translation",
    price: "PKR 2,000-5,000/document",
  },
  {
    name: "Live Factory Call Translation",
    price: "PKR 15,000-30,000/session",
  },
] as const;

const scanTrail = [
  { label: "Message received", timestamp: "2026-06-29 09:05", state: "done" },
  { label: "Contact info scan completed", timestamp: "2026-06-29 09:05", state: "done" },
  { label: "Translation draft generated", timestamp: "2026-06-29 09:06", state: "current" },
  { label: "Admin reviewed", timestamp: "Pending", state: "pending" },
  { label: "Forwarded to recipient", timestamp: "Pending", state: "pending" },
  { label: "File attached", timestamp: "Pending", state: "pending" },
  { label: "Thread closed", timestamp: "Pending", state: "pending" },
] as const;

export const messageThreads: MessageThread[] = [
  {
    threadId: "MSG-CPH-0007-IMPORTER",
    projectId: "CPH-2026-0007",
    assignmentId: "FMS-A-2026-014",
    topic: "School bag requirements and sample evidence",
    participants: [
      { role: "Importer", label: "Importer role only" },
      { role: "Admin", label: "ChinaPak project team" },
      { role: "FMS", label: "FMS role via admin review only" },
    ],
    threadType: "Project Update",
    latestMessagePreview:
      "Admin-approved update: factory-side product photos are being reviewed before release.",
    languagePair: "Urdu ↔ Chinese",
    riskFlags: ["None"],
    status: "Open",
    lastUpdated: "2026-06-29 11:20",
    unreadImporterMessages: 1,
    unreadFmsMessages: 0,
    unreadAdminMessages: 1,
    importerUnreadCount: 1,
    fmsAdminFeedbackNeeded: false,
    translationAddOnActive: true,
    messages: [
      {
        id: "MSG-0007-1",
        senderRole: "Importer",
        originalLanguage: "Urdu",
        originalText:
          "مجھے school bags کے zipper اور stitching کی clear photos چاہیے تاکہ میں quality دیکھ سکوں۔",
        translatedText:
          "The importer needs clear photos of the zippers and stitching to review quality.",
        adminApprovedText:
          "Your request for zipper and stitching photos has been received. Our team will review factory-side evidence before sharing it with you.",
        timestamp: "2026-06-29 09:05",
        riskFlags: ["None"],
        attachments: [
          {
            id: "ATT-0007-1",
            label: "Reference bag photo placeholder",
            kind: "Image",
            storageStatus: "Placeholder only",
          },
        ],
        visibleTo: ["admin", "importer"],
      },
      {
        id: "MSG-0007-2",
        senderRole: "FMS",
        originalLanguage: "Simplified Chinese",
        originalText:
          "已要求工厂提供拉链、缝线和内衬照片。工厂联系方式仅供管理员审核。",
        translatedText:
          "Requested zipper, stitching, and lining photos from the factory. Factory contact details are for admin review only.",
        adminApprovedText:
          "Factory-side zipper, stitching, and lining photos have been requested. ChinaPak will review the evidence before importer access.",
        timestamp: "2026-06-29 10:15",
        riskFlags: ["Factory Contact Detected"],
        attachments: [],
        visibleTo: ["admin", "fms"],
      },
      {
        id: "MSG-0007-3",
        senderRole: "Admin",
        originalLanguage: "English",
        originalText:
          "Approved update prepared for importer after evidence quality review.",
        translatedText:
          "Importer-facing Urdu translation will be generated after final admin approval.",
        adminApprovedText:
          "ہم factory-side photos review کر رہے ہیں۔ Approved evidence آپ کے project account میں share کی جائے گی۔",
        timestamp: "2026-06-29 11:20",
        riskFlags: ["None"],
        attachments: [],
        visibleTo: ["admin", "importer"],
      },
    ],
    auditTrail: [...scanTrail],
  },
  {
    threadId: "MSG-CPH-0008-FMS",
    projectId: "CPH-2026-0008",
    assignmentId: "FMS-A-2026-015",
    topic: "Electronics certification clarification",
    participants: [
      { role: "Admin", label: "ChinaPak admin team" },
      { role: "FMS", label: "Assigned FMS role only" },
    ],
    threadType: "FMS Internal",
    latestMessagePreview:
      "FMS requested admin guidance before sharing certification notes with importer.",
    languagePair: "English ↔ Chinese",
    riskFlags: ["Sensitive Document Shared"],
    status: "Pending Admin Review",
    lastUpdated: "2026-06-29 12:10",
    unreadImporterMessages: 0,
    unreadFmsMessages: 2,
    unreadAdminMessages: 2,
    importerUnreadCount: 0,
    fmsAdminFeedbackNeeded: true,
    translationAddOnActive: false,
    messages: [
      {
        id: "MSG-0008-1",
        senderRole: "Admin",
        originalLanguage: "English",
        originalText:
          "Please collect CE/RoHS certificate photos and quotation documents. Do not send any importer contact request.",
        translatedText:
          "请收集 CE/RoHS 证书照片和报价文件。不要发送任何进口商联系方式请求。",
        adminApprovedText:
          "Collect certificate photos and quotations. Keep all communication inside ChinaPak ImportHub.",
        timestamp: "2026-06-29 10:40",
        riskFlags: ["None"],
        attachments: [],
        visibleTo: ["admin", "fms"],
      },
      {
        id: "MSG-0008-2",
        senderRole: "FMS",
        originalLanguage: "Simplified Chinese",
        originalText:
          "工厂发来了证书扫描件和报价。付款条款需要管理员审核后再给客户看。",
        translatedText:
          "The factory sent certificate scans and a quotation. Payment terms need admin review before customer visibility.",
        adminApprovedText:
          "Certificate and quotation documents received for admin review. Payment terms remain hidden until approved.",
        timestamp: "2026-06-29 12:10",
        riskFlags: ["Sensitive Document Shared", "Payment Instruction Detected"],
        attachments: [
          {
            id: "ATT-0008-1",
            label: "Certificate scan placeholder",
            kind: "Document",
            storageStatus: "Future object storage",
          },
          {
            id: "ATT-0008-2",
            label: "Quotation document placeholder",
            kind: "Document",
            storageStatus: "Future object storage",
          },
        ],
        visibleTo: ["admin", "fms"],
      },
    ],
    auditTrail: [
      { label: "Message received", timestamp: "2026-06-29 12:10", state: "done" },
      { label: "Contact info scan completed", timestamp: "2026-06-29 12:11", state: "risk" },
      { label: "Translation draft generated", timestamp: "2026-06-29 12:11", state: "done" },
      { label: "Admin reviewed", timestamp: "Pending", state: "current" },
      { label: "Forwarded to recipient", timestamp: "Pending", state: "pending" },
      { label: "File attached", timestamp: "2026-06-29 12:10", state: "done" },
      { label: "Thread closed", timestamp: "Pending", state: "pending" },
    ],
  },
  {
    threadId: "MSG-CPH-0004-TRANSLATION",
    projectId: "CPH-2026-0004",
    assignmentId: "FMS-A-2026-011",
    topic: "Tool kit quotation translation review",
    participants: [
      { role: "Importer", label: "Importer role only" },
      { role: "Admin", label: "ChinaPak project team" },
      { role: "FMS", label: "Assigned FMS via admin review" },
    ],
    threadType: "Translation Review",
    latestMessagePreview:
      "A quotation note includes possible direct contact language and needs admin edit.",
    languagePair: "Urdu ↔ Chinese",
    riskFlags: ["Contact Info Detected", "Unapproved Direct Contact Attempt"],
    status: "Translation Needed",
    lastUpdated: "2026-06-29 13:05",
    unreadImporterMessages: 2,
    unreadFmsMessages: 1,
    unreadAdminMessages: 3,
    importerUnreadCount: 0,
    fmsAdminFeedbackNeeded: true,
    translationAddOnActive: false,
    messages: [
      {
        id: "MSG-0004-1",
        senderRole: "FMS",
        originalLanguage: "Simplified Chinese",
        originalText:
          "报价里包含工厂联系人信息和直接联系建议，建议管理员删除后再转发。",
        translatedText:
          "The quotation includes factory contact information and a direct contact suggestion. Admin should remove it before forwarding.",
        adminApprovedText:
          "Quotation requires admin editing before importer release. Direct contact language will be removed.",
        timestamp: "2026-06-29 12:55",
        riskFlags: ["Factory Contact Detected", "Unapproved Direct Contact Attempt"],
        attachments: [
          {
            id: "ATT-0004-1",
            label: "Quotation PDF placeholder",
            kind: "Document",
            storageStatus: "Future object storage",
          },
        ],
        visibleTo: ["admin", "fms"],
      },
      {
        id: "MSG-0004-2",
        senderRole: "Importer",
        originalLanguage: "Urdu",
        originalText:
          "براہ کرم quotation کو simple Urdu میں explain کر دیں، خاص طور پر MOQ اور delivery time۔",
        translatedText:
          "Please explain the quotation in simple Urdu, especially MOQ and delivery time.",
        adminApprovedText:
          "Your quotation explanation request is received. ChinaPak will prepare a simple approved summary.",
        timestamp: "2026-06-29 13:05",
        riskFlags: ["None"],
        attachments: [],
        visibleTo: ["admin", "importer"],
      },
    ],
    auditTrail: [
      { label: "Message received", timestamp: "2026-06-29 12:55", state: "done" },
      { label: "Contact info scan completed", timestamp: "2026-06-29 12:56", state: "risk" },
      { label: "Translation draft generated", timestamp: "2026-06-29 12:57", state: "done" },
      { label: "Admin reviewed", timestamp: "Pending", state: "current" },
      { label: "Forwarded to recipient", timestamp: "Pending", state: "pending" },
      { label: "File attached", timestamp: "2026-06-29 12:55", state: "done" },
      { label: "Thread closed", timestamp: "Pending", state: "pending" },
    ],
  },
  {
    threadId: "MSG-CPH-0009-REFUND",
    projectId: "CPH-2026-0009",
    topic: "Refund and payment support",
    participants: [
      { role: "Importer", label: "Importer role only" },
      { role: "Admin", label: "ChinaPak payments team" },
    ],
    threadType: "Refund/Dispute",
    latestMessagePreview:
      "Importer asked about refund timing before FMS assignment.",
    languagePair: "Urdu ↔ English",
    riskFlags: ["Payment Instruction Detected"],
    status: "Waiting for Importer",
    lastUpdated: "2026-06-29 14:20",
    unreadImporterMessages: 1,
    unreadFmsMessages: 0,
    unreadAdminMessages: 1,
    importerUnreadCount: 2,
    fmsAdminFeedbackNeeded: false,
    translationAddOnActive: false,
    messages: [
      {
        id: "MSG-0009-1",
        senderRole: "Importer",
        originalLanguage: "Urdu",
        originalText:
          "اگر FMS assign نہیں ہوا تو refund کیسے process ہو گا؟ مجھے payment proof بھی attach کرنا ہے۔",
        translatedText:
          "If FMS has not been assigned, how will the refund be processed? I also need to attach payment proof.",
        adminApprovedText:
          "Your refund question has been received. If no FMS is assigned, full refund eligibility can be reviewed by admin.",
        timestamp: "2026-06-29 14:05",
        riskFlags: ["Payment Instruction Detected"],
        attachments: [
          {
            id: "ATT-0009-1",
            label: "Payment proof placeholder",
            kind: "Image",
            storageStatus: "Future object storage",
          },
        ],
        visibleTo: ["admin", "importer"],
      },
      {
        id: "MSG-0009-2",
        senderRole: "Admin",
        originalLanguage: "English",
        originalText:
          "Before FMS assignment, full refund may be available after admin review of payment status.",
        translatedText:
          "FMS assignment سے پہلے admin payment status review کرے گا۔ Eligible case میں full refund available ہو سکتا ہے۔",
        adminApprovedText:
          "FMS assignment سے پہلے admin payment status review کرے گا۔ Eligible case میں full refund available ہو سکتا ہے۔",
        timestamp: "2026-06-29 14:20",
        riskFlags: ["None"],
        attachments: [],
        visibleTo: ["admin", "importer"],
      },
    ],
    auditTrail: [...scanTrail],
  },
  {
    threadId: "MSG-FACTORY-FUTURE-001",
    projectId: "CPH-2026-0008",
    assignmentId: "FMS-A-2026-015",
    topic: "Future factory communication architecture placeholder",
    participants: [
      { role: "Admin", label: "ChinaPak admin team" },
      { role: "Factory Future", label: "Factory role hidden until activation" },
    ],
    threadType: "Factory Communication Future",
    latestMessagePreview:
      "Reserved structure for future factory portal messaging after activation.",
    languagePair: "Future factory language",
    riskFlags: ["None"],
    status: "Closed",
    lastUpdated: "2026-06-29 08:00",
    unreadImporterMessages: 0,
    unreadFmsMessages: 0,
    unreadAdminMessages: 0,
    importerUnreadCount: 0,
    fmsAdminFeedbackNeeded: false,
    translationAddOnActive: false,
    messages: [
      {
        id: "MSG-FUTURE-1",
        senderRole: "System",
        originalLanguage: "System",
        originalText:
          "Factory communication is reserved for a future hidden portal activation.",
        translatedText:
          "Factory communication architecture placeholder.",
        adminApprovedText:
          "Factory communication remains hidden until the future factory portal is activated.",
        timestamp: "2026-06-29 08:00",
        riskFlags: ["None"],
        attachments: [],
        visibleTo: ["admin"],
      },
    ],
    auditTrail: [
      { label: "Message received", timestamp: "2026-06-29 08:00", state: "done" },
      { label: "Contact info scan completed", timestamp: "Not needed", state: "pending" },
      { label: "Translation draft generated", timestamp: "Future", state: "pending" },
      { label: "Admin reviewed", timestamp: "Future", state: "pending" },
      { label: "Forwarded to recipient", timestamp: "Future", state: "pending" },
      { label: "File attached", timestamp: "Future", state: "pending" },
      { label: "Thread closed", timestamp: "2026-06-29 08:00", state: "done" },
    ],
  },
];

export function getMessageThreadById(threadId: string) {
  return messageThreads.find((thread) => thread.threadId === threadId);
}

export function getThreadsForView(view: MessagingView) {
  if (view === "admin") {
    return messageThreads;
  }

  return messageThreads.filter((thread) =>
    thread.messages.some((message) => message.visibleTo.includes(view)),
  );
}

export function getThreadForView(threadId: string, view: MessagingView) {
  const thread = getMessageThreadById(threadId);

  if (!thread) {
    return undefined;
  }

  if (view === "admin") {
    return thread;
  }

  return thread.messages.some((message) => message.visibleTo.includes(view))
    ? thread
    : undefined;
}

export function getVisibleMessages(thread: MessageThread, view: MessagingView) {
  if (view === "admin") {
    return thread.messages;
  }

  return thread.messages.filter((message) => message.visibleTo.includes(view));
}
