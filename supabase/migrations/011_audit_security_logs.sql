create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role public.user_role,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index audit_logs_actor_user_id_idx on public.audit_logs(actor_user_id);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);

create table public.access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  role public.user_role,
  resource_type text not null,
  resource_id uuid,
  access_type text not null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index access_logs_user_id_idx on public.access_logs(user_id);
create index access_logs_resource_idx on public.access_logs(resource_type, resource_id);

create table public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  severity text not null default 'info',
  description text,
  ip_address inet,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index security_events_user_id_idx on public.security_events(user_id);
create index security_events_event_type_idx on public.security_events(event_type);

create table public.data_release_approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.import_projects(id) on delete cascade,
  factory_id uuid references public.factories(id) on delete cascade,
  file_asset_id uuid references public.file_assets(id) on delete cascade,
  release_type text not null,
  released_to_role public.user_role not null,
  approved_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  approved_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index data_release_approvals_project_id_idx on public.data_release_approvals(project_id);
create index data_release_approvals_factory_id_idx on public.data_release_approvals(factory_id);
create index data_release_approvals_file_asset_id_idx on public.data_release_approvals(file_asset_id);
create trigger set_data_release_approvals_updated_at before update on public.data_release_approvals for each row execute function public.set_updated_at();

create table public.contact_info_detection_events (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  source_id uuid not null,
  detected_type text not null,
  detected_excerpt text,
  status text not null default 'open',
  reviewed_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index contact_info_detection_events_source_idx on public.contact_info_detection_events(source_table, source_id);
create trigger set_contact_info_detection_events_updated_at before update on public.contact_info_detection_events for each row execute function public.set_updated_at();
