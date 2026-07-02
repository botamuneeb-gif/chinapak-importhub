# Vercel + Supabase Deployment Checklist

Use this checklist before deploying ChinaPak ImportHub to production.

## 1. Repository And Vercel Project

- Connect the GitHub repository to Vercel.
- Confirm the framework preset is Next.js.
- Confirm the root directory is the repository root unless the project is moved into a subfolder.
- Keep build command as `npm run build`.
- Keep install command as Vercel default or `npm install`.
- Confirm Node version compatibility with Next.js 15.

## 2. Production Domain

- Add `chinapakimporthub.com` to the Vercel project.
- Add `www.chinapakimporthub.com` if wanted.
- Configure DNS records through the domain provider.
- Confirm HTTPS is active before public launch.
- Set `NEXT_PUBLIC_SITE_URL=https://chinapakimporthub.com`.

## 3. Vercel Environment Variables

Set these in Vercel Project Settings > Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
NEXT_PUBLIC_SITE_URL=https://chinapakimporthub.com
EMAIL_DELIVERY_MODE=disabled
EMAIL_FROM_NAME=ChinaPak ImportHub
EMAIL_FROM_ADDRESS=no-reply@chinapakimporthub.com
RESEND_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

Security warnings:

- Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.
- Never paste real secrets into docs, chat, screenshots, commits, or issue comments.
- Keep `EMAIL_DELIVERY_MODE=disabled` until a provider is tested in staging.
- Rotate any key that was accidentally exposed.

## 4. Supabase Auth Configuration

In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://chinapakimporthub.com`
- Redirect URLs:
  - `https://chinapakimporthub.com/login`
  - `https://chinapakimporthub.com/signup`
  - `https://chinapakimporthub.com/admin/login`
  - `https://chinapakimporthub.com/super-admin/login`
  - `https://chinapakimporthub.com/fms/login`
  - `https://chinapakimporthub.com/agent/login`
  - Add preview/staging URLs separately if used.

Email settings:

- Confirm email provider is configured before enabling real password reset emails.
- Confirm confirmation email settings match the local testing plan.
- Importer phone/WhatsApp OTP remains future until provider setup.

## 5. Supabase Migrations

Before production deploy:

```bash
npx supabase migration list
npx supabase db push
```

Verify migrations through the Supabase dashboard or CLI. Expected migration files currently run from `001_extensions_and_enums.sql` through `020_phase_12_notifications_email_foundation.sql`.

If `db push` times out:

- Do not run `db reset` against production.
- Capture the error without secrets.
- Check Supabase dashboard database health.
- Re-run `npx supabase migration list`.
- If a migration partially failed, stop and decide whether to fix forward with a new migration or restore from backup.

## 6. Storage Buckets

Verify these buckets exist and are private:

- `importer-project-files`
- `fms-evidence-files`
- `admin-private-files`
- `importer-released-report-files`

If bucket SQL cannot create buckets in the hosted Supabase project, create them manually in Supabase Storage with public access disabled.

## 7. Seed And Static Data

Confirm seeded/static data exists:

- Packages:
  - Factory Discovery
  - Factory Match Plus
  - Import Partner
- Add-ons
- Refund rules
- FMS payout rules
- Platform settings

Do not use destructive seed scripts in production.

## 8. Pre-Deploy Checks

Run locally before pushing/deploying:

```bash
npm run lint
npm run typecheck
npm run build
```

Also check:

- `.env.local` exists locally and is ignored by Git.
- `.env.example` contains placeholders only.
- No service-role key appears in client components.
- Public/private route boundaries are documented in `docs/backend/ROUTE_ACCESS_MATRIX.md`.

## 9. Post-Deploy Smoke Test

Public routes:

- `/`
- `/packages`
- `/how-it-works`
- `/trust-safety`
- `/faq`
- `/contact`
- `/import-from-china-to-pakistan`
- `/sitemap.xml`
- `/robots.txt`

Protected routes:

- `/login`
- `/signup`
- `/admin/login`
- `/super-admin/login`
- `/fms/login`
- `/agent/login`

Operational checks:

- Create/import a test importer account.
- Login as admin and super admin.
- Login as FMS test account.
- Open `/admin/projects`, `/admin/fms`, `/admin/evidence`, `/admin/notifications`.
- Open `/super-admin/users`.
- Open a document print page and confirm browser print works.

## 10. Rollback Notes

- Keep the previous Vercel deployment available for instant rollback.
- Do not roll back database schema casually after production data is created.
- If the app deploy fails but migrations succeeded, roll forward the app fix.
- If migrations fail, stop and decide from a database backup/snapshot.
