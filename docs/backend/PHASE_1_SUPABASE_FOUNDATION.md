# Phase 1 Supabase Foundation

Status: foundation only. No live frontend features are connected to Supabase yet.

Source of truth: `AGENTS.md`, `docs/MDOM.md`, and the backend blueprint documents in `docs/backend/`.

## What Was Added

- Supabase project folder:
  - `supabase/migrations/`
  - `supabase/seed.sql`
- Ordered Phase 1 migration files:
  - `001_extensions_and_enums.sql`
  - `002_auth_profiles_and_roles.sql`
  - `003_packages_pricing_settings.sql`
  - `004_import_projects_and_leads.sql`
  - `005_payments_invoices_refunds.sql`
  - `006_fms_assignments_and_payouts.sql`
  - `007_factory_database.sql`
  - `008_messaging_translation.sql`
  - `009_file_assets_storage_metadata.sql`
  - `010_agents_commissions_training.sql`
  - `011_audit_security_logs.sql`
  - `012_rls_initial_policies.sql`
- Supabase utility wrappers:
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `lib/supabase/admin.ts`
  - `lib/supabase/types.ts`
- Environment template:
  - `.env.example`
- Dependency:
  - `@supabase/supabase-js`

## Environment Variables

Copy `.env.example` to `.env.local` when a real Supabase project is ready.

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Security Warnings

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.
- `lib/supabase/admin.ts` imports `server-only` and is for trusted server code only.
- Service-role clients bypass RLS. Any future use must explicitly enforce ChinaPak ImportHub role, project, file, and data-release rules.
- Do not create broad public read policies on operational tables.
- Factory sensitive contacts, FMS contact details, importer contact details, raw FMS evidence, and internal admin notes must stay protected by RLS and server-side rules.

## Migration Notes

These migrations are schema foundation files only. They have not been applied to a live Supabase project by this task.

Future local workflow, once Supabase CLI is configured:

```bash
supabase start
supabase db reset
```

Future linked-project workflow:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Do not run linked-project commands until the founder confirms the target Supabase project.

## RLS Phase 1 Stance

`012_rls_initial_policies.sql` enables RLS on all operational tables.

Only narrow self-read policies are added for:

- own `user_profiles`
- own `role_assignments`
- own role-specific profile rows for importer/FMS/agent

Most operational tables are intentionally deny-by-default until Phase 2+ implements auth flows, granular policies, and tests.

## Business Rules Reflected In Schema

- Import Projects are the central workflow anchor.
- Unpaid leads are separate from active sourcing work.
- FMS assignments are blocked at database level unless the project is paid and admin review is ready for FMS assignment.
- Importer-FMS direct messages are blocked by messaging constraints.
- Factory sensitive contacts are separated into `factory_sensitive_contacts`.
- File access requires future `file_access_grants` and review workflow.
- Factory portal and factory claim flow are future/hidden by naming and status fields.

## Seed Data

`supabase/seed.sql` seeds:

- Packages:
  - Factory Discovery: PKR 18,000
  - Factory Match Plus: PKR 35,000
  - Import Partner: PKR 75,000
- Package features
- Add-ons
- Refund rules
- Bronze/Silver/Gold FMS payout rules
- Basic platform settings

The seed uses `on conflict` upserts so it can be re-run safely.

## Intentionally Not Connected Yet

This Phase 1 task does not implement:

- Supabase project linking
- Real auth flows
- OTP/phone login
- API routes
- Frontend data reads/writes
- Real payments
- File upload storage buckets
- Messaging backend
- FMS assignment UI mutations
- Invoices/refunds backend actions
- Factory review mutations
- Realtime subscriptions

All current frontend pages continue to use placeholder/static data.

## Next Phase Recommendation

Phase 2 should implement auth/profile setup only:

1. Configure Supabase auth locally.
2. Add profile creation helpers.
3. Add invitation token flow for FMS/agent/factory future.
4. Add robust RLS helper functions.
5. Add tests proving:
   - importer cannot see FMS contact details
   - FMS cannot see importer contact details
   - agent can see assigned leads only
   - factory sensitive contacts remain admin-only

Do not connect importer project persistence until Phase 3.
