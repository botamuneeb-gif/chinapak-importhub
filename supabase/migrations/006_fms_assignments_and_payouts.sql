create or replace function public.prevent_invalid_fms_assignment()
returns trigger
language plpgsql
as $$
declare
  project_record record;
begin
  select payment_status, admin_review_status
    into project_record
  from public.import_projects
  where id = new.project_id;

  if project_record.payment_status is null then
    raise exception 'Import project % does not exist.', new.project_id;
  end if;

  if project_record.payment_status <> 'paid'
    or project_record.admin_review_status <> 'ready_for_fms_assignment'
  then
    raise exception 'FMS assignment requires paid project and admin review readiness.';
  end if;

  return new;
end;
$$;

create table public.fms_assignments (
  id uuid primary key default gen_random_uuid(),
  assignment_code text not null unique,
  project_id uuid not null references public.import_projects(id) on delete restrict,
  fms_profile_id uuid not null references public.fms_profiles(id) on delete restrict,
  assigned_fms_user_id uuid not null references auth.users(id) on delete restrict,
  assigned_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  assignment_status public.assignment_status not null default 'assigned',
  tier_snapshot public.fms_tier not null default 'bronze',
  deadline_at timestamptz,
  submitted_for_admin_review_at timestamptz,
  completed_by_admin_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index fms_assignments_project_id_idx on public.fms_assignments(project_id);
create index fms_assignments_fms_profile_id_idx on public.fms_assignments(fms_profile_id);
create index fms_assignments_assigned_fms_user_id_idx on public.fms_assignments(assigned_fms_user_id);
create trigger set_fms_assignments_updated_at before update on public.fms_assignments for each row execute function public.set_updated_at();
create trigger prevent_invalid_fms_assignment_before_write before insert or update of project_id on public.fms_assignments for each row execute function public.prevent_invalid_fms_assignment();

create table public.fms_assignment_milestones (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.fms_assignments(id) on delete cascade,
  milestone_key text not null,
  status text not null default 'pending',
  completed_at timestamptz,
  reviewed_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  unique (assignment_id, milestone_key)
);
create index fms_assignment_milestones_assignment_id_idx on public.fms_assignment_milestones(assignment_id);
create trigger set_fms_assignment_milestones_updated_at before update on public.fms_assignment_milestones for each row execute function public.set_updated_at();

create table public.fms_factory_submissions (
  id uuid primary key default gen_random_uuid(),
  submission_code text not null unique,
  assignment_id uuid not null references public.fms_assignments(id) on delete cascade,
  converted_factory_id uuid,
  factory_display_name text,
  city_province text,
  product_category text,
  main_products text[] not null default '{}',
  moq text,
  price_range text,
  production_time text,
  submission_status public.assignment_submission_status not null default 'draft',
  admin_review_status public.admin_review_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index fms_factory_submissions_assignment_id_idx on public.fms_factory_submissions(assignment_id);
create trigger set_fms_factory_submissions_updated_at before update on public.fms_factory_submissions for each row execute function public.set_updated_at();

create table public.fms_submission_evidence (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.fms_factory_submissions(id) on delete cascade,
  file_asset_id uuid,
  evidence_type text,
  review_status public.file_review_status_enum not null default 'pending_review',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index fms_submission_evidence_submission_id_idx on public.fms_submission_evidence(submission_id);
create trigger set_fms_submission_evidence_updated_at before update on public.fms_submission_evidence for each row execute function public.set_updated_at();

create table public.fms_payouts (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.fms_assignments(id) on delete restrict,
  fms_profile_id uuid not null references public.fms_profiles(id) on delete restrict,
  payout_status public.payout_status not null default 'draft',
  amount_pkr integer not null default 0,
  amount_cny_estimate integer,
  approved_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  scheduled_for date,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index fms_payouts_assignment_id_idx on public.fms_payouts(assignment_id);
create index fms_payouts_fms_profile_id_idx on public.fms_payouts(fms_profile_id);
create trigger set_fms_payouts_updated_at before update on public.fms_payouts for each row execute function public.set_updated_at();

create table public.fms_quality_scores (
  id uuid primary key default gen_random_uuid(),
  fms_profile_id uuid not null references public.fms_profiles(id) on delete cascade,
  assignment_id uuid references public.fms_assignments(id) on delete set null,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  score_reason text,
  scored_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index fms_quality_scores_fms_profile_id_idx on public.fms_quality_scores(fms_profile_id);

create table public.fms_academy_progress (
  id uuid primary key default gen_random_uuid(),
  fms_profile_id uuid not null references public.fms_profiles(id) on delete cascade,
  module_key text not null,
  status public.training_status not null default 'not_started',
  completed_at timestamptz,
  certified_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  unique (fms_profile_id, module_key)
);
create trigger set_fms_academy_progress_updated_at before update on public.fms_academy_progress for each row execute function public.set_updated_at();
