# Auth Roles Blueprint

Status: planning documentation only. This file does not configure Supabase Auth.

Source of truth: `AGENTS.md` and `docs/MDOM.md`.

This blueprint describes the future Supabase Auth and role-entry model for ChinaPak ImportHub.

## Supabase Auth User Model

Supabase `auth.users` should remain the identity root. Application data should live in public schema profile tables:

- `user_profiles` maps one application profile to one `auth.users.id`.
- `role_assignments` grants active platform roles.
- Role-specific profile tables hold operational data:
  - `importer_profiles`
  - `fms_profiles`
  - `agent_profiles`
  - `admin_profiles`
  - `super_admin_profiles`
  - `factory_profiles_future`

Do not store all role details in Supabase auth metadata. Metadata can become stale and should not replace database-enforced permissions.

## Role Assignment Strategy

Roles:

- `importer`
- `fms`
- `agent`
- `admin`
- `super_admin`
- `factory_future`

Recommended rules:

- A user may have multiple roles only when explicitly assigned.
- Importer role can be self-created through public OTP onboarding.
- FMS role is invitation-only or admin-approved.
- Agent role is invitation-only or admin-approved.
- Admin role is internal-only.
- Super admin role is highest privilege and internal-only.
- Factory future role remains hidden/invitation-only until factory activation.
- Role grants/revocations must create `audit_logs`.

## Importer OTP/Phone Auth

Importer onboarding should be phone/WhatsApp OTP-first.

Flow:

1. Public user enters phone/WhatsApp number.
2. Supabase Auth sends OTP in future integration.
3. If auth user exists, user signs in.
4. If auth user does not exist, create auth user and `user_profiles`.
5. Create or attach `importer_profiles`.
6. Assign active `importer` role.
7. Route to importer project/dashboard flow later.

Important:

- Public users should not need to understand "login vs signup".
- Email/password can be a fallback later, not the main importer path.
- Importer phone/WhatsApp contact details must never be visible to FMS.

## Invitation-Only FMS Access

FMS signup must not be open as a working public flow.

Recommended flow:

1. Candidate receives invitation code or submits interest placeholder.
2. Admin reviews candidate.
3. Admin creates/approves auth user.
4. Admin creates `fms_profiles` row with `fms_code`, tier, categories, and academy status.
5. Admin assigns active `fms` role.
6. FMS must complete academy/certification before paid assignments.

Security:

- FMS dashboard access should require active FMS role.
- FMS can view only assigned projects through redacted briefs.
- FMS cannot view importer contact information.

## Invitation-Only Agent Access

Agent accounts are approved by ChinaPak ImportHub.

Recommended flow:

1. Admin invites or approves Pakistani local representative.
2. Admin creates `agent_profiles` with `agent_code`, city/market, training status, and allowed activities.
3. Admin creates public-safe `representative_verifications` row.
4. Agent completes training and compliance acknowledgement.
5. Agent can view only assigned unpaid leads and allowed importer summary fields.

Agent restrictions:

- Agents must not collect unofficial payments.
- Agents must not promise guaranteed import success or factory pricing.
- Agents do not perform FMS sourcing work.
- Agent commissions are credited only after payment is verified and project is accepted for admin review.

## Admin Access

Admin login must be separate and internal.

Recommended setup:

- Admin users are created by super admin or secure internal process.
- Admin auth uses email/password initially, with 2FA required before launch.
- Admin routes should not be promoted in public navigation.
- Admin profile and permissions live in `admin_profiles` and role assignment tables.
- Admin can manage operational data but should not self-elevate privileges.

Admin responsibilities:

- Review paid projects.
- Manage unpaid lead follow-up.
- Assign/reassign FMS.
- Review FMS evidence and factory submissions.
- Control messaging and translation review.
- Manage payments, invoices, refunds, and support.
- Approve file/data releases.

## Super Admin Access

Super admin controls platform-level settings and security.

Recommended setup:

- Super admin accounts are created manually in a secure process.
- 2FA should be mandatory before production.
- Super admin access controls:
  - role assignments
  - platform settings
  - pricing/packages
  - payout/commission rules
  - security and audit records
  - future factory activation settings

Safeguards:

- No public links.
- Strong password and 2FA.
- Audit every settings, permission, pricing, and security change.
- Consider two-person approval for destructive or high-risk actions later.

## Factory Future Access

Factory portal remains hidden until future activation.

Current phase:

- Factory login/signup routes may exist as UI placeholders only.
- Public factory signup is not active.
- No factory account should become live through self-service signup.
- Factory records are internal/admin-owned.

Future activation:

1. Admin creates or approves `factory_claim_invitations_future`.
2. Factory accepts invitation and creates auth user.
3. `factory_profiles_future` links user to factory record.
4. Factory can view and request updates to own claimed profile only.
5. Admin reviews all factory-submitted changes before trusted database update.

## 2FA Future

Recommended before production:

- Require 2FA for admin and super admin.
- Strongly encourage 2FA for FMS and agents.
- Consider step-up auth for:
  - role changes
  - data release approvals
  - factory contact release
  - refund approval
  - payout approval
  - platform settings changes

## Session And Security Notes

- Use short-lived sessions for admin and super admin.
- Use refresh token rotation where supported.
- Log suspicious login/security events in `security_events`.
- Log sensitive data views/downloads in `access_logs`.
- Never expose service role keys to frontend.
- Server-side code using service role must enforce business rules explicitly.
- Never trust role claims from client state alone; check database role assignments.

## Public Navigation Rules

- Public website may link to `/login`, `/signup`, `/auth/role-select`, and invitation placeholders where appropriate.
- Do not publicly promote `/admin/login` or `/super-admin/login`.
- Do not publicly promote factory signup as active.
- Factory pages can exist as SEO/future partnership content but must clearly state invitation/future status.

## Implementation Checklist

- Create auth/profile tables before live auth routes.
- Create active role assignment checks and RLS helper functions.
- Seed package/settings data separately from auth data.
- Add admin-only role management UI after RLS tests pass.
- Add invitation tokens with expiry for FMS/agent/factory future.
- Add audit logs for role changes.
- Add security events for failed login, OTP abuse, and suspicious access.
