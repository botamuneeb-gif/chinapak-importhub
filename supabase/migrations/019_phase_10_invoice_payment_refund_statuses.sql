-- Phase 10: invoice/manual payment/refund status values for ChinaPak ImportHub.
-- This is intentionally limited to enum values needed by the existing
-- invoices/refunds tables; no payment gateway or money movement is connected.

alter type public.invoice_status add value if not exists 'issued';
alter type public.invoice_status add value if not exists 'awaiting_payment';

alter type public.refund_status add value if not exists 'processed';

