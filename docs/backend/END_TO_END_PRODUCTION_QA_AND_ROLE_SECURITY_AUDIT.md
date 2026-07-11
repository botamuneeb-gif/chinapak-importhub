# End-to-End Production QA and Role Security Audit

Date: 2026-07-12

Scope: local code audit for production launch readiness across route guards, role permissions, privacy boundaries, manual payment safety, FMS invite-only onboarding, cron/digest security, SEO/indexing, and PWA/mobile readiness. Live Supabase account testing still requires production role accounts and should be completed with the manual checklist below.

## Executive Result

ChinaPak ImportHub is ready for first production operations from a code/build readiness perspective, subject to manual live account smoke tests and production environment checks.

No schema migration was required. No business rules were changed. No public FMS signup was enabled. No payment, project, FMS submission, or report auto-approval behavior was introduced.

## Route Access Results

| Route group | Audit result |
|---|---|
| Public website (`/`, `/packages`, `/learn/*`, `/contact`, SEO pages) | Public routes render through `SiteChrome` and remain indexable through the public sitemap configuration. |
| Public auth (`/login`, `/signup`, `/forgot-password`, `/reset-password`, role login routes) | Public entry pages remain accessible. Role login redirects still depend on active role assignments. |
| Public FMS acquisition (`/fms`, `/fms/apply`, `/fms/[...fmsSeoSlug]`) | Public and indexable. `/fms/apply` creates an FMS application lead only. |
| FMS update token (`/fms/application-update/[token]`) | Public token-scoped page with `robots: { index: false, follow: false }`; updates existing lead only and clears token metadata after use. |
| Importer portal (`/importer/*`, `/payments/*`, `/invoices/*`, `/refunds/*`) | Nested importer layouts use `RoleProtectedPortalShell` with `importer` only. Billing actions also require importer context for owner-scoped data. |
| FMS portal (`/fms/dashboard`, `/fms/assignments`, `/fms/academy`, `/fms/earnings`, `/fms/messages`, `/fms/notifications`) | Protected by `FmsProtectedRoute`, which allows only active `fms` role and active FMS profile. |
| Admin portal (`/admin/*`) | Admin layout allows `admin` and `super_admin`. Admin project/payment actions re-check server-side Admin/Super Admin role. |
| Super Admin portal (`/super-admin/*`) | Super Admin layout allows `super_admin` only. Final FMS decisions and role/user controls use Super Admin-only server checks. |
| Project Manager portal (`/project-manager/*`) | Project Manager layout allows `project_manager` only. PM actions support project notes, markers, and escalation only. |
| Agent portal (`/agent/dashboard`, `/agent/leads`, `/agent/commissions`, `/agent/training`, `/agent/notifications`) | Agent layout allows `agent` only for protected agent workspace routes. |
| Cron/API (`/api/cron/project-lifecycle-alerts`, `/api/cron/daily-operations-digest`) | Both routes require `Authorization: Bearer CRON_SECRET`; missing secret returns 503 and wrong secret returns 401. |

## Role Permission Summary

The detailed matrix is maintained in `docs/backend/ROUTE_ACCESS_MATRIX.md`.

Key launch boundaries verified:

- Importer can create and view own projects, invoices, payments, refunds, notifications, and released reports only.
- FMS can view assigned sourcing briefs and submit factory options for Admin review only.
- Admin/Super Admin retain payment verification, project approval, FMS assignment, FMS submission review, and report release authority.
- Super Admin remains the only role that can final-approve FMS applications or manage users/roles.
- Project Manager cannot access `/admin` or `/super-admin`, cannot verify payments, cannot assign FMS, cannot release reports, and cannot approve FMS submissions.
- Public visitors cannot access private portals or cron routes.

## Privacy Boundary Results

FMS views/actions were audited with focus on importer data leakage.

FMS cannot see:

- importer email, phone, WhatsApp, full address, or private payment details
- payment proof/reference records
- admin-only notes or Project Manager internal notes
- raw importer-owned files unless separately released through existing file policy

FMS can see:

- project code
- assigned product/category/quantity/budget/quality requirements
- safe project links/details needed for sourcing
- assignment instructions and their own factory submission status

Factory/contact privacy:

- FMS factory submission forms separate admin-only factory contact fields from importer-facing fields.
- Contact/payment firewall checks block phone/email/WeChat/bank-like details in importer-facing fields before FMS submission.
- Admin-only factory contact metadata remains visible to Admin/Super Admin review flows, not importer or public flows.

## Payment Safety Results

Manual payment workflow remains Admin/Super Admin verified only.

- Importer can submit manual payment references from protected importer billing routes.
- Admin/Super Admin can verify, reject, request more info, or mark under review.
- Project Manager has no payment verification server action or payment controls.
- FMS has no payment proof or payment queue visibility.
- Payment helper copy warns importers not to upload card numbers, banking passwords, OTPs, or private credentials.
- Payment verification does not auto-assign FMS or auto-approve reports.

