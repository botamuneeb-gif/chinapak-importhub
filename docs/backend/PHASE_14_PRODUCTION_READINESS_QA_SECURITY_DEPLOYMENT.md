# Phase 14: Production Readiness, QA, Security, And Deployment

## Status

Phase 14 is a production-readiness audit and documentation pass. It does not add a new product workflow phase.

No Supabase schema changes, migrations, payment gateway integration, email provider connection, WhatsApp/SMS integration, FMS payout automation, public factory signup, or direct factory contact release were added.

## What Was Audited

Phase 14 reviewed:

- Environment variable template and usage.
- `.gitignore` protection for `.env.local`.
- Supabase migration inventory.
- Service-role Supabase usage boundary.
- Protected route layouts and role guards.
- Sitemap and robots privacy boundary.
- File/evidence signed URL flow.
- Document access scope.
- Notification scope and delivery mode.
- Public SEO/private app route indexing.
- Existing empty/error/loading state patterns.
- Vercel/Supabase deployment requirements.

## Safe Fixes Applied

The audit found a narrow SEO/privacy readiness issue:

- Some protected importer app routes had route guards but did not explicitly set `robots: { index: false, follow: false }`.
- `robots.ts` disallowed slash-suffixed private roots like `/admin/`, but exact private root paths such as `/admin` and `/super-admin` were safer to list explicitly too.

Fixes applied:

- Added `robots: { index: false, follow: false }` to:
  - `/importer/start`
  - `/payments`
  - `/payments/manual`
  - `/refunds`
- Expanded `app/robots.ts` to disallow exact private roots and importer app paths:
  - `/admin`
  - `/super-admin`
  - `/importer`
  - `/importer/start`
  - `/factory`

These are SEO/privacy hardening changes only. They do not change auth, RLS, payment, FMS, report, file, invoice, refund, or notification behavior.

## Environment Variable Checklist

`.env.example` documents:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=
EMAIL_DELIVERY_MODE=disabled
EMAIL_FROM_NAME=ChinaPak ImportHub
EMAIL_FROM_ADDRESS=no-reply@chinapakimporthub.com
RESEND_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

Findings:

- `.env.local` is ignored by `.gitignore`.
- `.env.example` contains placeholders only. The email from address is a non-secret default.
- `SUPABASE_SERVICE_ROLE_KEY` is used only through `lib/supabase/admin.ts`.
- `lib/supabase/admin.ts` imports `server-only`.
- No client component imports `createAdminSupabaseClient`.

Production notes:

- Set Vercel environment variables in the Vercel dashboard.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` publicly.
- Never prefix service role key with `NEXT_PUBLIC_`.
- Keep `EMAIL_DELIVERY_MODE=disabled` until a provider is tested in staging.
- Set `CRON_SECRET` only if enabling protected cron calls such as the project lifecycle alert scan.

## Supabase Migration And Storage Checklist

Current migration inventory:

- `001_extensions_and_enums.sql`
- `002_auth_profiles_and_roles.sql`
- `003_packages_pricing_settings.sql`
- `004_import_projects_and_leads.sql`
- `005_payments_invoices_refunds.sql`
- `006_fms_assignments_and_payouts.sql`
- `007_factory_database.sql`
- `008_messaging_translation.sql`
- `009_file_assets_storage_metadata.sql`
- `010_agents_commissions_training.sql`
- `011_audit_security_logs.sql`
- `012_rls_initial_policies.sql`
- `013_seed_platform_defaults.sql`
- `014_report_feedback_clarifications.sql`
- `015_admin_user_directory.sql`
- `016_backfill_active_role_assignments.sql`
- `017_admin_user_directory_management_fields.sql`
- `018_phase_9_file_storage_buckets.sql`
- `019_phase_10_invoice_payment_refund_statuses.sql`
- `020_phase_12_notifications_email_foundation.sql`
- `021_representative_verification_workflow.sql`
- `022_project_manager_role.sql`

Apply/check migrations:

```bash
npx supabase migration list
npx supabase db push
```

Critical tables/views to verify:

- `user_profiles`
- `role_assignments`
- `importer_profiles`
- `fms_profiles`
- `import_projects`
- `fms_assignments`
- `fms_factory_submissions`
- `invoices`
- `payments`
- `refunds`
- `file_assets`
- `notifications`
- `audit_logs`
- `admin_user_directory`
- `representatives`
- `representative_verification_attempts`

Storage buckets to verify as private:

- `importer-project-files`
- `fms-evidence-files`
- `admin-private-files`
- `importer-released-report-files`

If `db push` times out:

- Do not run `supabase db reset` on production.
- Capture the error without secrets.
- Check `npx supabase migration list`.
- Check Supabase dashboard migration history.
- Decide whether to retry, fix forward with a new migration, or restore from backup.

If bucket creation SQL fails:

- Create the four buckets manually in Supabase Storage.
- Keep public access disabled.
- Re-run app-level file upload tests.

## RLS And App-Level Security Notes

Current stance:

- Phase 1 enabled RLS on operational tables and added narrow self-read policies for base profile/role rows.
- Most workflow reads/writes use server actions after explicit role checks.
- Service-role access is server-only and must continue to enforce platform rules in application logic.
- Notification tables have direct RLS for own direct notifications and active role notifications.

Security rules confirmed in code/docs:

- Importer project, report, invoice, payment, refund, file, document, and notification reads are scoped to the owning importer.
- FMS assignment and evidence reads are scoped to the assigned FMS.
- FMS assignment pages do not query importer profile/contact tables.
- Raw FMS submissions remain admin-only.
- Factory sensitive contact data is separated in `factory_sensitive_contacts`.
- Importer-facing report/document actions re-run or reuse contact firewall checks.
- File preview/download uses short-lived signed URLs after role and visibility checks.
- Super Admin user management is guarded at route and server-action level.

Known future hardening:

- Add browser/e2e tests for the role matrix.
- Add per-recipient read receipts for role-targeted notifications.
- Add deeper database RLS policies if direct client reads are introduced later.
- Add OCR/contact scanning for uploaded binary files.
- Add formal retention/deletion policy for user/account data.

## Empty/Error/Loading State Audit

Existing patterns cover the main launch states:

- Protected portal checking, access denied, login required, and role mismatch messages.
- Admin project, lead, FMS, factory submission, evidence, feedback, billing, notification, and user-management loading/error states.
- Importer/FMS empty states for files, reports, invoices, refunds, assignments, and notifications.
- Supabase environment missing errors are surfaced by the Supabase utility wrappers and role guards.

No large UI state refactor was added in this phase.

## Mobile/Responsive QA Notes

The portal shell already uses:

- Desktop sidebar with fixed width.
- Mobile topbar/horizontal nav.
- `minmax(0, 1fr)` main column.
- Internal horizontal scroll for wide admin tables.

Manual mobile QA is still required for:

- `/`
- `/packages`
- `/importer/dashboard`
- `/importer/start`
- `/importer/reports`
- `/invoices`
- `/payments`
- `/refunds`
- `/fms/dashboard`
- `/fms/assignments/[assignmentId]`
- `/admin/projects`
- `/admin/projects/[projectId]`
- `/admin/fms`
- `/admin/evidence`
- `/admin/notifications`
- `/super-admin/users`

## Public SEO And Privacy Audit

Findings:

- Sitemap uses `publicSitemapRoutes` and excludes protected/private portal routes.
- Robots disallows private/admin/importer/FMS app, invoices, payments, refunds, files, documents, and future API paths.
- Protected route pages have noindex metadata where reviewed or fixed in this phase.
- Public SEO pages have unique metadata and semantic content.
- Urdu public copy uses `lang`, `dir`, and `.urdu-text` helpers where applicable.
- No private project IDs, invoice IDs, reports, files, or user directory routes are included in the sitemap.

## Related Documents

- `docs/backend/ROUTE_ACCESS_MATRIX.md`
- `docs/backend/VERCEL_SUPABASE_DEPLOYMENT_CHECKLIST.md`
- `docs/backend/LAUNCH_QA_CHECKLIST.md`
- `docs/backend/ROLE_ACCOUNT_MANAGEMENT.md`
- `docs/backend/SUPER_ADMIN_USER_MANAGEMENT.md`
- `docs/backend/PHASE_13_PUBLIC_WEBSITE_SEO_CONVERSION_POLISH.md`
- `docs/backend/PROJECT_MANAGER_ROLE_WORKFLOW.md`
- `docs/backend/PROJECT_LIFECYCLE_AUTOMATION_AND_ALERTS.md`

## Final Build Checks

Before deployment, run:

```bash
npm run lint
npm run typecheck
npm run build
```

Do not deploy if any command fails.

## Remaining Pre-Launch Risks

- Legal review is still needed for Terms, Privacy Policy, Refund Policy, FMS/Agent agreements, and customer-facing guarantees.
- Real payment gateway, SMS/WhatsApp OTP, and email delivery remain disabled/future.
- Production Supabase Auth redirect URLs must be configured manually.
- Storage buckets must be verified private in Supabase.
- First Super Admin/Admin/FMS setup remains manual and must be done carefully.
- Staging end-to-end QA is required before production launch.
