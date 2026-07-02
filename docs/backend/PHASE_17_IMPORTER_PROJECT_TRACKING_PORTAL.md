# Phase 17: Importer Project Tracking Portal

Status: importer project tracking pages are connected to existing Supabase data.

This phase closes the MVP gap where importers could submit a project but had no
proper project detail area unless a factory report had already been released.
No database schema changes, migrations, payment gateway integration, messaging,
or workflow rewrites were added.

## Routes Added

- `/importer/projects`
- `/importer/projects/[projectId]`

Both routes are protected importer portal routes and are marked noindex. The
route access matrix now documents the new importer-only boundary.

## What Importers Can See

The list page shows importer-owned projects only:

- Project ID
- Product title/category
- selected package
- project status
- payment status
- admin review status
- report status
- created and updated dates
- current friendly status and next action

The detail page shows importer-safe sections:

- Project summary and submitted requirements
- selected add-ons
- current status panel
- importer-visible timeline events
- invoice and manual payment links/statuses
- manual payment reference summaries submitted by the importer
- refund request/decision summaries intended for the importer
- released report links when available
- importer-owned uploaded files and admin-released files through the existing
  safe file panel
- next steps based on the current project state

## What Remains Hidden

Importer project tracking does not expose:

- raw FMS submissions
- FMS name/contact details
- importer-to-FMS direct communication
- factory private contact details
- admin internal notes
- unreleased factory reports
- private file storage paths
- admin audit/security records
- service-role data

Timeline events are filtered to `visible_to_importer = true`. File visibility is
handled by the Phase 9 file actions, which return only importer-owned uploads or
admin-released files.

## Tables Read

- `import_projects`
- `import_project_requirements`
- `import_project_addons`
- `import_project_timeline_events`
- `packages`
- `addons`
- `invoices`
- `manual_payment_requests`
- `refunds`
- `refund_decisions`
- `fms_assignments` for assignment-state detection only, without exposing FMS
  identity
- `file_assets` indirectly through the existing importer file panel

## Status Mapping

`lib/projects/importer-project-status.ts` converts internal statuses into
importer-facing labels and next steps.

Examples:

- `awaiting_payment` -> `Payment Required`
- submitted/under-review manual payment -> `Payment Submitted`
- `paid` plus admin review -> `Admin Review`
- `ready_for_fms_assignment` -> `Ready for FMS Assignment`
- `fms_assigned` -> `Factory Matching Started`
- `fms_working` -> `Factory Research In Progress`
- `factory_options_submitted` / `admin_quality_review` -> `Factory Options Under Review`
- released Phase 7 report -> `Factory Report Ready`
- refund/cancelled/disputed states -> clear blocked/refund labels

## Dashboard And Navigation Changes

Importer navigation now includes:

- Dashboard
- Start New Project
- My Projects
- Reports
- Invoices
- Payments
- Refunds
- Notifications
- Logout

The importer dashboard now shows a Recent Projects section before released
factory reports. The project-created success state in the importer wizard links
directly to the new project detail page.

## Security Rules

- The browser requests project tracking data with the current Supabase access
  token.
- Server actions verify an active importer role through `role_assignments`.
- Reads use the server/service client only after role verification.
- Project queries are scoped by `import_projects.importer_user_id`.
- Detail reads require both `project_code` and the logged-in importer's auth
  user ID.
- A different importer cannot load another importer's project by URL.
- FMS, admin, and super-admin routes are unchanged.

## Manual QA Checklist

1. Login as an importer.
2. Submit a paid-intent Import Project from `/importer/start`.
3. Confirm the success state includes `Track Project`.
4. Open `/importer/projects` and confirm the project appears.
5. Open `/importer/projects/[projectId]`.
6. Confirm project summary, payment status, admin review status, timeline,
   invoice links, report panel, refund panel, and files panel render.
7. Confirm unreleased reports show a waiting message.
8. Release a sanitized report as admin and confirm the detail page links to the
   report and report document.
9. Submit manual payment and confirm the project detail shows the reference
   without changing payment verification rules.
10. Submit/request refund and confirm the project detail shows importer-safe
    refund status.
11. Login as another importer and confirm the first importer's project detail is
    not accessible.
12. Confirm FMS pages still do not show importer contact details.

## Remaining Future Work

- A richer importer profile/settings page.
- More granular admin request-more-information workflow for project tracking.
- Real-time status updates or polling.
- Dedicated project activity filters.
- SEO-grade Urdu/English/Chinese localized portal copy once localization routes
  are introduced.
