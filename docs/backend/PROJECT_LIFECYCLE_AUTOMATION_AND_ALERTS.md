# Project Lifecycle Automation And Alerts

## Purpose

Project lifecycle alerts help Admin and Project Manager users notice Import Projects that appear stuck in an operational stage.

This is an advisory automation layer only. It does not auto-approve payments, auto-approve projects, auto-assign FMS users, approve FMS submissions, issue refunds, or release importer reports.

## Thresholds

Thresholds are defined in `config/project-lifecycle.ts`:

| Stage | Default threshold |
|---|---:|
| Awaiting payment | 24 hours |
| Payment verification pending | 12 hours |
| Admin review pending | 12 hours |
| FMS assignment pending | 24 hours |
| FMS submission pending | 48 hours |
| Admin submission review pending | 24 hours |
| Report release pending | 24 hours |
| Importer information missing | 48 hours |
| Project Manager escalation open | 24 hours |
| No project update | 72 hours |

These values are intentionally centralized so launch operations can tune them without scattered magic numbers.

## Alert Types

`lib/projects/project-lifecycle-alerts.ts` produces sanitized lifecycle alert objects with:

- project ID and Project ID/code
- product title
- current stage
- alert type
- severity
- age in hours
- recommended action
- target roles
- related route
- safe metadata

Current alert types:

- `awaiting_payment_too_long`
- `payment_verification_stuck`
- `admin_review_stuck`
- `fms_assignment_needed`
- `fms_submission_overdue`
- `admin_submission_review_needed`
- `report_release_stuck`
- `importer_info_missing`
- `escalation_open_too_long`
- `project_no_recent_update`

## Severity Rules

High priority:

- payment verification stuck
- report release pending
- admin submission review pending too long
- Project Manager escalation open too long

Needs review:

- FMS assignment needed
- FMS submission overdue
- admin review pending
- importer information missing

Follow up:

- awaiting payment too long
- no recent project update

## Dashboard Surfaces

Admin dashboard now shows `Projects Needing Attention`.

Admin users can:

- view stuck project alerts
- open the relevant Admin route
- manually run the lifecycle alert scan

Project Manager dashboard now shows `Projects Needing Follow-up`.

Project Managers can:

- view only Project Manager-safe alert guidance
- open the Project Manager project page
- add notes, set safe workflow markers, or escalate to Admin

Project Managers do not receive Admin-only action buttons.

## Notification Generation

The scan function is `generateProjectLifecycleAlertNotifications()`.

It:

- detects current stuck-stage alerts
- creates in-app notifications for Admin and/or Project Manager roles
- dedupes notifications by:
  - project
  - alert type
  - target role
  - UTC date bucket
- writes a safe audit log that the scan ran
- adds an internal timeline event only when an alert is first created or severity changes

Example dedupe key:

```text
project_lifecycle_alert:<project_id>:<alert_type>:<role>:<YYYY-MM-DD>
```

Notifications are role-scoped and do not include importer private contact details, FMS contact details, raw FMS notes, factory private contacts, tokens, or storage paths.

## Manual Scan

The Admin dashboard has a manual `Run lifecycle alert scan` button.

Access:

- Admin
- Super Admin through Admin role-compatible access

The button is not available to Project Manager users.

## Cron Readiness

A cron-ready route exists:

```text
GET /api/cron/project-lifecycle-alerts
```

It requires:

```text
Authorization: Bearer <CRON_SECRET>
```

If `CRON_SECRET` is missing, the route returns a safe 503 response and normal builds still work.

Suggested Vercel cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/cron/project-lifecycle-alerts",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Add `CRON_SECRET` in Vercel environment variables before enabling a production cron job.

## Privacy And Security Boundaries

- The helper uses server-only Supabase admin access and returns sanitized operational alerts.
- No importer private contact details are exposed to FMS.
- No FMS contact details are exposed to importers.
- Project Manager alerts route only to `/project-manager/projects/[projectCode]`.
- Admin alerts route only to Admin-authorized pages.
- Cron output returns counts only, not project data.
- Alerts never change payment, project approval, FMS assignment, FMS submission approval, report release, or refund status.

## QA Checklist

- Admin dashboard shows `Projects Needing Attention`.
- Admin can run the lifecycle alert scan manually.
- Project Manager dashboard shows `Projects Needing Follow-up`.
- Project Manager alerts do not show Admin-only action buttons.
- Lifecycle alert notifications are not duplicated repeatedly in the same date bucket.
- Timeline events are added only for first alert or severity changes.
- Cron route rejects missing or incorrect `Authorization`.
- Cron route works with `Authorization: Bearer <CRON_SECRET>`.
- Admin/Super Admin guards remain unchanged.
- Project Manager cannot access `/admin` or `/super-admin`.
- FMS private data restrictions remain unchanged.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
