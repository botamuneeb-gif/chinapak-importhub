# Supabase/PostgreSQL Schema Blueprint

Status: planning documentation only. This file is not a migration and does not connect Supabase.

Source of truth: `AGENTS.md` and `docs/MDOM.md`.

This blueprint describes the future Supabase/PostgreSQL data model for ChinaPak ImportHub. It is intentionally table-oriented so future migration tasks can implement it in safe phases.

## Locked Data Principles

- Everything revolves around an Import Project ID.
- Importers never communicate directly with FMSs.
- FMSs never see importer contact details.
- Importers never see FMS contact details.
- Factory contact details are sensitive and admin-only unless released through approved workflow.
- Unpaid leads are not active sourcing projects and must not be assignable to FMS.
- No FMS work begins until payment is completed and admin review is done.
- Full refund is allowed before FMS assignment.
- After FMS assignment, refunds are admin-reviewed based on completed milestones.
- Admin may reassign an FMS before issuing a refund.
- Factory database is internal/private in Phase 1.
- Factory signup exists only as future/hidden/invitation-only.
- All files uploaded by FMS go to admin review before importer visibility.
- Messaging is platform-controlled and admin-reviewed where needed.
- AI translation add-on must support future text, voice, document, and live call workflows.

## 1. Naming Conventions

- Use `snake_case` table and column names.
- Use `uuid` primary keys by default.
- Use `auth.users.id` as the canonical Supabase user reference.
- Use human-readable codes for customer/admin display:
  - Import Project ID: `CPH-2026-0007`
  - Invoice ID: `INV-2026-0007`
  - Lead ID: `LEAD-2026-031`
  - Factory code: `FACT-BA-001`
  - Assignment ID: `FMSA-2026-014`
- Store `created_at`, `updated_at`, `created_by`, and `updated_by` where useful.
- Prefer status enums or check constraints for workflow states.
- Use separate tables for sensitive fields where access should be narrower than the parent record.
- Store money as integer minor units where possible, for example `amount_pkr` as whole PKR integer until decimal handling is required.
- Store file metadata in PostgreSQL, not binary file content.
- Store frequently changing business rules in settings/config tables, not hard-coded frontend logic.
- Add `metadata jsonb` only for flexible notes that should not replace first-class columns.

## Suggested Shared Columns

Most operational tables should include:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `created_by uuid references auth.users(id)`
- `updated_by uuid references auth.users(id)`
- `status text not null`
- `metadata jsonb not null default '{}'::jsonb` where useful

## 2. Core Auth/Profile Tables

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `user_profiles` | One public-safe profile shell per Supabase auth user. | `id`, `auth_user_id`, `display_name`, `primary_role`, `preferred_language`, `status`, `last_seen_at` | `auth_user_id` references `auth.users(id)`; one-to-many with `role_assignments`. | Do not store private phone/email here if different role policies need narrower access. | Add onboarding progress, locale settings, notification preferences. |
| `role_assignments` | Assign one or more platform roles to a user. | `id`, `user_id`, `role`, `status`, `assigned_by`, `assigned_at`, `revoked_at` | References `user_profiles.id`; `assigned_by` references admin user. | Role changes should be audit logged. | Supports multi-role users and temporary role grants. |
| `importer_profiles` | Importer business/customer profile. | `id`, `user_id`, `full_name`, `phone_whatsapp`, `city`, `business_type`, `verification_status`, `support_notes` | One-to-one with `user_profiles`; one-to-many with `import_projects` and `unpaid_leads`. | Importer contact details must never be visible to FMS. | Add KYC, business documents, repeat importer tier. |
| `fms_profiles` | Factory Match Specialist profile for approved China-based sourcing workers. | `id`, `user_id`, `fms_code`, `tier`, `city_province`, `categories`, `academy_status`, `quality_score`, `status` | One-to-one with `user_profiles`; one-to-many with `fms_assignments`. | FMS private contact details should not be visible to importers. | Add payout methods, capacity calendar, specialization history. |
| `agent_profiles` | Pakistani local representative profile. | `id`, `user_id`, `agent_code`, `city_market`, `status`, `training_status`, `allowed_activities` | One-to-one with `user_profiles`; one-to-many with lead assignments and commissions. | Public verification should expose only approved representative fields. | Add market coverage, compliance score, territory management. |
| `admin_profiles` | Operational admin profile. | `id`, `user_id`, `department`, `permission_group`, `status`, `two_factor_required` | One-to-one with `user_profiles`; referenced by review and approval tables. | Internal staff profile; never promoted in public navigation. | Add granular permission groups and shift coverage. |
| `super_admin_profiles` | Highest privilege platform control profile. | `id`, `user_id`, `security_level`, `emergency_contact_policy`, `status` | One-to-one with `user_profiles`; manages settings and security tables. | Highest risk role; require strict access logging. | Add break-glass approvals and hardware key requirements. |
| `factory_profiles_future` | Future hidden factory account/profile shell. | `id`, `user_id`, `factory_id`, `claim_status`, `invitation_id`, `status` | References `user_profiles` and `factories`. | Hidden until activation; factory can later see only its own claimed profile. | Enables factory portal, claims, factory self-updates after admin review. |

