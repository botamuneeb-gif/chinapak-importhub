# Daily Operations Digest And Internal Reminders

## Purpose

The daily operations digest gives Admin, Super Admin, and Project Manager users one internal summary of work needing attention each day.

This phase is internal only. It does not send public/importer/FMS emails, does not approve workflow actions, and does not change core project/payment/FMS/report rules.

## Digest Helper

Server-only helper:

```text
lib/operations/daily-operations-digest.ts
```

The helper collects:

- lifecycle alerts from `lib/projects/project-lifecycle-alerts.ts`
- high, medium, and low priority stuck-project items
- payment verification pending alerts
- admin review pending alerts
- FMS assignment needed alerts
- FMS submission overdue alerts
- admin FMS submission review alerts
- report release pending alerts
- importer information missing alerts
- Project Manager escalation alerts
- no recent project update alerts
- FMS applications needing Admin review
- FMS applications pending Super Admin final review

Digest content includes:

- date
- generated timestamp
- totals by alert type
- high/medium/low priority sections
- Project ID/code
- alert label
- age label
- recommended action
- role-specific action URL

Digest content intentionally excludes:

- importer private contact details
- FMS contact details
- factory private contact details
- invite links
- auth tokens
- service-role keys
- raw private metadata

## Role-Specific Views

Admin digest includes:

- payment verification pending
- admin project approval/review
- FMS assignment needed
- FMS submission review
- report release
- Project Manager escalations
- FMS applications needing Admin review

Project Manager digest includes:

- project follow-up alerts
- importer information missing
- no recent update
- escalation status
- restricted Admin actions as follow-up/escalation guidance only

Project Manager digest does not include Admin-only action buttons or links to Admin mutation panels.

Super Admin digest includes:

- high-level operations summary
- Admin-level stuck workflow summary
- FMS applications pending final Super Admin review

## In-App Notifications

When the digest runs, it creates role-targeted notifications:

- Admin: `Daily operations digest ready`
- Project Manager: `Project follow-up digest ready`
- Super Admin: `Platform operations digest ready`

Notification type:

```text
daily_operations_digest
```

Cron dedupe key:

```text
daily_operations_digest:<role>:<YYYY-MM-DD>
```

Manual sends use a manual metadata suffix so an Admin/Super Admin can intentionally resend the digest.

## Email Delivery

The digest sends internal email to active users with the matching role in `admin_user_directory`.

Email delivery uses the existing `deliverEmail()` provider abstraction:

- `EMAIL_DELIVERY_MODE=disabled`: workflow succeeds, delivery log records skipped email.
- `EMAIL_DELIVERY_MODE=log`: workflow succeeds and logs safely.
- `EMAIL_DELIVERY_MODE=resend`: sends through Resend.
- provider failure: workflow still saves notification/digest state and logs a safe failure.

Email delivery attempts are recorded in `notification_delivery_logs` and tied to the in-app digest notification.

## Cron Route

Protected cron route:

```text
GET /api/cron/daily-operations-digest
```

Required header:

```text
Authorization: Bearer <CRON_SECRET>
```

The route returns counts only:

- date
- notifications created/skipped
- email delivery counts

It does not expose digest item data publicly.

## Vercel Cron Schedule

`vercel.json` includes:

```json
{
  "crons": [
    {
      "path": "/api/cron/project-lifecycle-alerts",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/daily-operations-digest",
      "schedule": "0 4 * * *"
    }
  ]
}
```

The digest schedule is `04:00 UTC`, which is roughly `09:00` Pakistan Standard Time.

## Manual Send

Admin dashboard includes:

```text
Send daily operations digest now
```

Access:

- Admin
- Super Admin through Admin-compatible dashboard access

The manual send:

- creates role digest notifications
- sends internal role emails
- records delivery attempts
- writes an audit log
- shows inline success/failure near the action

Project Manager does not see this button.

## Audit Logging

Audit actions:

- `daily_operations_digest_cron_ran`
- `daily_operations_digest_sent_manually`

Audit metadata includes:

- date bucket
- mode
- generated timestamp
- notifications created/skipped
- email delivery counts

Audit logs do not store passwords, tokens, API keys, invite links, or private contact details.

## QA Checklist

- Daily digest helper generates Admin, Super Admin, and Project Manager digest data.
- Admin digest contains operational action links only for Admin-safe routes.
- Project Manager digest routes to Project Manager project pages, not Admin mutation panels.
- Super Admin digest includes FMS applications pending final review.
- In-app digest notifications dedupe by role/date for cron runs.
- Manual send creates an intentional manual resend record.
- Email disabled mode does not crash.
- Resend mode uses existing provider abstraction.
- Cron route rejects missing or incorrect `Authorization`.
- Cron route succeeds with `Authorization: Bearer <CRON_SECRET>`.
- Cron route returns counts only.
- No importer/FMS/factory private contact data is included.
- No public/importer/FMS emails are sent by this digest.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
