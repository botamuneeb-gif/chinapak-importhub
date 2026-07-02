# Role-Based Portal Navigation

Status: UX/navigation foundation for protected ChinaPak ImportHub portals. No backend phase, schema, payment, report, FMS, or file workflow behavior was changed.

## Portal Shell Structure

The shared portal chrome lives in:

- `components/navigation/portal-shell.tsx`
- `components/navigation/role-protected-portal-shell.tsx`
- `components/navigation/role-nav-items.ts`

`RoleProtectedPortalShell` composes the existing `RoleProtectedShell` guard with `PortalShell`. The role guard still decides access first. Portal navigation is rendered only for protected portal routes after access is allowed.

The shell provides:

- Desktop sidebar
- Sticky topbar
- Mobile horizontal navigation
- Active route highlighting
- Breadcrumbs for detail routes
- Signed-in user label
- Role-aware logout button
- Dashboard quick action cards
- Disabled/future badges for placeholder features

## Public vs Protected Route Boundaries

Public routes remain public and are not wrapped in protected portal navigation:

- `/`
- `/login`
- `/signup`
- `/fms`
- `/fms/login`
- `/fms/opportunities`
- `/fms/opportunities/china-sourcing-jobs`
- `/fms/opportunities/work-with-pakistani-importers`
- `/admin/login`
- `/super-admin/login`
- `/agent`
- `/agent/login`
- `/factory/login`
- `/factory/signup`

Protected portal routes keep their existing role guards:

- Importer: `/importer/dashboard`, `/importer/start`, `/importer/reports`, `/importer/messages`
- FMS: `/fms/dashboard`, `/fms/assignments`, `/fms/messages`, `/fms/academy`, `/fms/earnings`
- Admin: `/admin` and admin subroutes except `/admin/login`
- Super Admin: `/super-admin` and subroutes except `/super-admin/login`
- Agent: `/agent/dashboard`, `/agent/leads`, `/agent/commissions`, `/agent/training`

## Navigation Items By Role

Importer:

- Dashboard
- Start New Project
- My Reports
- Messages / Feedback
- Payments
- Invoices
- Refunds
- Profile placeholder
- Logout

FMS:

- Dashboard
- Assignments
- Factory Submissions / Evidence
- Messages placeholder
- Academy
- Earnings
- Profile placeholder
- Logout

Admin:

- Dashboard
- Projects
- Leads
- Payments
- Refunds
- FMS Directory
- Factory Submissions
- Evidence Review
- Report Feedback
- Factories
- Messages placeholder
- Logout

Super Admin:

- Dashboard
- User Management
- Role Controls
- System Settings placeholder
- Audit / Security placeholder
- Logout

Agent:

- Dashboard
- Leads
- Commissions
- Training
- Profile placeholder
- Logout

Normal admin navigation intentionally does not expose Super Admin user-management controls.

## Logout Behavior

Logout uses the singleton browser Supabase client:

1. `supabase.auth.signOut()`
2. Redirect to the role login route:
   - Importer: `/login`
   - FMS: `/fms/login`
   - Admin: `/admin/login`
   - Super Admin: `/super-admin/login`
   - Agent: `/agent/login`

The service-role client is never used in portal navigation components.

## Mobile Behavior

Desktop uses a fixed left sidebar. Mobile uses a sticky topbar and horizontal scroll navigation under the topbar. Disabled/future items remain visible but non-clickable so users can see planned portal areas without triggering fake workflows.

## Remaining Placeholders

- Importer profile page
- FMS profile page
- Agent profile page
- Super Admin system settings
- Super Admin audit/security center
- Some messaging/payment/refund pages remain existing placeholder UI until their backend phases are connected.
