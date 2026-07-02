# Phase 5 FMS Assignment Workflow

Status: admin-to-FMS assignment creation and live FMS assignment viewing are connected to Supabase.

This phase does not implement real payment gateway webhooks, messaging, file uploads, invoices, refunds, factory option submissions, factory review mutations, importer-FMS chat, or factory contact release.

## What Is Connected

- Admin FMS directory at `/admin/fms`.
- Admin project detail FMS assignment panel.
- Assignment creation for eligible Import Projects.
- Duplicate active assignment prevention.
- FMS live dashboard at `/fms/dashboard`.
- FMS live assignment list at `/fms/assignments`.
- FMS live assignment workspace at `/fms/assignments/[assignmentId]`.
- FMS assignment progress updates for:
  - accept assignment
  - start factory research
- Timeline/status history writes for assignment creation and research start.

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
- `import_project_timeline_events`
- `import_project_status_history`

FMS live views intentionally do not query `importer_profiles`.

## Tables Written

- `fms_assignments`
- `fms_assignment_milestones`
- `import_projects`
- `import_project_timeline_events`
- `import_project_status_history`

No migration was required. The existing `prevent_invalid_fms_assignment` database trigger still blocks assignment writes unless the project is paid and admin review is ready.

## Assignment Eligibility Logic

An admin can assign an FMS only when all are true:

- acting user has active `admin` or `super_admin`
- project exists in `import_projects`
- `payment_status = paid`
- `admin_review_status = ready_for_fms_assignment`
- `project_status = ready_for_fms_assignment`
- project does not already have an active FMS assignment
- selected FMS profile has `status = active`
- selected FMS user has an active `fms` role assignment

Blocked states include:

- awaiting payment
- payment issue
- admin review not approved
- needs importer clarification
- cancelled/rejected/refunded/disputed project states
- unpaid leads
- inactive or suspended FMS profiles
- missing active FMS role assignment

Unpaid leads remain separate records and are never assignable to FMS.

## Statuses Used

Project statuses:

- Ready for assignment: `ready_for_fms_assignment`
- Assigned: `fms_assigned`
- FMS started research: `fms_working`

Assignment statuses:

- Assigned: `assigned`
- Accepted/requirements reviewed: `requirements_reviewed`
- In progress/factory researching: `factory_researching`

Factory option submission statuses remain future placeholders in this phase.

## FMS Privacy Firewall

FMS pages may show:

- assignment ID
- project ID
- product description
- product/category text
- quantity
- budget range
- quality requirements
- package level
- selected add-ons
- admin assignment notes intended for FMS
- deadline and priority
- assignment status

FMS pages must not show:

- importer name
- importer email
- importer phone or WhatsApp
- importer address
- importer contact preference
- direct personal identifiers
- factory contact details intended for admin-only review

All FMS assignment reads are scoped to the logged-in FMS user via `assigned_fms_user_id`.

## Manual Test FMS Account Setup

FMS signup remains invitation/admin-approved only. Do not enable public FMS self-registration.

For local/manual testing:

1. Create a Supabase Auth user with email/password.
2. Insert a `user_profiles` row linked to that Auth user.
3. Insert an active `role_assignments` row:
   - `role = fms`
   - `status = active`
4. Insert an active `fms_profiles` row:
   - `user_profile_id` matching the profile row
   - unique `fms_code`
   - `tier = bronze`, `silver`, or `gold`
   - `status = active`
   - optional `city_province`
   - optional `categories`
   - optional `quality_score`
   - optional `metadata.languages`
5. Login through `/fms/login`.

Do not create FMS users through public importer signup.

## Manual Testing Steps

1. Login as admin or super admin.
2. Open `/admin/fms`.
3. Confirm active FMS profiles appear as assignable, or setup guidance appears if none exist.
4. Create or open an Import Project that is not paid. Confirm assignment is blocked.
5. Mark payment verified but leave admin review unapproved. Confirm assignment is blocked.
6. Approve admin review so the project status is `ready_for_fms_assignment`.
7. Open the project detail page and select an active FMS.
8. Add deadline/priority/notes and click `Assign FMS`.
9. Confirm an `fms_assignments` row is created and project status becomes `fms_assigned`.
10. Confirm the project timeline includes `Project assigned to FMS`.
11. Try assigning again and confirm duplicate active assignment is blocked.
12. Login as the assigned FMS.
13. Open `/fms/dashboard` and `/fms/assignments`.
14. Confirm only the FMS user's own assignments appear.
15. Open the assignment detail page and confirm no importer contact fields are present.
16. Click `Accept Assignment`, then `Start Factory Research`.
17. Confirm assignment status changes and project status becomes `fms_working`.

## Still Placeholder / Future

- Public FMS signup
- FMS application/invitation code validation
- FMS reassignment workflow
- Factory option creation
- Factory evidence file uploads
- Factory submission admin review
- Messaging between FMS and admin
- FMS payout calculation and approval
- Importer-visible factory results
- Refund milestone evaluation after FMS assignment
