# Phase 9: File & Evidence Upload System

Status: implemented as a Supabase Storage + metadata foundation. Frontend workflows can upload, list, review, and release selected evidence, but payment, invoices, refunds, payouts, public factory signup, and PDF export remain out of scope.

## What Is Connected

- Importer project/report pages can upload product reference files for the importer’s own project.
- FMS assignment pages can upload evidence files for the logged-in FMS’s own assignment.
- Admins can review files at `/admin/evidence`.
- Admins can approve internal evidence, reject evidence, keep evidence admin-only, or release selected evidence to the importer.
- File preview/download uses short-lived signed URLs.

## Storage Structure

Migration `018_phase_9_file_storage_buckets.sql` adds private Supabase Storage buckets:

- `importer-project-files`
- `fms-evidence-files`
- `admin-private-files`
- `importer-released-report-files`

Current upload paths:

- Importer uploads: `projects/{project_code}/importer/{asset_id}-{safe_filename}`
- FMS evidence: `projects/{project_id}/fms/{assignment_code}/{asset_id}-{safe_filename}`

All buckets are private. Do not make these buckets public.

## Tables Used

- `file_assets`
- `file_review_status`
- `file_access_grants`
- `fms_submission_evidence` when an FMS links evidence to a factory submission
- `fms_assignment_milestones` for evidence-upload milestones
- `import_project_timeline_events` for upload/review/release timeline entries

## File Metadata

`file_assets.metadata.visibility_scope` is used for Phase 9 UI rules:

- `importer_uploaded`: uploaded by importer; visible to importer and admin.
- `fms_to_admin`: uploaded by FMS; visible to FMS owner and admin.
- `admin_only`: reviewed/retained for internal admin use.
- `released_to_importer`: explicitly released by admin for importer visibility.

Review status mapping:

- Pending admin review: `pending_review`
- Approved internal/admin-only: `approved_internal`
- Released to importer: `approved_importer_visible`
- Rejected: `rejected`

## Visibility Rules

- Importer can upload/read files only for their own projects.
- Importer can see their own uploaded files and admin-released files for their own project.
- Importer cannot see raw FMS evidence, rejected files, admin-only files, or another importer’s files.
- FMS can upload/read evidence only for their own assignment.
- FMS cannot upload to another FMS assignment.
- FMS cannot see importer contact details through the file system.
- Admin/super admin can review evidence across projects.
- Admin release creates an importer role file access grant and marks the file importer-visible.

## Signed URLs

The app creates signed URLs with a short expiration after role and visibility checks. It does not expose raw public Storage URLs for private files.

## Allowed File Types And Limits

Server-side validation currently allows:

- Images: JPG/JPEG, PNG, WebP up to 8 MB
- Documents: PDF up to 10 MB
- Videos: MP4/WebM up to 25 MB

Executable/script files are rejected. Filenames are sanitized before storage paths are created.

## Manual Supabase Setup

Run migrations before testing Phase 9:

```bash
npx supabase db push
```

The migration inserts the private Storage buckets into `storage.buckets` when the Storage schema is available. If the hosted project blocks bucket creation through SQL, create the four buckets manually in Supabase Storage with public access disabled.

## Manual Testing

1. Log in as an importer with a released report.
2. Open `/importer/reports/{projectId}`.
3. Upload a JPG/PNG/WebP/PDF product reference file.
4. Confirm the file appears for the importer with `Pending admin review`.
5. Log in as FMS.
6. Open `/fms/assignments/{assignmentId}`.
7. Upload evidence for the assignment or a factory submission.
8. Confirm the FMS sees only their uploaded evidence.
9. Log in as admin.
10. Open `/admin/evidence`.
11. Preview evidence through the signed URL button.
12. Approve internal, reject, or release selected safe evidence to importer.
13. Log back in as importer and confirm only released files are visible.

## Remaining Placeholders

- No direct Storage RLS policies for client uploads are used yet; uploads go through server actions after role checks.
- No real file redaction workflow is implemented yet.
- No OCR/contact-info scanning inside binary files is implemented yet.
- No PDF report export is connected.
- No payment, invoice, refund, FMS payout, public factory signup, or direct chat workflow is added in this phase.
