create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  thread_code text not null unique,
  project_id uuid references public.import_projects(id) on delete cascade,
  assignment_id uuid references public.fms_assignments(id) on delete set null,
  thread_type public.message_thread_type not null,
  status public.message_thread_status not null default 'open',
  participant_roles public.user_role[] not null default '{}',
  language_pair text,
  translation_addon_active boolean not null default false,
  latest_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  constraint no_importer_fms_direct_thread check (
    not (
      'importer' = any(participant_roles)
      and 'fms' = any(participant_roles)
      and not ('admin' = any(participant_roles) or 'super_admin' = any(participant_roles))
    )
  )
);
create index message_threads_project_id_idx on public.message_threads(project_id);
create index message_threads_assignment_id_idx on public.message_threads(assignment_id);
create index message_threads_status_idx on public.message_threads(status);
create trigger set_message_threads_updated_at before update on public.message_threads for each row execute function public.set_updated_at();

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  sender_role public.user_role not null,
  recipient_role public.user_role,
  original_language text not null default 'unknown',
  original_text text not null,
  translated_text text,
  admin_approved_text text,
  review_status public.message_review_status not null default 'pending_admin_review',
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  constraint no_importer_fms_direct_message check (
    not (
      (sender_role = 'importer' and recipient_role = 'fms')
      or (sender_role = 'fms' and recipient_role = 'importer')
    )
  )
);
create index messages_thread_id_idx on public.messages(thread_id);
create index messages_sender_user_id_idx on public.messages(sender_user_id);
create index messages_review_status_idx on public.messages(review_status);
create trigger set_messages_updated_at before update on public.messages for each row execute function public.set_updated_at();

create table public.message_translations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  source_language text not null,
  target_language text not null,
  translated_text text not null,
  translation_method text not null default 'placeholder',
  review_status public.message_review_status not null default 'pending_admin_review',
  reviewed_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index message_translations_message_id_idx on public.message_translations(message_id);
create trigger set_message_translations_updated_at before update on public.message_translations for each row execute function public.set_updated_at();

create table public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_asset_id uuid,
  review_status public.file_review_status_enum not null default 'pending_review',
  visibility_scope text not null default 'admin_only',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index message_attachments_message_id_idx on public.message_attachments(message_id);
create trigger set_message_attachments_updated_at before update on public.message_attachments for each row execute function public.set_updated_at();

create table public.message_review_actions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  action text not null,
  admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  edited_text text,
  reason text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index message_review_actions_message_id_idx on public.message_review_actions(message_id);

create table public.message_risk_flags (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  risk_flag public.message_risk_flag not null,
  detected_text_excerpt text,
  detection_method text not null default 'manual_placeholder',
  status text not null default 'open',
  reviewed_by_admin_profile_id uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index message_risk_flags_message_id_idx on public.message_risk_flags(message_id);
create trigger set_message_risk_flags_updated_at before update on public.message_risk_flags for each row execute function public.set_updated_at();

create table public.translation_addon_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.import_projects(id) on delete cascade,
  addon_id uuid references public.addons(id) on delete set null,
  translation_type text not null,
  status text not null default 'pending',
  price_pkr integer,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index translation_addon_orders_project_id_idx on public.translation_addon_orders(project_id);
create trigger set_translation_addon_orders_updated_at before update on public.translation_addon_orders for each row execute function public.set_updated_at();

create table public.translation_sessions_future (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.import_projects(id) on delete cascade,
  thread_id uuid references public.message_threads(id) on delete set null,
  session_type text not null,
  scheduled_at timestamptz,
  status text not null default 'future_placeholder',
  review_required boolean not null default true,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb
);
create index translation_sessions_future_project_id_idx on public.translation_sessions_future(project_id);
create trigger set_translation_sessions_future_updated_at before update on public.translation_sessions_future for each row execute function public.set_updated_at();
