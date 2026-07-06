# Actionable Lead Management Workflow

## Purpose

Admin Leads are now operational records instead of read-only rows.

The workflow supports two launch lead types:

- `project_lead`: importer/project leads saved before payment
- `fms_application`: public FMS candidate applications from `/fms/apply`

No Supabase schema migration was added. The existing `unpaid_leads` table already has:

- `lead_status`
- `follow_up_status`
- `metadata`
- `draft_project_id`

Lead action notes are written to the existing `lead_followups` table. Flexible workflow state is stored in `unpaid_leads.metadata`.

## Lead Type Detection

FMS application leads are detected from metadata:

- `metadata.source = public_fms_application`
- `metadata.intended_role = fms`
- `metadata.lead_type = fms_application`
- lead code starts with `FMS-APP`

All other `unpaid_leads` records are treated as project/importer leads unless future metadata adds a different lead type.

## Workflow Statuses

The workflow uses these metadata values:

- `new`
- `in_review`
- `contacted`
- `qualified`
- `pending_more_info`
- `forwarded_to_super_admin`
- `super_admin_approved`
- `super_admin_declined`
- `approved_pending_account_setup`
- `admin_declined`
- `converted`
- `archived`

`lead_status` remains mapped to the closest existing enum value so existing lead pages and filters keep working.

Because `unpaid_leads` is shared storage, FMS application records may still carry generic `lead_status` or `follow_up_status` values internally. The Admin and Super Admin UIs do not show project/payment/customer labels for FMS applications. They map FMS workflow metadata into professional application labels:

- `new` or missing workflow: `New FMS Application`
- `in_review`: `Admin Screening`
- `pending_more_info`: `Pending Candidate Info`
- `forwarded_to_super_admin` or Super Admin status `pending`: `Pending Super Admin Review`
- Super Admin status `more_info_requested`: `More Info Requested by Super Admin`
- `approved_pending_account_setup`: `Approved - Account Setup Needed`
- `converted`: `FMS Profile Created`
- `admin_declined`: `Declined by Admin Screening`
- `super_admin_declined`: `Declined by Super Admin`

Project/importer leads keep the normal project lead labels such as contacted, qualified, awaiting customer, converted, and declined.

## Admin Responsibilities

Admin and Super Admin can use `/admin/leads`.

For FMS application leads, Admin can:

- mark in review
- mark pending more information
- decline at admin screening
- forward to Super Admin
- add internal notes

Admin cannot final-approve FMS users.

After an FMS application is forwarded, approved, converted, or declined, the Admin Leads card becomes read-only for normal screening actions. Converted FMS applications show `FMS profile created successfully` instead of a raw converted entity string.

For project leads, Admin can:

- mark contacted
- mark qualified
- mark pending more information
- decline
- convert to Import Project when required data exists
- add internal notes

Project lead conversion never bypasses payment verification or admin project review.

## Super Admin Responsibilities

Super Admin uses `/super-admin/fms-applications` for final FMS application review.

Super Admin can:

- approve FMS application
- decline FMS application
- request more information / send back to Admin
- add Super Admin notes

Only leads forwarded by Admin can be final-reviewed here.

Super Admin decisions keep two notes separate:

- Internal Super Admin note: stored for admin/audit context and never emailed to the applicant.
- Applicant-facing decision message: used in candidate decision emails. It is required for decline and more-info decisions and optional for approval.

Forwarded FMS leads are included in the Super Admin queue when any safe FMS signal is present:

- `metadata.source = public_fms_application`
- `metadata.intended_role = fms`
- lead code starts with `FMS-APP`
- product summary indicates an FMS application

The queue shows leads that have been forwarded or reviewed by Super Admin using either `metadata.workflow_status` or `metadata.super_admin_review_status`. Forward notifications open `/super-admin/fms-applications?lead=<leadId>&filter=pending` so the pending application is visible immediately.

## FMS Approval And Account Creation

When Super Admin approves a forwarded FMS application, the workflow attempts secure onboarding:

