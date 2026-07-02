# Storage Buckets Blueprint

Status: planning documentation only. This file does not create Supabase Storage buckets or connect object storage.

Source of truth: `AGENTS.md` and `docs/MDOM.md`.

ChinaPak ImportHub should store file metadata in PostgreSQL (`file_assets`) and binary files in Supabase Storage, Cloudflare R2, or a compatible object storage provider. Buckets should be private by default unless explicitly public.

## Storage Principles

- Store files by purpose and review workflow, not by random upload source.
- Keep private buckets private; use signed URLs or access grants.
- Do not expose FMS evidence to importers until admin review approves it.
- Do not expose factory contact data or documents without explicit admin-approved workflow.
- Use `file_assets`, `file_review_status`, `file_access_grants`, and `file_redaction_history` for metadata and access control.
- Scan uploads for malware and contact/payment sensitive data in future phases.
- Use stable object paths, for example `project_id/yyyy/mm/file_id-original.ext`.
- Never rely on obscured storage paths as security.

## Bucket Plan

| Bucket | Purpose | Visibility | Allowed roles | Review requirements | Retention notes | Sensitive data handling |
|---|---|---|---|---|---|---|
| `importer-uploads` | Product photos, product documents, voice notes, links/screenshots, and importer-provided requirement files. | Private. | Importer uploads own project files; admin reviews; FMS may see only redacted/approved requirement files for assigned projects. | Admin review required before FMS visibility if file may contain contact details or private importer data. | Retain for project lifecycle, refund/dispute window, and audit policy. | Run contact info detection and redact private phone/email/address before FMS access. |
| `fms-evidence` | FMS-submitted product photos, factory photos/videos, quotations, certificates, voice notes, and sourcing evidence. | Private. | FMS uploads for assigned assignments; admin reviews; importer receives only approved files through access grants. | Always requires admin review before importer visibility. | Retain for project history, factory database intelligence, disputes, and FMS quality scoring. | Check for factory contact details, direct contact attempts, payment instructions, and sensitive supplier documents. |
| `factory-evidence` | Factory database evidence including business license, certificates, factory photos/videos, product images, and verification material. | Private. | Admin and authorized FMS for assigned submission upload; future factory can upload only to own pending review area after activation. | Admin review required before becoming active factory evidence or importer-visible evidence. | Retain while factory record is active; keep historical verification evidence according to legal/compliance policy. | Factory contact/address/license data is sensitive. Use redaction before any importer release. |
| `message-attachments` | Attachments in importer-admin, FMS-admin, admin internal, and future factory-admin threads. | Private. | Thread participant can upload according to role; admin reviews cross-role visibility. | Required before forwarding to another role, especially importer-facing or FMS-facing files. | Retain with message thread and project audit history. | Scan for contact details, bank/payment instructions, factory contacts, and sensitive documents. |
| `invoice-documents` | Generated invoices, receipts, payment confirmations, and future QR verification documents. | Private by default; optionally public verification page can expose limited document status. | Admin/system generates; importer can access own invoices; super admin audits. | Document generation should be system-controlled; manual replacement requires admin review. | Retain for finance/legal requirements. | Do not expose full customer contact publicly through QR verification. |
| `refund-evidence` | Refund request attachments, proof of failed service, screenshots, payment proof, and admin evidence. | Private. | Importer can upload to own refund request; admin reviews; super admin audits. | Admin review required before any sharing outside refund workflow. | Retain through refund/dispute window and finance audit policy. | May include payment and personal information; restrict to requester/admin and redact if exported. |
| `training-assets` | FMS Academy and Agent training files, guides, quizzes, and policy documents. | Private or authenticated depending on content. | Admin uploads; FMS/agent can access assigned training modules; super admin manages. | Admin approval before publishing training content. | Retain current and historical versions for compliance. | Keep internal SOPs protected; public candidate materials should be separated if needed. |
| `public-content` | Public website images, SEO content assets, brand-safe downloads, and public documentation. | Public read, restricted write. | Admin/super admin or deployment process writes; public reads. | Content review before publish. | Retain while referenced by public pages; use redirects/replacements when updated. | Never store private project, importer, FMS, factory contact, payment, or evidence files here. |

## Path Naming Recommendations

Use predictable but non-security-dependent paths:

- `importer-uploads/projects/{project_code}/{file_id}-{safe_filename}`
- `fms-evidence/assignments/{assignment_code}/{file_id}-{safe_filename}`
- `factory-evidence/factories/{factory_code}/{file_id}-{safe_filename}`
- `message-attachments/threads/{thread_code}/{file_id}-{safe_filename}`
- `invoice-documents/invoices/{invoice_code}/{document_id}.pdf`
- `refund-evidence/refunds/{refund_code}/{file_id}-{safe_filename}`
- `training-assets/{role}/{module_key}/{version}/{safe_filename}`
- `public-content/{content_type}/{slug}/{safe_filename}`

## Review Status Flow

Recommended file review states:

- `pending_review`
- `approved_internal`
- `approved_importer_visible`
- `approved_fms_visible`
- `approved_factory_visible_future`
- `needs_redaction`
- `redacted`
- `rejected`
- `archived`

## File Release Workflow

1. User uploads file to role-appropriate private bucket.
2. Insert `file_assets` row with project/assignment/factory/message context.
3. Insert `file_review_status` row as `pending_review`.
4. Run future malware/contact-info scan.
5. Admin reviews file and either rejects, requests redaction, approves internally, or creates access grants.
6. If released to importer/FMS/factory future, create `file_access_grants` and `data_release_approvals` where needed.
7. Log review/release/download in `audit_logs` or `access_logs`.

## Retention Guidance

- Project intake and FMS evidence should be retained at least through project completion, refund/dispute window, and operational audit period.
- Invoice/payment documents should follow finance/legal retention requirements.
- Rejected files should be retained only as long as needed for safety/audit unless legal review requires more.
- Public content assets can be cached aggressively but must not contain private data.
- Final retention durations are a founder/legal open decision before launch.

## Future Security Work

- Add malware scanning.
- Add MIME/type validation.
- Add maximum file size by bucket.
- Add OCR/contact information detection for images and PDFs.
- Add redaction workflow for sensitive text/images.
- Add signed URL expiration policies.
- Add download logging for sensitive files.
