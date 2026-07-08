# Phase 13: Public Website SEO + Conversion Polish

## What Was Added

Phase 13 improves the public website layer without changing backend workflows, database schema, auth guards, payment logic, FMS assignment, reports, files, refunds, or notifications.

The public site now has a shared SEO content configuration and reusable page renderer for one-segment public landing pages:

- `/how-it-works`
- `/about`
- `/faq`
- `/trust-safety`
- `/refund-policy`
- `/privacy-policy`
- `/terms`
- `/import-from-china-to-pakistan`
- `/find-chinese-factories`
- `/china-factory-verification-pakistan`
- `/avoid-middlemen-china-imports`
- `/pakistan-import-business-guide`
- `/how-to-import-from-china-to-pakistan`
- `/china-factory-sourcing-pakistan`
- `/find-factory-in-china-from-pakistan`
- `/verify-chinese-supplier-before-payment`
- `/china-product-sourcing-for-pakistani-shopkeepers`
- `/china-import-help-for-small-business`
- `/import-products-from-china-without-travel`
- `/china-factory-agent-for-pakistan`
- `/china-sourcing-service-pakistan`

The FMS acquisition SEO layer now adds Chinese-first public pages for China-based Factory Match Specialist candidates:

- `/fms`
- `/fms/apply`
- `/fms/china-sourcing-jobs`
- `/fms/factory-match-specialist`
- `/fms/china-procurement-agent`
- `/fms/china/*`
- `/fms/categories/*`

`/fms/apply` creates an admin-review lead only. It does not create an FMS auth account, role assignment, or FMS profile.

The FMS acquisition SEO layer also records safe attribution for FMS applications. CTAs from `/fms`, city pages, category pages, and core FMS SEO pages append compact source/UTM parameters into `/fms/apply`; the application action stores sanitized attribution in `unpaid_leads.metadata` for Admin review.

The homepage was expanded with conversion-focused sections:

- Trust gates and platform rules
- How the Import Project workflow works
- Why importers may avoid China travel for early sourcing
- Why factory-level access matters
- Who the service is for
- What importers get
- What ChinaPak ImportHub does not promise
- Packages preview
- FAQ and final CTA

## SEO Strategy

Public pages use unique titles, descriptions, H1s, semantic headings, and internal links to:

- `/importer/start`
- `/packages`
- `/trust-safety`
- `/contact`
- related importer learning pages

The copy avoids aggressive claims against marketplaces. The safe positioning is:

- Marketplaces and middle channels may involve multiple layers.
- ChinaPak ImportHub focuses on Import Project tracking, FMS research, admin-reviewed factory options, and importer-safe factory-side evidence.

Chinese-first FMS pages use Chinese metadata, `zh_CN` Open Graph locale, FMS keyword coverage, and safe Organization/WebPage/FAQ structured data. JobPosting structured data is intentionally not used while FMS remains invite-only, project-based sourcing support without publicly fixed compensation or a real application deadline.

## Public And Private Route Boundary

The sitemap includes only public website, SEO, learning, FMS opportunity, and future factory partnership pages.

Public FMS acquisition pages are included in the sitemap. Secure FMS update links such as `/fms/application-update/[token]` and protected FMS portal pages are excluded.

The robots configuration disallows private or transactional portal routes such as:

- `/admin/`
- `/super-admin/`
- `/agent/dashboard`
- `/importer/dashboard`
- `/importer/reports`
- `/fms/dashboard`
- `/fms/assignments`
- `/fms/application-update`
- `/project-manager`
- `/invoices`
- `/payments`
- `/refunds`
- `/documents`
- `/files`
- `/api/`

Protected route guards remain the source of access control. `robots.txt` is only SEO guidance and must not be treated as security.

## Urdu And Bilingual Strategy

Public pages remain English-readable for SEO while using Urdu support blocks for Pakistani importer trust and local comprehension. Urdu text uses:

- `lang="ur"`
- `dir="rtl"`
- `.urdu-text`
- The existing Nastaliq-style font stack

Full SEO-grade multilingual indexing still requires dedicated localized routes later, for example `/ur`, `/en`, and `/zh`.

## Structured Data

The site includes JSON-LD for:

- `Organization`
- `WebSite`
- `Service`
- `FAQPage` where FAQ content is rendered

FMS acquisition pages include Organization, WebPage, and FAQPage data. JobPosting JSON-LD should only be reconsidered later if a page represents a real job posting with approved compensation, a true deadline, and business-approved role terms.

Optional Baidu, Bing, and Google webmaster verification meta tags are controlled by env vars and render only when real verification values are configured.

No fake reviews, ratings, partner logos, or office addresses were added.

## Remaining Future Work

- Dedicated localized URL structure for Urdu, English, and Simplified Chinese.
- Production-reviewed legal terms and privacy policy.
- Real contact/support routing.
- Public document verification portal if needed.
- Optional Open Graph image design and social previews.
- Search functionality only if a real search route is built later.
