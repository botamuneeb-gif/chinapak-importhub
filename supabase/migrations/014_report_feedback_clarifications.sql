-- Phase 8: importer feedback on released factory reports and admin-controlled clarifications.
-- Feedback is project-scoped, admin-reviewed, and never creates direct importer-FMS communication.

create table public.report_feedback (
  id uuid primary key default gen_random_uuid(),
  feedback_code text not null unique,
  project_id uuid not null references public.import_projects(id) on delete cascade,
  importer_profile_id uuid not null references public.importer_profiles(id) on delete restrict,
  importer_user_id uuid not null references auth.users(id) on delete restrict,
  report_status_snapshot text not null,
  report_version integer not null default 1,
  feedback_type text not null check (
    feedback_type in (
      'question_about_option',
      'request_better_price',
      'request_more_factories',
      'request_sample_guidance',
      'request_shipping_guidance',
      'not_satisfied',
      'ready_for_next_step',
      'other'
    )
  ),
  selected_option_label text,
  urgency_level text not null default 'normal' check (
    urgency_level in ('low', 'normal', 'urgent')
  ),
  message text not null,
  status text not null default 'new' check (
    status in (
      'new',
      'in_review',
      'answered',
      'routed_to_fms',
      'closed',
      'rejected_or_not_applicable'
    )
  ),
  admin_response text,
  admin_responded_at timestamptz,
  admin_responded_by uuid references auth.users(id),
  internal_notes text,
  routed_to_assignment_id uuid references public.fms_assignments(id) on delete set null,
  fms_clarification_request text,
  fms_clarification_status text not null default 'not_requested' check (
    fms_clarification_status in ('not_requested', 'requested', 'answered', 'closed')
  ),
  contact_firewall_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);

create index report_feedback_project_id_idx on public.report_feedback(project_id);
create index report_feedback_importer_user_id_idx on public.report_feedback(importer_user_id);
create index report_feedback_status_idx on public.report_feedback(status);
create index report_feedback_created_at_idx on public.report_feedback(created_at desc);
create trigger set_report_feedback_updated_at before update on public.report_feedback for each row execute function public.set_updated_at();

create table public.report_feedback_responses (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.report_feedback(id) on delete cascade,
  response_type text not null default 'admin_response' check (
    response_type in (
      'admin_response',
      'internal_note',
      'fms_clarification_request',
      'status_change',
      'system_note'
    )
  ),
  responder_role text not null check (
    responder_role in ('admin', 'super_admin', 'importer', 'fms', 'system')
  ),
  responder_user_id uuid references auth.users(id),
  message text not null,
  visible_to_importer boolean not null default false,
  visible_to_fms boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);

create index report_feedback_responses_feedback_id_idx on public.report_feedback_responses(feedback_id);
create index report_feedback_responses_created_at_idx on public.report_feedback_responses(created_at);

alter table public.report_feedback enable row level security;
alter table public.report_feedback_responses enable row level security;

comment on table public.report_feedback is
  'Importer feedback/questions on released sanitized factory reports. Admin controls all responses and routing.';

comment on table public.report_feedback_responses is
  'Admin-visible feedback response/event history. Importer-visible responses must be explicitly approved.';

comment on column public.report_feedback.routed_to_assignment_id is
  'Optional future FMS clarification route. FMS must never receive importer contact details or raw importer contact info.';
