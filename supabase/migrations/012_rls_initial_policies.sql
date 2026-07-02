-- Phase 1 RLS stance: enable RLS everywhere and add only narrow self-read policies.
-- Granular operational policies should be added in Phase 2+ after auth flows and tests exist.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_profiles',
    'role_assignments',
    'importer_profiles',
    'fms_profiles',
    'agent_profiles',
    'admin_profiles',
    'super_admin_profiles',
    'factory_profiles_future',
    'packages',
    'package_features',
    'addons',
    'platform_settings',
    'refund_rules',
    'payout_rules',
    'agent_commission_rules',
    'import_projects',
    'import_project_requirements',
    'import_project_addons',
    'import_project_status_history',
    'import_project_timeline_events',
    'import_project_internal_notes',
    'unpaid_leads',
    'lead_followups',
    'lead_agent_assignments',
    'invoices',
    'invoice_line_items',
    'payments',
    'payment_attempts',
    'manual_payment_requests',
    'refunds',
    'refund_decisions',
    'refund_evidence',
    'fms_assignments',
    'fms_assignment_milestones',
    'fms_factory_submissions',
    'fms_submission_evidence',
    'fms_payouts',
    'fms_quality_scores',
    'fms_academy_progress',
    'factories',
    'factory_sensitive_contacts',
    'factory_products',
    'factory_certifications',
    'factory_evidence',
    'factory_verification_history',
    'factory_risk_flags',
    'factory_matching_metadata',
    'factory_claim_invitations_future',
    'message_threads',
    'messages',
    'message_translations',
    'message_attachments',
    'message_review_actions',
    'message_risk_flags',
    'translation_addon_orders',
    'translation_sessions_future',
    'file_assets',
    'file_access_grants',
    'file_review_status',
    'file_redaction_history',
    'representative_verifications',
    'agent_leads',
    'agent_commissions',
    'agent_training_progress',
    'agent_compliance_events',
    'audit_logs',
    'access_logs',
    'security_events',
    'data_release_approvals',
    'contact_info_detection_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

create or replace function public.current_user_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.user_profiles where auth_user_id = auth.uid()
$$;

create or replace function public.has_active_role(role_name public.user_role)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.role_assignments ra
    join public.user_profiles up on up.id = ra.user_profile_id
    where up.auth_user_id = auth.uid()
      and ra.role = role_name
      and ra.status = 'active'
  )
$$;

create policy "Users can read own profile"
  on public.user_profiles
  for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy "Users can read own active role assignments"
  on public.role_assignments
  for select
  to authenticated
  using (
    user_profile_id = public.current_user_profile_id()
  );

create policy "Importers can read own importer profile"
  on public.importer_profiles
  for select
  to authenticated
  using (
    user_profile_id = public.current_user_profile_id()
  );

create policy "FMS can read own FMS profile"
  on public.fms_profiles
  for select
  to authenticated
  using (
    user_profile_id = public.current_user_profile_id()
  );

create policy "Agents can read own agent profile"
  on public.agent_profiles
  for select
  to authenticated
  using (
    user_profile_id = public.current_user_profile_id()
  );

comment on table public.factory_sensitive_contacts is
  'Sensitive admin-only factory contact data. No public/authenticated read policy in Phase 1.';

comment on table public.file_assets is
  'Private file metadata. Access must use future file_access_grants policies; no broad public read in Phase 1.';

comment on table public.message_threads is
  'Platform-controlled messages only. No importer-FMS direct messaging policy should be added.';
