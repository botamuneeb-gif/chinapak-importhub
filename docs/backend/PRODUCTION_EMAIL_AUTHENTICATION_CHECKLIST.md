# Production Email Authentication Checklist

## Current MVP Auth Position

ChinaPak ImportHub uses Supabase email/password authentication for production
MVP login across importer, admin, super admin, FMS, and agent portals.

Phone/WhatsApp OTP is not active yet. Keep `/auth/otp` as a noindex
informational page only until SMS/WhatsApp provider setup, rate limits, and OTP
templates are fully configured.

## Supabase Auth Configuration

1. Open Supabase Dashboard -> Authentication -> URL Configuration.
2. Set Site URL:
   - `https://chinapakimporthub.com`
3. Add Redirect URLs:
   - `https://chinapakimporthub.com/**`
   - `https://www.chinapakimporthub.com/**`
   - `https://chinapakimporthub.com/login`
   - `https://www.chinapakimporthub.com/login`
   - `https://chinapakimporthub.com/reset-password`
   - `https://www.chinapakimporthub.com/reset-password`
   - Vercel preview URL patterns used for staging tests.
4. Confirm email/password provider is enabled.
5. Enable email confirmations for public signup.
6. Confirm phone provider is not enabled for production launch unless a real
   SMS/WhatsApp provider is configured and tested.

## Custom SMTP

1. Open Supabase Dashboard -> Authentication -> SMTP Settings.
2. Configure a production SMTP provider controlled by ChinaPak ImportHub.
3. Use a verified sender domain for `chinapakimporthub.com`.
4. Test deliverability for:
   - Password reset email
   - Signup confirmation email
   - Email change confirmation, if enabled later
5. Without custom SMTP, verification and password reset emails may not be
   reliable enough for production importer onboarding.
6. Do not store SMTP credentials in source code, docs, screenshots, or logs.

## Email Templates

Review Supabase Auth email templates before launch:

- Password reset
- Confirm signup
- Magic link, if ever enabled
- Email change confirmation

Template rules:

- Use the brand name `ChinaPak ImportHub`.
- Link to `https://chinapakimporthub.com`.
- Avoid promising gateway payment, direct factory contact, or direct FMS chat.
- Do not include secrets, tokens, or internal IDs beyond the Supabase-managed
  action link.

## Forgot Password Flow

Routes:

- `/forgot-password`
- `/reset-password`

Manual test:

1. Open `/forgot-password`.
2. Enter a known test user email.
3. Confirm the UI does not reveal whether the email exists.
4. Open the Supabase password reset email.
5. Set a new password on `/reset-password`.
6. Confirm redirect back to `/login`.
7. Log in with the new password.
8. Confirm role redirect still works:
   - importer -> `/importer/dashboard`
   - admin -> `/admin`
   - super admin -> `/super-admin`
   - fms -> `/fms/dashboard`
   - agent -> `/agent/dashboard`

## Public Importer Signup Verification

Public importer signup must use the Supabase public signup confirmation flow.
Do not use `email_confirm: true` for public importer signup in production.

Current behavior:

1. `/signup` calls Supabase `signUp` with importer-only metadata.
2. Supabase sends a confirmation email.
3. The importer sees: "Please check your email inbox and verify your email
   before logging in."
4. No `user_profiles`, `role_assignments`, or `importer_profiles` rows are
   created before email verification.
5. On first verified importer login, the server checks the Supabase Auth user,
   confirmed email state, and importer metadata, then creates:
   - `user_profiles`
   - active importer `role_assignments`
   - `importer_profiles`

If the Auth user is not email-confirmed, the importer sees: "Please verify your
email inbox before logging in."

If importer metadata is missing, the app shows a safe support message instead
of granting access.

Admin, super admin, FMS, and agent accounts must remain manually created or
admin-controlled. Do not create public signup for privileged roles.

## Resend Verification Email

The importer login form includes a "Resend verification email" action.

Manual test:

1. Enter the importer email on `/login`.
2. Click "Resend verification email."
3. Confirm the success message is generic and does not reveal whether an account
   exists.
4. Open the confirmation email.
5. Confirm the link returns to `/login`.
6. Log in after confirmation and verify importer profile/role rows are created.

## Vercel Environment Variables

Confirm production Vercel variables:

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

Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side.

## Phone/WhatsApp OTP Disabled Check

Before launch:

1. Open `/login` and confirm there is no fake phone OTP form.
2. Open `/auth/otp` and confirm it clearly says OTP is not active.
3. Confirm Supabase phone provider is not enabled unless a real provider is
   configured.
4. Confirm no UI claims that OTP codes are being sent.

## Acceptance Checklist

- Importer email/password login works.
- Public importer signup sends confirmation email and does not auto-confirm.
- Unverified importer cannot access `/importer/dashboard`.
- Verified importer first login creates importer profile and active importer role.
- Admin email/password login works.
- FMS email/password login works.
- Super admin email/password login works.
- Wrong-role login is rejected and signed out.
- Password reset email can be requested without account-existence disclosure.
- Reset password page updates the password from a valid Supabase reset link.
- User can log in after reset.
- Public importer signup remains importer-only.
- Public users cannot create admin, super admin, FMS, agent, or factory roles.
- Phone/WhatsApp OTP remains disabled.
- No secrets appear in frontend bundles, source code, docs, logs, or screenshots.