## 3. Import Project Tables

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `import_projects` | Master project record and central workflow anchor. | `id`, `project_code`, `importer_id`, `package_id`, `payment_status`, `project_status`, `admin_review_status`, `paid_at`, `admin_reviewed_at`, `ready_for_fms_at` | References `importer_profiles`, `packages`; parent to requirements, addons, payments, messages, files, assignments. | Importer contact stays in importer profile; FMS views must use redacted project brief. | Add category scoring, risk level, SLA timers, project health. |
| `import_project_requirements` | Product and sourcing requirements submitted by importer/admin. | `id`, `project_id`, `product_name`, `product_description`, `product_links`, `budget_range`, `quantity`, `quality_level`, `import_experience`, `special_notes`, `input_methods` | One-to-one or one-to-many with `import_projects`. | Product notes may contain accidental contact details; scan before FMS visibility. | Add structured HS/category fields and AI summary fields. |
| `import_project_addons` | Add-ons selected for a project. | `id`, `project_id`, `addon_id`, `status`, `price_snapshot_pkr`, `notes` | References `import_projects` and `addons`. | Translation add-ons may include sensitive message/file data. | Add usage counters and fulfillment state per add-on. |
| `import_project_status_history` | Immutable project status transition log. | `id`, `project_id`, `from_status`, `to_status`, `reason`, `changed_by`, `changed_at` | References `import_projects` and admin/user actor. | Admin/internal reasons may not be importer visible. | Supports audit, SLA reporting, dispute investigation. |
| `import_project_timeline_events` | User/admin timeline events shown by role. | `id`, `project_id`, `event_type`, `title`, `body`, `visible_to_importer`, `visible_to_fms`, `visible_to_agent`, `created_by` | References `import_projects`. | Visibility flags must be enforced by RLS/API, not frontend only. | Add localized timeline copy and system-generated events. |
| `import_project_internal_notes` | Admin-only project notes. | `id`, `project_id`, `author_admin_id`, `note_body`, `note_type`, `pinned` | References `import_projects` and `admin_profiles`. | Admin-only; never visible to importer/FMS/agent. | Add note mentions, tasks, escalation tags. |

## 4. Unpaid Lead Tables

Unpaid leads are not active sourcing projects. They must never be assigned to FMS.

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `unpaid_leads` | Saved project request where payment was not completed. | `id`, `lead_code`, `importer_id`, `draft_project_id`, `package_id`, `product_summary`, `payment_problem_reason`, `lead_status`, `follow_up_status` | References `importer_profiles`, optional draft `import_projects`, `packages`. | Importer contact visible only to admin and assigned agent. | Convert to paid project only after verified payment and admin review. |
| `lead_followups` | Follow-up attempts by admin or agent. | `id`, `lead_id`, `actor_user_id`, `channel`, `outcome`, `notes`, `next_follow_up_at` | References `unpaid_leads`. | Notes may include contact details; restrict to admin/assigned agent. | Add call recordings or WhatsApp logs later through file assets. |
| `lead_agent_assignments` | Assign unpaid leads to Pakistani agents. | `id`, `lead_id`, `agent_id`, `assigned_by_admin_id`, `status`, `assigned_at`, `released_at` | References `unpaid_leads` and `agent_profiles`. | Agent sees only assigned lead and allowed importer profile fields. | Add territory routing and assignment capacity rules. |

