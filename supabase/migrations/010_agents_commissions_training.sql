create table public.representative_verifications (
  id uuid primary key default gen_random_uuid(),
  agent_profile_id uuid not null references public.agent_profiles(id) on delete cascade,
  agent_code text not null,
  public_name text not null,
  city_market text,
  status public.profile_status not null default 'active',
  allowed_activities text[] not null default '{}',
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index representative_verifications_agent_code_idx on public.representative_verifications(agent_code);
create trigger set_representative_verifications_updated_at before update on public.representative_verifications for each row execute function public.set_updated_at();

create table public.agent_leads (
  id uuid primary key default gen_random_uuid(),
  agent_profile_id uuid not null references public.agent_profiles(id) on delete restrict,
  lead_id uuid references public.unpaid_leads(id) on delete set null,
  project_id uuid references public.import_projects(id) on delete set null,
  source text,
  status public.lead_status not null default 'new_lead',
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index agent_leads_agent_profile_id_idx on public.agent_leads(agent_profile_id);
create index agent_leads_lead_id_idx on public.agent_leads(lead_id);
create index agent_leads_project_id_idx on public.agent_leads(project_id);
create trigger set_agent_leads_updated_at before update on public.agent_leads for each row execute function public.set_updated_at();

create table public.agent_commissions (
  id uuid primary key default gen_random_uuid(),
  agent_profile_id uuid not null references public.agent_profiles(id) on delete restrict,
  project_id uuid references public.import_projects(id) on delete set null,
  commission_rule_id uuid references public.agent_commission_rules(id) on delete set null,
  status public.commission_status not null default 'pending',
  amount_pkr integer,
  approved_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index agent_commissions_agent_profile_id_idx on public.agent_commissions(agent_profile_id);
create index agent_commissions_project_id_idx on public.agent_commissions(project_id);
create trigger set_agent_commissions_updated_at before update on public.agent_commissions for each row execute function public.set_updated_at();

create table public.agent_training_progress (
  id uuid primary key default gen_random_uuid(),
  agent_profile_id uuid not null references public.agent_profiles(id) on delete cascade,
  module_key text not null,
  status public.training_status not null default 'not_started',
  completed_at timestamptz,
  certified_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  unique (agent_profile_id, module_key)
);
create trigger set_agent_training_progress_updated_at before update on public.agent_training_progress for each row execute function public.set_updated_at();

create table public.agent_compliance_events (
  id uuid primary key default gen_random_uuid(),
  agent_profile_id uuid not null references public.agent_profiles(id) on delete cascade,
  event_type text not null,
  severity text not null default 'medium',
  description text not null,
  action_taken text,
  created_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index agent_compliance_events_agent_profile_id_idx on public.agent_compliance_events(agent_profile_id);
create trigger set_agent_compliance_events_updated_at before update on public.agent_compliance_events for each row execute function public.set_updated_at();
