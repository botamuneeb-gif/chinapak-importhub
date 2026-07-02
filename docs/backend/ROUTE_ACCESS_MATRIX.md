# Route Access Matrix

This matrix documents the intended public/private boundary for ChinaPak ImportHub. Route guards and server actions remain the real access controls; sitemap and robots rules are SEO guidance only.

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
| `/fms` | Public | FMS public entry page only. |
| `/fms/opportunities/*` | Public | FMS recruitment SEO pages. |
| `/factories/export-to-pakistan`, `/factories/find-pakistani-buyers`, `/factories/partnership` | Public | Factory opportunity pages remain future/invitation-only; no public factory signup activation. |

## Authentication Entry

| Route group | Allowed access | Notes |
|---|---|---|
| `/login`, `/signup` | Public | Importer-first auth entry. Public signup creates importer role only. |
| `/auth/role-select`, `/auth/otp`, `/auth/invite`, `/auth/security` | Public or placeholder | Invite and OTP remain controlled/future flows. |
| `/admin/login` | Public login page | Access after login requires active `admin` or `super_admin`. |
| `/super-admin/login` | Public login page | Access after login requires active `super_admin`. |
| `/fms/login` | Public login page | Access after login requires active `fms` role and usable FMS profile. |
| `/agent/login` | Public login page | Access after login requires active `agent` role. |
| `/factory/login`, `/factory/signup` | Public placeholder, noindex | Future/invitation-only. Factory public signup is not active. |

## Importer Portal

| Route group | Allowed access | Notes |
|---|---|---|
| `/importer/dashboard` | Importer | Own project/report/payment summary only. |
| `/importer/start` | Importer | Protected Import Project wizard. Not included in sitemap and marked noindex. |
| `/importer/reports`, `/importer/reports/[projectId]` | Importer | Own released reports only. Raw FMS submissions and factory contacts hidden. |
| `/importer/reports/[projectId]/document` | Importer | Own released report document only; sanitized fields only. |
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
| `/admin/projects/*` | Admin, Super Admin | Project review, payment verification, assignment, report release, admin documents. |
| `/admin/leads` | Admin, Super Admin | Unpaid leads only; not assignable to FMS. |
| `/admin/fms` | Admin, Super Admin | FMS directory. Public users cannot create FMS roles. |
| `/admin/factory-submissions/*` | Admin, Super Admin | Raw FMS submissions and factory contact/admin-only fields. |
| `/admin/evidence` | Admin, Super Admin | Evidence review and release controls. |
| `/admin/report-feedback` | Admin, Super Admin | Importer feedback inbox and admin responses. |
| `/admin/factories/*` | Admin, Super Admin | Private internal factory database. |
| `/admin/payments`, `/admin/refunds` | Admin, Super Admin | Manual payment/refund review. |
| `/admin/messages/*`, `/admin/notifications` | Admin, Super Admin | Operational communication/notification surfaces. |

## Super Admin Portal

| Route group | Allowed access | Notes |
|---|---|---|
| `/super-admin` | Super Admin | Highest-privilege dashboard. |
| `/super-admin/users` | Super Admin | User management, role controls, password reset, suspension, soft deletion. |
| `/super-admin/notifications` | Super Admin | Security/user-management notifications. |

## Agent Portal

| Route group | Allowed access | Notes |
|---|---|---|
| `/agent` | Public/noindex entry | Agent public entry only. |
| `/agent/dashboard`, `/agent/leads/*`, `/agent/commissions`, `/agent/training` | Agent | Assigned leads and training only. Agents do not perform FMS sourcing work. |

## Billing, Refunds, Files, Documents, Notifications

| Route group | Allowed access | Notes |
|---|---|---|
| `/invoices`, `/invoices/[invoiceId]`, `/invoices/[invoiceId]/document` | Importer owner | Own invoices only. Admin equivalents live under `/admin`. |
| `/payments`, `/payments/manual`, `/payments/[paymentId]/document` | Importer owner | Own manual payment records only. Payment gateway not connected. |
| `/refunds`, `/refunds/request`, `/refunds/[refundId]/document` | Importer owner | Own refund records only. Admin equivalents live under `/admin`. |
| `/files/*` | No public page; server actions only | File access requires role checks and short-lived signed URLs. |
| `/documents/*` | No public document index | Document routes are explicit importer/admin routes only. |
| `/notifications/*` | Role scoped | Importer/FMS/admin/super-admin notifications are scoped by profile/role. |
| `/api/*` | Internal/future | No current API route directory; disallowed in robots as a future private boundary. |