## 5. Package/Pricing/Settings Tables

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `packages` | Configurable package catalog. | `id`, `package_code`, `name`, `price_pkr`, `factory_option_count`, `delivery_days_min`, `delivery_days_max`, `is_recommended`, `status` | Referenced by projects, invoices, payout rules. | Public-safe fields can be exposed. | Add localization, versioning, seasonal pricing. |
| `package_features` | Package deliverables and comparison rows. | `id`, `package_id`, `feature_key`, `label`, `value`, `sort_order`, `visible_publicly` | References `packages`. | Public-safe unless feature is internal. | Add translated labels and feature groups. |
| `addons` | Optional services such as translation, background checks, tours. | `id`, `addon_code`, `name`, `price_type`, `price_min_pkr`, `price_max_pkr`, `status`, `requires_human_review` | Referenced by project add-ons, translation orders, invoices. | Some add-ons may process sensitive files/messages. | Add fulfillment workflows and usage limits. |
| `platform_settings` | Admin-configurable settings. | `id`, `setting_key`, `setting_value`, `value_type`, `environment`, `updated_by` | Managed by super admin/admin by permission. | Some settings may be security-sensitive; split or encrypt if needed. | Add approval workflow for critical setting changes. |
| `refund_rules` | Configurable refund policy rules. | `id`, `rule_code`, `applies_before_fms_assignment`, `applies_after_fms_assignment`, `description`, `status` | Referenced by refund decisions. | Public summary can differ from internal policy notes. | Add jurisdiction/versioned legal policy references. |
| `payout_rules` | FMS tier payout configuration. | `id`, `tier`, `package_id`, `min_payout_pkr`, `max_payout_pkr`, `quality_adjustment_rules`, `status` | References packages and FMS payouts. | Internal finance/admin only. | Add CNY conversion snapshots and bonus logic. |
| `agent_commission_rules` | Configurable agent commission rules. | `id`, `package_id`, `commission_type`, `amount_pkr`, `percentage_rate`, `status` | Referenced by `agent_commissions`. | Internal finance/admin and limited agent summary. | Add campaign-specific and territory-specific rules. |

## 6. Payment/Invoice/Refund Tables

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `payments` | Canonical payment record for project/invoice. | `id`, `project_id`, `invoice_id`, `payment_status`, `amount_pkr`, `method`, `provider`, `provider_reference`, `verified_at` | References `import_projects`, `invoices`. | Do not store raw card/bank secrets. | Add gateway reconciliation and webhooks later. |
| `payment_attempts` | Attempt-level payment events. | `id`, `payment_id`, `attempt_status`, `provider_response_code`, `failure_reason`, `attempted_at` | References `payments`. | Provider payloads may be sensitive; store sanitized response. | Add idempotency keys and fraud scoring. |
| `manual_payment_requests` | Help requests when online payment fails or user needs support. | `id`, `project_id`, `lead_id`, `requester_name`, `phone_whatsapp`, `city`, `preferred_method`, `problem_description`, `status` | References project or unpaid lead. | Contact details admin/assigned agent only. | Add upload proof and bank verification workflow. |
| `invoices` | Professional invoice/document record. | `id`, `invoice_code`, `document_id`, `project_id`, `customer_user_id`, `status`, `issued_at`, `due_at`, `paid_at`, `total_pkr` | References projects, users, line items, payments. | Customer details visible to importer/admin only. | Add QR verification, PDF generation, tax fields. |
| `invoice_line_items` | Invoice package/add-on lines. | `id`, `invoice_id`, `item_type`, `description`, `quantity`, `unit_price_pkr`, `total_pkr` | References `invoices`, optional package/addon IDs. | Public to invoice owner/admin. | Add discounts, taxes, versioned product names. |
| `refunds` | Refund request and lifecycle. | `id`, `refund_code`, `project_id`, `invoice_id`, `requested_by`, `refund_status`, `reason`, `requested_amount_pkr`, `approved_amount_pkr` | References projects, invoices, users. | Reason text may contain sensitive info; restrict by role. | Add SLA, payment reversal references, dispute tags. |
| `refund_decisions` | Admin decision record for refund. | `id`, `refund_id`, `decision`, `decision_by_admin_id`, `milestone_review_summary`, `reassignment_offered`, `decided_at` | References refunds/admin profiles. | Admin-only except approved customer-facing summary. | Add multi-admin approval for high-value refunds. |
| `refund_evidence` | Files/notes supporting refund review. | `id`, `refund_id`, `file_asset_id`, `evidence_type`, `visibility`, `notes` | References refunds and file assets. | May include payment/project evidence; explicit grants required. | Add redaction and external dispute export. |

