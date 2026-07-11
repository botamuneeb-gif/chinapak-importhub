# PWA and Mobile App Experience

## Purpose

This pass adds an installable Progressive Web App foundation and small mobile experience improvements for ChinaPak ImportHub without creating native Android/iOS app files and without changing core business workflows.

The goal is to make the live web platform feel more like a professional mobile operations app before any future native app investment.

## PWA Behavior

The app now exposes a Next.js App Router manifest at `/manifest.webmanifest`.

Manifest settings:

- App name: `ChinaPak ImportHub`
- Short name: `ChinaPak`
- Description: `Direct China Factory Access for Pakistani Importers`
- Start URL: `/`
- Scope: `/`
- Display mode: `standalone`
- Theme color: `#0B1F3A`
- Background color: `#F7F9FC`
- Orientation: `portrait`

Global metadata links the manifest and adds install-friendly mobile metadata:

- Apple mobile web app capable metadata
- Apple app title: `ChinaPak`
- Theme color metadata
- Apple touch icon
- 192x192 and 512x512 PWA icons

## Icon Setup

PWA icons are static brand-colored PNG files in `public/icons`:

- `public/icons/pwa-icon-192.png`
- `public/icons/pwa-icon-512.png`
- `public/icons/apple-touch-icon.png`

They use the approved ChinaPak ImportHub palette: deep navy, emerald, gold, and white.

## Offline and Private Data Policy

No service worker was added in this pass.

Reason:

- The platform contains private importer, FMS, admin, payment, refund, notification, document, and project data.
- Offline caching must not accidentally store private authenticated data on shared devices.
- A future offline fallback can be added only if it caches a generic public fallback page and explicitly excludes protected portal data.

Current behavior is online-first and safer for MVP launch.

## Mobile Portal Shell Improvements

Protected portals now use a more app-like mobile shell:

- Desktop sidebars remain unchanged.
- Mobile protected portals use a fixed bottom navigation bar.
- The bottom navigation uses the existing role-based nav config.
- Portal content includes bottom safe-area padding so actions are not hidden behind the mobile nav.
- Notification tray opens as a mobile-friendly viewport panel on small screens.
- Public marketing navigation remains hidden inside protected portals.

Protected portals covered:

- Importer
- FMS
- Admin
- Super Admin
- Agent
- Project Manager

## Importer App Flow

Importer portal polish:

- Dashboard now explains what happens after payment and when reports appear.
- Recent project cards show a clear `Next action`.
- Project detail pages show a prominent `Next Required Action` card near the top.
- Importer detail keeps payment, notifications, reports, timeline, files, invoices, refunds, and report links in one secure tracking view.

Importer visibility remains sanitized:

- Importer can see own project details, payment/report status, own files, released reports, and importer-safe timeline events.
- Importer cannot see raw FMS submissions, FMS contact details, factory private contact details, admin-only notes, or unreleased reports.

## FMS Mobile Workflow

FMS portal polish:

- Dashboard no longer says factory submissions are disabled.
- Dashboard now explains the mobile field workflow for assignment work.
- Assignment detail pages include a mobile FMS checklist for supplier evidence capture.
- Assignment action buttons are full-width on mobile and normal width on larger screens.

FMS can still:

- View own assignments only.
- Review safe project requirements.
- Add supplier/factory option details.
- Enter quotation, MOQ, lead time, match notes, evidence notes, and risk notes.
- Upload evidence where the existing file workflow allows it.
- Submit factory options to Admin review.

FMS still cannot:

- See importer private contact details.
- Contact importers directly.
- Release factory contact details to importers.
- Bypass Admin review.

## Project Manager Mobile Workflow

Project Manager portal polish:

- Dashboard now explains project-flow focus, safe escalation, and mobile operations.
- Project detail pages show current PM marker, escalation status, and the next safe action.

Project Manager remains limited to:

- Viewing project-flow data.
- Adding internal operational notes.
- Updating safe Project Manager workflow markers.
- Escalating restricted actions to Admin.

Project Manager cannot:

- Verify payments.
- Assign FMS.
- Approve FMS submissions.
- Release importer reports.
- Issue refunds.
- Manage users or roles.
- Access Admin or Super Admin portals.

## Admin Operational Visibility

Admin dashboard now includes a Launch Operations Watchlist with mobile-friendly links for:

- Payment verification
- Projects needing FMS assignment
- FMS submissions
- Reports ready to release
- Project Manager escalations
- Refund review

Existing Admin controls remain unchanged.

Importer conversion/payment readiness added a compact Admin payment queue surface for:

- Projects awaiting payment
- Payment proof pending verification
- Paid projects awaiting Admin approval
- Paid projects awaiting FMS assignment
- Payment issues needing correction
- Project Manager escalations

These links are operational shortcuts only. They do not add Project Manager payment verification powers or payment auto-approval.

## Notification UX

The existing protected portal notification tray remains role-scoped and polls near-live.

Mobile polish:

- The tray opens as a viewport-width panel on narrow screens.
- Unread counts, refresh, mark read, mark all read, settings, and View All remain available.
- Role-specific notification action URLs continue to control where users can go.

## Security and Privacy Notes

This pass did not weaken route guards, RLS assumptions, or server action checks.

Confirmed boundaries:

- Public FMS signup remains disabled.
- FMS account creation remains invite-only after approval.
- FMS cannot see importer contact details.
- Project Manager cannot access Admin/Super Admin-only actions.
- Protected portals remain excluded from sitemap and disallowed in robots.
- No private data is cached offline.
- No service role key or private token is exposed client-side.
- Tokenized FMS application update routes remain noindex/private and are not part of the sitemap.
- Manual payment readiness copy warns users not to submit card numbers, banking passwords, OTPs, CNIC images, or private account credentials.

## QA Checklist

- Open `/manifest.webmanifest` and confirm app name, icons, theme color, display mode, start URL, and scope.
- Confirm mobile browser offers Add to Home Screen / install where supported.
- Confirm no service worker caches private data.
- Confirm homepage loads normally.
- Confirm `/login` loads normally.
- Confirm `/importer/dashboard` has mobile bottom nav and no public marketing nav.
- Confirm `/importer/projects/[projectId]` shows the Next Required Action card.
- Confirm `/fms/dashboard` shows the updated mobile field workflow.
- Confirm `/fms/assignments/[assignmentId]` shows the mobile FMS checklist and no importer contact details.
- Confirm `/project-manager/dashboard` shows project-flow guidance.
- Confirm `/project-manager/projects/[projectId]` shows PM marker, escalation status, and safe action guidance.
- Confirm `/admin/projects` remains horizontally scrollable on mobile.
- Confirm `/super-admin/users` still loads with the protected portal shell.
- Confirm Project Manager cannot access `/admin` or `/super-admin`.
- Confirm public FMS signup remains disabled.
- Confirm sitemap and robots continue to exclude protected routes.
- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm run build`.

## Future Work

- Add a public-only offline fallback page when the app has a reviewed service worker strategy.
- Add screenshots for PWA manifest metadata if required by future app store-style distribution.
- Consider role-specific install prompts after real mobile usage testing.
- Consider touch-optimized table card variants for the highest-traffic Admin queues.
