# Test FMS Account Setup

Status: FMS invite codes are not live yet. The `/auth/invite` page is a placeholder for invitation/admin-approved access, and it does not validate or store FMS invite codes.

Use this guide to create a safe manual test Factory Match Specialist account for Phase 5 assignment testing. Do not create FMS users through public importer signup.

## Current Auth Model

- FMS public signup remains disabled.
- `/fms/login` uses Supabase email/password login.
- Portal access requires an active `fms` row in `role_assignments`.
- Assignment pages also require an active row in `fms_profiles`.
- `role_assignments` is the source of truth for access.

## Required Tables

Create or confirm one row in each table:

- `auth.users`: Supabase login identity.
- `user_profiles`: base ChinaPak ImportHub profile.
- `role_assignments`: active `fms` role grant.
- `fms_profiles`: operational FMS profile used by admin assignment screens.

## Manual Setup in Supabase Dashboard

1. Open Supabase Dashboard.
2. Go to Authentication > Users.
3. Add a test user with email/password.
4. Confirm the user email if local testing requires immediate login.
5. Copy the Auth User ID.
6. Go to Table Editor > `user_profiles`.
7. Insert a row:

| Column | Value |
| --- | --- |
| `auth_user_id` | Auth User ID from `auth.users` |
| `display_name` | Test FMS Guangzhou |
| `primary_role` | `fms` |
| `preferred_language` | `zh` or `en` |
| `status` | `active` |
| `metadata` | `{"setup_source":"manual_test_fms_account"}` |

8. Copy the new `user_profiles.id`.
9. Go to Table Editor > `role_assignments`.
10. Insert a row:

| Column | Value |
| --- | --- |
| `user_profile_id` | The `user_profiles.id` from step 8 |
| `role` | `fms` |
| `status` | `active` |
| `metadata` | `{"assignment_source":"manual_test_fms_account"}` |

11. Go to Table Editor > `fms_profiles`.
12. Insert a row:

| Column | Value |
| --- | --- |
| `user_profile_id` | The `user_profiles.id` from step 8 |
| `fms_code` | `FMS-TEST-CN-001` or another unique code |
| `tier` | `bronze`, `silver`, or `gold` |
| `city_province` | Guangzhou, Guangdong |
| `categories` | `{"electronics","bags","household goods"}` |
| `academy_status` | `in_progress` or `certified` |
| `quality_score` | `85` |
| `status` | `active` |
| `metadata` | `{"languages":["zh-CN","en"],"setup_source":"manual_test_fms_account"}` |

13. Login at `/fms/login` with the test email/password.
14. Open `/admin/fms` as admin and confirm the FMS appears in the directory.
15. Assign only a project that is already `payment_status = paid` and `admin_review_status = ready_for_fms_assignment`.

## Optional SQL Template

Use this only after creating the Supabase Auth user. Replace `<AUTH_USER_ID>` before running. If a profile already exists for that auth user, use the Table Editor to update it instead of inserting duplicates.

```sql
with profile as (
  insert into public.user_profiles (
    auth_user_id,
    display_name,
    primary_role,
    preferred_language,
    status,
    metadata
  )
  values (
    '<AUTH_USER_ID>'::uuid,
    'Test FMS Guangzhou',
    'fms',
    'zh',
    'active',
    '{"setup_source":"manual_test_fms_account"}'::jsonb
  )
  returning id
),
role_row as (
  insert into public.role_assignments (
    user_profile_id,
    role,
    status,
    metadata
  )
  select
    id,
    'fms',
    'active',
    '{"assignment_source":"manual_test_fms_account"}'::jsonb
  from profile
  returning id
)
insert into public.fms_profiles (
  user_profile_id,
  fms_code,
  tier,
  city_province,
  categories,
  academy_status,
  quality_score,
  status,
  metadata
)
select
  id,
  'FMS-TEST-CN-001',
  'silver',
  'Guangzhou, Guangdong',
  array['electronics', 'bags', 'household goods'],
  'in_progress',
  85,
  'active',
  '{"languages":["zh-CN","en"],"setup_source":"manual_test_fms_account"}'::jsonb
from profile
cross join role_row;
```

## What Not To Do

- Do not use public importer signup for FMS creation.
- Do not let public users self-select the `fms` role.
- Do not expose or paste the service role key in browser code, support chats, or docs.
- Do not add FMS users to importer-only lists unless they also have an intentional active importer role.
- Do not assign unpaid leads to FMS.

## Troubleshooting

- If `/fms/login` says access denied, check `role_assignments.role = fms` and `role_assignments.status = active`.
- If the FMS can login but sees no profile, check `fms_profiles.user_profile_id` and `fms_profiles.status = active`.
- If `/admin/fms` does not show the FMS as assignable, confirm both the role assignment and FMS profile are active.
- If assignment fails, confirm the project is paid, admin-approved, and not already assigned to another active FMS.

## Cleanup

For temporary test accounts, prefer deactivation over deletion when assignments or audit history exist:

- Set `role_assignments.status = revoked` for the test FMS role.
- Set `fms_profiles.status = suspended`.
- Keep historical assignment records intact for auditability.
