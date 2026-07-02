# Apply Migrations Checklist

Status: pre-flight documentation only. Do not run these commands until the founder confirms the target Supabase project.

Source of truth: `AGENTS.md`, `docs/MDOM.md`, and `docs/backend/PHASE_1_SUPABASE_FOUNDATION.md`.

## Current Pre-Flight Findings

- `.env.local` is ignored by `.gitignore` through both `.env.local` and `.env*.local`.
- `.env.example` exists and contains blank Supabase keys only.
- `supabase/migrations/` contains the expected ordered files from `001_extensions_and_enums.sql` through `012_rls_initial_policies.sql`.
- `supabase/seed.sql` exists and contains static seed/upsert data only. It does not contain schema creation, alteration, privilege, or destructive statements.
- `supabase --version` was checked in PowerShell and the Supabase CLI is not currently installed in this shell.
- No `.env.local` values were read or printed.

## Pre-Flight Checklist

Before applying anything to a database:

- Confirm the target Supabase project is the correct non-production project unless the founder explicitly approves production.
- Confirm `.env.local` exists locally and is not committed.
- Confirm `.env.local` contains:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_SECRET`
  - `NEXT_PUBLIC_SITE_URL`
- Do not print or paste `.env.local` values into chat, screenshots, logs, or commits.
- Confirm Supabase CLI is installed with:

```bash
supabase --version
```

- Confirm Docker or a Docker-compatible runtime is available if running the local Supabase stack.
- Confirm all migrations are reviewed in `supabase/migrations/`.
- Confirm `supabase/seed.sql` contains only static seed data.
- Confirm RLS is enabled by `012_rls_initial_policies.sql` and broad public policies are not added.
- Confirm a rollback/backup plan exists before applying to any remote project.

## Supabase CLI Install Options

The CLI was not installed in the current shell during this pre-flight check.

Official install options include:

- Project-local npm dev dependency:

```bash
npm install --save-dev supabase
npx supabase --version
```

- Windows Scoop:

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase --version
```

- macOS/Linux Homebrew:

```bash
brew install supabase/tap/supabase
supabase --version
```

Reference:

- Supabase local development CLI docs: https://supabase.com/docs/guides/local-development
- Supabase CLI repository: https://github.com/supabase/cli

Do not install the CLI inside this project unless the team agrees whether it should be a local dev dependency or a system-level tool.

## Login To Supabase CLI

After CLI installation:

```bash
supabase login
```

This opens or prompts for Supabase authentication. Use the owner-approved Supabase account.

## Link The Remote Project

Use the Supabase project reference from the Supabase dashboard URL or project settings.

```bash
supabase link --project-ref <PROJECT_REF>
```

Do not paste database passwords or service role keys into chat. If prompted for a database password, enter it only in the local terminal.

## Push Migrations

After linking and confirming the target project:

```bash
supabase db push
```

This applies pending local migrations to the linked remote database.

Recommended before push:

```bash
supabase migration list
```

Review the output and confirm only the intended Phase 1 migration files are pending.

## Local Migration Test Option

If using local Supabase first:

```bash
supabase start
supabase db reset
```

`supabase db reset` is intended for local development. Do not use it against a remote project unless the team explicitly intends to reset that database.

## Seeding Notes

Local seeding:

```bash
supabase db reset
```

The local reset workflow applies migrations and can run `supabase/seed.sql` in the local stack.

Remote seeding:

- Do not assume `supabase db push` applies `supabase/seed.sql`.
- Review `supabase/seed.sql` before running it remotely.
- Preferred first remote seed path: paste the reviewed seed SQL into the Supabase SQL editor for the linked project, or run it through an approved secure SQL client using the database connection.
- Do not run seed SQL until after migrations apply successfully.

## Rollback Warning

PostgreSQL migrations in this project do not include automatic down migrations.

Before applying to a remote database:

- Create a backup or snapshot in the Supabase dashboard.
- Record the exact migration files being applied.
- Confirm whether the target is empty, staging, or production.
- Avoid applying to production until Phase 1 is tested locally or in staging.

If a migration fails:

- Stop.
- Do not manually patch the remote database without documenting the state.
- Capture the error message without exposing secrets.
- Decide whether to fix forward with a new migration or restore from backup.

## Verify Tables In Supabase Dashboard

After migration push:

1. Open the Supabase dashboard.
2. Select the linked project.
3. Open Table Editor.
4. Confirm the `public` schema contains the expected Phase 1 tables.
5. Confirm sensitive tables exist but are not publicly exposed:
   - `factory_sensitive_contacts`
   - `import_project_internal_notes`
   - `file_assets`
   - `audit_logs`
   - `access_logs`
   - `security_events`
6. Open Authentication > Policies or Database > Policies and confirm RLS is enabled on operational tables.

Optional SQL verification:

```sql
select tablename
from pg_tables
where schemaname = 'public'
order by tablename;
```

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

## Security Warning About Service Role Key

- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed in browser code.
- Do not prefix it with `NEXT_PUBLIC_`.
- Do not paste it into chat, screenshots, commits, logs, or client-side config.
- The service role bypasses RLS and must be used only in trusted server code that enforces ChinaPak ImportHub rules.
- Current frontend routes are not connected to Supabase and should remain placeholder-only until the next approved phase.

## Safe To Proceed Criteria

It is safe to proceed with migration application only when:

- Supabase CLI is installed and version output is visible.
- Target project is confirmed.
- Backup/rollback plan is confirmed.
- `.env.local` is configured locally and ignored by Git.
- The team accepts that Phase 1 creates schema and static seed data only.
- The founder explicitly instructs Codex to apply migrations.
