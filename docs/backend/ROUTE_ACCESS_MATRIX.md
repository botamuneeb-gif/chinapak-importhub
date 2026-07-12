# Route Access Matrix

This matrix documents the intended public/private boundary for ChinaPak ImportHub. Route guards and server actions remain the real access controls; sitemap and robots rules are SEO guidance only.

Public marketing chrome is shown on public website and auth entry routes only. Protected portal routes use the role-based portal shell and must not render visitor navigation such as Packages, Learn, Login, or Start Import Project.

## Role Permission Matrix

| Permission | Public visitor | Importer | FMS | Admin | Super Admin | Project Manager | Agent |
|---|---|---|---|---|---|---|---|
| View own projects | No | Yes, own projects only | Assigned sourcing brief only | Yes, operational queue | Yes | Yes, project-flow view | Assigned leads only |
| Create import project | No | Yes | No | No | No | No | No |
| Upload payment proof/reference | No | Yes, own invoices only | No | No | No | No | No |
| Verify payment | No | No | No | Yes | Yes | No | No |
| Approve project/admin review | No | No | No | Yes | Yes | No, escalate only | No |
| Assign FMS | No | No | No | Yes | Yes | No, escalate only | No |
| Submit factory options | No | No | Yes, assigned FMS work only | No | No | No | No |
| Review FMS submissions | No | No | No | Yes | Yes | No, follow-up/escalate only | No |
| Release importer report | No | No | No | Yes | Yes | No | No |
| Manage users/roles | No | No | No | No | Yes | No | No |
| Approve FMS applications | No | No | No | Pre-screen and forward only | Yes, final approval/decline | No | No |
| Create Project Managers | No | No | No | No | Yes | No | No |
| View lifecycle alerts | No | No | No | Yes, full admin actions | Yes, full admin summary | Yes, PM-safe follow-up actions | No |
| Run lifecycle alert scan | No | No | No | Yes | Yes | No | No |
| Send daily digest | No | No | No | Yes | Yes | No | No |
| View importer private contact info | No | Own account only | No | Yes, operational need | Yes | Limited safe profile summary only | Assigned lead data only |
| View supplier/factory data | No | Released report only | Own submitted/assigned evidence only | Yes, including admin-only fields | Yes | Safe operational summary only | No |
| Access cron routes | No | No | No | No UI access; `CRON_SECRET` only | No UI access; `CRON_SECRET` only | No | No |

## Public Website

| Route group | Allowed access | Notes |
|---|---|---|
| `/` | Public | Public homepage and conversion entry. |
| `/packages` | Public | Public package comparison. |
| `/contact` | Public | Placeholder contact routing only; no real submission yet. |
| `/verify`, `/verify/representative` | Public | Public trust and representative verification foundation. |
| `/how-it-works`, `/about`, `/faq`, `/trust-safety`, `/refund-policy`, `/privacy-policy`, `/terms` | Public | SEO/policy pages. Legal pages still require production legal review. |
| Public SEO landing pages such as `/import-from-china-to-pakistan`, `/find-chinese-factories`, `/china-sourcing-service-pakistan` | Public | Generated through the public SEO route config. |
| `/learn/*` | Public | Existing content hub routes. |
| `/fms` | Public | Chinese-first FMS acquisition hub. Public FMS signup remains disabled. |
| `/fms/apply` | Public | FMS application/interest form only. Creates an admin-review lead; does not create auth user, role assignment, or FMS profile. Stores safe source/UTM attribution in `unpaid_leads.metadata` for Admin review. |
| `/fms/application-update/[token]` | Public token-scoped, noindex | Secure existing-application update link for FMS candidates when Admin/Super Admin requests more information. Updates only the matching `unpaid_leads` record and does not create duplicate applications or accounts. |
| `/fms/china-sourcing-jobs`, `/fms/factory-match-specialist`, `/fms/china-procurement-agent` | Public | Chinese FMS acquisition SEO pages. Indexable and linked to `/fms/apply` with safe attribution parameters. |
| `/fms/china/*`, `/fms/categories/*` | Public | City/category FMS acquisition SEO pages. Indexable and linked to `/fms/apply` with safe attribution parameters. |
| `/fms/opportunities/*` | Public | Existing FMS recruitment SEO pages retained for compatibility. |
| `/factories/export-to-pakistan`, `/factories/find-pakistani-buyers`, `/factories/partnership` | Public | Factory opportunity pages remain future/invitation-only; no public factory signup activation. |
| `/manifest.webmanifest`, `/icons/*` | Public | Installable PWA assets only. No service worker/offline cache is enabled for private portal data. |

