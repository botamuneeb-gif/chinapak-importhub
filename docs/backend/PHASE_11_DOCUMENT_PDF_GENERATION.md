# Phase 11: Document And PDF Generation

Status: print-ready HTML document views are connected. Browser print / Save as
PDF is the supported export method for this phase.

No payment gateway, email/SMS sending, FMS payouts, public factory signup,
direct importer-FMS chat, direct factory contact release, or server-side PDF
rendering was added.

## Document Strategy

Phase 11 uses reliable print-ready HTML instead of a heavy PDF dependency.

Documents use shared React components for:

- document shell
- brand header
- status stamp
- line item table
- verification block
- footer disclaimer
- print actions

The print button calls the browser print dialog. Users can choose Save as PDF.
This keeps the implementation compatible with Next.js and avoids brittle
server-side PDF rendering before final document requirements are locked.

## Routes Added

Importer-facing:

- `/invoices/[invoiceId]/document`
- `/payments/[paymentId]/document`
- `/refunds/[refundId]/document`
- `/importer/reports/[projectId]/document`

Admin-facing:

- `/admin/projects/[projectId]/document`
- `/admin/invoices/[invoiceId]/document`
- `/admin/payments/[paymentId]/document`
- `/admin/refunds/[refundId]/document`

The admin invoice/payment/refund routes reuse the same document loaders, but
live under the protected admin portal so normal admin users are not placed into
the importer portal shell.

## Data Sources

Invoice documents read:

- `invoices`
- `invoice_line_items`
- `import_projects`
- `importer_profiles`
- `refunds`

Payment confirmation documents read:

- `manual_payment_requests`
- `payments`
- `invoices`
- `import_projects`

Refund documents read:

- `refunds`
- `refund_decisions`
- `invoices`
- `import_projects`

Importer factory report documents read:

- released Phase 7 factory report metadata from `import_projects.metadata`
- `file_assets` for released-to-importer evidence references only

Admin project summary documents read:

- the existing admin live project detail action
- package/add-on data
- importer admin profile summary
- assignment/report/timeline status

## Security And Visibility

- Importers can open documents only for their own projects, invoices, payments,
  refunds, and released reports.
- Admin and super admin can open operational document routes under `/admin`.
- FMS users cannot access invoice, payment, refund, importer report, or admin
  project document routes.
- Server actions verify the Supabase session and role before using the
  service-role client.
- The service-role key remains server-only.
- Raw storage paths are not rendered in document pages.
- Released evidence is shown as document-safe references only; signed preview
  remains controlled by the Phase 9 file actions.

## Included And Excluded Fields

Invoice documents include package/add-on line items, totals, manual payment
instructions, payment status, refund summary, project ID, invoice ID, document
ID, and customer details for the owning importer/admin view.

Payment confirmation documents include verified manual payment details, amount,
method, reference, verification date, and a disclaimer that the record is not
bank-issued gateway settlement proof.

Refund documents include requested amount, approved amount, refund status,
admin decision, customer-visible response, processed date, and manual/offline
refund disclaimer.

Importer factory report documents include only sanitized released report fields:

- masked/display factory labels
- city/province
- product match summaries
- unit price estimate
- MOQ
- sample availability
- lead time
- packaging/customization notes
- quality/reliability summary
- risk summary
- admin recommendation
- comparison notes
- released evidence references

Importer factory report documents exclude:

- factory phone
- factory email
- WeChat
- WhatsApp
- Telegram
- bank/payment details
- raw FMS notes
- admin-only notes
- internal factory IDs
- FMS private details
- raw FMS evidence

Admin internal project summary documents may show admin-operational importer
contact summary, but still exclude passwords, tokens, service keys, raw private
storage paths, and factory sensitive contact records.

## Contact Firewall

Importer-facing factory report document generation re-runs the contact firewall
against report-visible content before rendering. If contact/payment information
is detected in importer-facing report fields, the document is blocked.

Admin-only fields are not copied into importer report document payloads.

## Print Styling

Global print CSS:

- hides portal sidebar/topbar and document action buttons
- sets A4 page size and print margins
- centers document content
- preserves brand colors where the browser allows it
- avoids cutting important document blocks and table rows
- keeps Urdu/RTL styling readable through the existing Urdu font stack

The implementation does not bundle proprietary Urdu/Nastaliq fonts. Browser
printing uses the existing safe font stack from the global typography phase.

## Document Registry

No migration was added in Phase 11.

Document IDs are deterministic from existing records:

- invoice: existing `invoices.document_id`
- payment: `PAY-DOC-...`
- refund: `REF-DOC-...`
- importer report: `RPT-{project_code}-V{version}`
- admin project summary: `ADM-{project_code}`

A future hardening phase can add a normalized `document_records` or
`generated_documents` table for permanent export audit, QR verification, and
versioned PDF artifacts.

## Manual Testing Steps

1. Login as importer.
2. Open `/invoices` and choose `Print document` on an invoice.
3. Confirm `/invoices/[invoiceId]/document` renders and browser print works.
4. Open a verified manual payment row and confirm payment document renders.
5. Open `/refunds` and confirm refund document renders.
6. Open a released importer factory report and choose `Print report`.
7. Confirm factory contact details, raw FMS notes, and admin-only notes are not
   present in the printed report.
8. Login as admin or super admin.
9. Open `/admin/projects/[projectId]` and choose `Print admin summary`.
10. Confirm `/admin/projects/[projectId]/document` renders.
11. Open `/admin/payments` and `/admin/refunds` document links.
12. Confirm an FMS account cannot open invoice/payment/refund/report document
    routes.

## Remaining Placeholder / Future Work

- Server-side PDF rendering.
- Stored generated PDF files.
- QR verification route with public-safe status lookup.
- Dedicated `document_records` table and export audit trail.
- Email/SMS delivery of documents.
- Digital signatures or company stamp workflow.
- Embedded PDF Urdu font hardening for environments that need exact typography.
