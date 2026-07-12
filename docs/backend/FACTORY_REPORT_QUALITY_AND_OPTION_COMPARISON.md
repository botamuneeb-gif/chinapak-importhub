# Factory Report Quality And Option Comparison

This phase improves the Phase 7 importer factory report workflow without changing core gates.

No schema migration was added. Factory report comparison, scoring, recommendation, and readiness data are stored inside the existing `import_projects.metadata.phase_7_factory_report` payload.

## Admin Workflow

Admin still releases reports only from:

- `/admin/projects/[projectId]#report-release`

The report release panel now supports:

- side-by-side comparison of admin-approved FMS factory submissions
- evidence and risk summary review
- recommendation selection
- calculated comparison score
- risk label
- release readiness checklist
- current saved report preview

Release remains Admin/Super Admin-only. The checklist never auto-releases a report.

## Comparison Model

Each importer-facing report option can include:

- factory display label
- city/province
- product match summary
- estimated price and currency
- MOQ
- lead time
- sample/customization/packaging availability
- evidence summary
- quality/reliability summary
- risk summary
- recommendation status
- quality score
- risk score
- overall comparison score

The scoring config lives in:

```txt
config/factory-report-quality.ts
```

## Scoring Categories

Scores are calculated as platform review indicators, not guarantees.

Categories:

- product match
- price competitiveness
- MOQ suitability
- lead time suitability
- evidence quality
- supplier clarity
- risk review

Labels:

- `85-100`: Strong option
- `70-84`: Good option
- `50-69`: Needs clarification
- `0-49`: High risk / not recommended

Risk labels:

- Low
- Medium
- Needs review
- High

## Release Readiness

The Admin readiness checklist checks:

- at least one factory/supplier option reviewed
- price or quote information present, or reason marked unavailable
- MOQ information present, or reason marked unavailable
- lead time information present, or reason marked unavailable
- evidence/photos/docs reviewed
- risk notes reviewed
- importer-safe summary completed
- admin-only notes excluded from importer report
- recommended option selected or no-recommendation explanation written

Required missing items block the release button in the Admin UI. Draft saving remains available.

## Importer Report

Importer report pages now show:

- report summary
- factory option comparison table
- recommended option labels
- price/MOQ/lead-time comparison
- evidence summary
- risk level and risk notes
- next steps
- disclaimers

Printable report documents include the same sanitized comparison table.

## Hidden From Importer

Importer report and document actions do not expose:

- raw FMS submissions
- FMS contact details
- FMS private/internal notes
- factory private contact details
- Admin-only notes
- private payment/bank details
- raw storage paths
- other importers' data

The report save/document actions continue to run contact firewall checks.

## FMS Feedback Boundary

FMS assignment pages show safe review-state feedback:

- submission received
- under Admin review
- accepted for internal review
- clarification needed
- rejected from current report workflow

FMS users still cannot see importer contact details, Admin-only notes, payment proofs, or the final importer report unless a future approved workflow allows it.

## Project Manager Boundary

Project Manager project detail shows read-only report progress:

- report status
- readiness label
- reviewed option count

Project Managers cannot approve FMS submissions, score/release reports, verify payments, assign FMS, issue refunds, or access Admin/Super Admin panels.

## Notifications And Email

Existing templates were tightened:

- `factory_report_released`
- `fms_clarification_requested`

Future trigger work can add dedicated notifications for:

- report ready to release
- report missing readiness items
- FMS clarification overdue

Lifecycle alerts already route report-release blockers to the Admin report release panel.

## QA Checklist

- Admin can view approved FMS submission comparison UI.
- Admin can save a report draft.
- Admin can release only through existing Admin/Super Admin report gate.
- Release button is blocked when required readiness items are missing.
- Importer report shows side-by-side comparison.
- Printable report document shows comparison table.
- Importer report excludes Admin-only notes.
- Importer report excludes FMS private notes and contact details.
- FMS cannot see importer private contact fields.
- Project Manager sees read-only report progress only.
- Project Manager cannot release reports.
- Payment/Admin gates remain unchanged.
- Lifecycle alerts and daily digest still build.
- PWA manifest, sitemap, and robots still build.
