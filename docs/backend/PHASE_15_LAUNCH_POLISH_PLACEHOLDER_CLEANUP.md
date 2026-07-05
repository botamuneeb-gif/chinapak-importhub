# Phase 15: Launch Polish, Placeholder Cleanup, and MVP Feature Gating

## Purpose

Phase 15 prepares ChinaPak ImportHub for a professional MVP launch by hiding non-working surfaces, removing fake action buttons, and keeping launch users focused on the workflows that are actually connected.

No Supabase schema changes, migrations, payment gateway integration, email/SMS provider activation, or new product phases were added.

## Launch Feature Flags

Static launch flags live in `config/launch-flags.ts`.

Current launch flag state:

- `enableMessages = false`
- `enableBulkActions = false`
- `enableVoiceNotes = true` after importer voice note upload was connected to private project files.
- `enablePhotoUploadInWizard = true` after importer product photo/catalog upload was connected to private project files.
- `enableProfilePages = false`
- `enableFactoryPortal = false`
- `enableFactoryDatabaseAdmin = false`
- `enablePublicFmsSignup = false`
- `enablePdfServerExport = false`
- `enableGatewayPayments = false`
- `showFutureNavItems = false`
- `showPortalChromeOnDocumentRoutes = false`

These flags are intentionally static for MVP launch. Environment-driven feature flags can be added later if staging/production differences are needed.

## Launch-Visible Features

The launch navigation keeps working surfaces visible:

- Importer: dashboard, start project, reports, invoices, payments, refunds, notifications, logout.
- FMS: dashboard, assignments, factory submissions/evidence through assignments, academy, notifications, logout.
- Admin: dashboard, projects, leads, payments, refunds, representatives, FMS directory, factory submissions, evidence review, report feedback, notifications, logout.
- Super Admin: dashboard, users/role controls, notifications, logout.
- Agent: dashboard, leads, commissions, training, logout.

## Hidden or De-Emphasized Features

The following are hidden from launch navigation or converted into clear launch notices:

- Messages and direct message composers.
- Profile pages.
- FMS earnings navigation.
- Static factory database admin navigation.
- Super Admin settings/audit placeholders.
- OCR/transcription/AI interpretation for product files and voice notes. Upload itself is now connected.
- Public contact form placeholder.
- Public FMS self-service onboarding placeholder.
- Online gateway payment button.

## Placeholder Cleanup

Visible fake controls were removed from:

- Admin project list bulk action panel.
- Admin project list `Prepare Assignment Placeholder` button.
- Admin project detail fake message/refund action panel.
- Admin leads fake action buttons and lead action panel.
- Importer wizard fake photo/voice selector buttons. Product photo/catalog/spec upload and voice note/audio upload are now working private project-file inputs.
- Importer wizard backend/Supabase explanation text.
- Public contact placeholder form.
- Public FMS onboarding placeholder card.
- Public representative verification fake lookup form.
- Public factory portal/signup/partnership fake forms.
- Agent lead detail fake contact/conversion buttons.
- Messaging route fake composer surfaces when launch messaging is disabled.
- FMS Academy module open buttons.

Some internal code identifiers still contain the word `placeholder` where they represent existing data model fields, HTML input placeholder attributes, or database metadata markers. These are not launch-visible fake buttons.

## Document Layout

Document routes now use a standalone document presentation:

- `/invoices/[invoiceId]/document`
- `/payments/[paymentId]/document`
- `/refunds/[refundId]/document`
- `/importer/reports/[projectId]/document`
- `/admin/projects/[projectId]/document`
- `/admin/invoices/[invoiceId]/document`
- `/admin/payments/[paymentId]/document`
- `/admin/refunds/[refundId]/document`

The protected portal shell does not wrap document routes when `showPortalChromeOnDocumentRoutes` is false. A `document-standalone` page marker hides the public header/footer for document pages, while print CSS continues to hide app chrome when printing or saving as PDF.

## Manual QA Checklist

- Public homepage, packages, contact, FMS entry, and SEO pages load without unfinished call-to-action controls.
- Importer wizard shows the current working submission methods: product details, product URL, product photos/screenshots/catalog/spec files, and voice note/audio upload.
- Importer wizard uploads product files and voice notes as private importer project files for admin review.
- Importer can submit paid-intent projects and save unpaid leads.
- Admin project list shows filters and real `Review Project` links only.
- Admin project detail keeps payment verification, admin review, FMS assignment, report release, feedback, evidence, and document controls.
- Admin leads page clearly states unpaid leads are not assignable to FMS.
- FMS assignment detail allows connected factory option/evidence workflows without exposing importer contacts.
- Messages nav is hidden and direct message routes show launch-state notices.
- Document routes open as centered official documents with Back and Print/Save controls.
- Auth guards still block wrong roles.
- Sitemap/robots continue excluding private routes.
- Public verify/factory pages explain launch status without pretending to submit forms.
- Agent lead pages provide compliance guidance instead of non-working CRM actions.

## Remaining Launch Risks

- Manual/offline payment verification remains the payment model; gateway payments are intentionally disabled.
- Email delivery remains notification-record-only unless a provider is configured later.
- Factory database admin is hidden from launch navigation because the operational factory-submission review workflow is the active path.
- Phone/WhatsApp OTP remains disabled for launch; production-visible importer
  authentication uses email/password until SMS/WhatsApp provider setup is
  complete.
- Some historical config files still contain sample/static data for earlier prototype pages. Keep hidden/static surfaces out of primary launch navigation.
