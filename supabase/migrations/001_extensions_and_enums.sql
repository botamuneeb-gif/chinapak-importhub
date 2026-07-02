-- Phase 1 foundation: extensions, shared enums, and timestamp trigger.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create type public.user_role as enum ('importer', 'fms', 'agent', 'admin', 'super_admin', 'factory_future');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.profile_status as enum ('pending', 'active', 'suspended', 'revoked', 'hidden_future');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.role_assignment_status as enum ('active', 'pending', 'suspended', 'revoked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fms_tier as enum ('bronze', 'silver', 'gold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.training_status as enum ('not_started', 'in_progress', 'certified', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_status as enum (
    'draft',
    'awaiting_payment',
    'payment_received',
    'admin_review',
    'needs_importer_clarification',
    'ready_for_fms_assignment',
    'fms_assigned',
    'fms_working',
    'factory_options_submitted',
    'admin_quality_review',
    'results_released_to_importer',
    'importer_feedback_requested',
    'completed',
    'cancelled',
    'refunded',
    'partially_refunded',
    'disputed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.admin_review_status as enum ('not_started', 'in_review', 'needs_information', 'ready_for_fms_assignment', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('awaiting_payment', 'paid', 'failed', 'refunded', 'partially_refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.refund_status as enum ('requested', 'under_admin_review', 'reassignment_offered', 'approved', 'partially_approved', 'rejected', 'paid', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.assignment_status as enum ('assigned', 'requirements_reviewed', 'factory_researching', 'factory_options_drafted', 'submitted_for_admin_review', 'changes_requested', 'approved_by_admin', 'completed_by_admin', 'reassigned', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.factory_status as enum ('draft', 'submitted_by_fms', 'admin_verified', 'active_internal_record', 'invited_to_claim_profile', 'claimed_by_factory', 'suspended', 'blacklisted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum ('unverified', 'basic_checked', 'evidence_reviewed', 'video_verified', 'document_verified', 'trusted_factory');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum ('new_lead', 'contact_attempted', 'interested', 'payment_help_needed', 'awaiting_customer', 'payment_link_sent', 'payment_completed', 'not_interested', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.package_status as enum ('draft', 'active', 'retired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.addon_price_type as enum ('fixed', 'range', 'percentage');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_status as enum ('draft', 'pending', 'paid', 'refunded', 'partially_refunded', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.assignment_submission_status as enum ('draft', 'submitted_for_admin_review', 'changes_requested', 'approved_by_admin', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_thread_status as enum ('open', 'pending_admin_review', 'waiting_for_importer', 'waiting_for_fms', 'translation_needed', 'approved_for_forwarding', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_thread_type as enum ('importer_support', 'project_update', 'fms_internal', 'translation_review', 'factory_communication_future', 'refund_dispute');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_review_status as enum ('not_required', 'pending_admin_review', 'approved', 'edited_and_approved', 'rejected', 'needs_translation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_risk_flag as enum ('none', 'contact_info_detected', 'payment_instruction_detected', 'factory_contact_detected', 'unapproved_direct_contact_attempt', 'sensitive_document_shared');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.file_review_status_enum as enum ('pending_review', 'approved_internal', 'approved_importer_visible', 'approved_fms_visible', 'approved_factory_visible_future', 'needs_redaction', 'redacted', 'rejected', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.file_bucket as enum ('importer-uploads', 'fms-evidence', 'factory-evidence', 'message-attachments', 'invoice-documents', 'refund-evidence', 'training-assets', 'public-content');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payout_status as enum ('draft', 'pending_admin_approval', 'approved', 'scheduled', 'paid', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.commission_status as enum ('pending', 'approved', 'paid', 'cancelled');
exception when duplicate_object then null; end $$;