## FMS Invite-Only Results

- `/fms/apply` stores `unpaid_leads` metadata with `account_creation: "not_created"` and does not create an auth user, role assignment, or FMS profile.
- Admin can pre-screen, request candidate info, decline at screening, and forward applications to Super Admin.
- Final approve/decline/more-info decisions require Super Admin.
- Super Admin approval uses Supabase `inviteUserByEmail` where possible, then creates/repairs the `user_profiles`, `role_assignments`, and `fms_profiles` records.
- No default password is created or displayed.
- If secure invite creation fails, the lead is marked as approved pending manual account setup.
- More-info links use the secure existing-application update route, not duplicate application submission.

## Cron And Digest Results

- Project lifecycle cron route requires `CRON_SECRET`.
- Daily operations digest cron route requires `CRON_SECRET`.
- Lifecycle notifications dedupe by project, alert type, role, and date bucket.
- Daily digest notifications dedupe by role/date for cron runs; manual sends are separately identified.
- Digest email content is role-specific and excludes importer private contact details, FMS contact details, invite links, tokens, service-role keys, and raw private metadata.
- `EMAIL_DELIVERY_MODE=disabled` is handled through delivery status logging/skips and should not crash the digest flow.

## SEO And Indexing Results

- `robots.ts` disallows private portals, `/api/`, token update routes, protected billing/document/file surfaces, and protected FMS portal routes.
- `sitemap.ts` is driven by `publicSitemapRoutes` and public FMS route config.
- `/fms/apply` is intentionally included in sitemap for candidate acquisition.
- `/fms/application-update/[token]` is not in sitemap and is noindex.
- Protected pages audited declare noindex metadata.
- Webmaster verification metadata is env-driven and does not render fake placeholder IDs.
- No FMS `JobPosting` JSON-LD was found in app/components/config during audit.

## PWA And Mobile Results

- `app/manifest.ts` provides an installable manifest with app name, short name, theme/background colors, standalone display, scope `/`, start URL `/`, and PWA icons.
- PWA icon files exist under `public/icons`.
- No service worker or private-data offline cache is enabled.
- Mobile portal layouts rely on the portal shell and previously added responsive cards/sections. Final device QA should be done on a real mobile browser before paid traffic.

## Manual Live QA Checklist

Use production accounts for each role.

1. Public visitor opens `/`, `/packages`, `/learn/import-from-china-to-pakistan`, `/contact`, `/fms`, `/fms/apply`, `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest`.
2. Logged-out visitor attempts `/importer/dashboard`, `/admin`, `/super-admin/users`, `/project-manager/dashboard`, and `/fms/assignments`; each should block or redirect safely.
3. Importer logs in, opens dashboard, submits a test project, sees project code, opens project detail, invoices, payments, refunds, reports, and notifications.
4. FMS logs in, opens assignments, confirms importer contact/payment/private notes are absent, submits a factory option, and verifies it goes to Admin review.
5. Admin logs in, verifies/rejects a test manual payment, approves project review, assigns FMS, reviews FMS submissions, and releases only sanitized reports.
6. Super Admin logs in, opens users, role controls, notifications, and FMS applications; final-approve/decline/more-info FMS application tests should work.
7. Project Manager logs in, opens project dashboard/detail, adds internal note, sets safe marker, escalates to Admin, and confirms `/admin` and `/super-admin` remain blocked.
8. Agent logs in, opens dashboard/leads/commissions/notifications and confirms no Admin/FMS/private project controls appear.
9. Call cron routes with missing/wrong secret and confirm 401/503 behavior; call with correct secret from a secure environment only.
10. Run Google Rich Results/source checks to confirm no `JobPosting` schema remains on FMS pages.

## Known Limitations

- This pass did not perform live role-login testing because production credentials and Supabase data are environment-specific.
- No automated test framework is configured in `package.json`; no new test stack was introduced for this audit.
- Factory portal and public factory signup remain future/invitation-only surfaces.
- Phone/WhatsApp OTP remains disabled.
- Payment gateway integration remains intentionally absent; manual verification is the production path.
- Legal/policy copy should still receive human legal review before broader paid acquisition.

## Recommended Next Fixes

1. Create a small production smoke-test account set for Importer, FMS, Admin, Super Admin, Project Manager, and Agent.
2. Add focused automated guard tests later if the project introduces a test runner.
3. Run a real mobile device pass for portal tables/cards before heavy public launch traffic.
4. Verify Vercel environment variables: Supabase URL/anon key/service key, Resend, `CRON_SECRET`, site URL, and webmaster verification values.
5. Run a Supabase RLS policy review directly in the database before scaling beyond internal launch users.