## Authentication Entry

| Route group | Allowed access | Notes |
|---|---|---|
| `/login`, `/signup` | Public | Importer-first auth entry. Public signup creates importer role only. |
| `/auth/role-select`, `/auth/otp`, `/auth/invite`, `/auth/security` | Public/noindex auth utilities | OTP remains inactive. `/auth/invite` is the Supabase invite acceptance page for approved FMS account activation and password setup; public FMS signup is not enabled. |
| `/admin/login` | Public login page | Access after login requires active `admin` or `super_admin`. |
| `/project-manager/login` | Public login page | Access after login requires active `project_manager`. |
| `/super-admin/login` | Public login page | Access after login requires active `super_admin`. |
| `/fms/login` | Public login page | Access after login requires active `fms` role and usable FMS profile. |
| `/agent/login` | Public login page | Access after login requires active `agent` role. |
| `/factory/login`, `/factory/signup` | Public placeholder, noindex | Future/invitation-only. Factory public signup is not active. |

## Importer Portal

| Route group | Allowed access | Notes |
|---|---|---|
| `/importer/dashboard` | Importer | Own project/report/payment summary only. |
| `/importer/start` | Importer | Protected Import Project wizard. Supports package preselection with safe `?package=` query params and stores importer conversion attribution in project/lead metadata. Not included in sitemap and marked noindex. |
| `/importer/projects`, `/importer/projects/[projectId]` | Importer | Own submitted Import Projects only. Shows sanitized project status, timeline, payment readiness, billing links, released report links, and importer-safe files. Raw FMS submissions, FMS contacts, factory contacts, attribution, and admin-only notes are hidden. |
| `/importer/reports`, `/importer/reports/[projectId]` | Importer | Own released reports only. Shows sanitized factory option comparison, recommendation labels, evidence summaries, risk notes, and disclaimers. Raw FMS submissions, FMS contacts, factory contacts, and Admin-only notes hidden. |
| `/importer/reports/[projectId]/document` | Importer | Own released report document only; sanitized comparison/report fields only. |
| `/importer/messages/*` | Importer | Placeholder controlled messaging; no direct importer-FMS communication. |
| `/importer/notifications` | Importer | Own direct notifications only. |

## FMS Portal

| Route group | Allowed access | Notes |
|---|---|---|
| `/fms/dashboard` | FMS | Own assignment summary only. |
| `/fms/assignments`, `/fms/assignments/[assignmentId]` | FMS | Own assignments only. No importer name, email, phone, WhatsApp, address, or contact preference. |
| `/fms/messages/*` | FMS | Admin-only communication placeholder. No direct importer messaging. |
| `/fms/academy`, `/fms/earnings` | FMS | Protected portal pages. Payouts remain placeholder/manual. |
| `/fms/notifications` | FMS | Own direct/role notifications. Must not include importer contact details. |

## Admin Portal

