# Auth-Aware Public Navigation Fix

## Old Issue

Public pages such as `/packages`, `/learn`, `/contact`, and SEO landing pages used a static header. A logged-in user could visit those pages but could not easily see the active session, role, or path back to the correct portal dashboard.

## New Behavior

The public header now includes a small client-side auth status menu.

Logged-out visitors see:

- Login
- Sign Up
- Start Import Project
- Public navigation such as Packages, Learn, Contact, Verify, and FMS

Logged-in users see:

- Logged-in identity using display name or email
- Safe role label
- Dashboard button
- Logout button
- My Projects button for importer-only sessions

The portal shells and role guards remain unchanged. This fix only improves the public website header experience.

## Dashboard Routing Rules

The safe session summary routes users by active role:

- `importer` -> `/importer/dashboard`
- `admin` -> `/admin`
- `super_admin` -> `/super-admin`
- `fms` -> `/fms/dashboard`
- `agent` -> `/agent/dashboard`

If an account has multiple active roles or the role cannot be safely resolved, the Dashboard button routes to `/auth/role-select`.

## Safe Session Summary Fields

The public header requests only:

- logged-in state
- display name
- email
- role label
- dashboard URL
- importer My Projects eligibility

It does not expose:

- Supabase tokens
- service role keys
- profile IDs
- internal notes
- admin metadata
- private importer, FMS, agent, or representative fields

## Logout Behavior

Logout uses the existing singleton browser Supabase client. After sign-out, the public header returns to the logged-out state and routes the user to the homepage.

## SEO And Rendering Notes

The public pages remain SEO-friendly because the header shell is still rendered normally and only the small account menu hydrates on the client. The session summary is fetched after page load and is not embedded in static page source.

## QA Checklist

- Logged-out user sees Login, Sign Up, and Start Import Project.
- Logged-in importer on `/packages` sees Dashboard and My Projects.
- Logged-in admin on `/packages` routes Dashboard to `/admin`.
- Logged-in FMS on `/packages` routes Dashboard to `/fms/dashboard`.
- Multi-role user routes Dashboard to `/auth/role-select`.
- Logout works from public pages.
- Protected dashboards remain role guarded.
- No private profile fields or tokens appear in public responses.
