# Importer Conversion And Payment Readiness

This phase improves importer-facing conversion and manual payment readiness without adding a payment gateway or changing Admin verification rules.

## Public Conversion Flow

Launch-visible importer pages now guide users toward the real workflow:

- Start Import Project
- View Packages
- How It Works

The homepage explains that ChinaPak ImportHub helps Pakistani importers submit product details, complete Admin-verified manual payment, let FMS gather factory options, and receive an Admin-released sanitized report.

Factory reports now include a sanitized side-by-side factory option comparison, platform review score, recommendation label, evidence summary, risk notes, and importer-facing disclaimers. Scores are decision-support indicators only and do not guarantee factory reliability, customs clearance, shipment delivery, product compliance, or fixed pricing.

Important boundary copy remains visible:

- ChinaPak supports platform-assisted sourcing decisions.
- ChinaPak does not guarantee the final factory deal.
- FMS never contacts importers directly.
- Factory matching starts only after Admin payment verification and project review.

## Package Selection Behavior

Package content is centralized in:

```text
config/importer-packages.ts
```

Each package has:

- recommended use case
- what importer gets
- what is not included
- expected next step
- package-specific start URL

Public package CTAs link to:

```text
/importer/start?package=factory-discovery
/importer/start?package=factory-match-plus
/importer/start?package=import-partner
```

The importer wizard reads the `package` query parameter and preselects the matching active package if supported.

## Importer Intake Improvements

The protected `/importer/start` wizard still uses the existing submission flow, invoice creation, file upload, and unpaid lead handling.

Additional optional context is captured in existing metadata:

- product category
- target product budget
- destination city in Pakistan
- preferred China city/province
- customization, branding, or packaging needs
- quality concerns
- conversion attribution

Required submission rule remains:

- at least one real requirement input must be present: written details, product URL, product file/photo, or voice note.

Before paid-intent submission, importer must confirm:

- payment is manual/Admin-verified
- factory sourcing starts only after payment and Admin review gates pass
- FMS never collects payment or contacts importer directly

After successful project creation, the wizard shows:

- Project ID
- Invoice ID
- Track Project
- Complete payment
- Invoice
- Importer dashboard

## Payment Status States

Importer-facing payment readiness explains these states:

- Awaiting payment
- Proof submitted
- Verification pending
- Payment verified
- Needs correction
- Refund/refund requested where existing refund workflow applies

Payment UI warns importers not to share:

- card numbers
- banking passwords
- OTPs
- CNIC images
- private account credentials

Manual payment references are still submitted through the existing manual payment form and reviewed by Admin/Super Admin only.

## Admin Payment Permissions

Admin/Super Admin can:

- review manual payment references
- mark payment verified
- reject/request correction
- continue project review and FMS assignment gates

Project Manager cannot:

- verify payment
- reject payment
- mark project paid
- approve final project review
- assign FMS
- release reports
- issue refunds

## Notifications And Email Templates

Notification templates were added for importer payment readiness:

- `importer_project_received`
- `importer_payment_instructions`
- `importer_payment_proof_received`
- `importer_payment_verified`
- `importer_payment_needs_correction`
- `importer_payment_reminder`

Current triggers:

- Project submission creates importer received/payment-instructions notifications.
- Manual payment submission creates importer proof-received notification and Admin payment-review notification.
- Admin payment review uses importer payment verified/correction notifications.

Email delivery remains provider-controlled:

- `EMAIL_DELIVERY_MODE=disabled` must not crash workflows.
- Resend mode uses the existing provider abstraction where recipient-aware helpers call it.
- Generic in-app notifications remain the main always-on channel.

## Payment Follow-Up Helper

Reusable server-only helper:

```text
lib/importer/importer-payment-followups.ts
```

It can detect:

- project submitted but no payment action after 24 hours
- payment reference submitted but not verified after 12 hours

Behavior:

- creates Admin and Project Manager internal notifications
- Project Manager notices remain advisory and route to Project Manager project pages
- optionally creates importer payment reminder notifications
- optionally sends importer reminder email only when the caller enables it, the importer email is verified, delivery mode supports sending, and reminder caps allow it
- dedupes by project/date/reminder type
- caps importer payment reminders at 3 per project

The helper is not scheduled in this phase. It is ready for a future manual action or cron integration.

## Attribution Capture

Importer start/submission now captures safe attribution in project/lead metadata:

- landing page
- referrer
- UTM source
- UTM medium
- UTM campaign
- UTM content
- selected package
- submitted from URL
- submitted at

No fingerprinting, invasive tracking script, card data, or private browser identifiers are collected.

Admin project detail shows compact attribution for operational conversion review. Importer-facing project pages do not show attribution.

## Privacy And Security Boundaries

- No payment gateway was added.
- No payment is auto-approved.
- No project is auto-approved.
- No FMS assignment is auto-created by payment readiness logic.
- No report is auto-released.
- Importer reports expose only sanitized comparison/report fields; Admin-only notes, raw FMS notes, FMS contact details, and factory private contact details remain hidden.
- FMS cannot see importer private contact details.
- Project Manager cannot verify payments or access Admin/Super Admin-only controls.
- Manual payment references remain access-controlled.
- No service role key is exposed client-side.
- Public pages do not expose private project/payment data.

## QA Checklist

- Homepage CTAs show Start Import Project, View Packages, and How It Works.
- `/packages` works on desktop and mobile.
- Package CTA opens `/importer/start?package=...`.
- `/importer/start` preselects the package from the query param.
- Importer can submit with existing required fields.
- Importer can submit using details, URL, files, voice note, or mixed inputs.
- Project code and invoice code appear after submission.
- Complete payment link opens manual payment for the invoice.
- Importer dashboard shows next payment/project action.
- Importer project detail shows payment status and safety warning.
- Manual payment submission still creates Admin review request.
- Admin can verify/reject/request correction through existing controls only.
- Project Manager cannot verify payment.
- FMS cannot see importer private contact details.
- `EMAIL_DELIVERY_MODE=disabled` does not crash.
- Importer attribution appears in Admin project detail only.
- Lifecycle alerts and daily digest still build.
- PWA manifest, sitemap, and robots still build.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.
