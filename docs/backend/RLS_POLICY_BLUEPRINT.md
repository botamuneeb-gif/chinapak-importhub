# RLS Policy Blueprint

Status: planning documentation only. This file is not a migration and does not enable Supabase RLS yet.

Source of truth: `AGENTS.md` and `docs/MDOM.md`.

This plan describes how future Supabase Row Level Security should protect ChinaPak ImportHub data. It should be implemented before any frontend route reads or writes live Supabase data.

## RLS Principles

- Enable RLS on all application tables by default.
- Deny by default; add explicit policies per role and action.
- Use helper functions such as `current_user_role()`, `has_role(role_name)`, and `is_admin_or_super_admin()` in migrations later.
- Avoid relying on frontend checks for sensitive data.
- Prefer role-safe views for redacted records, especially FMS project briefs and importer-facing factory results.
- Use `file_access_grants` for any private file visibility beyond the uploader/admin.
- Use `data_release_approvals` before exposing factory contact details or sensitive evidence.
- Keep service-role access limited to trusted server-side jobs only.

## Role Model

| Role | Intended access posture |
|---|---|
| `importer` | Own projects, own leads, approved project messages, approved files, own invoices/payments/refunds. |
| `fms` | Assigned project briefs only, assigned assignment work, own submissions/evidence/payouts/training. |
| `agent` | Assigned leads and allowed importer summary fields only. |
| `admin` | Operational data required for review, assignment, messaging, files, refunds, and support. |
| `super_admin` | Platform settings, security, audit, permissions, and all operational data. |
| `factory_future` | Hidden/future. Later, own claimed factory profile only after activation. |

## Required Helper Concepts For Future Migrations

- `auth.uid()` maps to `user_profiles.auth_user_id`.
- `current_profile_id()` returns `user_profiles.id`.
- `has_role(text)` checks active `role_assignments`.
- `is_importer_owner(importer_profile_id)` checks current user owns importer profile.
- `is_assigned_fms(project_id)` checks an active `fms_assignments` row for current FMS.
- `is_assigned_agent(lead_id)` checks an active `lead_agent_assignments` row.
- `has_file_grant(file_asset_id, scope)` checks `file_access_grants`.
- `has_data_release(entity_type, entity_id, release_type)` checks `data_release_approvals`.

## Importer Policies

Importer can:

- Select own `user_profiles`, `importer_profiles`, and active role rows.
- Select own `import_projects` where `importer_id` belongs to current user.
- Insert draft/import project intake records for self only.
- Select own `import_project_requirements`, selected `import_project_addons`, status history, and importer-visible timeline events.
- Select own `unpaid_leads` and lead follow-up summaries that are explicitly importer-visible.
- Select own `payments`, `payment_attempts` sanitized summaries, `manual_payment_requests`, `invoices`, `invoice_line_items`, `refunds`, and customer-visible `refund_decisions`.
- Select `message_threads` where participant role includes importer and project belongs to importer.
- Select only messages where `review_status = 'approved'` and recipient role includes importer.
- Insert messages to platform/admin/project team only, never directly to FMS.
- Select file assets only through approved `file_access_grants` or invoice document ownership.

Importer cannot:

- Select FMS contact details or private FMS profile data.
- Select importer-to-FMS direct threads because those must not exist.
- Select factory sensitive contacts.
- Select internal admin notes.
- Select raw FMS evidence unless admin has approved and granted access.
- Assign FMS, update project status beyond allowed importer actions, or approve files/messages.

## FMS Policies

FMS can:

- Select own `user_profiles`, `fms_profiles`, FMS academy progress, own quality score summaries, and own payouts.
- Select `fms_assignments` assigned to current FMS.
- Select redacted project brief data for assigned projects only, preferably through a view such as `fms_project_briefs`.
- Select assignment milestones for own assignments.
- Insert/update milestone progress where allowed by workflow, subject to admin review.
- Insert `fms_factory_submissions` for own assignments only.
- Insert `fms_submission_evidence` and `file_assets` in FMS evidence buckets for own assignments only.
- Select admin messages in FMS internal threads where current FMS is a participant.
- Insert messages to admin only.

FMS cannot:

- Select importer phone, WhatsApp, email, direct address, or personal identifiers beyond operational project requirements.
- Select importer profile rows directly except redacted fields exposed by role-safe views.
- Message importers directly.
- Select factory sensitive contact release approvals for importers.
- Mark projects complete alone.
- Select unpaid leads or receive lead assignments.
- Submit evidence for unassigned projects.

## Agent Policies

Agent can:

- Select own `agent_profiles`, training progress, representative verification status, and own commission summaries.
- Select `unpaid_leads` assigned through active `lead_agent_assignments`.
- Select allowed lead fields such as lead code, importer name, city, product summary, package selected, payment issue, follow-up status, and approved contact channel.
- Insert `lead_followups` for assigned leads.
- Select own `agent_leads` and own `agent_commissions`.

