# Phase 18: QR Codes, Global Project ID Lookup, and Admin Search Polish

Status: implemented as an MVP launch polish phase.

## What Was Connected

- Added local QR generation through the `qrcode` package.
- Added reusable QR helpers:
  - `lib/qr/generate-qr.ts`
  - `components/qr/qr-code.tsx`
- Replaced visible document QR placeholders with real generated QR codes.
- Added representative verification QR codes in the protected admin representative directory.
- Added support for `/verify/representative?code=...` so scanned representative QR URLs prefill the public verifier.
- Added safe document reference support on `/verify?ref=...`.
- Added admin dashboard Project ID lookup.
- Added Project ID search/filter support on `/admin/projects`.
- Added importer-facing Project ID copy controls on project list/detail pages.

## QR Payload Strategy

Representative QR codes encode:

```text
https://SITE_URL/verify/representative?code=CPIH-REP-XXXXX
```

Document QR codes encode:

```text
https://SITE_URL/verify?ref=DOCUMENT_REFERENCE
```

The public `/verify` page does not expose private invoice, project, payment,
refund, report, storage, FMS, or factory data. It only shows the scanned
reference and tells the user to contact official ChinaPak ImportHub support for
verification.

## Project ID Strategy

The existing `import_projects.project_code` field remains the global
human-readable Import Project ID. The current app already generates and uses
codes such as:

```text
CPH-2026-0007
```

UUID primary keys remain internal database identifiers. Project codes are shown
across importer, admin, FMS, invoice, payment, refund, report, document, file,
and notification surfaces where appropriate.

No migration was added in this phase because `project_code` already exists,
is used for route lookup, and is the right MVP global reference field.

## Admin Search Behavior

- `/admin` includes a "Find Project" lookup box for Project ID or UUID.
- Exact Project ID or UUID matches navigate directly to the admin project
  detail page.
- Partial Project ID matches show a short result list.
- `/admin/projects` includes a local filter for Project ID, UUID, product,
  importer name, city, package, payment status, project status, admin review
  status, and readiness label.

Admin searches use existing admin-only server actions or already authorized
admin data. No public project lookup was added.

## Privacy Rules

- Public representative verification returns only sanitized representative
  fields: display name, role title, city/province/service area, status,
  public notes, checked code, and timestamp.
- Public document QR verification does not reveal document contents.
- Importers can only open their own project tracking routes through existing
  server-side ownership checks.
- FMS pages show the safe project code and sourcing brief only; importer
  contact details remain hidden.
- Raw FMS submissions, factory contact data, admin notes, private storage
  paths, and service-role data are not exposed.

## Manual QA Checklist

1. Open an invoice/report/payment/refund/admin project document and confirm the
   QR code renders.
2. Scan or open the document QR URL and confirm `/verify?ref=...` displays only
   the reference and safety text.
3. In `/admin/representatives`, confirm active representatives show a QR code.
4. Open the representative QR URL and confirm `/verify/representative?code=...`
   prefills the code field.
5. Verify active, invalid, suspended, and revoked representative code results.
6. Open `/admin`, search a full Project ID, and confirm direct navigation.
7. Open `/admin/projects?q=CPH` and confirm the search box initializes.
8. Confirm importer project list/detail pages show copyable Project IDs.
9. Confirm FMS assignment pages show Project ID but no importer contact details.
10. Run `npm run lint`, `npm run typecheck`, and `npm run build`.

## Remaining Future Improvements

- Public document verification could later return a minimal safe status record,
  but it must never expose private document contents.
- QR download as PNG/SVG can be added if the operations team needs printable
  representative badges.
- A dedicated global admin search index may be useful when project volume grows
  beyond simple server-side lookups.
