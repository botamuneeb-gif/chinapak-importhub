# FMS Approval To Importer Report Release Fix

Status: implemented as a surgical workflow connection fix.

## Old Incorrect Behavior

After admin approved an FMS factory submission, the admin UI showed:

```text
Submission approved. Importer release remains a future workflow.
```

That was stale Phase 6 wording. Phase 7 already implemented importer-facing
approved factory reports from the admin project detail page.

## New Connected Workflow

1. FMS submits factory options to admin review.
2. Admin reviews the FMS submission at `/admin/factory-submissions/[submissionId]`.
3. Admin approves, rejects, or requests revision.
4. On approval, the submission remains admin-only but is available to the Phase 7 report builder.
5. The approved submission detail now shows a real CTA:

```text
Open Project Report Panel
```

The CTA routes to:

```text
/admin/projects/[projectId]#report-release
```

6. Admin selects approved submissions, chooses importer-safe visible fields,
   writes summary/recommendation/comparison notes, and releases the sanitized
   report.
7. Only after release does the importer see the report in `/importer/reports`
   and `/importer/projects/[projectId]`.

## Report Sanitization Rules

Importer-safe report fields may include:

- factory display label
- city/province
- product category
- product match summary
- main products
- estimated unit price/currency
- MOQ
- sample availability
- production lead time
- packaging/customization notes
- quality/reliability summary
- risk summary
- admin recommendation and comparison notes

Never include:

- raw FMS notes
- FMS contact details
- factory phone, email, WeChat, WhatsApp, Telegram, or exact address
- bank/payment details
- admin-only internal notes
- sensitive factory database contact records
- private storage paths

The existing Phase 7 contact firewall still blocks report release if
importer-facing fields contain contact/payment details.

## Importer Visibility Rules

- Before report release, importer project tracking shows that the factory report
  will appear after admin review.
- After report release, importer project tracking links to the released report
  and report document.
- Importers cannot see raw FMS submissions, private factory contacts, admin
  notes, or unreleased reports.

## Files Updated

- `app/admin/factory-submissions/actions.ts`
- `components/admin/live-factory-submission-detail.tsx`
- `components/admin/live-admin-project-detail.tsx`
- `docs/backend/PHASE_6_FMS_FACTORY_OPTIONS_ADMIN_REVIEW.md`

## QA Checklist

1. Login as admin.
2. Open an FMS submission in `/admin/factory-submissions/[submissionId]`.
3. Approve the submission.
4. Confirm the UI no longer says importer release is future work.
5. Confirm the approved submission shows `Open Project Report Panel`.
6. Click the CTA and confirm it lands on the project report release section.
7. Select approved submissions and safe fields.
8. Save draft or release to importer.
9. Login as importer and confirm the report is invisible before release and
   visible only after release.
10. Confirm raw FMS/private factory/admin data is not visible to importer.
