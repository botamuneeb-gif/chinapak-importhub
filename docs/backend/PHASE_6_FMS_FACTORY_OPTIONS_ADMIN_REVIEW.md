# Phase 6 FMS Factory Options + Admin Review

Status: FMS factory option submission and admin review queue are connected to Supabase.

This phase does not directly release factory options to importers from the FMS
submission review screen. Approved submissions feed the Phase 7 importer-safe
report builder on the admin project detail page. It does not implement
messaging, file uploads, real payments, invoices, refunds, FMS payouts, public
factory signup, or direct importer/FMS/factory contact exchange.

## What Is Connected

- FMS assignment detail page can submit factory options for the logged-in FMS user's own assignment.
- Contact/firewall validation blocks contact or payment details in importer-safe fields.
- FMS submissions are saved to admin review only.
- Admin review queue at `/admin/factory-submissions`.
- Admin review detail at `/admin/factory-submissions/[submissionId]`.
- Admin can approve, reject, or request revision.
- Admin approval can create or update a private internal factory database record.
- Admin approval now links to the Phase 7 importer-safe report release panel.
- Factory sensitive contact details are stored only in admin-only factory contact records when admin approves factory database linkage.

## Tables Read

- `user_profiles`
- `role_assignments`
- `fms_profiles`
- `admin_profiles`
- `import_projects`
- `import_project_requirements`
- `import_project_addons`
- `packages`
- `addons`
- `fms_assignments`
- `fms_assignment_milestones`
- `fms_factory_submissions`
- `fms_submission_evidence`
- `factories`

FMS assignment views still do not query `importer_profiles`.

## Tables Written

- `fms_factory_submissions`
- `fms_submission_evidence`
- `fms_assignments`
- `fms_assignment_milestones`
- `import_projects`
- `import_project_timeline_events`
- `import_project_status_history`
- `factories`
- `factory_sensitive_contacts`
- `factory_products`
- `factory_evidence`

No migration was required. Existing Phase 1 schema tables are used. `lib/supabase/types.ts` was extended to include already-existing tables used in this phase.

## Submission Status Flow

FMS submission:

- `fms_factory_submissions.submission_status = submitted_for_admin_review`
- `fms_factory_submissions.admin_review_status = in_review`
- `fms_assignments.assignment_status = submitted_for_admin_review`
- `import_projects.project_status = factory_options_submitted`

Admin approval:

- `fms_factory_submissions.submission_status = approved_by_admin`
- `fms_factory_submissions.admin_review_status = ready_for_fms_assignment`
- `fms_assignments.assignment_status = approved_by_admin`
- `import_projects.project_status = admin_quality_review`

Admin revision request:

- `fms_factory_submissions.submission_status = changes_requested`
- `fms_factory_submissions.admin_review_status = needs_information`
- `fms_assignments.assignment_status = changes_requested`
- `import_projects.project_status = fms_working`

Admin rejection:

- `fms_factory_submissions.submission_status = rejected`
- `fms_factory_submissions.admin_review_status = rejected`
- `fms_assignments.assignment_status = changes_requested`
- `import_projects.project_status = fms_working`

Importer-facing factory result release is handled by Phase 7 from
`/admin/projects/[projectId]#report-release`. Raw FMS submissions and private
factory contact details remain admin-only until admin explicitly releases a
sanitized report.

## Contact Firewall Rules

FMS importer-safe fields are scanned for:

- email addresses
- phone-like numbers
- WhatsApp
- WeChat / Weixin / 微信
- Telegram handles
- direct contact language
- bank/payment instructions

If these appear in importer-safe fields, submission is blocked with a validation error.

Admin-only factory contact fields are allowed because they are private and not importer-facing:

- contact person
- phone
- WeChat
- email
- website/Alibaba link
- exact address
- payment/bank notes

These values remain admin-only. They are never shown to importers in this phase.

## Factory Database Linkage

On admin approval, admin can choose whether to create/update the private factory database.

If enabled:

- An existing factory can be linked by `factory_code`.
- If no existing factory code is provided, a new private factory record is created.
- Factory record status becomes `active_internal_record`.
- Verification status becomes `evidence_reviewed`.
- Sensitive contact details are stored in `factory_sensitive_contacts`.
- Product notes are written to `factory_products`.
- Evidence notes are written to `factory_evidence` with `visibility_scope = admin_only`.
- `fms_factory_submissions.converted_factory_id` links the submission to the internal factory record.

Factory database remains private/admin-only.

## Security Notes

- FMS submission actions require active `fms` role and active `fms_profiles` row.
- FMS can submit only for assignments where `assigned_fms_user_id` matches the logged-in auth user.
- FMS cannot submit for another FMS assignment.
- FMS cannot see importer contact details.
- Admin review actions require active `admin` or `super_admin`.
- Importers cannot see raw FMS submissions.
- Factory contact details remain admin-only.
- Server actions verify roles before using the service-role Supabase client.
- The service-role key is never imported into client components.

## Manual Testing Steps

1. Login as admin or super admin.
2. Ensure a project is paid and admin-approved.
3. Assign the project to an active FMS.
4. Login as the assigned FMS.
5. Open `/fms/assignments/[assignmentId]`.
6. Submit a factory option using importer-safe fields.
7. Confirm contact details in importer-safe fields are blocked.
8. Confirm admin-only contact fields are accepted.
9. Open `/admin/factory-submissions`.
10. Confirm the submission appears in the review queue.
11. Open the submission detail page.
12. Approve with factory database update enabled.
13. Confirm `factories`, `factory_sensitive_contacts`, `factory_products`, and `factory_evidence` are written.
14. Confirm importer-facing pages do not show the raw submission.
15. Test request revision and rejection on separate submissions.
16. Confirm FMS can see only their own assignments and submissions.

## Still Placeholder / Future

- Admin redaction workflow
- Real file uploads and object storage
- Factory evidence file review
- Messaging between FMS and admin
- FMS payout calculation
- Importer factory comparison report
- Factory contact release by package/workflow
- Public factory signup
- Factory portal activation
- Audit/security hardening beyond timeline/status history
