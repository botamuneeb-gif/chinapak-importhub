-- Phase 9: private file and evidence storage buckets for ChinaPak ImportHub.
-- These buckets support importer uploads, FMS evidence, admin-private files,
-- and importer-released report evidence. Objects are private; app code issues
-- short-lived signed URLs only after role/firewall checks.

alter type public.file_bucket add value if not exists 'importer-project-files';
alter type public.file_bucket add value if not exists 'fms-evidence-files';
alter type public.file_bucket add value if not exists 'admin-private-files';
alter type public.file_bucket add value if not exists 'importer-released-report-files';

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values
      ('importer-project-files', 'importer-project-files', false),
      ('fms-evidence-files', 'fms-evidence-files', false),
      ('admin-private-files', 'admin-private-files', false),
      ('importer-released-report-files', 'importer-released-report-files', false)
    on conflict (id) do update
      set
        name = excluded.name,
        public = false;
  end if;
end $$;

comment on table public.file_assets is
  'Private file/evidence metadata. Storage objects remain private and are exposed only through short-lived signed URLs after role and visibility checks.';

comment on table public.file_access_grants is
  'Explicit file access grants for admin-approved release workflows such as importer-visible report evidence.';
