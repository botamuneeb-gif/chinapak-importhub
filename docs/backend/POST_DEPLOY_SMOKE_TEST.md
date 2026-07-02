# Post-Deploy Smoke Test

Run this checklist after every Vercel preview or production deployment.

Use test accounts only. Do not enter real customer payment data, real supplier contact details, production secrets, or private representative contact details into public pages.

## 1. Public Page Smoke Test

Open:

- `/`
- `/packages`
- `/contact`
- `/verify`
- `/verify/representative`
- `/how-it-works`
- `/trust-safety`
- `/refund-policy`
- `/privacy-policy`
- `/terms`
- `/sitemap.xml`
- `/robots.txt`

Expected:

- Pages load without login.
- Urdu text remains readable and RTL where expected.
- Public CTAs route to `/importer/start`, `/signup`, `/login`, `/packages`, `/verify`, or `/verify/representative`.
- No private project, invoice, report, user, FMS assignment, evidence, or notification data appears.
- Sitemap lists public pages only.
- Robots disallow private areas such as `/admin`, `/super-admin`, `/importer`, `/fms/dashboard`, `/invoices`, `/payments`, `/refunds`, `/files`, and `/api`.

## 2. Auth Page Smoke Test

Open:

- `/signup`
- `/login`
- `/admin/login`
- `/super-admin/login`
- `/fms/login`
- `/agent/login`

Expected:

- Forms render without runtime errors.
- Importer signup/login remains importer-first.
- Admin, super admin, FMS, and agent logins remain role-gated.
- Phone OTP still clearly indicates future/SMS-provider activation where applicable.
- Factory signup/login remain future/invitation-only.

## 3. Representative Verification Smoke Test

Before testing an active code:

1. Login as admin or super admin.
2. Open `/admin/representatives`.
3. Create a test representative.
4. Copy the generated `CPIH-REP-XXXXX` code.

Public tests:

1. Open `/verify/representative` while logged out or in a private browser session.
2. Enter a random invalid code.
3. Confirm the page shows a safe invalid result and no private details.
4. Enter the active test representative code.
5. Confirm the page shows only:
   - display name
   - city/province/service area
   - role title
   - active status
   - public notes
   - verification timestamp
6. Suspend the representative in admin.
7. Recheck the code publicly.
8. Confirm suspended/revoked status does not show an active verified result.

Expected:

- No private phone, email, CNIC, address, bank/payment detail, auth user id, agent profile id, or internal note appears publicly.
- Attempt history appears in admin after public checks.

## 4. Protected Route Guard Test

While logged out, open:

- `/importer/dashboard`
- `/importer/start`
- `/admin`
- `/admin/projects`
- `/admin/representatives`
- `/super-admin`
- `/super-admin/users`
- `/fms/dashboard`
- `/fms/assignments`
- `/agent/dashboard`
- `/invoices`
- `/payments`
- `/refunds`

Expected:

- Routes require login or show protected portal checks.
- Wrong-role accounts are denied.
- Public routes remain accessible.

## 5. Role Login Tests

Use prepared test accounts only.

Importer:

- Login at `/login`.
- Confirm redirect to importer dashboard or intended importer route.
- Confirm `/admin`, `/fms/dashboard`, `/agent/dashboard`, and `/super-admin` are blocked.

Admin:

- Login at `/admin/login`.
- Confirm `/admin`, `/admin/projects`, `/admin/payments`, `/admin/refunds`, `/admin/fms`, `/admin/representatives`, `/admin/factory-submissions`, `/admin/evidence`, `/admin/report-feedback`, and `/admin/notifications` load.
- Confirm `/super-admin/users` is blocked for normal admin.

Super Admin:

- Login at `/super-admin/login`.
- Confirm `/super-admin/users` loads.
- Confirm password reset and role controls are visible only to super admin.

FMS:

- Login at `/fms/login`.
- Confirm `/fms/dashboard` and `/fms/assignments` load.
- Confirm importer contact details are not visible.
- Confirm `/admin` and `/super-admin` are blocked.

Agent:

- Login at `/agent/login`.
- Confirm `/agent/dashboard`, `/agent/leads`, `/agent/commissions`, and `/agent/training` load.
- Confirm admin/FMS/super-admin routes are blocked.

## 6. Complete Staging Transaction Flow

After test accounts are created:

1. Importer signs up or logs in.
2. Importer submits a paid-intent Import Project at `/importer/start`.
3. Confirm an invoice is created.
4. Importer submits manual payment reference.
5. Admin opens `/admin/payments` and verifies payment.
6. Admin opens `/admin/projects/[projectId]` and approves admin review.
7. Admin assigns an active FMS.
8. FMS logs in and opens `/fms/assignments/[assignmentId]`.
9. FMS submits a factory option for admin review.
10. Admin opens `/admin/factory-submissions` and approves or requests revision.
11. Admin builds/releases a sanitized importer factory report.
12. Importer opens `/importer/reports/[projectId]`.
13. Importer submits report feedback.
14. Admin responds from `/admin/report-feedback`.
15. Importer checks feedback response.
16. Importer opens invoice/payment/refund document views as applicable.
17. Admin checks `/admin/notifications`.
18. Importer checks `/importer/notifications`.

Expected:

- No direct importer-FMS communication appears.
- FMS never sees importer phone, email, WhatsApp, address, or contact preference.
- Importer never sees raw FMS submissions, FMS contact details, or factory private contact details.
- Manual payment remains manual/offline.
- Email delivery remains disabled.
- File/evidence access uses private/signed access paths where configured.

## 7. Visual And Browser Checks

Check desktop and mobile widths for:

- homepage
- packages
- importer start wizard
- importer dashboard
- admin projects
- admin representatives
- FMS assignment detail
- super admin users
- document print views

Expected:

- Admin tables scroll inside containers if wide.
- Portal navigation is usable.
- Logout works.
- Print views hide portal chrome.
- No duplicate Supabase client warning.
- No infinite protected portal loading.

## 8. Stop Conditions

Do not proceed to production launch if:

- Any build fails.
- Private routes are exposed in sitemap.
- Service-role key appears in client-visible output.
- Wrong-role access succeeds.
- FMS can see importer contact details.
- Public representative verification exposes private representative data.
- Storage buckets are public.
- Email or payment provider accidentally sends/charges in MVP.
