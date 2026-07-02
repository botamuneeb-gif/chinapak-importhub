# Phase 8: Importer Feedback + Admin-Controlled Clarifications

## Status

Phase 8 connects importer feedback on released factory reports and admin-controlled clarification handling.

The implementation preserves the platform firewall:

- Importers can ask questions only after a sanitized report is released.
- Importers do not contact FMSs directly.
- Importers do not contact factories directly through this workflow.
- Admin reviews all feedback first.
- Admin responses are the only importer-visible answers.
- FMS clarification is recorded as a sanitized admin request; full FMS response UI remains future work.

## Migration Added

`supabase/migrations/014_report_feedback_clarifications.sql`

This migration creates:

- `report_feedback`
- `report_feedback_responses`

Both tables have RLS enabled. Current frontend/server actions use the service-role Supabase client only after explicit role checks, following the existing operational-data pattern.

## Tables Read

- `import_projects`
- `importer_profiles`
- `packages`
- `report_feedback`
- `report_feedback_responses`
- `fms_assignments`
- `user_profiles`
- `role_assignments`

## Tables Written

- `report_feedback`
- `report_feedback_responses`
- `import_project_timeline_events`
- `import_project_status_history`
- `import_projects`

When an importer submits feedback, the project status may move to:

- `importer_feedback_requested`

This status already existed in the Phase 1 enum.

## Feedback Type Flow

Importer feedback types:

- `question_about_option`
- `request_better_price`
- `request_more_factories`
- `request_sample_guidance`
- `request_shipping_guidance`
- `not_satisfied`
- `ready_for_next_step`
- `other`

## Feedback Status Flow

Feedback statuses:

- `new`
- `in_review`
- `answered`
- `routed_to_fms`
- `closed`
- `rejected_or_not_applicable`

Typical flow:

1. Importer submits feedback.
2. Feedback is saved as `new`.
3. Admin reviews it in `/admin/report-feedback` or the project detail page.
4. Admin may mark it `in_review`.
5. Admin may respond safely and mark it `answered`.
6. Admin may record a sanitized FMS clarification request and mark it `routed_to_fms`.
7. Admin may close or reject/not-apply the feedback.

## Importer Visibility

Importer can:

- Submit feedback only on their own released report.
- Read their own feedback for that project.
- See admin-approved responses.
- See status labels for their feedback items.

Importer cannot:

- See feedback from other importers.
- See raw FMS submissions.
- See admin-only notes.
- See FMS contact details.
- See factory contact details.
- Receive direct FMS/factory messages.

## Admin Visibility

Admin and Super Admin can:

- View all report feedback.
- See importer profile summary needed for operations.
- Respond to importer with importer-safe text.
- Add internal notes.
- Close or reject feedback.
- Record a sanitized FMS clarification request.

Admin responses are scanned by the contact firewall before becoming importer-visible.

## FMS Visibility

Phase 8 records optional sanitized FMS clarification requests in:

- `report_feedback.fms_clarification_request`
- `report_feedback.routed_to_assignment_id`
- `report_feedback_responses` with `response_type = fms_clarification_request`

The full FMS clarification inbox/reply workflow is not implemented yet.

Important rule for future implementation:

- FMS may see only sanitized admin-written sourcing questions.
- FMS must not see importer name, phone, email, WhatsApp, address, direct message, or personal contact details.

## Contact Firewall Rules

Importer feedback is blocked if it includes:

- Phone-like numbers
- Email addresses
- WhatsApp
- WeChat
- Telegram
- Bank/payment instructions
- Direct contact language
- Requests to share factory phone/email/WeChat/WhatsApp/address/contact details

Admin importer-visible responses are blocked if they include contact/payment details.

Admin FMS clarification requests are also scanned before being recorded.

## Routes Connected

Importer:

- `/importer/reports/[projectId]`

Admin:

- `/admin/report-feedback`
- `/admin/projects/[projectId]#report-feedback`

## Manual Testing Steps

1. Complete Phase 7 flow so a project has a released importer factory report.
2. Login as the importer who owns the project.
3. Open `/importer/reports/[projectId]`.
4. Submit feedback with a normal question.
5. Confirm the feedback appears in the previous feedback list.
6. Try feedback requesting direct factory contact details and confirm it is blocked.
7. Login as admin or super admin.
8. Open `/admin/report-feedback` and confirm the feedback appears.
9. Open the linked project detail and go to the Report Feedback section.
10. Write an importer-safe response and mark it answered.
11. Login as the importer and confirm the admin response is visible.
12. In admin, test marking feedback in review, closed, and rejected/not applicable.
13. Test FMS clarification request with sanitized text.
14. Confirm no importer contact details are shown to FMS pages.

## Remaining Placeholder/Future Work

- Full FMS clarification inbox and FMS reply workflow.
- Real-time messaging.
- Email/SMS notifications.
- File attachments for feedback.
- Feedback SLA/assignment queues.
- Feedback analytics.
- Automated translation of importer feedback.
- Rich threaded messaging app integration.
- Audit log hardening beyond timeline/status-history and feedback response rows.
