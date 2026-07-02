create table public.packages (
  id uuid primary key default gen_random_uuid(),
  package_code text not null unique,
  name text not null,
  price_pkr integer not null check (price_pkr >= 0),
  best_for_budget text,
  factory_option_count text,
  delivery_days_min integer,
  delivery_days_max integer,
  is_recommended boolean not null default false,
  status public.package_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_packages_updated_at before update on public.packages for each row execute function public.set_updated_at();

create table public.package_features (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  feature_key text not null,
  label text not null,
  value text,
  sort_order integer not null default 0,
  visible_publicly boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  unique (package_id, feature_key)
);
create index package_features_package_id_idx on public.package_features(package_id);
create trigger set_package_features_updated_at before update on public.package_features for each row execute function public.set_updated_at();

create table public.addons (
  id uuid primary key default gen_random_uuid(),
  addon_code text not null unique,
  name text not null,
  price_type public.addon_price_type not null default 'fixed',
  price_min_pkr integer,
  price_max_pkr integer,
  percentage_rate numeric(8,4),
  status public.package_status not null default 'draft',
  requires_human_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_addons_updated_at before update on public.addons for each row execute function public.set_updated_at();

create table public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null,
  value_type text not null default 'json',
  environment text not null default 'all',
  is_sensitive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_platform_settings_updated_at before update on public.platform_settings for each row execute function public.set_updated_at();

create table public.refund_rules (
  id uuid primary key default gen_random_uuid(),
  rule_code text not null unique,
  title text not null,
  description text not null,
  applies_before_fms_assignment boolean not null default false,
  applies_after_fms_assignment boolean not null default false,
  status public.package_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create trigger set_refund_rules_updated_at before update on public.refund_rules for each row execute function public.set_updated_at();

create table public.payout_rules (
  id uuid primary key default gen_random_uuid(),
  rule_code text not null unique,
  tier public.fms_tier not null,
  package_id uuid references public.packages(id) on delete set null,
  min_payout_pkr integer not null check (min_payout_pkr >= 0),
  max_payout_pkr integer not null check (max_payout_pkr >= min_payout_pkr),
  min_payout_cny integer,
  max_payout_cny integer,
  status public.package_status not null default 'draft',
  quality_adjustment_rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index payout_rules_package_id_idx on public.payout_rules(package_id);
create trigger set_payout_rules_updated_at before update on public.payout_rules for each row execute function public.set_updated_at();

create table public.agent_commission_rules (
  id uuid primary key default gen_random_uuid(),
  rule_code text not null unique,
  package_id uuid references public.packages(id) on delete set null,
  commission_type text not null default 'configurable_placeholder',
  amount_pkr integer,
  percentage_rate numeric(8,4),
  status public.package_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index agent_commission_rules_package_id_idx on public.agent_commission_rules(package_id);
create trigger set_agent_commission_rules_updated_at before update on public.agent_commission_rules for each row execute function public.set_updated_at();
