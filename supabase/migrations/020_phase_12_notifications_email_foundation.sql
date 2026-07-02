-- Phase 12: notification and email-delivery foundation.
-- Notifications are user/role targeted, project-aware, and provider-neutral.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid references public.user_profiles(id) on delete cascade,
  recipient_role public.user_role,
  actor_profile_id uuid references public.user_profiles(id) on delete set null,
  project_id uuid references public.import_projects(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  refund_id uuid references public.refunds(id) on delete set null,
  assignment_id uuid references public.fms_assignments(id) on delete set null,
  submission_id uuid references public.fms_factory_submissions(id) on delete set null,
  type text not null,
  title text not null,
  message text not null,
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'system')),
  status text not null default 'queued' check (status in ('queued', 'delivered', 'read', 'failed', 'skipped')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  created_by uuid references auth.users(id)
);

create index notifications_recipient_profile_id_idx on public.notifications(recipient_profile_id);
create index notifications_recipient_role_idx on public.notifications(recipient_role);
create index notifications_status_idx on public.notifications(status);
create index notifications_type_idx on public.notifications(type);
create index notifications_project_id_idx on public.notifications(project_id);
create index notifications_created_at_idx on public.notifications(created_at desc);
create index notifications_unread_idx on public.notifications(recipient_profile_id, read_at) where read_at is null;

create table public.notification_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  provider text not null,
  provider_message_id text,
  delivery_status text not null default 'skipped',
  error_message text,
  attempted_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index notification_delivery_logs_notification_id_idx on public.notification_delivery_logs(notification_id);
create index notification_delivery_logs_attempted_at_idx on public.notification_delivery_logs(attempted_at desc);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  preferred_language text not null default 'en',
  role_defaults jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  constraint notification_preferences_user_profile_id_key unique (user_profile_id)
);

create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

alter table public.notifications enable row level security;
alter table public.notification_delivery_logs enable row level security;
alter table public.notification_preferences enable row level security;

create policy "Users can read their own direct notifications"
  on public.notifications
  for select
  to authenticated
  using (recipient_profile_id = public.current_user_profile_id());

create policy "Users can read notifications for their active role"
  on public.notifications
  for select
  to authenticated
  using (
    recipient_role is not null
    and exists (
      select 1
      from public.role_assignments ra
      where ra.user_profile_id = public.current_user_profile_id()
        and ra.role = notifications.recipient_role
        and ra.status = 'active'
    )
  );

create policy "Users can mark their own notifications read"
  on public.notifications
  for update
  to authenticated
  using (
    recipient_profile_id = public.current_user_profile_id()
    or (
      recipient_role is not null
      and exists (
        select 1
        from public.role_assignments ra
        where ra.user_profile_id = public.current_user_profile_id()
          and ra.role = notifications.recipient_role
          and ra.status = 'active'
      )
    )
  )
  with check (
    recipient_profile_id = public.current_user_profile_id()
    or (
      recipient_role is not null
      and exists (
        select 1
        from public.role_assignments ra
        where ra.user_profile_id = public.current_user_profile_id()
          and ra.role = notifications.recipient_role
          and ra.status = 'active'
      )
    )
  );

create policy "Users can read own notification preferences"
  on public.notification_preferences
  for select
  to authenticated
  using (user_profile_id = public.current_user_profile_id());

create policy "Users can update own notification preferences"
  on public.notification_preferences
  for update
  to authenticated
  using (user_profile_id = public.current_user_profile_id())
  with check (user_profile_id = public.current_user_profile_id());

comment on table public.notifications is
  'Phase 12 in-app/email-ready notification records. Do not store passwords, API keys, raw FMS submissions, or cross-role contact details.';

comment on table public.notification_delivery_logs is
  'Provider-neutral delivery attempts. Payloads must not include secrets or restricted contact data.';

comment on table public.notification_preferences is
  'User notification preferences foundation. Email remains disabled by default until a provider is configured.';
