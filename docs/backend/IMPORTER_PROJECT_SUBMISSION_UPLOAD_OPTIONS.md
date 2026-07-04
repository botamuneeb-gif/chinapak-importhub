# Importer Project Submission Upload Options

## What Was Enabled

The importer start-project wizard now supports four working requirement input methods:

- Product name/details
- Product URL
- Product photos, screenshots, catalog PDFs, and simple spec documents
- Voice note/audio requirement upload

The earlier launch-hidden photo/file and voice note cards are now connected to the existing Phase 9 private file upload system.

## Allowed File Types And Limits

Product requirement files:

- JPG/JPEG
- PNG
- WebP
- PDF
- DOC
- DOCX
- Maximum 5 files during initial project submission
- Maximum 10 MB per file

Voice note:

- MP3
- M4A
- WAV
- WebM
- OGG
- Maximum 1 audio file during initial project submission
- Maximum 20 MB

Automatic transcription, OCR, AI translation, and browser voice recording are not enabled yet.

## Storage Bucket And Path

Initial importer requirement files use the existing private Supabase Storage bucket:

- `importer-project-files`

Storage path pattern:

- `projects/{project_code}/importer/requirements/{asset_id}-{safe_filename}`

Buckets must remain private. Files are previewed only through short-lived signed URLs after role checks.

## Metadata Stored

The project requirement metadata records:

- `submission_method`
- `has_manual_description`
- `has_product_url`
- `has_voice_note`
- `uploaded_requirement_file_count`
- `voice_note_file_name`
- selected budget, quality, experience, package, and add-on metadata

File metadata records:

- `purpose`
- `kind`
- `source = importer_project_submission`
- `visibility_scope = importer_uploaded`

## Visibility Rules

Importer:

- Can upload files only after an authenticated importer project is created.
- Can view their own uploaded files and admin-released files.
- Cannot view another importer’s files.

Admin/super admin:

- Can see importer requirement files from the admin project detail page and evidence review tools.
- Can preview files through signed URLs.
- Can review/release files according to Phase 9 rules.

FMS:

- Does not automatically see importer-uploaded files.
- May see only files made available through existing approved file access/release rules.
- Must not see importer contact details through files.

## Error Handling

- Empty Step 1 submissions are blocked unless at least one of details, URL, file, or voice note is present.
- Invalid file types are blocked before submission.
- Oversized files are blocked before submission and again server-side.
- Double submit is guarded by the existing submitting state.
- If a project is created but a file upload fails, the importer sees a warning and can upload again from the project detail page.

## Future Improvements

- OCR for product screenshots/catalogs
- Audio transcription
- AI trade translation for voice notes
- Browser voice recorder
- Contact-info scanning inside binary files
- More granular admin release to FMS for selected requirement files
