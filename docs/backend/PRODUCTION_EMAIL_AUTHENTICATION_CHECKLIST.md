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
   - `https://chinapakimporthub.com/auth/confirmed`
   - `https://www.chinapakimporthub.com/auth/confirmed`
   - `https://chinapakimporthub.com/auth/callback`
   - `https://www.chinapakimporthub.com/auth/callback`
   - `https://chinapakimporthub.com/auth/invite`
   - `https://www.chinapakimporthub.com/auth/invite`
   - `https://chinapakimporthub.com/login`
   - `https://www.chinapakimporthub.com/login`
   - `https://chinapakimporthub.com/fms/login`
   - `https://www.chinapakimporthub.com/fms/login`
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
- Invite User
- Magic link, if ever enabled
- Email change confirmation

Template rules:

- Use the brand name `ChinaPak ImportHub`.
- Link to `https://chinapakimporthub.com`.
- Email verification should redirect to `/auth/confirmed`.
- Password reset should redirect to `/reset-password`.
- FMS invite acceptance should redirect to `/auth/invite`.
- Avoid promising gateway payment, direct factory contact, or direct FMS chat.
- Do not include secrets, tokens, or internal IDs beyond the Supabase-managed
  action link.

### Invite User Template

Update this in Supabase Dashboard -> Authentication -> Email Templates ->
Invite User.

Recommended subject:

```text
Activate your ChinaPak ImportHub FMS account
```

Recommended body concept:

```html
<p>Hello,</p>

<p>Your ChinaPak ImportHub FMS account has been created after application approval.</p>

<p>Click the button below to accept the invitation and set your account password.</p>

<p><a href="{{ .ConfirmationURL }}">Accept invitation</a></p>

<p>After activation, you can log in at:</p>
<p>https://chinapakimporthub.com/fms/login</p>

<p>FMS users never contact importers directly and never see importer contact details. All sourcing evidence is submitted for admin review first.</p>
```

Keep the Supabase-managed `{{ .ConfirmationURL }}` variable exactly as provided
by Supabase. Do not replace it with a hard-coded URL or expose tokens manually.
The application sets FMS invite redirects to `/auth/invite`, so the candidate
sees the `Activate your FMS account` page and sets a password there.

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
6. Confirm redirect back to `/login?reset=1`.
7. Confirm the login page shows: "Password updated successfully. Please log in
   with your new password."
8. Log in with the new password.
9. Confirm role redirect still works:
   - importer -> `/importer/dashboard`
   - admin -> `/admin`
   - super admin -> `/super-admin`
   - fms -> `/fms/dashboard`
   - agent -> `/agent/dashboard`

## FMS Invite Activation Flow

This is separate from forgot/reset password.

1. Super Admin approves a forwarded FMS application.
2. Supabase sends the Invite User email.
3. Candidate clicks `Accept invitation`.
4. Candidate lands on `/auth/invite`.
5. Candidate sees `Activate your FMS account`.
6. Candidate sets a password with `Set Password & Continue`.
7. The app signs out the temporary invite session and redirects to
   `/fms/login?activated=1`.
8. Candidate logs in through `/fms/login`.

Do not enable public FMS signup. Do not create or show a default password.

## Public Importer Signup Verification

Public importer signup must use the Supabase public signup confirmation flow.
Do not use `email_confirm: true` for public importer signup in production.

Current behavior:

1. `/signup` calls Supabase `signUp` with importer-only metadata.
2. Supabase sends a confirmation email.
3. The importer sees: "Please check your email inbox and verify your email
   before logging in."
4. The verification link redirects to `/auth/confirmed`.
5. `/auth/confirmed` shows: "Email verified successfully. You can now log in
   and start your Import Project."
6. The user clicks "Go to Login" and lands on `/login?verified=1`.
7. Login shows: "Email verified successfully. Please log in to continue."
8. Signup intentionally does not auto-login when email verification is required.
   The old "automatic login failed" message must not appear.
9. The signup success state should show:
   - "Go to Login"
   - "Resend verification email"
10. No `user_profiles`, `role_assignments`, or `importer_profiles` rows are
   created before email verification.
11. On first verified importer login, the server checks the Supabase Auth user,
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
5. Confirm the link returns to `/auth/confirmed`.
6. Confirm `/auth/confirmed` shows the success state and a "Go to Login" CTA.
7. Log in after confirmation and verify importer profile/role rows are created.

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
- Public importer signup does not attempt automatic login.
- Signup success does not show "automatic login failed" copy.
- Clicking the verification email shows `/auth/confirmed` success UX.
- `/login?verified=1` shows the sanitized verification success banner.
- `/login?error=verification_failed` shows the sanitized failure banner.
- Unverified importer cannot access `/importer/dashboard`.
- Verified importer first login creates importer profile and active importer role.
- Admin email/password login works.
- FMS email/password login works.
- FMS invite email lands on `/auth/invite`, lets the candidate set a password,
  and redirects to `/fms/login?activated=1`.
- FMS invite acceptance does not use public signup, reset-password wording, or a
  default password.
- Super admin email/password login works.
- Wrong-role login is rejected and signed out.
- Password reset email can be requested without account-existence disclosure.
- Reset password page updates the password from a valid Supabase reset link.
- User can log in after reset.
- Public importer signup remains importer-only.
- Public users cannot create admin, super admin, FMS, agent, or factory roles.
- Phone/WhatsApp OTP remains disabled.
- No secrets appear in frontend bundles, source code, docs, logs, or screenshots.
