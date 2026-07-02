# Phase 10: Invoice, Manual Payment Records & Refund Workflow

This phase connects ChinaPak ImportHub invoice generation, manual payment tracking, and refund review. It remains an offline/manual payment workflow only.

## What Is Connected

- New paid-intent Import Project submissions now create an idempotent invoice and awaiting payment record.
- Importers can view their own invoices at `/invoices` and `/invoices/[invoiceId]`.
- Importers can submit manual payment references from invoice detail or `/payments/manual`.
- Admin/super admin can review manual payment records at `/admin/payments`.
- Importers can request refunds for their own paid invoices at `/refunds/request`.
- Admin/super admin can review refund requests at `/admin/refunds`.
- Existing admin project detail payment verification now syncs linked invoice/payment records.

## Tables Read/Written

- `import_projects`
- `import_project_status_history`
- `import_project_timeline_events`
- `importer_profiles`
- `packages`
- `addons`
- `import_project_addons`
- `invoices`
- `invoice_line_items`
- `payments`
- `payment_attempts`
- `manual_payment_requests`
- `refunds`
- `refund_decisions`
- `fms_assignments` for refund milestone warnings

## Migration Added

`supabase/migrations/019_phase_10_invoice_payment_refund_statuses.sql`

Adds enum values:

- `invoice_status`: `issued`, `awaiting_payment`
- `refund_status`: `processed`

## Invoice Status Flow

- `awaiting_payment`: invoice prepared and waiting for manual payment verification.
- `paid`: admin verified manual payment.
- `refunded`: full manual refund was marked processed.
- `partially_refunded`: partial manual refund was marked processed.
- `cancelled`: reserved for future cancellation workflow.
- Existing legacy/static values `draft` and `pending` remain supported.

Invoices are generated once per project unless future versioning is intentionally added.

## Manual Payment Status Flow

Manual payment records are stored in `manual_payment_requests.status`:

- `submitted`
- `under_review`
- `verified`
- `rejected`
- `needs_more_info`

When admin verifies a manual payment:

- Invoice becomes `paid`.
- Payment row becomes `paid`.
- Project `payment_status` becomes `paid`.
- Project readiness still requires admin review before FMS assignment.
- Timeline/status history are written where applicable.

When admin rejects or requests more information:

- Project remains blocked from FMS work.
- Invoice remains awaiting payment unless it had already been paid.
- Importer sees review status in the manual payment history.

## Refund Status Flow

Refund records use `refunds.refund_status`:

- `requested`
- `under_admin_review`
- `reassignment_offered`
- `approved`
- `partially_approved`
- `rejected`
- `processed`
- `cancelled`

Before FMS assignment/work, full refund policy may apply. After FMS assignment/work, admin reviews milestones, evidence, and whether reassignment should be offered before refund.

Refund approval does not move money. `processed` means admin marked the refund as handled manually/offline.

## Security And Visibility

- Importers can only view invoices, manual payment submissions, and refunds tied to their own projects.
- Admin/super admin can review all payment and refund queues.
- FMS cannot see importer invoices, payment details, refund requests, or manual payment records.
- Service-role Supabase access remains server-only.
- No card data, banking credentials, gateway tokens, or password-like data should be stored.
- Receipt uploads are intentionally left future until a dedicated payment-review file visibility scope is added.

## Manual Testing Steps

1. Login as importer and submit a paid-intent Import Project.
2. Open `/invoices` and confirm an invoice appears for the project.
3. Open the invoice detail and submit a manual payment reference.
4. Login as admin/super admin and open `/admin/payments`.
5. Verify the payment.
6. Confirm the invoice is `paid` and project `payment_status` is `paid`.
7. As importer, open `/refunds/request` and submit a refund request for the paid invoice.
8. As admin/super admin, open `/admin/refunds`.
9. Start review, approve full/partial, reject, offer reassignment, or mark processed.
10. Confirm importer refund overview updates and timeline events are created.

## Remaining Placeholders / Future Work

- Real payment gateway integration.
- Automated bank/Easypaisa/JazzCash/JazzCash verification.
- Receipt file upload/review scoped specifically to payment evidence.
- PDF invoice export and QR verification.
- Email/SMS payment and refund notifications.
- Actual money movement/refund processing.
- FMS payout accounting.

