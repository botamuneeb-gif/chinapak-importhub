# Launch QA Checklist

Run this checklist in staging before any production launch.

## Account Setup

- Create first Super Admin manually in Supabase.
- Create at least one Admin account.
- Create at least one test Importer through `/signup`.
- Create one active FMS account manually:
  - `auth.users`
  - `user_profiles`
  - active `role_assignments.role = fms`
  - active `fms_profiles`
- Create one test Agent account if agent portal testing is needed.
- Confirm public users cannot self-select admin, super admin, FMS, or agent roles.

## Public Website

- Homepage clearly explains ChinaPak ImportHub.
- `/packages` shows locked package prices and delivery windows.
- `/how-it-works`, `/trust-safety`, `/faq`, `/refund-policy`, `/privacy-policy`, `/terms` load publicly.
- SEO landing pages load publicly and have unique metadata.
- `/sitemap.xml` lists public pages only.
- `/robots.txt` disallows private portal and transaction routes.
- Urdu text uses proper RTL direction and readable Nastaliq-style font stack.
- Browser translation is not blocked globally.

## Importer Flow

- Importer can sign up with email/password fallback.
- Importer login redirects to importer portal.
- Importer can open `/importer/start`.
- Importer can submit paid-intent Import Project.
- Invoice is created for paid-intent project.
- Importer can save unpaid lead.
- Unpaid lead does not appear in FMS assignment queue.
- Importer dashboard shows useful empty states when no records exist.

## Admin Review And Manual Payment

- Admin can login through `/admin/login`.
- Admin can view live projects at `/admin/projects`.
- Admin can open project detail.
- Admin can mark payment verified.
- Admin can mark payment issue/rejected.
- Admin can approve project review.
- Project becomes ready for FMS assignment only when payment is paid and admin review is ready.
- Admin can mark needs information or reject project.
- Timeline/status history updates after each admin action.

## FMS Assignment

- `/admin/fms` shows active/assignable FMS accounts.
- Admin cannot assign unpaid or unapproved projects.
- Admin can assign a ready project to active FMS.
- Duplicate active assignment is blocked.
- FMS can login through `/fms/login`.
- FMS dashboard shows only own assignments.
- FMS assignment detail does not show importer phone, email, WhatsApp, address, or contact preference.

## Factory Submission And Report

- FMS can submit factory option for own assignment only.
- FMS cannot submit contact/payment data in importer-facing fields.
- Admin sees submission in `/admin/factory-submissions`.
- Admin can approve/reject/request revision.
- Admin can release sanitized factory report.
- Importer sees only own released report.
- Importer does not see raw FMS submission, factory contacts, admin-only notes, or FMS private details.
- Admin can withdraw report.

## Feedback And Clarifications

- Importer can submit feedback on own released report.
- Feedback requesting direct factory contact is blocked.
- Admin can view feedback in `/admin/report-feedback`.
- Admin can respond with importer-safe answer.
- Importer can see admin-approved response.
- FMS does not see importer direct message/contact data.

## Files And Evidence

- Importer can upload allowed product reference file type/size.
- Importer cannot access another importer's files.
- FMS can upload evidence for own assignment.
- FMS cannot upload evidence for another assignment.
- Admin can preview evidence through signed URL.
- Admin can release selected safe evidence to importer.
- Importer sees only released evidence.
- Unsafe file types are rejected.
- Supabase Storage buckets are private.

## Invoices, Payments, Refunds

- Importer can view only own invoices.
- Importer can submit manual payment reference.
- Admin can verify/reject/request info for manual payment.
- Payment verification updates invoice/payment/project status.
- Importer can request refund for own eligible invoice/project.
- Admin can approve, partially approve, reject, offer reassignment, and mark processed.
- FMS cannot access invoice, payment, or refund data.

## Documents And Print

- Importer invoice document renders.
- Importer payment confirmation document renders after verification.
- Importer refund document renders.
- Importer factory report document renders only sanitized report data.
- Admin project summary document renders.
- Print view hides portal navigation and uses A4-friendly layout.
- Factory contacts and raw FMS notes do not appear in importer documents.

## Notifications

- Importer project submission creates importer and admin notification.
- Manual payment submission creates admin notification.
- Admin payment verification creates importer notification.
- FMS assignment creates FMS notification without importer contact details.
- Report release creates importer notification.
- Feedback response creates importer notification.
- Refund decision creates importer notification.
- Mark as read works.
- `EMAIL_DELIVERY_MODE=disabled` does not send real emails and does not crash workflows.

## Super Admin

- Super Admin can open `/super-admin/users`.
- Admin cannot open `/super-admin/users`.
- Importer/FMS/agent cannot open `/super-admin/users`.
- Search by name, email, role, status, and FMS code works.
- Password reset works through Supabase Admin Auth only.
- Add/revoke/convert role actions work.
- Last active Super Admin cannot be removed.
- Suspended user cannot access protected portals.

## Mobile And Layout

Check at a narrow/mobile viewport:

- Homepage
- Packages
- Importer dashboard
- Importer start wizard
- Importer reports
- Invoices
- Payments
- Refunds
- FMS dashboard
- FMS assignment detail
- Admin projects
- Admin project detail
- Admin FMS directory
- Admin evidence
- Admin notifications
- Super Admin users

Acceptance:

- No major horizontal page overflow.
- Wide tables scroll inside their containers.
- Action buttons are reachable.
- Portal navigation remains usable.

## Final Pre-Launch Commands

```bash
npm run lint
npm run typecheck
npm run build
```

Do not launch if any command fails.
