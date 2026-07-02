-- Phase 16: manual representative verification workflow.
-- Representative records are admin-managed and never publicly readable directly.

do $$ begin
  create type public.representative_code_status as enum ('active', 'suspended', 'revoked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.representative_status as enum ('active', 'pending', 'suspended', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.representative_verification_result as enum ('verified', 'invalid', 'suspended', 'revoked');
exception when duplicate_object then null; end $$;

create table public.representatives (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  display_name text not null,
  verification_code text not null unique,
  code_status public.representative_code_status not null default 'active',
  representative_status public.representative_status not null default 'pending',
  province text,
  city text,
  service_area text,
  role_title text not null default 'ChinaPak ImportHub Representative',
  linked_user_id uuid references auth.users(id) on delete set null,
  agent_profile_id uuid references public.agent_profiles(id) on delete set null,
  public_notes text,
  internal_notes text,
  activated_at timestamptz,
  suspended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  constraint representatives_full_name_not_blank check (length(trim(full_name)) >= 2),
  constraint representatives_display_name_not_blank check (length(trim(display_name)) >= 2),
  constraint representatives_verification_code_format check (
    verification_code ~ '^CPIH-REP-[A-Z0-9]{5}$'
  )
);

create unique index representatives_verification_code_upper_unique
  on public.representatives (upper(verification_code));
create index representatives_status_idx
  on public.representatives(representative_status, code_status);
create index representatives_city_province_idx
  on public.representatives(city, province);
create index representatives_agent_profile_id_idx
  on public.representatives(agent_profile_id);
create trigger set_representatives_updated_at
  before update on public.representatives
  for each row execute function public.set_updated_at();

create table public.representative_verification_attempts (
  id uuid primary key default gen_random_uuid(),
  verification_code_entered text not null,
  normalized_code text not null,
  matched_representative_id uuid references public.representatives(id) on delete set null,
  result public.representative_verification_result not null,
  requester_ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index representative_verification_attempts_code_idx
  on public.representative_verification_attempts(normalized_code);
create index representative_verification_attempts_representative_idx
  on public.representative_verification_attempts(matched_representative_id);
create index representative_verification_attempts_created_at_idx
  on public.representative_verification_attempts(created_at desc);

alter table public.representatives enable row level security;
alter table public.representative_verification_attempts enable row level security;

comment on table public.representatives is
  'Admin-managed local representative verification records. Public verification must use server-side sanitized lookup only.';
comment on column public.representatives.full_name is
  'Admin-only legal/internal name. Do not expose publicly unless display_name intentionally matches it.';
comment on column public.representatives.display_name is
  'Public-safe representative name shown after active verification.';
comment on column public.representatives.internal_notes is
  'Admin-only notes. Never expose on public verification pages.';
comment on table public.representative_verification_attempts is
  'Public verification attempt log with no private representative contact details.';
