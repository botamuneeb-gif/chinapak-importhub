create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  primary_role public.user_role,
  preferred_language text not null default 'ur',
  status public.profile_status not null default 'active',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_user_profiles_updated_at before update on public.user_profiles for each row execute function public.set_updated_at();

create table public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  role public.user_role not null,
  status public.role_assignment_status not null default 'active',
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create unique index role_assignments_active_unique on public.role_assignments(user_profile_id, role) where status = 'active';
create index role_assignments_user_profile_id_idx on public.role_assignments(user_profile_id);
create trigger set_role_assignments_updated_at before update on public.role_assignments for each row execute function public.set_updated_at();

create table public.importer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null unique references public.user_profiles(id) on delete cascade,
  importer_code text unique,
  full_name text,
  phone_whatsapp text,
  city text,
  business_type text,
  verification_status text not null default 'unverified',
  support_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index importer_profiles_user_profile_id_idx on public.importer_profiles(user_profile_id);
create trigger set_importer_profiles_updated_at before update on public.importer_profiles for each row execute function public.set_updated_at();

create table public.fms_profiles (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null unique references public.user_profiles(id) on delete cascade,
  fms_code text not null unique,
  tier public.fms_tier not null default 'bronze',
  city_province text,
  categories text[] not null default '{}',
  academy_status public.training_status not null default 'not_started',
  quality_score numeric(5,2),
  status public.profile_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index fms_profiles_user_profile_id_idx on public.fms_profiles(user_profile_id);
create trigger set_fms_profiles_updated_at before update on public.fms_profiles for each row execute function public.set_updated_at();

create table public.agent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null unique references public.user_profiles(id) on delete cascade,
  agent_code text not null unique,
  city_market text,
  status public.profile_status not null default 'pending',
  training_status public.training_status not null default 'not_started',
  allowed_activities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index agent_profiles_user_profile_id_idx on public.agent_profiles(user_profile_id);
create trigger set_agent_profiles_updated_at before update on public.agent_profiles for each row execute function public.set_updated_at();

create table public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null unique references public.user_profiles(id) on delete cascade,
  department text,
  permission_group text,
  status public.profile_status not null default 'pending',
  two_factor_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_admin_profiles_updated_at before update on public.admin_profiles for each row execute function public.set_updated_at();

create table public.super_admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null unique references public.user_profiles(id) on delete cascade,
  security_level text not null default 'highest',
  emergency_contact_policy text,
  status public.profile_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_super_admin_profiles_updated_at before update on public.super_admin_profiles for each row execute function public.set_updated_at();

create table public.factory_profiles_future (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid unique references public.user_profiles(id) on delete cascade,
  factory_id uuid,
  invitation_id uuid,
  claim_status text not null default 'not_active',
  status public.profile_status not null default 'hidden_future',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_factory_profiles_future_updated_at before update on public.factory_profiles_future for each row execute function public.set_updated_at();