## 7. FMS Assignment/Work Tables

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `fms_assignments` | Assignment of a paid, admin-reviewed project to an FMS. | `id`, `assignment_code`, `project_id`, `fms_id`, `assigned_by_admin_id`, `assignment_status`, `deadline_at`, `tier_snapshot` | References projects and FMS profiles. | Must only exist after payment complete and admin review. FMS brief excludes importer contact. | Add reassignment history and capacity rules. |
| `fms_assignment_milestones` | Milestone checklist and progress. | `id`, `assignment_id`, `milestone_key`, `status`, `completed_at`, `reviewed_by_admin_id` | References assignments. | Admin controls completion quality. | Add milestone payout weighting. |
| `fms_factory_submissions` | Factory option records submitted by FMS for admin review. | `id`, `assignment_id`, `submission_code`, `factory_display_name`, `city_province`, `category`, `submission_status`, `admin_review_status` | References assignments, may convert/link to `factories`. | Factory contact details must not be importer-visible from this table. | Add duplicate detection and comparison scoring. |
| `fms_submission_evidence` | Evidence files for an FMS factory submission. | `id`, `submission_id`, `file_asset_id`, `evidence_type`, `review_status`, `admin_notes` | References FMS submissions and file assets. | All FMS evidence requires admin review before importer visibility. | Add OCR/transcription and redaction. |
| `fms_payouts` | FMS earning/payout records. | `id`, `assignment_id`, `fms_id`, `payout_status`, `amount_pkr`, `amount_cny_estimate`, `approved_by_admin_id`, `scheduled_for` | References assignments and FMS profiles. | Finance/internal; FMS sees own payouts only. | Add payout provider and exchange rate snapshots. |
| `fms_quality_scores` | Quality scoring history for FMS. | `id`, `fms_id`, `assignment_id`, `score`, `score_reason`, `scored_by_admin_id` | References FMS and assignments. | Internal/admin and limited FMS summary. | Add automated performance metrics. |
| `fms_academy_progress` | FMS training/certification progress. | `id`, `fms_id`, `module_key`, `status`, `completed_at`, `certified_by_admin_id` | References FMS profiles. | Visible to FMS/admin. | Add quizzes, signed agreements, recertification. |

## 8. Factory Database Tables

Factory data is internal/private in Phase 1.

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `factories` | Internal factory master record. | `id`, `factory_code`, `display_name`, `chinese_legal_name`, `category`, `city_province`, `status`, `verification_status`, `trust_score`, `submitted_by_fms_id`, `last_verified_at` | Parent to products, contacts, evidence, metadata; may link to submissions. | Do not expose sensitive contacts from parent or child tables to importers by default. | Can become claimed factory profile later. |
| `factory_sensitive_contacts` | Admin-only factory contact/payment/address details. | `id`, `factory_id`, `contact_person`, `phone`, `wechat`, `email`, `website_url`, `exact_address`, `bank_payment_notes` | References factories. | Admin-only unless released by `data_release_approvals`. | Add field-level encryption and release scopes. |
| `factory_products` | Products and categories a factory can supply. | `id`, `factory_id`, `product_name`, `category`, `main_products`, `moq_range`, `price_range_notes`, `production_time_notes` | References factories. | Usually internal; importer release only after admin approval. | Add category taxonomy and HS codes. |
| `factory_certifications` | Certification/licensing metadata. | `id`, `factory_id`, `certification_name`, `issuer`, `valid_until`, `file_asset_id`, `review_status` | References factories and file assets. | Certificates require review before release. | Add document verification providers. |
| `factory_evidence` | Evidence files attached to factory record. | `id`, `factory_id`, `file_asset_id`, `evidence_type`, `review_status`, `visibility_scope` | References factories and file assets. | Admin-reviewed release only. | Add evidence expiry and re-verification needs. |
| `factory_verification_history` | Verification actions and status changes. | `id`, `factory_id`, `from_status`, `to_status`, `verified_by_admin_id`, `verification_method`, `notes`, `verified_at` | References factories/admins. | Internal notes admin-only. | Add external verification sources. |
| `factory_risk_flags` | Risk flags such as conflicting info or blacklist candidate. | `id`, `factory_id`, `risk_flag`, `severity`, `status`, `notes`, `flagged_by` | References factories. | Internal/admin only. | Add complaint links and automated risk scoring. |
| `factory_matching_metadata` | Structured matching signals. | `id`, `factory_id`, `best_fit_categories`, `suitable_budget_ranges`, `package_eligibility`, `reliability_score`, `recommended_for_small_importers` | References factories. | Internal matching intelligence. | Add AI matching vectors and analytics. |
| `factory_claim_invitations_future` | Future factory profile claim invitations. | `id`, `factory_id`, `invite_code`, `invited_contact`, `status`, `expires_at`, `accepted_by_user_id` | References factories and future factory users. | Hidden/future; admin-only until activation. | Enables factory portal activation. |