Agent cannot:

- View unassigned leads.
- View FMS assignments or factory sourcing work.
- Assign leads to self.
- Convert unpaid leads to paid projects without admin/payment verification.
- View private FMS or factory contact data.
- Collect or record unofficial payment instructions outside approved workflow.

## Admin Policies

Admin can:

- Select and manage operational records needed for project review, lead follow-up, FMS assignment, factory review, messaging, file review, refunds, invoices, and support.
- Insert/update `fms_assignments` only when project payment is completed and admin review status is ready.
- Review and approve FMS submissions/evidence before importer visibility.
- Manage `message_review_actions`, `message_risk_flags`, translations, and message forwarding.
- Manage factory database records and sensitive contact tables.
- Manage refunds and refund decisions according to policy.
- Grant file access and approve data releases.

Admin should be constrained from:

- Managing super admin profiles and critical platform settings unless explicitly permitted.
- Changing their own privilege level.
- Disabling audit/security logs.

## Super Admin Policies

Super admin can:

- Manage role assignments, admin/super-admin profiles, platform settings, pricing rules, payout rules, commission rules, security events, audit logs, and critical configuration.
- Perform emergency access and data correction subject to audit logging.
- Manage future factory portal activation flags.

Super admin safeguards:

- Critical changes should require 2FA and future two-person approval where practical.
- Every role/settings/security change must write to `audit_logs`.
- Direct production data exports should be logged in `access_logs`.

## Factory Future Policies

Factory future role is hidden until activation.

Future factory can:

- Select only its own claimed `factory_profiles_future` and linked factory profile fields approved for factory self-view.
- Submit profile update requests through admin review, not directly mutate trusted factory database fields.
- View platform messages only in future factory communication threads approved by admin.

Factory future cannot:

- View importer contact details.
- View other factory records.
- View internal factory trust scores/risk flags unless explicitly designed later.
- Publicly sign up without invitation/admin approval.

## Sensitive Factory Contact Rules

- `factory_sensitive_contacts` should be admin/super-admin only.
- Importers can see factory contact details only if a matching `data_release_approvals` row exists for the project, factory, release type, and role.
- FMS can collect admin-only factory contact details during assigned work but cannot release them to importers.
- Factory contact release should create an `audit_logs` row and optionally an `access_logs` row when viewed/downloaded.

## Messaging Firewall Rules

- No policy should allow importer-to-FMS direct thread creation.
- `message_threads` must enforce allowed participant role combinations:
  - importer <-> admin/platform team
  - fms <-> admin
  - admin internal
  - future factory <-> admin
- Importer can select only approved messages and approved attachments.
- FMS can select only admin/FMS internal messages and attachments for assigned work.
- Admin can review, edit, approve, reject, translate, and forward messages.
- Contact information detection events are admin-only.

## File Access Rules

- `file_assets` are private by default unless bucket is public content.
- Uploaders can see their own uploaded file metadata.
- Admin/super-admin can review all file assets.
- Importer access requires project ownership plus either invoice ownership, approved message attachment, or explicit `file_access_grants`.
- FMS access requires assignment ownership and role-appropriate file scope.
- Factory future access requires own claimed profile and explicit grant.
- FMS evidence, factory evidence, message attachments, and refund evidence require review status before cross-role release.

## Unpaid Lead Guardrails

- FMS role has no select/insert/update policy on unpaid lead tables.
- `fms_assignments` insert policy should require:
  - linked `import_projects.payment_status = 'paid'`
  - linked `import_projects.admin_review_status = 'ready_for_fms_assignment'`
  - project is not only an unpaid lead
- Converting an unpaid lead to a paid project must be admin/payment verified and logged.

## Refund Guardrails

- Importer can request refund for own project/invoice.
- Admin reviews refund eligibility.
- Before FMS assignment, full refund path can be approved according to refund rules.
- After FMS assignment, refund decision requires milestone review.
- Admin can record FMS reassignment offered before refund.
- Refund decisions and evidence must be audit logged.

## Audit And Security Policies

- Regular users cannot select raw `audit_logs`, `access_logs`, `security_events`, or `contact_info_detection_events`.
- Admin can select operational audit logs relevant to their permission group.
- Super admin can select/manage security and audit records.
- Insert-only audit logging should be handled by trusted server functions/triggers in future migrations.

## Policy Testing Checklist

Before connecting UI to Supabase, write tests or SQL fixtures that prove:

- Importer cannot read FMS profile/contact fields.
- FMS cannot read importer contact fields.
- FMS cannot read unassigned projects.
- FMS cannot read unpaid leads.
- Agent cannot read unassigned leads.
- Importer cannot read unapproved messages/files.
- Sensitive factory contacts are admin-only.
- File assets are invisible without explicit grant/review.
- Admin can perform operational review tasks.
- Super admin can manage settings and roles.
