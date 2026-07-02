create table public.factories (
  id uuid primary key default gen_random_uuid(),
  factory_code text not null unique,
  display_name text not null,
  chinese_legal_name text,
  category text,
  city_province text,
  status public.factory_status not null default 'draft',
  verification_status public.verification_status not null default 'unverified',
  trust_score numeric(5,2),
  submitted_by_fms_profile_id uuid references public.fms_profiles(id) on delete set null,
  source_assignment_id uuid references public.fms_assignments(id) on delete set null,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index factories_status_idx on public.factories(status);
create index factories_verification_status_idx on public.factories(verification_status);
create index factories_category_idx on public.factories(category);
create trigger set_factories_updated_at before update on public.factories for each row execute function public.set_updated_at();

alter table public.fms_factory_submissions
  add constraint fms_factory_submissions_converted_factory_id_fkey
  foreign key (converted_factory_id) references public.factories(id) on delete set null;

create table public.factory_sensitive_contacts (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null unique references public.factories(id) on delete cascade,
  contact_person text,
  phone text,
  wechat text,
  email text,
  website_url text,
  alibaba_url text,
  exact_address text,
  bank_payment_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_factory_sensitive_contacts_updated_at before update on public.factory_sensitive_contacts for each row execute function public.set_updated_at();

create table public.factory_products (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  product_name text,
  category text,
  main_products text[] not null default '{}',
  moq_range text,
  price_range_notes text,
  production_time_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index factory_products_factory_id_idx on public.factory_products(factory_id);
create trigger set_factory_products_updated_at before update on public.factory_products for each row execute function public.set_updated_at();

create table public.factory_certifications (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  certification_name text not null,
  issuer text,
  valid_until date,
  file_asset_id uuid,
  review_status public.file_review_status_enum not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index factory_certifications_factory_id_idx on public.factory_certifications(factory_id);
create trigger set_factory_certifications_updated_at before update on public.factory_certifications for each row execute function public.set_updated_at();

create table public.factory_evidence (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  file_asset_id uuid,
  evidence_type text,
  review_status public.file_review_status_enum not null default 'pending_review',
  visibility_scope text not null default 'admin_only',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index factory_evidence_factory_id_idx on public.factory_evidence(factory_id);
create trigger set_factory_evidence_updated_at before update on public.factory_evidence for each row execute function public.set_updated_at();

create table public.factory_verification_history (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  from_status public.verification_status,
  to_status public.verification_status not null,
  verified_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  verification_method text,
  notes text,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index factory_verification_history_factory_id_idx on public.factory_verification_history(factory_id);

create table public.factory_risk_flags (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  risk_flag text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  notes text,
  flagged_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index factory_risk_flags_factory_id_idx on public.factory_risk_flags(factory_id);
create trigger set_factory_risk_flags_updated_at before update on public.factory_risk_flags for each row execute function public.set_updated_at();

create table public.factory_matching_metadata (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null unique references public.factories(id) on delete cascade,
  best_fit_categories text[] not null default '{}',
  typical_moq text,
  suitable_budget_ranges text[] not null default '{}',
  package_eligibility text[] not null default '{}',
  reliability_score numeric(5,2),
  on_time_response_score numeric(5,2),
  recommended_for_small_importers boolean,
  recommended_for_repeat_importers boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_factory_matching_metadata_updated_at before update on public.factory_matching_metadata for each row execute function public.set_updated_at();

create table public.factory_claim_invitations_future (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid not null references public.factories(id) on delete cascade,
  invite_code text not null unique,
  invited_contact text,
  status text not null default 'draft',
  expires_at timestamptz,
  accepted_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_factory_claim_invitations_future_updated_at before update on public.factory_claim_invitations_future for each row execute function public.set_updated_at();

alter table public.factory_profiles_future
  add constraint factory_profiles_future_factory_id_fkey
  foreign key (factory_id) references public.factories(id) on delete set null;

alter table public.factory_profiles_future
  add constraint factory_profiles_future_invitation_id_fkey
  foreign key (invitation_id) references public.factory_claim_invitations_future(id) on delete set null;
