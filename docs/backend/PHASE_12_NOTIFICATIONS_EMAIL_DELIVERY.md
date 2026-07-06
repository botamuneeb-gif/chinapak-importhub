# Phase 12: Notifications & Email Delivery Foundation

## What Was Added

Phase 12 adds a provider-neutral notification foundation for ChinaPak ImportHub:

- `notifications` for in-app, email-ready, and system notification records.
- `notification_delivery_logs` for future provider delivery attempts.
- `notification_preferences` for per-user language/channel foundation and tray category preferences.
- Server-only notification helpers in `lib/notifications/`.
- Protected notification centers for importer, FMS, admin, super admin, and agent portals.
- A protected portal notification tray with unread count, latest alerts, refresh, mark-read actions, and tray category preferences.
- Workflow hooks for core operational events.

Email delivery is disabled by default. Local development records in-app notifications only.

## Tables Added

### `notifications`

Stores user/profile or role-targeted notifications.

Important fields:

- `recipient_profile_id`: direct recipient profile.
- `recipient_role`: role-level notification, such as `admin` or `super_admin`.
- `actor_profile_id`: profile that triggered the notification, when safe.
- `project_id`, `invoice_id`, `payment_id`, `refund_id`, `assignment_id`, `submission_id`: optional workflow links.
- `type`: event key, such as `project_submitted` or `factory_report_released`.
- `channel`: `in_app`, `email`, or `system`.
- `status`: `queued`, `delivered`, `read`, `failed`, or `skipped`.
- `priority`: `low`, `normal`, `high`, or `urgent`.
- `action_url`: role-safe route for the recipient.
- `metadata`: safe operational metadata only.

Do not store passwords, API keys, auth tokens, raw FMS submissions, factory contact details, or cross-role contact details.

### `notification_delivery_logs`

Stores provider attempt metadata. The current email adapter does not send real messages in default mode.

### `notification_preferences`

Foundation for:

- in-app enabled
- email enabled
- preferred language
- role defaults
- tray category filtering in `metadata.tray_hidden_categories`

Preferences are surfaced in the portal notification tray. They affect tray visibility only and do not delete notification records. System/security notifications are always shown and cannot be fully suppressed.

## Delivery Modes

Configured through `.env.local`:

```bash
EMAIL_DELIVERY_MODE=disabled
EMAIL_FROM_NAME=ChinaPak ImportHub
EMAIL_FROM_ADDRESS=no-reply@chinapakimporthub.com
RESEND_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

Modes:

- `disabled`: default. Creates notification records and skips email delivery.
- `log`: logs a safe email summary without secrets or message body dumping.
- `resend`: sends through the Resend API only when `EMAIL_DELIVERY_MODE=resend`, `RESEND_API_KEY`, sender env vars, and a recipient email are configured.
- `smtp`: provider-ready placeholder. Requires SMTP environment variables before future sending is activated.

Real email sending is not active in default/local mode.

## Template Strategy

Templates live in `lib/notifications/templates.ts`.

Pattern:

- Header
- Content
- Project/workflow summary
- CTA
- ChinaPak ImportHub signature
- Footer

Language intent:

- Importer-facing: Urdu-first where helpful with familiar English business words.
- FMS-facing: English with Chinese support where useful.
- Admin/Super Admin: English-first.

Templates must not include raw FMS notes, factory contact details, importer contact details, passwords, tokens, or payment credentials.

## FMS Application Decision Emails

Super Admin FMS application decisions use the email foundation for candidate-facing updates:

- Approval email: `Your ChinaPak ImportHub FMS application has been approved`
- Decline email: `Update on your ChinaPak ImportHub FMS application`
- More-info email: `More information needed for your ChinaPak ImportHub FMS application`

These emails are separate from the Supabase invite email. The Supabase invite/password setup email handles secure account activation when approval can create or link an FMS account. The decision email explains the decision, next steps, and platform boundaries.

Decision emails use a separate applicant-facing message field. Internal Super Admin notes are stored for admin/audit context and are never sent to the candidate.

If `EMAIL_DELIVERY_MODE=disabled`, the decision is still saved, an email notification/delivery-log record is written with skipped status, and Super Admin sees a warning to contact the candidate manually.

## Workflow Hooks

Notifications are created after successful workflow actions:

- importer project submitted
- invoice issued during project submission
- unpaid lead created
- manual payment submitted
- admin payment verified/rejected/needs more info
- admin project approved/needs info/rejected
- FMS assignment created
- FMS factory submission received
- admin factory submission approved/rejected/changes requested
- factory report released/withdrawn
- importer report feedback received
- admin feedback response
- FMS clarification requested
- refund requested
- refund approved/rejected/processed
- importer/FMS file evidence uploaded
- evidence released to importer
- super-admin password reset
- super-admin role/user-management security events
- Super Admin FMS application approve/decline/more-info decision emails

Notification writes are server-only and should not expose service-role credentials to client components.

## Visibility Rules

- Importer can read direct notifications for their own profile.
- FMS can read direct notifications for their own profile.
- Admin and super admin can read role-targeted operational notifications for active roles.
- Super admin can read role-targeted super-admin notifications.
- Agent can read direct/role notifications for active agent accounts.
- FMS notifications must not include importer name, phone, WhatsApp, email, address, or contact preference.
- Importer notifications must not include raw FMS submissions, factory contact details, WeChat, phone, email, bank/payment details, or admin-only notes.
- Action URLs must point to routes that the recipient role can already access.

Role-targeted notification read state is shared at the notification row level in this foundation. A future hardening phase should add per-recipient read receipts for multi-admin teams.

## Routes

- `/importer/notifications`
- `/fms/notifications`
- `/admin/notifications`
- `/super-admin/notifications`
- `/agent/notifications`

These routes are protected through existing role-aware portal guards.

## Portal Tray

Protected portals render a near-live notification tray in the portal header. It:

- polls every 45 seconds
- shows unread count
- shows latest scoped notifications
- supports manual refresh
- supports marking one or all notifications read
- links to the full notification center
- stores tray category preferences in `notification_preferences.metadata`

The tray is not rendered on public SEO pages or public login pages.

## Local Testing Steps

1. Keep `EMAIL_DELIVERY_MODE=disabled`.
2. Sign in as an importer and submit a project.
3. Confirm importer notifications show project/invoice notices.
4. Sign in as admin and confirm `/admin/notifications` shows the new project.
5. Submit a manual payment reference and confirm admin receives an alert.
6. Verify or reject payment as admin and confirm importer receives an update.
7. Assign an eligible project to FMS and confirm the FMS notification appears without importer contact details.
8. Submit a factory option as FMS and confirm admin receives an alert.
9. Release a sanitized report and confirm importer receives a report-ready notification.
10. Mark notifications read and verify unread count changes.
11. Toggle a non-critical tray category and confirm the tray filters without deleting records.
12. Confirm system/security notifications remain visible.

## Remaining Future Work

- Real Resend/SES/SMTP sending.
- Recipient email lookup and preference checks before email delivery.
- Per-user read receipts for role-level notifications.
- Full email unsubscribe/preference UI.
- WhatsApp/SMS integration.
- Supabase Realtime badge delivery if needed later.
- Admin notification filters by type/priority.
