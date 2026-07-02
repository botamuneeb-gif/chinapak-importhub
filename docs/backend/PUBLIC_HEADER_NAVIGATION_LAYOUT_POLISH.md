# Public Header Navigation Layout Polish

## Old Issue

After the auth-aware public navigation update, public links, language support, and account controls were all competing in the same flexible area. On wider screens this made links such as Packages, Learn, Contact, and FMS look scattered, and logged-in controls could push the navigation out of alignment.

## New Header Grouping

The public header now uses three clear desktop zones:

1. Brand block on the left
2. Public navigation in the center/left-middle
3. Auth/account actions on the right

Public navigation labels are kept short and consistent:

- Packages
- Learn
- How It Works
- Contact
- Work as FMS

## Desktop Behavior

Desktop uses a single professional row:

- Brand is fixed-width/flex-none.
- Public navigation is grouped together and centered within available space.
- Auth controls are compact on the right.
- Logged-out users see Login and Start Import Project.
- Logged-in users see a compact identity card, Dashboard, and Logout.
- Long display names or emails truncate instead of pushing the navigation around.

## Mobile Behavior

Mobile shows:

- Brand/logo
- One menu button

Inside the mobile menu:

1. Public links appear first.
2. A divider separates navigation from account controls.
3. Logged-out users see Login and Start Import Project.
4. Logged-in users see identity, role, Dashboard, optional My Projects for importers, and Logout.

## Auth-Aware Dashboard Behavior

Dashboard routing still comes from the safe auth session summary:

- `importer` -> `/importer/dashboard`
- `admin` -> `/admin`
- `super_admin` -> `/super-admin`
- `fms` -> `/fms/dashboard`
- `agent` -> `/agent/dashboard`
- multiple or unclear roles -> `/auth/role-select`

No role guard, dashboard, or Supabase schema behavior was changed.

## QA Checklist

- Logged-out desktop header is one aligned row.
- Logged-in importer desktop header shows compact account controls.
- Logged-in admin/FMS desktop header keeps public links grouped.
- Mobile menu has public links first, then account actions.
- Dashboard remains easy to find after login.
- Logout works from public pages.
- No duplicate public links appear.
- No horizontal overflow on mobile/tablet widths.
- Public pages and SEO routes still build normally.
