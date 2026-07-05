# Super Admin Role Controls Refactor

## Old Issue

The Super Admin navigation showed `Role Controls`, but that item routed back to `/super-admin/users` and explained that role controls were managed inside user management. The result was a confusing tab and a crowded user-management page where directory search, account safety actions, password reset, role assignment, role revocation, conversion, and FMS profile repair all competed for space.

## New Structure

Super Admin now has two purpose-built sections:

- `/super-admin/users`: searchable user directory and account safety management.
- `/super-admin/role-controls`: dedicated role assignment, revocation, conversion, and role/profile repair.

The Super Admin navigation now links directly to `/super-admin/role-controls`. The old "Inside user management" wording has been removed.

## User Management Behavior

`/super-admin/users` focuses on account visibility and account safety:

- Search users by name, email, role, status, FMS code, and business/profile fields exposed by `admin_user_directory`.
- Filter by role and profile status.
- View display name, email, active role badges, profile status, and role/profile hygiene badges.
- Open the selected account summary.
- Reset password using the existing Super Admin-only server action.
- Suspend or soft-delete users with the existing confirmation and lockout protections.
- Open `/super-admin/role-controls?user=<userProfileId>` from a `Manage Roles` link.

Role assignment, revocation, primary-role conversion, and FMS profile repair are no longer buried in the user directory panel.

## Role Controls Behavior

`/super-admin/role-controls` focuses on high-risk role operations:

- Search/select a user using the same safe directory data.
- Deep-link to a selected user with `?user=<userProfileId>`.
- Show selected user summary, active roles, primary role, and profile status.
- Change `user_profiles.primary_role`.
- Ensure or reactivate an active `role_assignments` row.
- Revoke a role by marking assignment history revoked.
- Convert a multi-role account into a single active role.
- Create or activate a basic FMS profile only after the FMS role has been intentionally assigned.

The page includes a safety note reminding Super Admins that role changes are privileged operations.

## Security Protections

No schema migration was required for this refactor.

Existing protections remain in the server actions:

- Only active `super_admin` users can call Super Admin management actions.
- Service role access stays server-side only.
- Privileged-role changes require explicit confirmation.
- The platform blocks removal, suspension, conversion, or deletion paths that would leave no active `super_admin`.
- Self-lockout and self-delete paths still require explicit confirmation.
- Audit/security logging remains attached to sensitive mutations.
- `role_assignments` remains the source of truth for access.

## QA Checklist

1. Login as an active Super Admin.
2. Open `/super-admin/users` and confirm it loads as a clean user directory.
3. Search/filter users and select a row.
4. Confirm role mutation panels are not shown on `/super-admin/users`.
5. Confirm reset password and suspend/delete account safety controls still work where appropriate.
6. Click `Manage Roles` for a user and confirm `/super-admin/role-controls?user=<userProfileId>` opens with that user selected.
7. Open `/super-admin/role-controls` directly and select/search a user.
8. Assign a non-privileged role and confirm the active role row is repaired without duplicates.
9. Revoke a test role and confirm history is retained.
10. Convert a multi-role test account to one role and confirm other active roles are revoked.
11. Attempt to remove the last active `super_admin` and confirm it is blocked.
12. Confirm normal admin/importer/FMS/agent accounts cannot access either Super Admin route.