1. Check whether the application has an email.
2. Check `admin_user_directory` for duplicate email.
3. Block approval if the email already belongs to importer/admin/super_admin/agent roles.
4. If no account exists, call Supabase Admin Auth invite flow with no default password.
5. Create or update `user_profiles` with `primary_role = fms`.
6. Ensure active `role_assignments.role = fms`.
7. Create or update `fms_profiles` with active status, generated FMS code, categories, location, and metadata.
8. Mark the lead converted and link created account/profile IDs in metadata.

If invite email cannot be created safely, the lead is marked:

- `workflow_status = approved_pending_account_setup`

The UI explains that manual account setup is required. The system does not create or display weak/default passwords.

Approval also records and attempts a professional applicant decision email:

- Subject: `Your ChinaPak ImportHub FMS application has been approved`
- Explains that access is invite-based and public FMS signup is not enabled.
- Points the candidate to `/fms/login` and `/fms/academy`.
- Reminds the candidate that FMS does not contact importers directly, submits evidence for admin review, and cannot release factory contact details without admin approval.
- If Supabase invite email provides the secure setup path, the applicant is told to check their inbox. The platform does not invent or display default passwords.

Decline and more-info decisions also record applicant emails:

- Decline subject: `Update on your ChinaPak ImportHub FMS application`
- More-info subject: `More information needed for your ChinaPak ImportHub FMS application`
- Decline requires an applicant-facing reason and includes professional reapply guidance.
- More-info requires an applicant-facing request and asks the candidate to submit a new `/fms/apply` application with the extra details if no update route exists yet.

If `EMAIL_DELIVERY_MODE=disabled`, the decision still saves, a safe delivery attempt is logged, and Super Admin sees: `Decision saved, but email delivery is disabled. Please contact the candidate manually.`

## Project Lead Conversion

Admin can convert a project lead only when the lead has:

- `importer_profile_id`
- `importer_user_id`
- `package_id`

Conversion creates:

- `import_projects`
- `import_project_requirements`
- selected add-ons when metadata contains selected add-on codes
- invoice/payment placeholders through the existing invoice helper
- importer-visible timeline event

Converted projects remain:

- `payment_status = awaiting_payment`
- `project_status = awaiting_payment`
- `admin_review_status = not_started`

FMS work remains blocked until payment is verified and admin review approves the project.

## Notifications

Notifications are created when:

- Admin forwards an FMS lead to Super Admin
- Super Admin approves, declines, or requests more information on an FMS application
- Admin converts a project lead to Import Project
- Admin declines a project lead

Notifications never include passwords, service-role data, importer private contact data for FMS, or factory private contact data.

## Security Rules

- Public `/fms/apply` creates lead only.
- Public FMS signup remains disabled.
- Normal Admin cannot final-approve FMS users.
- Super Admin final approval is required for FMS account/profile setup.
- Service role stays server-only.
- FMS applicants cannot view admin notes or workflow metadata.
- Public users cannot access `/admin/leads` or `/super-admin/fms-applications`.
- Project lead conversion does not bypass payment or admin review gates.

## Duplicate Email Handling

If a forwarded FMS application email already belongs to a user with an active non-FMS role, Super Admin approval is blocked and manual review is required.

If the email belongs to an existing FMS-only account, the workflow can ensure the FMS role/profile is active and link the lead to that account.

## QA Checklist

- Submit `/fms/apply`; confirm only an `unpaid_leads` record is created.
- Open `/admin/leads`; confirm the FMS application is labeled.
- Mark FMS application in review.
- Forward FMS application to Super Admin.
- Open `/super-admin/fms-applications`; confirm the lead appears.
- Confirm normal Admin cannot access `/super-admin/fms-applications`.
- Approve an FMS application with an unused email; confirm no default password is created.
- If invite works, confirm `user_profiles`, active `role_assignments`, and active `fms_profiles` exist.
- If invite fails, confirm lead is `approved_pending_account_setup`.
- Decline an FMS application and confirm status updates.
- Mark project leads contacted/qualified/pending/declined.
- Convert a complete project lead and confirm payment remains awaiting verification.
- Confirm converted lead links to project in metadata.
