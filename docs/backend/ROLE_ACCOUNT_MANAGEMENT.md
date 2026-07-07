# Role Account Management

Status: account hygiene guidance for Phase 2+ auth/profile setup.

## Core Model

`auth.users` is the Supabase login identity table. Every person who can sign in has an `auth.users` record, regardless of whether they are an importer, FMS, agent, admin, super admin, or future factory user.

`user_profiles` is the ChinaPak ImportHub base application profile for all roles. Admins and super admins are expected to exist here. Seeing an admin in `auth.users` or `user_profiles` is normal and not a bug.

`role_assignments` is the source of truth for access. A user should be treated as an importer, FMS, agent, Project Manager, admin, super admin, or factory future user only when they have an active row for that role.

Role-specific profile tables are extensions:

- `importer_profiles`: importer business/customer details.
- `fms_profiles`: Factory Match Specialist details.
- `agent_profiles`: Pakistani representative details.
- Project Manager has no separate profile table in MVP; it uses `user_profiles`, active `role_assignments.role = project_manager`, internal notes, timeline events, and audit logs.
- `admin_profiles`: internal operations staff details.
- `super_admin_profiles`: highest-privilege platform control details.
- `factory_profiles_future`: hidden/future factory account details.

The existence of a role-specific extension row is not enough to grant access. Route guards and server actions must check `role_assignments`.

## Current Code Rules

- Public signup creates importer accounts only.
- Public importer signup creates `user_profiles`, an active `role_assignments` row with role `importer`, and `importer_profiles`.
- Public users cannot self-select `admin`, `project_manager`, `super_admin`, `fms`, `agent`, or `factory_future`.
- `/admin` requires active `admin` or `super_admin`.
- `/project-manager` requires active `project_manager`.
- `/super-admin` requires active `super_admin`.
- `/fms/dashboard`, `/fms/assignments`, `/fms/earnings`, `/fms/academy`, and `/fms/messages` require active `fms`.
- `/agent/dashboard`, `/agent/leads`, `/agent/commissions`, and `/agent/training` require active `agent`.
- `/importer/dashboard`, `/importer/start`, and `/importer/messages` require active `importer`.
- Import Project submission actions require active `importer`.
- Admin project and lead reads only use importer profile details when the linked user still has active `importer`.
- Base profile status must be `active`; suspended/revoked profiles are denied even if old role rows remain active.

## Admin/Super Admin Creation

Do not use public importer signup to create production internal accounts.

For now, create the first admin, Project Manager, or super admin manually:

1. Create a Supabase Auth user with a secure email/password.
2. Insert a `user_profiles` row linked to the Auth user.
3. Insert an active `role_assignments` row for `admin`, `project_manager`, or `super_admin`.
4. Optionally create the matching `admin_profiles` or `super_admin_profiles` row when that workflow is implemented.

Do not hard-code admin credentials in the repository.

## Test Account Cleanup

If a test account was first created through importer signup and later converted to admin or super admin:

- It is expected that `auth.users` and `user_profiles` still exist.
- Ensure `role_assignments` has only the intended active role rows.
- If the account should no longer be an importer, revoke or delete the active `importer` role assignment.
- Leave the stale `importer_profiles` row in place if deleting it could break historical test projects.
- Optionally remove the stale `importer_profiles` row only after confirming no real projects, unpaid leads, invoices, or audit records need it.

The application should ignore stale `importer_profiles` rows for importer-only account views when the active `importer` role is absent.

## Listing Guidance

General account views should be labeled `All Accounts` or `User Profiles`, not `Importer Accounts`.

Importer/customer-only lists must filter to users with active `importer`.

Admin staff lists must filter to active `admin` or `super_admin`.

Project Manager lists must filter to active `project_manager`.

FMS lists must filter to active `fms`.

Agent lists must filter to active `agent`.

Every list that mixes roles should display the active role clearly.

## Automatic Role Assignment Creation

`user_profiles.primary_role` is a display/default-role convenience field. It is not sufficient for access.

The application creates active role rows through a server-only helper:

- `ensureActiveRoleAssignment(userProfileId, role, actorId?)`
- It checks for an existing active row first.
- It inserts only when missing.
- It does not create duplicate active rows.
- By default it only allows the public importer role.
- Privileged roles require a protected Super Admin workflow.

Importer signup uses this helper with role `importer`. Public users cannot pass a different role into signup.

Super Admin role controls at `/super-admin/role-controls` can ensure an active role assignment for manual account setup, including `project_manager`. That action may assign privileged roles only after the server verifies the caller has an active `super_admin` role.

No automatic database trigger is used for privileged role creation. This is intentional: a trigger that converts any `primary_role` edit into an active role assignment could make a mistaken Table Editor edit grant access. Role creation should remain in controlled server actions, with one idempotent backfill migration for existing rows.

