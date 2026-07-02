export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type UserRole =
  | "importer"
  | "fms"
  | "agent"
  | "admin"
  | "super_admin"
  | "factory_future";

export type ProjectStatus =
  | "draft"
  | "awaiting_payment"
  | "payment_received"
  | "admin_review"
  | "needs_importer_clarification"
  | "ready_for_fms_assignment"
  | "fms_assigned"
  | "fms_working"
  | "factory_options_submitted"
  | "admin_quality_review"
  | "results_released_to_importer"
  | "importer_feedback_requested"
  | "completed"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "disputed";

export type PaymentStatus =
  | "awaiting_payment"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type RefundStatus =
  | "requested"
  | "under_admin_review"
  | "reassignment_offered"
  | "approved"
  | "partially_approved"
  | "rejected"
  | "paid"
  | "cancelled";

export type AssignmentStatus =
  | "assigned"
  | "requirements_reviewed"
  | "factory_researching"
  | "factory_options_drafted"
  | "submitted_for_admin_review"
  | "changes_requested"
  | "approved_by_admin"
  | "completed_by_admin"
  | "reassigned"
  | "cancelled";

export type FactoryStatus =
  | "draft"
  | "submitted_by_fms"
  | "admin_verified"
  | "active_internal_record"
  | "invited_to_claim_profile"
  | "claimed_by_factory"
  | "suspended"
  | "blacklisted";

export type VerificationStatus =
  | "unverified"
  | "basic_checked"
  | "evidence_reviewed"
  | "video_verified"
  | "document_verified"
  | "trusted_factory";

export type LeadStatus =
  | "new_lead"
  | "contact_attempted"
  | "interested"
  | "payment_help_needed"
  | "awaiting_customer"
  | "payment_link_sent"
  | "payment_completed"
  | "not_interested"
  | "closed";

export type MessageThreadStatus =
  | "open"
  | "pending_admin_review"
  | "waiting_for_importer"
  | "waiting_for_fms"
  | "translation_needed"
  | "approved_for_forwarding"
  | "closed";

export type MessageRiskFlag =
  | "none"
  | "contact_info_detected"
  | "payment_instruction_detected"
  | "factory_contact_detected"
  | "unapproved_direct_contact_attempt"
  | "sensitive_document_shared";

export type FileReviewStatus =
  | "pending_review"
  | "approved_internal"
  | "approved_importer_visible"
  | "approved_fms_visible"
  | "approved_factory_visible_future"
  | "needs_redaction"
  | "redacted"
  | "rejected"
  | "archived";

export type ActorRole = UserRole | "system";

export interface TimestampedRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface ImportProject extends TimestampedRecord {
  projectCode: string;
  importerId: string;
  packageId: string;
  paymentStatus: PaymentStatus;
  projectStatus: ProjectStatus;
  adminReviewStatus:
    | "not_started"
    | "in_review"
    | "needs_information"
    | "ready_for_fms_assignment"
    | "rejected";
  productName?: string | null;
  productDescription?: string | null;
  productLinks: string[];
  budgetRange?: string | null;
  quantity?: string | null;
  qualityLevel?: "normal" | "better" | "premium" | null;
  importExperience?:
    | "first_time"
    | "one_to_five_imports"
    | "experienced_importer"
    | null;
  selectedAddonIds: string[];
  paidAt?: string | null;
  adminReviewedAt?: string | null;
  readyForFmsAt?: string | null;
  metadata?: JsonValue;
}

export interface UnpaidLead extends TimestampedRecord {
  leadCode: string;
  importerId: string;
  draftProjectId?: string | null;
  packageId?: string | null;
  productSummary: string;
  paymentProblemReason:
    | "need_more_information"
    | "do_not_trust_online_payment"
    | "payment_failed"
    | "arranging_funds"
    | "wants_team_call"
    | "other";
  leadStatus: LeadStatus;
  assignedAgentId?: string | null;
  followUpDueAt?: string | null;
}

export interface Payment extends TimestampedRecord {
  projectId: string;
  invoiceId?: string | null;
  paymentStatus: PaymentStatus;
  amountPkr: number;
  method:
    | "bank_transfer"
    | "easypaisa"
    | "jazzcash"
    | "card_future"
    | "manual_placeholder";
  provider?: string | null;
  providerReference?: string | null;
  verifiedAt?: string | null;
}

