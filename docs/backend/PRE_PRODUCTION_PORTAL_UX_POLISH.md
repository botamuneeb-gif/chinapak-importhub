# Pre-Production Portal UX Polish

## What Changed

This pass tightened launch-readiness behavior without changing the business workflows or Supabase schema.

## Portal/Public Header Separation

The public marketing header/footer now render only on public pages and auth entry pages. Protected workspaces use the role-based portal shell only.

Public chrome remains visible on:

- `/`
- `/packages`
- `/learn/*`
- `/contact`
- `/verify/*`
- public SEO pages
- role login pages such as `/admin/login`, `/super-admin/login`, `/fms/login`, and `/agent/login`

Public chrome is hidden on protected portal/workflow pages:

- `/importer/*`
- `/admin/*` except `/admin/login`
- `/super-admin/*` except `/super-admin/login`
- protected `/fms/*` app routes
- protected `/agent/*` app routes
- `/invoices/*`, `/payments/*`, and `/refunds/*`

## Notification Tray

The portal shell now includes a notification tray in the top-right of protected portals:

- Importer
- FMS
- Admin
- Super Admin
- Agent

Tray behavior:

- Shows unread count.
- Shows latest scoped notifications.
- Polls every 45 seconds.
- Includes manual refresh.
- Allows marking one notification read.
- Allows marking all visible-role notifications read.
- Links to the role's full notifications page.
- Does not expose tokens, service-role data, raw FMS submissions, factory contacts, importer contacts, or admin-only notes.

Admin and Super Admin can see operational/security alerts from the tray without opening the full notifications page first.

## Notification Preferences

No migration was added. The existing `notification_preferences.metadata` JSON stores tray preferences:

- `tray_hidden_categories`

Categories:

- Projects
- Payments
- FMS submissions
- Reports
- Refunds
- Representatives
- System/security

System/security notifications are always shown in the tray and cannot be suppressed. Preferences affect tray visibility only. Notification records are not deleted when a user hides a category.

## Inline Action Feedback

Routine success/error messages now appear near the relevant action panel instead of only at the top of long pages.

Updated examples:

- FMS assignment progress and factory submission form.
- Admin project payment verification, admin review, FMS assignment, and report release panels.
- Admin factory submission review controls.
- Admin representative create/edit/status/code controls.
- Importer manual payment and refund forms.

Messages use an `aria-live` feedback component so the result is announced near the submitted action.

## FMS Assignment Closed State

FMS factory option submission is now state-consistent.

The new submission form is visible only while the assignment is open for sourcing submission:

- `assigned`
- `requirements_reviewed`
- `factory_researching`
- `changes_requested`

The form is hidden and replaced by a read-only notice when the assignment is:

- `submitted_for_admin_review`
- `approved_by_admin`
- `completed_by_admin`
- `cancelled`

Existing submitted options remain visible as read-only cards. The backend submit action uses the same open/closed rule.

## QA Checklist

1. Public pages show public header/footer.
2. `/admin`, `/super-admin/users`, `/super-admin/role-controls`, `/fms/assignments/[assignmentId]`, `/importer/dashboard`, and `/agent/dashboard` do not show public marketing nav.
3. Existing `/super-admin/users` and `/super-admin/role-controls` still work.
4. Notification tray appears in each protected portal shell.
5. Tray unread count loads and refreshes.
6. Mark one notification read from the tray.
7. Mark all read from the tray.
8. Hide a non-critical tray category and confirm system/security remains visible.
9. Admin and Super Admin can see latest notifications from the tray.
10. Submit FMS factory option and confirm success/error appears near the form.
11. Mark a project payment/review/report action and confirm feedback appears inside that action panel.
12. Create/update a representative and confirm feedback appears near the form/card.
13. Open a closed FMS assignment and confirm the submission form/button is hidden.
14. Confirm existing submitted factory options remain visible read-only.
15. Confirm wrong-role access remains blocked.
16. Run `npm run lint`, `npm run typecheck`, and `npm run build`.
