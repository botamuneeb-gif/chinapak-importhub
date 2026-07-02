# Phase 2 Auth/Profile Setup

This phase connects the authentication and profile foundation only. Import
projects, payments, messaging, file uploads, FMS assignment work, invoices,
refunds, and factory review behavior remain placeholder UI.

## What Was Added

- Supabase email/password login for importer testing, admin, super admin, FMS,
  and agent entry pages.
- Public importer signup that creates:
  - Supabase Auth user
  - `user_profiles` row
  - active importer `role_assignments` row
  - `importer_profiles` row
- Role-aware redirect helpers:
  - importer -> `/importer/dashboard`
  - fms -> `/fms/dashboard`
  - agent -> `/agent/dashboard`
  - admin -> `/admin`
  - super_admin -> `/super-admin`
  - factory_future -> `/factory/login`
- Lightweight client route guards for protected placeholder portals. The guard
  checks the browser Supabase session, then verifies active role assignment
  through a server action.
- FMS and Agent login pages for already-approved users.
- Factory login/signup remains future and invitation-only.

## Business Rules Preserved

- Public signup creates importer accounts only.
- Public users cannot choose admin, super admin, FMS, agent, or factory roles.
- FMS and Agent onboarding remains invitation/admin-approved.
- Factory signup is not active publicly.
- Importers and FMSs still do not have direct messaging or contact exchange.
- No import project persistence, payment, messaging, file upload, FMS assignment,
  invoice, refund, or factory database mutations were connected in this phase.

## Environment Variables

Phase 2 expects these values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client components. It is used only
inside trusted server actions for importer profile creation and role checks.

## Importer Signup And Login

The importer signup form uses a server action to create the Auth user and
profile rows. After successful creation, the browser signs in with
email/password so the protected importer dashboard can verify the session.

Phone/WhatsApp OTP remains visible as the intended importer-first UX, but real
phone OTP requires SMS/WhatsApp provider activation and is not connected yet.

## Staff, FMS, And Agent Login

Admin, Super Admin, FMS, and Agent pages use Supabase email/password login, then
verify active roles before redirecting:

- `/admin/login` allows `admin` or `super_admin`.
- `/super-admin/login` allows `super_admin` only.
- `/fms/login` allows `fms` only.
- `/agent/login` allows `agent` only.

If role lookup fails, access is denied and the browser session is signed out.

## First Admin / Super Admin Setup

Do not create hard-coded admin credentials in this repository.

For now, create the first admin or super admin manually in Supabase:

1. Create a user in Supabase Auth using a secure email/password.
2. Insert a matching `user_profiles` row with `auth_user_id` set to the Auth
   user ID and `primary_role` set to `admin` or `super_admin`.
3. Insert an active `role_assignments` row for the profile.
4. For operational profile detail, insert a row in `admin_profiles` or
   `super_admin_profiles` when those profile workflows are implemented.

A future secure admin bootstrap script can automate this with explicit local
operator confirmation.

## Route Protection Notes

The current guard is intentionally lightweight because the project does not yet
use Supabase SSR cookie helpers. Protected portal layouts verify the browser
session and then ask a server action to validate role assignment. This is enough
for Phase 2 UI protection, but later phases should add middleware or server
component guards after cookie-based auth is introduced.

Protected UI areas:

- `/admin` and admin subroutes except `/admin/login`
- `/super-admin` except `/super-admin/login`
- `/fms/dashboard`, `/fms/assignments`, `/fms/earnings`, `/fms/academy`,
  `/fms/messages`
- `/agent/dashboard`, `/agent/leads`, `/agent/commissions`, `/agent/training`
- `/importer/dashboard`

## Manual Testing

Importer:

1. Set `.env.local` with Supabase URL, anon key, and service role key.
2. Open `/signup`.
3. Create an importer account with full name, email, password, phone, city, and
   business type.
4. Confirm redirect to `/importer/dashboard`.
5. Sign out manually from Supabase local storage if needed, then test `/login`
   with the same email/password.

Admin / Super Admin:

1. Manually create the Auth user and role rows in Supabase as described above.
2. Open `/admin/login` or `/super-admin/login`.
3. Login with email/password.
4. Confirm role-correct redirect and access denial for accounts without the
   required role.

FMS / Agent:

1. Manually create approved/invited Auth users and role rows.
2. Open `/fms/login` or `/agent/login`.
3. Confirm role-correct redirect and denial for wrong roles.

## Still Placeholder / Future

- Phone/WhatsApp OTP sending
- 2FA and emergency recovery
- Invitation code validation
- Admin user bootstrap script
- Import project persistence
- Payments and invoices
- Messaging and translation
- File uploads and evidence review
- FMS assignments and payouts
- Factory profile activation
- Middleware/server-cookie route protection
