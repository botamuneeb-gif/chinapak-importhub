-- Extend the safe Super Admin directory view with role/profile management
-- fields. This still avoids password hashes, tokens, refresh tokens, and raw
-- auth internals.

create or replace view public.admin_user_directory as
select
  au.id as auth_user_id,
  up.id as user_profile_id,
  au.email::text as email,
  up.display_name,
  up.primary_role,
  up.status as profile_status,
  coalesce(role_summary.active_roles, array[]::text[]) as active_roles,
  coalesce(role_summary.role_statuses, '{}'::jsonb) as role_statuses,
  up.created_at,
  up.updated_at,
  ip.full_name as importer_business_name,
  ip.business_type as importer_business_type,
  ip.city as importer_city,
  fp.fms_code,
  fp.tier as fms_tier,
  fp.status as fms_status,
  ap.agent_code,
  ap.status as agent_status,
  coalesce(role_summary.role_status_entries, '[]'::jsonb) as role_status_entries,
  ip.id as importer_profile_id,
  fp.id as fms_profile_id,
  fp.city_province as fms_city_province,
  fp.categories as fms_categories,
  fp.academy_status as fms_academy_status,
  fp.quality_score as fms_quality_score,
  ap.id as agent_profile_id,
  ap.city_market as agent_city_market
from auth.users au
join public.user_profiles up on up.auth_user_id = au.id
left join public.importer_profiles ip on ip.user_profile_id = up.id
left join public.fms_profiles fp on fp.user_profile_id = up.id
left join public.agent_profiles ap on ap.user_profile_id = up.id
left join lateral (
  select
    array_agg(ra.role::text order by ra.role::text)
      filter (where ra.status = 'active') as active_roles,
    jsonb_object_agg(ra.role::text, ra.status::text) as role_statuses,
    jsonb_agg(
      jsonb_build_object(
        'id', ra.id,
        'role', ra.role::text,
        'status', ra.status::text,
        'assigned_at', ra.assigned_at,
        'revoked_at', ra.revoked_at
      )
      order by ra.role::text, ra.assigned_at desc
    ) as role_status_entries
  from public.role_assignments ra
  where ra.user_profile_id = up.id
) role_summary on true;

revoke all on public.admin_user_directory from anon, authenticated;
grant select on public.admin_user_directory to service_role;

comment on view public.admin_user_directory is
  'Safe Super Admin user directory view. Exposes searchable role/profile management fields only; no password hashes, refresh tokens, auth secrets, or raw auth internals.';
