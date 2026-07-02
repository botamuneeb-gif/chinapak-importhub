# Post-Import Vercel Setup Steps

Use this checklist after the GitHub repository has been imported into Vercel.

Do not paste secrets into code, documentation, screenshots, issue comments, or chat messages. Add secrets only inside the Vercel and Supabase dashboards.

## A. Vercel Environment Variables

In Vercel:

1. Open the ChinaPak ImportHub project.
2. Go to `Project Settings -> Environment Variables`.
3. Add the variables below for the `Production` environment.
4. Use production Supabase values for production.
5. Keep email delivery disabled for MVP.
6. Redeploy after adding or changing environment variables.

Required production variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
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

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_`.
- Do not add real payment gateway, email, SMS, or WhatsApp provider keys for MVP.
- `RESEND_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` may remain blank while `EMAIL_DELIVERY_MODE=disabled`.
- `SUPABASE_JWT_SECRET` is listed in `.env.example` for backend planning, but the current Next.js app code does not require it for Vercel runtime.

## B. Supabase Dashboard Configuration

In Supabase:

1. Open the production/staging project connected to this Vercel deployment.
2. Go to `Authentication -> URL Configuration`.
3. Set `Site URL` to:

```text
https://chinapakimporthub.com
```

4. Add redirect URLs:

```text
https://chinapakimporthub.com/**
https://www.chinapakimporthub.com/**
```

5. When testing Vercel preview deployments, add the Vercel preview URL as a redirect pattern for that test window, for example:

```text
https://your-vercel-preview-url.vercel.app/**
```

6. Verify migrations through `021_representative_verification_workflow.sql` are applied.
7. Verify private storage buckets exist and are not public:

- `importer-project-files`
- `fms-evidence-files`
- `admin-private-files`
- `importer-released-report-files`

8. Confirm these critical tables/views exist:

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
- `representatives`
- `representative_verification_attempts`
- `admin_user_directory`

## C. First Vercel Deployment Test

Deploy first using the Vercel temporary URL or preview deployment URL.

Test these routes:

- `/`
- `/packages`
- `/contact`
- `/verify/representative`
- `/signup`
- `/login`
- `/admin/login`
- `/fms/login`
- `/super-admin/login`
- `/sitemap.xml`
- `/robots.txt`

Expected:

- Public pages load without login.
- Auth pages render without missing environment errors.
- Private portal pages are blocked until login.
- Email remains disabled.
- Manual payment model remains active.
- Sitemap uses the configured `NEXT_PUBLIC_SITE_URL`.
- Robots disallow private app routes.

## D. Custom Domain Setup

After the preview deployment works:

1. In Vercel, open `Project Settings -> Domains`.
2. Add:

```text
chinapakimporthub.com
www.chinapakimporthub.com
```

3. Update DNS using the records shown by Vercel.
4. Wait for DNS and SSL provisioning to complete.
5. Confirm `NEXT_PUBLIC_SITE_URL` is set to:

```text
https://chinapakimporthub.com
```

6. Redeploy production after DNS and environment variables are correct.

## E. Final Production Checks

After the production domain resolves:

1. Open `https://chinapakimporthub.com`.
2. Check `https://chinapakimporthub.com/sitemap.xml`.
3. Check `https://chinapakimporthub.com/robots.txt`.
4. Verify `/signup` and `/login` connect to Supabase auth.
5. Verify `/verify/representative` can safely return invalid-code messaging.
6. Login with test admin/super admin accounts.
7. Confirm `/admin/representatives` is protected and visible only to admin/super_admin.

## Safety Reminders

- Do not commit `.env.local`.
- Do not print Supabase keys in logs or screenshots.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` client-side.
- Do not make private storage buckets public.
- Do not enable live email provider delivery until a separate staging test is complete.
- Do not enable payment gateways for MVP unless a later payment integration phase is approved.
