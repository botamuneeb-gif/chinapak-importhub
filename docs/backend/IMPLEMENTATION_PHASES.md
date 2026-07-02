# Backend Implementation Phases

Status: planning documentation only. This file does not create migrations, Supabase clients, APIs, or live backend behavior.

Source of truth: `AGENTS.md` and `docs/MDOM.md`.

These phases are designed to let future Codex tasks implement Supabase safely without breaking ChinaPak ImportHub business rules.

## Phase 1: Schema And Static Seed Data

Goal: create the database foundation without connecting frontend behavior.

Scope:

- Create enums/check constraints for statuses.
- Create auth/profile shell tables.
- Create package, addon, refund rule, payout rule, and commission rule tables.
- Seed locked package pricing:
  - Factory Discovery: PKR 18,000
  - Factory Match Plus: PKR 35,000
  - Import Partner: PKR 75,000
- Seed locked add-on names and pricing ranges.
- Add indexes and foreign keys.
- Add `created_at`, `updated_at`, and actor columns.

Exit criteria:

- Migrations apply locally.
- Seed data is repeatable.
- No UI route reads live Supabase yet.

## Phase 2: Auth/Profile Setup

Goal: map Supabase auth users to role-safe application profiles.

Scope:

- Configure importer phone/OTP auth flow.
- Create `user_profiles` and role-specific profile creation paths.
- Implement `role_assignments`.
- Add invitation token model for FMS/agent/factory future.
- Add admin/super-admin internal account setup.
- Add initial RLS helper functions.

Exit criteria:

- Importer can create/access account through OTP in test environment.
- FMS/agent/factory cannot self-activate without invitation/admin approval.
- Admin and super-admin paths are separated.
- Role changes are audit logged.

## Phase 3: Importer Project Persistence

Goal: persist Import Project intake safely.

Scope:

- Persist `import_projects`, requirements, selected package, and add-ons.
- Generate human-readable project codes like `CPH-2026-0007`.
- Keep product input files in metadata or storage placeholders depending on phase.
- Add project status history and timeline events.
- Keep required fields validated server-side.

Exit criteria:

- Importer can create own draft/awaiting-payment project.
- Importer cannot edit another importer's project.
- No FMS assignment is possible yet.

## Phase 4: Admin Project Review

Goal: let admin review paid projects before FMS work starts.

Scope:

- Admin project list/review workflow.
- Admin review status transitions.
- Internal notes.
- Needs-info workflow.
- Ready-for-FMS-assignment state.

Exit criteria:

- Admin can mark a paid project ready for FMS assignment.
- Project must be paid and admin-reviewed before assignment.
- Internal notes are not visible to importer/FMS.

## Phase 5: Payments And Manual Leads

Goal: persist payment status, invoices, manual payment help, and unpaid lead follow-up.

Scope:

- Payment records and attempts.
- Manual payment support requests.
- Invoice records and line items.
- Unpaid lead save flow.
- Lead followups and agent assignment.

Exit criteria:

- Payment status is a server-side source of truth.
- Unpaid leads cannot be assigned to FMS.
- Agents can view only assigned leads.
- Manual payment requests do not trigger sourcing work.

## Phase 6: FMS Assignments And Submissions

Goal: allow approved FMSs to work only on assigned, paid, admin-reviewed projects.

Scope:

- FMS assignment creation by admin only.
- Redacted assignment/project brief view for FMS.
- Milestone checklist.
- Factory option submissions.
- FMS payout draft records.

Exit criteria:

- FMS sees only assigned project briefs.
- FMS cannot see importer contact details.
- FMS submissions are pending admin review by default.
- Admin can reassign FMS before refund when needed.

## Phase 7: File Storage And Review

Goal: implement private storage and file review.

Scope:

- Create storage buckets.
- Add file upload metadata.
- Add review status workflow.
- Add file access grants.
- Add redaction history.
- Add download/view access logging.

Exit criteria:

- FMS evidence cannot be seen by importer before admin approval.
- Factory evidence and sensitive contacts remain admin-controlled.
- Private files require signed access and explicit grants.

## Phase 8: Messaging

Goal: implement platform-controlled messaging without importer-FMS direct contact.

Scope:

- Message threads and messages.
- Admin review actions.
- Message risk flags.
- Message attachments.
- Importer-admin and FMS-admin thread policies.
- Translation placeholder fields.

Exit criteria:

- No importer-to-FMS direct thread can be created.
- Importer sees only approved messages.
- FMS messages admin only.
- Contact info detection events are admin-only.

## Phase 9: Factory Database

Goal: turn FMS submissions into internal private factory intelligence.

Scope:

- Factory master records.
- Sensitive factory contact table.
- Factory products/certifications/evidence.
- Verification history.
- Risk flags.
- Matching metadata.
- Future claim invitation shell.

Exit criteria:

- Factory database is internal/private.
- Factory contacts are admin-only unless release approval exists.
- Factory submissions require admin approval before becoming active records.

## Phase 10: Refunds And Invoices

Goal: complete financial document and refund workflows.

Scope:

- Refund request records.
- Refund decisions.
- Refund evidence files.
- Invoice QR/document ID fields.
- Payment/refund status reconciliation.
- Customer-visible refund summaries.

Exit criteria:

- Full refund before FMS assignment is supported.
- After FMS assignment, refund decision requires milestone review.
- FMS reassignment offer can be recorded before refund.
- Invoice records are professional and verifiable later.

## Phase 11: Agent Portal

Goal: persist representative verification, lead work, commissions, and compliance.

Scope:

- Representative verification records.
- Assigned lead access.
- Agent follow-up notes.
- Commission rules and ledger.
- Agent training progress.
- Compliance events.

Exit criteria:

- Public representative verification exposes approved fields only.
- Agents cannot see unassigned leads.
- Agent commissions depend on verified payment and accepted project review.
- Compliance restrictions are auditable.

## Phase 12: AI Translation

Goal: add controlled translation workflows for text, voice, documents, and future live calls.

Scope:

- Translation add-on order activation.
- Message translations.
- Document/voice/live session records.
- Admin/human review flags.
- Translation confidence/provider metadata.

Exit criteria:

- AI translation supports communication but does not bypass admin review.
- Legal contracts, technical specifications, certifications, and payment terms can require human/admin review.
- Translation outputs are tied to project/thread/file audit history.

## Phase 13: Audit/Security Hardening

Goal: make the backend production-safe before broader launch.

Scope:

- Audit logs.
- Access logs.
- Security events.
- Data release approvals.
- Contact info detection events.
- RLS policy tests.
- 2FA for admin/super-admin.
- Backup and retention policy.

Exit criteria:

- Sensitive data reads and releases are logged.
- RLS tests prove role isolation.
- Admin/super-admin actions are auditable.
- No service-role paths bypass business rules silently.

## Cross-Phase Rules

- Do not connect frontend routes to live Supabase tables before relevant RLS tests pass.
- Do not create FMS assignments before paid/admin-reviewed project workflow exists.
- Do not expose importer contact details to FMS in any phase.
- Do not expose FMS contact details to importer in any phase.
- Do not expose factory sensitive contacts without admin-approved release workflow.
- Do not activate public factory signup until founder explicitly approves future activation.
- Keep package/pricing/refund/payout/commission rules configurable.
