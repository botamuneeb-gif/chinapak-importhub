# Phase 7: Importer Approved Factory Report

## Status

Phase 7 connects the first importer-facing release layer for admin-approved FMS factory submissions.

The implementation is intentionally narrow:

- Admins can build, save, release, update, and withdraw a sanitized factory report from a live Import Project.
- Importers can view only released reports for their own projects.
- Raw FMS submissions remain admin-only.
- Factory contact details remain admin-only.
- No direct importer-FMS or importer-factory communication is implemented.

No new migration was required in this phase. The released report payload is stored as a versioned `phase_7_factory_report` object inside `import_projects.metadata`. A future hardening phase may move reports into dedicated normalized tables if reporting, version history, or per-option release auditing needs to grow.

## Tables Read

- `import_projects`
- `import_project_requirements`
- `import_project_addons`
- `import_project_timeline_events`
- `import_project_status_history`
- `packages`
- `addons`
- `importer_profiles`
- `fms_assignments`
- `fms_factory_submissions`
- `user_profiles`
- `role_assignments`

## Tables Written

- `import_projects`
  - Stores `metadata.phase_7_factory_report`.
  - Sets `project_status = results_released_to_importer` when a report is released.
  - Sets project status back to `admin_quality_review` when a released report is withdrawn and the project was currently `results_released_to_importer`.

- `import_project_timeline_events`
  - Adds events for draft saved, report released, and report withdrawn.

- `import_project_status_history`
  - Records project status transitions caused by report release or withdrawal.

## Report Status Flow

The report object supports these statuses:

- `draft`
- `released_to_importer`
- `updated`
- `withdrawn`

Admin actions:

- Save Draft: stores sanitized report draft, not visible to importer.
- Release to Importer: validates contact firewall rules, stores the released report, updates project status to `results_released_to_importer`, and creates the timeline event “Admin released approved factory report to importer.”
- Release again after an existing release: stores status `updated`.
- Withdraw Report: changes report status to `withdrawn`; importer report pages no longer show it.

Importer report pages only return reports with status:

- `released_to_importer`
- `updated`

## Importer-Safe Fields

Importer-safe report options may include:

- Factory display label
- City/province
- Product category
- Main products
- Product match summary
- Estimated unit price and currency
- MOQ
- Sample availability
- Production lead time
- Packaging notes
- Customization/private label availability
- Quality/reliability summary
- Risk summary
- Admin recommendation
- Comparison notes

## Admin-Only Fields

These fields must not be included in importer reports:

- Factory phone
- Factory email
- WeChat
- WhatsApp
- Telegram
- Exact address
- Bank/payment details
- Raw FMS notes
- Admin-only internal notes
- Sensitive factory contact records
- Private factory database identifiers unless a future approved workflow allows it

The Phase 7 importer read actions do not return `internalReleaseNotes`, raw FMS submission metadata, or admin-only contact fields.

## Contact Firewall

Before saving or releasing importer-facing report content, the server action runs the existing contact firewall against all importer-facing fields.

The release is blocked if these are detected:

- Phone-like numbers
- Email addresses
- WhatsApp references
- WeChat references
- Telegram references
- Bank/payment instructions
- Direct contact language

Admin-only internal notes are not shown to importers, but admins should still avoid putting sensitive details into importer-facing summary, recommendation, comparison, or selected option fields.

## Package Visibility Rules

The admin release action enforces the current package option caps:

- Factory Discovery: up to 3 approved factory options
- Factory Match Plus: up to 5 approved factory options
- Import Partner: up to 10 approved factory options

The UI also shows package guidance in the report builder. More nuanced package release rules remain future work.

## Security Notes

- Only `admin` and `super_admin` roles can save, release, update, or withdraw reports.
- Importers can read only released reports where `import_projects.importer_user_id` matches their Supabase auth user ID.
- FMS users cannot release reports.
- FMS users cannot view importer report controls.
- Importer report views do not query or render raw FMS submissions.
- Service-role Supabase access remains server-only.

## Routes Connected

Admin:

- `/admin/projects/[projectId]`

Importer:

- `/importer/dashboard`
- `/importer/reports`
- `/importer/reports/[projectId]`

## Manual Testing Steps

1. Login as importer and submit an Import Project.
2. Login as admin or super admin.
3. Mark payment verified.
4. Approve admin review.
5. Assign an active FMS.
6. Login as FMS and submit a factory option.
7. Login as admin and approve the FMS submission.
8. Open `/admin/projects/[projectId]`.
9. In the Importer Factory Report panel, select approved submissions and safe visible fields.
10. Add importer-safe summary and admin recommendation.
11. Release the report.
12. Login as the importer and open `/importer/dashboard` or `/importer/reports`.
13. Confirm the released report is visible.
14. Confirm factory contact details, raw FMS notes, admin-only notes, phone, email, WeChat, WhatsApp, Telegram, and payment instructions are not visible.
15. Login as a different importer and confirm the report is not visible.
16. Login as FMS and confirm no importer report release controls are available.

## Remaining Placeholder/Future Work

- Dedicated normalized factory report tables.
- Full report version history UI.
- Importer acknowledgement or feedback workflow.
- Importer-facing file/evidence gallery from reviewed storage assets.
- Notifications or email/SMS when a report is released.
- Direct factory contact release, if ever allowed, through explicit future package workflow.
- PDF report export.
- More granular package-based field visibility rules.