## 9. Messaging and Translation Tables

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `message_threads` | Project/support/admin-controlled messaging thread. | `id`, `thread_code`, `project_id`, `assignment_id`, `thread_type`, `status`, `language_pair`, `translation_addon_active` | References projects and optionally assignments. | Participants are by role; direct importer-FMS thread should not be allowed. | Add mobile app sync and SLA tracking. |
| `messages` | Individual messages in platform-controlled threads. | `id`, `thread_id`, `sender_user_id`, `sender_role`, `recipient_role`, `original_language`, `original_text`, `approved_text`, `review_status`, `sent_at` | References threads and users. | Scan for contact info. Importer sees approved messages only. FMS messages admin only. | Add voice transcripts and message templates. |
| `message_translations` | Translation drafts and approved translations. | `id`, `message_id`, `source_language`, `target_language`, `translated_text`, `translation_method`, `review_status`, `reviewed_by_admin_id` | References messages. | Legal/technical/payment terms may require human/admin review. | Add provider metadata and confidence score. |
| `message_attachments` | Files attached to messages. | `id`, `message_id`, `file_asset_id`, `review_status`, `visibility_scope` | References messages and file assets. | Attachments require review before cross-role visibility. | Add inline redaction and previews. |
| `message_review_actions` | Admin review actions on messages. | `id`, `message_id`, `action`, `admin_id`, `edited_text`, `reason`, `created_at` | References messages/admins. | Admin-only audit until approved customer-facing copy. | Supports moderation, forwarding, rejection. |
| `message_risk_flags` | Contact/payment/factory detail risk flags. | `id`, `message_id`, `risk_flag`, `detected_text_excerpt`, `detection_method`, `status`, `reviewed_by_admin_id` | References messages. | Excerpts may be sensitive; admin-only. | Add AI detection and false-positive tracking. |
| `translation_addon_orders` | Project add-on order for translation services. | `id`, `project_id`, `addon_id`, `translation_type`, `status`, `price_pkr`, `activated_at` | References projects and addons. | Translation content may be sensitive. | Add usage limits and per-file/session billing. |
| `translation_sessions_future` | Future live call/document/voice translation session records. | `id`, `project_id`, `thread_id`, `session_type`, `scheduled_at`, `status`, `review_required`, `summary` | References projects/threads. | Admin/human review for legal/payment/technical content. | Supports live factory call translation and voice note workflows. |

## 10. File/Media Storage Metadata

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `file_assets` | Metadata for all uploaded files stored in object storage. | `id`, `bucket`, `storage_path`, `original_filename`, `mime_type`, `size_bytes`, `uploaded_by`, `source_role`, `project_id`, `assignment_id`, `factory_id` | Referenced by evidence, messages, invoices, refunds. | No public access by default except public content bucket. | Add checksum, virus scan status, thumbnails. |
| `file_access_grants` | Explicit file visibility grants by role/user/project. | `id`, `file_asset_id`, `granted_to_role`, `granted_to_user_id`, `project_id`, `scope`, `expires_at`, `granted_by_admin_id` | References file assets and users. | Required for importer/FMS/factory access to private files. | Add signed URL request logging. |
| `file_review_status` | Review state for files before release. | `id`, `file_asset_id`, `review_status`, `reviewed_by_admin_id`, `review_notes`, `reviewed_at` | References file assets/admins. | FMS and factory evidence blocked until approved. | Add automated scanning and redaction queue. |
| `file_redaction_history` | History of redactions applied to files. | `id`, `file_asset_id`, `redacted_file_asset_id`, `redaction_reason`, `redacted_by_admin_id`, `created_at` | References original and redacted file assets. | Protect contact details and sensitive data before release. | Add visual redaction coordinates and OCR logs. |

