# Phase 3 Import Project Persistence

Status: importer project and unpaid lead persistence are connected to Supabase.

This phase connects the `/importer/start` wizard and safe admin read views only.
Payments, file uploads, messaging, invoices, refunds, FMS assignment, and factory
review behavior are still placeholders.

## What Is Connected

- Authenticated importer project submission from `/importer/start`.
- Authenticated importer unpaid lead saving from `/importer/start`.
- Admin live Import Project list at `/admin/projects`.
- Admin live Import Project detail at `/admin/projects/[projectId]`.
- Admin live unpaid lead list at `/admin/leads`.

## Tables Written

- `import_projects`
- `import_project_requirements`
- `import_project_addons`
- `import_project_status_history`
- `import_project_timeline_events`
- `unpaid_leads`

## Tables Read

- `packages`
- `addons`
- `importer_profiles`
- `import_projects`
- `import_project_requirements`
- `import_project_addons`
- `import_project_timeline_events`
- `unpaid_leads`

## Status Flow

Paid-intent Import Project submissions are saved as:

- `project_status`: `awaiting_payment`
- `payment_status`: `awaiting_payment`
- `admin_review_status`: `not_started`

This is intentional. The payment gateway is not connected, so no project is
marked paid and no FMS work can begin.

Unpaid lead submissions are saved as:

- `lead_status`: `new_lead`
- no `fms_assignments` row
- no active sourcing project

Unpaid leads are follow-up records only. They must not be assigned to an FMS.

## Security Notes

- Importer submission actions require a verified Supabase session and active
  `importer` role.
- Admin read actions require active `admin` or `super_admin` role.
- The browser client never receives or imports the service-role key.
- Server actions use the service-role client only after role verification.
- Operational tables remain RLS-deny-by-default from Phase 1. Phase 3 does not
  add broad public read policies.
- Admin pages load live operational data client-side after role verification so
  sensitive rows are not rendered into the initial public HTML.
- FMS pages were not changed and do not receive importer contact details.

## Still Placeholder / Future

- Real payment gateway integration
- Payment confirmation and `paid` status updates
- Admin review mutations
- FMS assignment creation
- File upload and object storage
- Messaging and translation workflows
- Invoice and refund generation
- Importer dashboard live project list
- Agent lead mutation workflows
- Factory review and factory data release workflows

## Manual Testing Steps

1. Ensure `.env.local` contains Supabase URL, anon key, and service-role key.
2. Login as an importer or create an importer through `/signup`.
3. Open `/importer/start`, complete the wizard, and choose
   `Pay & Start My Import Project`.
4. Confirm the success state shows a `CPH-...` Project ID.
5. Login as an admin or super admin.
6. Open `/admin/projects` and confirm the project appears as Awaiting Payment.
7. Open `/admin/projects/[projectId]` and confirm requirements, package,
   add-ons, importer profile, timeline, and disabled assignment controls load.
8. Return to `/importer/start`, complete the wizard, choose
   `Save My Project & Get Assistance`, select a payment reason, and save.
9. Confirm the success state shows a `LEAD-...` Lead ID.
10. Open `/admin/leads` and confirm the lead appears with the warning that it is
    not assignable to FMS.

## Next Phase Recommendation

Phase 4 should connect admin review mutations only after adding tested RLS or
server-side authorization rules for:

- marking needs information
- marking payment verified after payment integration
- starting admin review
- preparing FMS assignment only when payment and admin review requirements are met

Do not connect FMS assignment before payment verification is implemented.
