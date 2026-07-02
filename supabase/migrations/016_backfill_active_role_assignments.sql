-- Backfill missing active role_assignments from user_profiles.primary_role.
-- This repairs legacy/manual accounts without weakening the role_assignments
-- source-of-truth model. It is idempotent and does not delete or revoke roles.

with missing_primary_roles as (
  select
    up.id as user_profile_id,
    up.auth_user_id,
    up.primary_role
  from public.user_profiles up
  where up.primary_role is not null
    and not exists (
      select 1
      from public.role_assignments ra
      where ra.user_profile_id = up.id
        and ra.role = up.primary_role
        and ra.status = 'active'
    )
),
inserted_assignments as (
  insert into public.role_assignments (
    user_profile_id,
    role,
    status,
    assigned_at,
    metadata
  )
  select
    user_profile_id,
    primary_role,
    'active',
    now(),
    jsonb_build_object(
      'assignment_source', 'migration_016_primary_role_backfill',
      'backfill_reason', 'primary_role_missing_active_role_assignment'
    )
  from missing_primary_roles
  on conflict do nothing
  returning id, user_profile_id, role
)
insert into public.audit_logs (
  action,
  entity_type,
  entity_id,
  before_data,
  after_data,
  metadata
)
select
  'role_assignment_backfilled_from_primary_role',
  'role_assignment',
  ia.id,
  null,
  jsonb_build_object(
    'user_profile_id', ia.user_profile_id,
    'role', ia.role::text,
    'status', 'active'
  ),
  jsonb_build_object(
    'migration', '016_backfill_active_role_assignments',
    'no_secret_values_stored', true
  )
from inserted_assignments ia;

comment on index public.role_assignments_active_unique is
  'Prevents duplicate active role rows for the same user profile and role.';
