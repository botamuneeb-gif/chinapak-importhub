create table public.file_assets (
  id uuid primary key default gen_random_uuid(),
  bucket public.file_bucket not null,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  uploaded_by uuid references auth.users(id) on delete set null,
  source_role public.user_role,
  project_id uuid references public.import_projects(id) on delete set null,
  assignment_id uuid references public.fms_assignments(id) on delete set null,
  factory_id uuid references public.factories(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  checksum text,
  review_status public.file_review_status_enum not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index file_assets_project_id_idx on public.file_assets(project_id);
create index file_assets_assignment_id_idx on public.file_assets(assignment_id);
create index file_assets_factory_id_idx on public.file_assets(factory_id);
create index file_assets_message_id_idx on public.file_assets(message_id);
create index file_assets_review_status_idx on public.file_assets(review_status);
create trigger set_file_assets_updated_at before update on public.file_assets for each row execute function public.set_updated_at();

create table public.file_access_grants (
  id uuid primary key default gen_random_uuid(),
  file_asset_id uuid not null references public.file_assets(id) on delete cascade,
  granted_to_role public.user_role,
  granted_to_user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references public.import_projects(id) on delete cascade,
  scope text not null default 'read',
  expires_at timestamptz,
  granted_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  constraint file_access_grants_has_target check (granted_to_role is not null or granted_to_user_id is not null)
);
create index file_access_grants_file_asset_id_idx on public.file_access_grants(file_asset_id);
create index file_access_grants_project_id_idx on public.file_access_grants(project_id);
create trigger set_file_access_grants_updated_at before update on public.file_access_grants for each row execute function public.set_updated_at();

create table public.file_review_status (
  id uuid primary key default gen_random_uuid(),
  file_asset_id uuid not null unique references public.file_assets(id) on delete cascade,
  review_status public.file_review_status_enum not null default 'pending_review',
  reviewed_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_file_review_status_updated_at before update on public.file_review_status for each row execute function public.set_updated_at();

create table public.file_redaction_history (
  id uuid primary key default gen_random_uuid(),
  file_asset_id uuid not null references public.file_assets(id) on delete cascade,
  redacted_file_asset_id uuid references public.file_assets(id) on delete set null,
  redaction_reason text not null,
  redacted_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index file_redaction_history_file_asset_id_idx on public.file_redaction_history(file_asset_id);

alter table public.refund_evidence
  add constraint refund_evidence_file_asset_id_fkey
  foreign key (file_asset_id) references public.file_assets(id) on delete set null;

alter table public.fms_submission_evidence
  add constraint fms_submission_evidence_file_asset_id_fkey
  foreign key (file_asset_id) references public.file_assets(id) on delete set null;

alter table public.factory_certifications
  add constraint factory_certifications_file_asset_id_fkey
  foreign key (file_asset_id) references public.file_assets(id) on delete set null;

alter table public.factory_evidence
  add constraint factory_evidence_file_asset_id_fkey
  foreign key (file_asset_id) references public.file_assets(id) on delete set null;

alter table public.message_attachments
  add constraint message_attachments_file_asset_id_fkey
  foreign key (file_asset_id) references public.file_assets(id) on delete set null;