## 11. Agent/Representative System

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `representative_verifications` | Public-safe representative verification records. | `id`, `agent_id`, `agent_code`, `public_name`, `city_market`, `status`, `allowed_activities`, `last_verified_at` | References agent profiles. | Expose only approved public fields. | Add QR verification and official contact display rules. |
| `agent_leads` | Agent lead/referral records. | `id`, `agent_id`, `lead_id`, `project_id`, `source`, `status`, `converted_at` | References agents, unpaid leads, projects. | Agent can see only assigned/owned records. | Add campaign attribution and territory analytics. |
| `agent_commissions` | Agent commission ledger. | `id`, `agent_id`, `project_id`, `commission_rule_id`, `status`, `amount_pkr`, `approved_by_admin_id`, `paid_at` | References agents, projects, commission rules. | Finance/internal; agent sees own commission summary. | Add payout provider and tax withholding. |
| `agent_training_progress` | Agent onboarding/training progress. | `id`, `agent_id`, `module_key`, `status`, `completed_at`, `certified_by_admin_id` | References agent profiles. | Visible to agent/admin. | Add quizzes and recertification. |
| `agent_compliance_events` | Compliance warnings/incidents for agents. | `id`, `agent_id`, `event_type`, `severity`, `description`, `action_taken`, `created_by_admin_id` | References agent profiles/admins. | Internal/admin only unless summary shared. | Add suspension automation and appeals. |

## 12. Audit/Security Tables

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `audit_logs` | Immutable audit trail for important actions. | `id`, `actor_user_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `before_data`, `after_data`, `ip_address`, `created_at` | References users where possible. | May include sensitive snapshots; restrict to admin/super admin. | Add append-only protections and export tools. |
| `access_logs` | Record reads/downloads of sensitive objects. | `id`, `user_id`, `role`, `resource_type`, `resource_id`, `access_type`, `ip_address`, `user_agent`, `created_at` | References users/resources by polymorphic IDs. | Security-sensitive; super admin/admin security only. | Add anomaly detection. |
| `security_events` | Authentication and account security events. | `id`, `user_id`, `event_type`, `severity`, `description`, `ip_address`, `created_at` | References users. | Security/admin only. | Add 2FA, lockout, impossible travel. |
| `data_release_approvals` | Approval record before releasing sensitive data across role boundaries. | `id`, `project_id`, `factory_id`, `file_asset_id`, `release_type`, `released_to_role`, `approved_by_admin_id`, `approved_at`, `expires_at` | References projects/factories/files/admins. | Core control for factory contact and file release. | Add two-person approvals for high-risk releases. |
| `contact_info_detection_events` | Detection events for phone/email/WhatsApp/WeChat/payment info. | `id`, `source_table`, `source_id`, `detected_type`, `detected_excerpt`, `status`, `reviewed_by_admin_id` | Links to messages/files/requirements via source fields. | Excerpts are sensitive; admin-only. | Add ML detection confidence and redaction tasks. |

## 13. SEO/Content Tables Future

| Table | Purpose | Key columns | Relationships | Sensitive data notes | Future expansion notes |
|---|---|---|---|---|---|
| `content_pages` | Future CMS-backed SEO/content pages. | `id`, `slug`, `audience`, `status`, `canonical_url`, `published_at`, `author_user_id` | References users for authors. | Public content only after publish workflow. | Add review workflow and scheduled publishing. |
| `content_translations` | Localized content versions. | `id`, `content_page_id`, `locale`, `title`, `meta_description`, `body_blocks`, `translation_status` | References content pages. | Public once approved. | Add human/AI translation review. |
| `content_categories` | Content grouping by audience/topic. | `id`, `category_key`, `audience`, `name`, `description`, `sort_order` | Referenced by content pages through join table later. | Public-safe. | Add tags and taxonomy redirects. |
| `content_redirects` | SEO-safe redirects for changed URLs. | `id`, `from_path`, `to_path`, `status_code`, `reason`, `active` | Independent or references content pages. | Public-safe. | Add redirect import/export and analytics. |

## Implementation Notes For Future Migrations

- Start with auth/profile, packages, add-ons, project, payment, and lead primitives.
- Add RLS before connecting any UI to Supabase.
- Create database views for role-specific redaction, for example `fms_project_briefs` without importer contact data.
- Use database constraints/triggers to prevent FMS assignment unless project is paid and admin-reviewed.
- Use explicit release tables for sensitive file/factory contact visibility.
- Keep all status enums versioned and documented before live migration work.
