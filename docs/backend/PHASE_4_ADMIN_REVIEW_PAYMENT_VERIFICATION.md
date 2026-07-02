# Phase 4 Admin Review + Manual Payment Verification

Status: admin-side manual payment verification and admin review controls are connected to Supabase.

This phase does not implement a payment gateway, FMS assignment, messaging, file uploads, invoices, refunds, or factory review mutations.

## What Is Connected

- Admin project detail payment verification controls.
- Admin project detail review controls.
- Readiness gate calculation for FMS assignment preparation.
- Admin project list filters for payment, review, and readiness queues.
- Timeline events for each payment/review action.
- Project status history when the high-level `project_status` changes.

## Tables Updated

- `import_projects`
  - `payment_status`
  - `project_status`
  - `admin_review_status`
  - `paid_at`
  - `admin_reviewed_at`
  - `ready_for_fms_at`
  - `updated_by`
  - `metadata`
- `import_project_timeline_events`
- `import_project_status_history`

No new migration was required. Existing Phase 1/Phase 3 columns and enums are used.

## Status Flow

Manual payment verification uses the existing payment enum:

- Awaiting payment: `payment_status = awaiting_payment`
- Payment verified: `payment_status = paid`
- Payment issue/rejected: `payment_status = failed`

Admin review uses the existing admin review enum:

- Review not started: `admin_review_status = not_started`
- In review: `admin_review_status = in_review`
- Needs information: `admin_review_status = needs_information`
- Approved for sourcing: `admin_review_status = ready_for_fms_assignment`
- Rejected: `admin_review_status = rejected`

The existing `admin_review_status = ready_for_fms_assignment` value is used as the closest available "admin approved" status. The actual project is only ready for FMS assignment when both gates are complete.

## Readiness Logic

`project_status = ready_for_fms_assignment` is set only when:

- `payment_status = paid`
- `admin_review_status = ready_for_fms_assignment`

Other derived project states:

- Payment not verified: `project_status = awaiting_payment`
- Payment verified but admin not approved: `project_status = admin_review`
- Admin needs information: `project_status = needs_importer_clarification`
- Admin rejected: `project_status = cancelled`

FMS assignment remains disabled in the UI. The assignment button is a next-phase placeholder and does not create any `fms_assignments` row.

## Security Notes

- Only users with active `admin` or `super_admin` roles can run payment/review actions.
- The browser client sends the current Supabase access token to server actions.
- Server actions verify the admin role before using the service-role Supabase client.
- The service-role key is never imported into client components.
- Importers cannot update payment or admin review statuses.
- FMS users still do not see importer contact details or admin project review controls.
- Unpaid leads remain separate follow-up records and are not assignable to FMS.

## Manual Testing Steps

1. Login as an admin or super admin.
2. Open `/admin/projects`.
3. Confirm the filter row shows counts for awaiting payment, payment verified, review status, and ready-for-FMS queues.
4. Open a project detail page.
5. Add a payment reference/note and click `Mark Payment Verified`.
6. Confirm `payment_status` becomes `paid`, `project_status` becomes `admin_review`, and a timeline event is added.
7. Add a review note and click `Approve Project`.
8. Confirm the readiness badge says `Ready for FMS Assignment` and `project_status` becomes `ready_for_fms_assignment`.
9. Confirm no FMS assignment is created and the assignment UI remains a placeholder.
10. Test `Mark Needs Information` and confirm `project_status` becomes `needs_importer_clarification`.
11. Test `Reject Project` and confirm `project_status` becomes `cancelled`.
12. Confirm unpaid leads in `/admin/leads` still show as not assignable to FMS.

## Still Placeholder / Future

- Real payment gateway verification
- Automatic payment webhooks
- Manual payment proof uploads
- FMS assignment creation
- FMS reassignment
- Importer-facing request-more-information workflow
- Messaging notifications
- Invoice generation
- Refund request and decision mutations
- Audit log hardening beyond timeline/status-history records
