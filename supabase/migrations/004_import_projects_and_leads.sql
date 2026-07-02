create table public.import_projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique,
  importer_profile_id uuid not null references public.importer_profiles(id) on delete restrict,
  importer_user_id uuid not null references auth.users(id) on delete restrict,
  package_id uuid references public.packages(id) on delete set null,
  payment_status public.payment_status not null default 'awaiting_payment',
  project_status public.project_status not null default 'draft',
  admin_review_status public.admin_review_status not null default 'not_started',
  paid_at timestamptz,
  admin_reviewed_at timestamptz,
  ready_for_fms_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index import_projects_importer_profile_id_idx on public.import_projects(importer_profile_id);
create index import_projects_importer_user_id_idx on public.import_projects(importer_user_id);
create index import_projects_payment_status_idx on public.import_projects(payment_status);
create index import_projects_project_status_idx on public.import_projects(project_status);
create trigger set_import_projects_updated_at before update on public.import_projects for each row execute function public.set_updated_at();

create table public.import_project_requirements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.import_projects(id) on delete cascade,
  product_name text,
  product_description text,
  product_links text[] not null default '{}',
  budget_range text,
  quantity text,
  quality_level text,
  import_experience text,
  special_notes text,
  input_methods text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index import_project_requirements_project_id_idx on public.import_project_requirements(project_id);
create trigger set_import_project_requirements_updated_at before update on public.import_project_requirements for each row execute function public.set_updated_at();

create table public.import_project_addons (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.import_projects(id) on delete cascade,
  addon_id uuid not null references public.addons(id) on delete restrict,
  status text not null default 'selected',
  price_snapshot_pkr integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  unique (project_id, addon_id)
);
create index import_project_addons_project_id_idx on public.import_project_addons(project_id);
create trigger set_import_project_addons_updated_at before update on public.import_project_addons for each row execute function public.set_updated_at();

create table public.import_project_status_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.import_projects(id) on delete cascade,
  from_status public.project_status,
  to_status public.project_status not null,
  reason text,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index import_project_status_history_project_id_idx on public.import_project_status_history(project_id);

create table public.import_project_timeline_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.import_projects(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text,
  visible_to_importer boolean not null default false,
  visible_to_fms boolean not null default false,
  visible_to_agent boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index import_project_timeline_events_project_id_idx on public.import_project_timeline_events(project_id);

create table public.import_project_internal_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.import_projects(id) on delete cascade,
  author_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  note_body text not null,
  note_type text not null default 'general',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index import_project_internal_notes_project_id_idx on public.import_project_internal_notes(project_id);
create trigger set_import_project_internal_notes_updated_at before update on public.import_project_internal_notes for each row execute function public.set_updated_at();

create table public.unpaid_leads (
  id uuid primary key default gen_random_uuid(),
  lead_code text not null unique,
  importer_profile_id uuid references public.importer_profiles(id) on delete set null,
  importer_user_id uuid references auth.users(id) on delete set null,
  draft_project_id uuid references public.import_projects(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  product_summary text not null,
  payment_problem_reason text,
  lead_status public.lead_status not null default 'new_lead',
  follow_up_status text,
  follow_up_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index unpaid_leads_lead_status_idx on public.unpaid_leads(lead_status);
create index unpaid_leads_importer_user_id_idx on public.unpaid_leads(importer_user_id);
create trigger set_unpaid_leads_updated_at before update on public.unpaid_leads for each row execute function public.set_updated_at();

create table public.lead_followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.unpaid_leads(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  channel text,
  outcome text,
  notes text,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index lead_followups_lead_id_idx on public.lead_followups(lead_id);
create trigger set_lead_followups_updated_at before update on public.lead_followups for each row execute function public.set_updated_at();

create table public.lead_agent_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.unpaid_leads(id) on delete cascade,
  agent_profile_id uuid not null references public.agent_profiles(id) on delete restrict,
  assigned_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  status text not null default 'active',
  assigned_at timestamptz not null default now(),
  released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index lead_agent_assignments_lead_id_idx on public.lead_agent_assignments(lead_id);
create index lead_agent_assignments_agent_profile_id_idx on public.lead_agent_assignments(agent_profile_id);
create trigger set_lead_agent_assignments_updated_at before update on public.lead_agent_assignments for each row execute function public.set_updated_at();