export interface Invoice extends TimestampedRecord {
  invoiceCode: string;
  documentId: string;
  projectId: string;
  customerUserId: string;
  status:
    | "draft"
    | "pending"
    | "paid"
    | "refunded"
    | "partially_refunded"
    | "cancelled";
  issuedAt: string;
  dueAt?: string | null;
  paidAt?: string | null;
  subtotalPkr: number;
  discountPkr: number;
  taxPkr: number;
  totalPkr: number;
  paymentMethod?: string | null;
  transactionReference?: string | null;
}

export interface Refund extends TimestampedRecord {
  refundCode: string;
  projectId: string;
  invoiceId?: string | null;
  requestedBy: string;
  refundStatus: RefundStatus;
  reason: string;
  requestedAmountPkr?: number | null;
  approvedAmountPkr?: number | null;
  fmsAssignedAtRequest: boolean;
  milestoneReviewRequired: boolean;
  reassignmentOffered: boolean;
}

export interface FmsAssignment extends TimestampedRecord {
  assignmentCode: string;
  projectId: string;
  fmsId: string;
  assignedByAdminId: string;
  assignmentStatus: AssignmentStatus;
  tierSnapshot: "bronze" | "silver" | "gold";
  deadlineAt?: string | null;
  submittedForAdminReviewAt?: string | null;
  completedByAdminAt?: string | null;
}

export interface FactoryRecord extends TimestampedRecord {
  factoryCode: string;
  displayName: string;
  chineseLegalName?: string | null;
  category: string;
  mainProducts: string[];
  cityProvince: string;
  status: FactoryStatus;
  verificationStatus: VerificationStatus;
  trustScore?: number | null;
  submittedByFmsId?: string | null;
  sourceAssignmentId?: string | null;
  lastVerifiedAt?: string | null;
  riskFlags: string[];
  sensitiveContactRecordId?: string | null;
  metadata?: JsonValue;
}

export interface MessageThread extends TimestampedRecord {
  threadCode: string;
  projectId?: string | null;
  assignmentId?: string | null;
  threadType:
    | "importer_support"
    | "project_update"
    | "fms_internal"
    | "translation_review"
    | "factory_communication_future"
    | "refund_dispute";
  status: MessageThreadStatus;
  participantRoles: UserRole[];
  languagePair?: "ur_zh" | "en_zh" | "ur_en" | "multi" | null;
  translationAddonActive: boolean;
  latestMessageAt?: string | null;
}

export interface Message extends TimestampedRecord {
  threadId: string;
  senderUserId: string;
  senderRole: ActorRole;
  recipientRole: UserRole | "platform_team";
  originalLanguage: "ur" | "en" | "zh-CN" | "unknown";
  originalText: string;
  translatedText?: string | null;
  adminApprovedText?: string | null;
  reviewStatus:
    | "not_required"
    | "pending_admin_review"
    | "approved"
    | "edited_and_approved"
    | "rejected"
    | "needs_translation";
  riskFlags: MessageRiskFlag[];
  attachmentFileAssetIds: string[];
  sentAt: string;
}

export interface FileAsset extends TimestampedRecord {
  bucket:
    | "importer-uploads"
    | "fms-evidence"
    | "factory-evidence"
    | "message-attachments"
    | "invoice-documents"
    | "refund-evidence"
    | "training-assets"
    | "public-content";
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  sourceRole: ActorRole;
  projectId?: string | null;
  assignmentId?: string | null;
  factoryId?: string | null;
  messageId?: string | null;
  reviewStatus: FileReviewStatus;
  checksum?: string | null;
  metadata?: JsonValue;
}

export interface AuditLog extends TimestampedRecord {
  actorUserId?: string | null;
  actorRole: ActorRole;
  action: string;
  entityType:
    | "user"
    | "role_assignment"
    | "import_project"
    | "unpaid_lead"
    | "payment"
    | "invoice"
    | "refund"
    | "fms_assignment"
    | "factory"
    | "message"
    | "file_asset"
    | "settings"
    | "data_release";
  entityId: string;
  beforeData?: JsonValue | null;
  afterData?: JsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
