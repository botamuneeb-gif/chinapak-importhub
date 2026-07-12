# Project Manager Role Workflow

## Purpose

`project_manager` is a limited internal operations role for monitoring and moving Import Projects through safe project-flow steps.

Display name: Project Manager.

Project Managers help keep projects organized, identify missing information, add internal operations notes, set safe workflow markers, and escalate restricted decisions to Admin. They are not Admins and do not receive full Admin privileges.

## Data Model

Migration `022_project_manager_role.sql` adds `project_manager` to the existing `public.user_role` enum.

The workflow uses existing tables:

- `user_profiles`
- `role_assignments`
- `import_projects`
- `import_project_requirements`
- `import_project_addons`
- `import_project_timeline_events`
- `import_project_internal_notes`
- `notifications`
- `audit_logs`

Safe Project Manager workflow state is stored in `import_projects.metadata.project_manager_workflow`.

Admin escalation state is stored in `import_projects.metadata.project_manager_escalation`.

No public Project Manager signup exists.

## Routes

Project Manager routes:

- `/project-manager`
- `/project-manager/login`
- `/project-manager/dashboard`
- `/project-manager/projects`
- `/project-manager/projects/[projectId]`
- `/project-manager/notifications`

`/project-manager` redirects to `/project-manager/dashboard`.

Protected Project Manager routes require an active `role_assignments.role = project_manager` row and an active base `user_profiles` row.

## Super Admin Account Setup

Super Admin can assign, revoke, convert, or repair `project_manager` role assignments from `/super-admin/role-controls`.

Rules:

- Public users cannot self-select Project Manager.
- Normal Admin cannot create or assign Project Managers.
- Last active `super_admin` protections remain unchanged.
- Project Manager cannot access `/super-admin/*` or role/user management.

## Allowed Permissions

Project Manager can:

- View project list.
- Search projects by Project ID, UUID, product, importer name, city, package, and status.
- View sanitized project details needed for operations.
- View importer requirements/product information.
- View package/add-on selections.
- View safe assignment status without FMS contact details.
- View read-only factory report progress/readiness labels.
- View internal timeline and Project Manager notes.
- Add internal operational notes.
- Set safe Project Manager workflow markers:
  - `manager_reviewing`
  - `needs_importer_info`
  - `ready_for_admin_review`
  - `waiting_internal_action`
  - `escalated_to_admin`
- Escalate a project to Admin with reason, urgency, and internal note.
- Receive Project Manager notifications.
- View `Projects Needing Follow-up` lifecycle alerts on the dashboard.

## Prohibited Actions

Project Manager cannot:

- Verify, reject, or request more information on payments.
- Mark payment as paid.
- Final approve or reject projects.
- Assign or reassign FMS.
- Approve or reject FMS factory submissions.
- Score factory options or edit Admin-only report notes.
- Release importer reports.
- Issue or approve refunds.
- Delete projects.
- Change package pricing or payment amounts.
- Manage users or roles.
- Access `/admin/*`, `/super-admin/*`, `/fms/*`, or `/agent/*` protected portals.
- Access service-role-sensitive user creation actions.

## Admin Escalation

The Project Manager detail page has an `Escalate to Admin` action.

It records:

- `project_manager_escalation.reason`
- `project_manager_escalation.urgency`
- `project_manager_escalation.note`
- `project_manager_escalation.escalated_at`
- `project_manager_escalation.escalated_by_project_manager_profile_id`
- `project_manager_escalation.status = open`

It also:

- Adds an internal timeline event.
- Sets the Project Manager workflow marker to `escalated_to_admin`.
- Creates an Admin notification linking to `/admin/projects/[projectCode]`.
- Writes an audit log.

## Lifecycle Alerts

Project Manager dashboard includes a lifecycle alert section powered by `lib/projects/project-lifecycle-alerts.ts`.

Project Manager-safe alerts include stuck importer information, stale project updates, open PM escalations, and restricted workflow actions that require Admin escalation.

When an alert points to a restricted action such as payment verification, FMS assignment, factory submission approval, report release, or refund handling, the Project Manager UI shows escalation guidance only. It does not show Admin-only mutation controls.

See `docs/backend/PROJECT_LIFECYCLE_AUTOMATION_AND_ALERTS.md` for thresholds, notification dedupe behavior, and cron readiness.

## Audit Logging

New Project Manager mutations write to `audit_logs` through `lib/audit/audit-log.ts`.

Logged Project Manager actions:

- `project_manager_internal_note_added`
- `project_manager_workflow_marker_updated`
- `project_manager_project_escalated`

Audit records include:

- actor user ID
- actor role
- action
- entity type/id
- safe before/after metadata
- project code
- actor profile ID
- `no_passwords_tokens_or_secrets_stored = true`

Audit records do not store passwords, tokens, invite links, service-role keys, or private secrets.

Existing high-risk Super Admin user/role actions continue to use their existing audit/security logging.

## Security Notes

- Project Manager server actions call `getProfileForAccessToken` and require active `project_manager`.
- Project Manager pages use the role-protected portal shell.
- Public marketing chrome is hidden on `/project-manager/*`.
- `robots.ts` disallows `/project-manager` routes.
- Project Manager notes/timeline events are internal and not visible to importer or FMS.
- FMS contact details, factory contact details, raw FMS submissions, payment controls, refunds, and report release controls are not exposed in the Project Manager portal.

## QA Checklist

- Super Admin can assign `project_manager` role to an existing user.
- Project Manager can log in at `/project-manager/login`.
- Project Manager routes open only for active Project Manager role.
- Project Manager cannot access `/admin`.
- Project Manager cannot access `/super-admin`.
- Project Manager cannot access `/fms`.
- Project Manager can view `/project-manager/projects`.
- Project Manager can search by Project ID.
- Project Manager can open `/project-manager/projects/[projectId]`.
- Project Manager can add an internal note.
- Project Manager can set a safe workflow marker.
- Project Manager can escalate to Admin.
- Admin receives escalation notification.
- Project Manager sees lifecycle follow-up alerts without Admin-only controls.
- Project Manager mutation actions create audit logs.
- No payment verification/FMS assignment/report release/refund/user-management controls are visible.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