Public FMS applications from `/fms/apply` do not create roles. They create lead records only. Admin can pre-screen and forward suitable FMS applications, but only Super Admin can final-approve them through `/super-admin/fms-applications`. Approval uses Supabase invite-based setup when possible, creates/repairs `user_profiles`, active `role_assignments.role = fms`, and `fms_profiles`, and never creates a default weak password.

## Role Changes And Revocation

Super Admin role controls support controlled role changes:

- Change `user_profiles.primary_role`.
- Add an active role assignment.
- Revoke a role by setting `role_assignments.status = revoked` and `revoked_at`.
- Convert a multi-role account into one active role.

Do not delete role rows for normal operations. Revoked rows preserve account history and help diagnose role/account changes.

Privileged role additions require explicit Super Admin confirmation. The server blocks actions that would remove the platform's last active `super_admin`.

## Deactivation Versus Auth Deletion

Deactivation/suspension is preferred for most account access problems.

Suspension:

- Sets `user_profiles.status = suspended`.
- Can optionally revoke all active roles.
- Keeps the Auth user and app records available for audit/history.
- Blocks protected portal access because the session helper requires an active base profile.

Auth user deletion is dangerous and should be rare. The Super Admin module uses Supabase Auth soft deletion through `supabase.auth.admin.deleteUser(authUserId, true)`. This does not mean project, payment, report, or audit records should be deleted. Historical operational records should remain unless a dedicated retention/deletion policy is built.

Never edit Supabase Auth password hashes directly and never delete `auth.users` rows manually from Table Editor.

## Role-Specific Profile Repair

Adding a role does not silently create role-specific profile rows.

Examples:

- Active `fms` role still needs an `fms_profiles` row before the FMS can be assigned useful work.
- Active `agent` role still needs an `agent_profiles` row before agent workflows can fully operate.
- Active `importer` role normally needs an `importer_profiles` row for importer/business details.

The Super Admin Role Controls module can create or activate a basic FMS profile after the FMS role is added. Other role-specific profile creation should be implemented as explicit workflows, not hidden side effects.

## Backfill Repair

Migration `016_backfill_active_role_assignments.sql` repairs existing accounts by finding every `user_profiles` row with a non-null `primary_role` where the matching active role row is missing.

It inserts the missing active role assignment, does not duplicate existing active role rows, does not delete or revoke anything, and writes audit rows for inserted assignments.

Equivalent manual repair pattern:

```sql
insert into public.role_assignments (
  user_profile_id,
  role,
  status,
  assigned_at,
  metadata
)
select
  up.id,
  up.primary_role,
  'active',
  now(),
  jsonb_build_object(
    'assignment_source', 'manual_primary_role_repair',
    'no_secret_values_stored', true
  )
from public.user_profiles up
where up.primary_role is not null
  and not exists (
    select 1
    from public.role_assignments ra
    where ra.user_profile_id = up.id
      and ra.role = up.primary_role
      and ra.status = 'active'
  )
on conflict do nothing;
```

Manual Table Editor role changes must update both:

- `user_profiles.primary_role`
- an active `role_assignments` row for the same role

Changing `user_profiles.primary_role` alone does not grant access.

## Verification SQL

Profiles with no active role assignment:

```sql
select
  up.id as user_profile_id,
  up.auth_user_id,
  up.display_name,
  up.primary_role,
  up.status
from public.user_profiles up
where not exists (
  select 1
  from public.role_assignments ra
  where ra.user_profile_id = up.id
    and ra.status = 'active'
)
order by up.created_at desc;
```

Profiles whose `primary_role` has no matching active assignment:

```sql
select
  up.id as user_profile_id,
  up.auth_user_id,
  up.display_name,
  up.primary_role,
  up.status
from public.user_profiles up
where up.primary_role is not null
  and not exists (
    select 1
    from public.role_assignments ra
    where ra.user_profile_id = up.id
      and ra.role = up.primary_role
      and ra.status = 'active'
  )
order by up.created_at desc;
```

Profiles with multiple active roles:

```sql
select
  up.id as user_profile_id,
  up.display_name,
  up.primary_role,
  array_agg(ra.role order by ra.role) as active_roles,
  count(*) as active_role_count
from public.user_profiles up
join public.role_assignments ra on ra.user_profile_id = up.id
where ra.status = 'active'
group by up.id, up.display_name, up.primary_role
having count(*) > 1
order by active_role_count desc, up.display_name;
```

Role mismatch examples where an active role exists but `primary_role` is different:

```sql
select
  up.id as user_profile_id,
  up.display_name,
  up.primary_role,
  ra.role as active_role,
  ra.status as role_status
from public.user_profiles up
join public.role_assignments ra on ra.user_profile_id = up.id
where ra.status = 'active'
  and up.primary_role is distinct from ra.role
order by up.updated_at desc;
```

## Security Notes

- Route guards must check active roles through `role_assignments`.
- Server actions must re-check roles before using service-role database access.
- Service-role Supabase clients must remain server-only.
- FMS users must never see importer contact details.
- Importers must never see FMS contact details.
- Factory sensitive contacts remain admin-only unless released through a future approved workflow.
