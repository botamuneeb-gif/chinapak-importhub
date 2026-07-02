# Super Admin User Management

This document describes the safe user-management foundation for ChinaPak ImportHub. It supports searchable account visibility, role hygiene, profile repair, user suspension, Auth soft deletion, and controlled Super Admin password reset without exposing Supabase Auth internals.

## Identity Model

`auth.users` is the Supabase login identity table for every role: importer, FMS, agent, admin, super admin, and future factory users.

`user_profiles` is the application base profile for every account. It stores safe display fields such as `display_name`, `primary_role`, `status`, language preference, and profile metadata. Importer signup writes the submitted full name to `user_profiles.display_name` and also stores safe name metadata on the Auth user for convenience. Application display should still treat `user_profiles` as the source of truth.

`role_assignments` remains the source of truth for access. Route guards and server actions must check active role assignments, not only `user_profiles.primary_role` and not only role-specific profile rows.

Role-specific tables such as `importer_profiles`, `fms_profiles`, `agent_profiles`, `admin_profiles`, and `super_admin_profiles` are extensions. A stale importer profile row on a test staff account does not grant importer access unless an active `importer` role assignment also exists.

## Searchable Directory

Migration `015_admin_user_directory.sql` creates `public.admin_user_directory`, a safe searchable view for Super Admin tooling. Migration `017_admin_user_directory_management_fields.sql` extends the same view with safe management fields for badges and role-specific profile summaries.

The view exposes:

- Auth user ID and user profile ID
- Email
- Display name
- Primary role and profile status
- Active roles and role statuses
- Created/updated timestamps
- Importer profile fields currently available: full name, business type, city
- FMS code, tier, and status
- Agent code and status
- Safe role/profile management fields such as inactive role history and role-specific profile presence

The view intentionally does not expose password hashes, refresh tokens, confirmation tokens, recovery tokens, raw Auth metadata, or other sensitive Supabase Auth internals.

The view grants select access only to `service_role`. The UI reads it through a server action after confirming the caller has an active `super_admin` role.

## Super Admin Page

`/super-admin/users` is protected by the Super Admin route guard and by server-side role checks in its actions.

Super Admins can search/filter by:

- Name
- Email
- Role
- Profile status
- FMS code
- Importer profile fields currently available in the schema

The directory also shows account hygiene badges:

- `Role mismatch`: `user_profiles.primary_role` does not have a matching active role assignment.
- `Missing FMS profile`: account has active `fms` role but no `fms_profiles` row.
- `FMS profile not active`: account has active `fms` role but the FMS profile is not active.
- `Multiple roles`: account has more than one active role.
- `Suspended`: base user profile is suspended.
- `Super Admin protected`: account has active `super_admin` role and is subject to lockout checks.

Normal admins, importers, FMSs, agents, and future factory users must not access this module.

## Role Assignment Support

Super Admins can manage `role_assignments` for a selected account from `/super-admin/users`.

Role actions:

1. Verify the actor has an active `super_admin` role.
2. Validate the requested role against the locked platform roles.
3. Require explicit confirmation before adding privileged roles.
4. Check whether the selected user already has that active role.
5. Insert active roles only when missing.
6. Revoke roles by marking them `revoked` and setting `revoked_at`.
7. Convert a multi-role account into one active role.
8. Optionally update `user_profiles.primary_role` to match.
9. Write audit/security records without storing secrets.

`user_profiles.primary_role` is a display/default role. It does not grant access by itself. Protected routes use active `role_assignments`.

## Role-Specific Profile Repair

Role-specific profiles are not created silently when adding roles.

If an account receives `fms` role, Super Admin can create or activate a basic `fms_profiles` row from `/super-admin/users` with:

- `fms_code`
- `tier`
- `city_province`
- `categories`
- `academy_status`
- `quality_score`
- `status`

An FMS account is not practically assignable until it has both an active `fms` role assignment and a usable `fms_profiles` row.

Importer and agent profile presence is shown in the selected-user panel. Agent profile creation remains a future explicit workflow unless implemented separately.

Manual Supabase repair must update both `user_profiles.primary_role` and `role_assignments`. Changing `primary_role` alone does not grant access.

## Deactivation And Deletion

Suspension is the preferred safe deactivation action.

Suspending a user:

- Sets `user_profiles.status = suspended`.
- Optionally revokes all active role assignments.
- Does not delete the Supabase Auth user.
- Blocks protected portal access because session profile verification requires an active base profile.

Auth deletion is a dangerous action and is implemented as Supabase Auth soft delete:

- Calls `supabase.auth.admin.deleteUser(authUserId, true)` server-side.
- Requires confirmation text `DELETE USER`.
- Marks the app profile `revoked` when possible.
- Does not intentionally delete historical project, payment, report, feedback, audit, or timeline records.
- Historical app data may remain for audit/history and operational traceability.

Do not directly delete rows from `auth.users` in Table Editor. Use Supabase Admin Auth APIs so Auth state remains consistent.

## Lockout Protection

The platform blocks actions that would remove the last active `super_admin` role.

Protected actions include:

- Revoking `super_admin`
- Converting a user away from `super_admin`
- Suspending a Super Admin
- Soft-deleting a Super Admin Auth user

If a Super Admin manages their own account, the UI and server action require explicit self-lockout/self-delete confirmation before proceeding. The last-active-Super-Admin rule still cannot be bypassed.

## Password Reset

The password reset action is available only to active Super Admin users.

The action:

1. Reads the browser session token from the client.
2. Verifies the actor has an active `super_admin` role on the server.
3. Verifies the selected `user_profiles.id` matches the selected `auth.users.id`.
4. Validates the temporary password:
   - Minimum 10 characters
   - At least one lowercase letter
   - At least one uppercase letter
   - At least one number or symbol
5. Calls Supabase Admin Auth server-side:
   - `supabase.auth.admin.updateUserById(authUserId, { password })`
6. Writes audit/security records without storing the password value.

The temporary password is never displayed after submission, never logged, never stored in database metadata, and never written to audit tables.

Do not edit Supabase Auth password hashes directly in Table Editor. Passwords must be changed through Supabase Auth APIs so hashing, validation, and Auth state remain consistent.

## Audit Notes

The reset action writes:

- `audit_logs.action = password_reset_by_super_admin`
- `security_events.event_type = password_reset_by_super_admin`

Both records include actor/target identifiers and safety metadata, but no password value.

If audit insertion fails after Supabase Auth accepts the password reset, the action returns a warning so the Super Admin can investigate immediately.

## Password Reset Email

The UI includes a disabled placeholder for password reset email. It should be connected later only after Supabase Auth email templates, redirect URLs, and SMTP/sending rules are configured.

## Manual Testing

1. Apply migration `015_admin_user_directory.sql` to the linked Supabase project.
2. Login as an account with an active `super_admin` role assignment.
3. Open `/super-admin/users`.
4. Search by a known user's name, email, role, or FMS code.
5. Select a test user.
6. Enter a temporary password that passes strength checks.
7. Confirm the warning that the current password will be replaced.
8. Submit the reset.
9. Sign out and verify the test user can login with the new temporary password.
10. Confirm a normal `admin` account cannot open `/super-admin/users`.
11. Confirm importer/FMS/agent accounts cannot open `/super-admin/users`.
12. Review `audit_logs` and `security_events` for the password reset entries.

## Role Assignment Testing

1. Login as Super Admin.
2. Open `/super-admin/users`.
3. Select a test account.
4. Use `Activate role assignment` to ensure an active role.
5. Leave `Also set this as user_profiles.primary_role` checked when repairing a manual account.
6. Confirm the directory row refreshes and shows the active role.
7. Confirm the user can access only the portal allowed by active `role_assignments`.
8. For FMS testing, confirm an active `fms_profiles` row also exists.

## Advanced Control Testing

1. Add a secondary role to a test account and confirm the `Multiple roles` badge.
2. Revoke that role and confirm it appears in inactive role history.
3. Convert a multi-role account to one role and confirm all other active roles are revoked.
4. Change primary role without ensuring assignment and confirm the `Role mismatch` badge if no active role exists.
5. Change primary role with assignment enabled and confirm the matching active role exists.
6. Add `fms` role to a test account and confirm `Missing FMS profile`.
7. Create or activate the FMS profile and confirm `/admin/fms` can treat it as usable when profile status is active.
8. Suspend a test user and confirm protected portals deny access.
9. Attempt to revoke/delete the last active Super Admin and confirm it is blocked.
10. Soft-delete a disposable test Auth user only after typing `DELETE USER`.

## Security Warnings

- Never import `createAdminSupabaseClient` into client components.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`.
- Never show or store current passwords.
- Never store temporary passwords in notes, metadata, timeline events, or logs.
- Keep `role_assignments` as the access source of truth.
- Keep `/admin/login` and `/super-admin/login` separate.
- Public importer signup must never create admin, super admin, FMS, or agent roles.
- Prefer suspension over Auth deletion when project/audit history matters.
- Never delete historical project records as part of user management without a dedicated retention policy.