| Route group | Allowed access | Notes |
|---|---|---|
| `/admin` | Admin, Super Admin | Operational dashboard. |
| `/admin/projects/*` | Admin, Super Admin | Project review, importer attribution review, payment verification, assignment, FMS submission comparison/scoring, report readiness checklist, report release, admin documents. |
| `/admin/leads` | Admin, Super Admin | Unpaid leads only; not assignable to FMS. |
| `/admin/representatives` | Admin, Super Admin | Manual representative records, verification code management, and attempt review. Public lookup uses sanitized server-side verification only. |
| `/admin/fms` | Admin, Super Admin | FMS directory. Public users cannot create FMS roles. |
| `/admin/factory-submissions/*` | Admin, Super Admin | Raw FMS submissions and factory contact/admin-only fields. |
| `/admin/evidence` | Admin, Super Admin | Evidence review and release controls. |
| `/admin/report-feedback` | Admin, Super Admin | Importer feedback inbox and admin responses. |
| `/admin/factories/*` | Admin, Super Admin | Private internal factory database. |
| `/admin/payments`, `/admin/refunds` | Admin, Super Admin | Manual payment/refund review. |
| `/admin/messages/*`, `/admin/notifications` | Admin, Super Admin | Operational communication/notification surfaces. |

## Project Manager Portal

| Route group | Allowed access | Notes |
|---|---|---|
| `/project-manager`, `/project-manager/dashboard` | Project Manager | Limited project-flow dashboard. No Admin/Super Admin privileges. |
| `/project-manager/projects`, `/project-manager/projects/[projectId]` | Project Manager | Safe project operational view, read-only report progress, lifecycle follow-up, internal notes, workflow markers, and Admin escalation only. No payment verification, FMS assignment, FMS submission approval, report release, refunds, or user management. |
| `/project-manager/notifications` | Project Manager | Own direct/role notifications and escalation/project-flow notices. |

## Super Admin Portal

| Route group | Allowed access | Notes |
|---|---|---|
| `/super-admin` | Super Admin | Highest-privilege dashboard. |
| `/super-admin/users` | Super Admin | User directory, account review, password reset, suspension, soft deletion. |
| `/super-admin/fms-applications` | Super Admin | Final approval/decline queue for FMS applications forwarded by Admin. May create secure invite-based FMS onboarding or mark manual setup needed. |
| `/super-admin/role-controls` | Super Admin | Dedicated role assignment, revocation, single-role conversion, primary-role repair, and FMS profile setup. |
| `/super-admin/notifications` | Super Admin | Security/user-management notifications. |

## Agent Portal

| Route group | Allowed access | Notes |
|---|---|---|
| `/agent` | Public/noindex entry | Agent public entry only. |
| `/agent/dashboard`, `/agent/leads/*`, `/agent/commissions`, `/agent/training` | Agent | Assigned leads and training only. Agents do not perform FMS sourcing work. |
| `/agent/notifications` | Agent | Own direct/role notifications for active agent accounts. |

## Billing, Refunds, Files, Documents, Notifications

| Route group | Allowed access | Notes |
|---|---|---|
| `/invoices`, `/invoices/[invoiceId]`, `/invoices/[invoiceId]/document` | Importer owner | Own invoices only. Admin equivalents live under `/admin`. |
| `/payments`, `/payments/manual`, `/payments/[paymentId]/document` | Importer owner | Own manual payment records only. Payment gateway not connected. Manual payment references remain Admin/Super Admin verified and do not grant Project Manager payment powers. |
| `/refunds`, `/refunds/request`, `/refunds/[refundId]/document` | Importer owner | Own refund records only. Admin equivalents live under `/admin`. |
| `/files/*` | No public page; server actions only | File access requires role checks and short-lived signed URLs. |
| `/documents/*` | No public document index | Document routes are explicit importer/admin routes only. |
| `/notifications/*` | Role scoped | Importer/FMS/admin/project-manager/super-admin/agent notifications are scoped by profile/role. Portal tray uses the same notification actions and role checks. |
| `/api/cron/project-lifecycle-alerts` | Internal cron only | Requires `Authorization: Bearer CRON_SECRET`. Runs stuck-project alert scan and returns counts only. No public project data is exposed. |
| `/api/cron/daily-operations-digest` | Internal cron only | Requires `Authorization: Bearer CRON_SECRET`. Sends internal Admin/Super Admin/Project Manager digest notifications/emails and returns counts only. No public/importer/FMS emails or private contact data are exposed. |
| `/api/*` | Internal/future | Disallowed in robots as a future private boundary unless a route is explicitly documented as public. |
