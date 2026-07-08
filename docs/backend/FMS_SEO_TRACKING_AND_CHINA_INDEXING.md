# FMS SEO Tracking And China Indexing

## Purpose

This pass improves the public China-side FMS acquisition program without changing the protected FMS portal, public signup boundary, or Super Admin approval workflow.

The goals are:

- measure which public FMS pages produce applications
- keep Chinese FMS metadata strong and page-specific
- prepare Baidu, Bing, and Google indexing
- help Admin understand applicant source context in `/admin/leads`

Public FMS signup remains disabled. `/fms/apply` still creates an admin-review `unpaid_leads` record only; it does not create an auth user, role assignment, or FMS profile.

## Attribution Fields

FMS application submissions store safe attribution fields in `unpaid_leads.metadata`.

Tracked fields:

- `landing_page`
- `referrer`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `source_page_slug`
- `fms_seo_page_type`
- `user_language`
- `submitted_from_url`
- `submitted_at`

The core FMS lead fields remain:

- `source = public_fms_application`
- `intended_role = fms`
- `lead_type = fms_application`
- `workflow_status`

The implementation uses URL parameters, `document.referrer`, and browser language only. It does not add tracking cookies, fingerprinting, private device collection, or external analytics dependencies.

## UTM Handling

Public FMS SEO CTAs link to `/fms/apply` with compact source parameters.

Examples:

- `/fms/apply?fms_seo_page_type=hub&source_page=/fms&utm_source=fms_seo&utm_medium=organic_page&utm_campaign=fms_hub_acquisition`
- `/fms/apply?fms_seo_page_type=city&source_page=/fms/china/guangzhou&utm_source=fms_seo&utm_medium=organic_page&utm_campaign=fms_china_acquisition`
- `/fms/apply?fms_seo_page_type=category&source_page=/fms/categories/electronics-sourcing&utm_source=fms_seo&utm_medium=organic_page&utm_campaign=fms_category_acquisition`

The client form sends these values as hidden `FormData` values at submit time. The server sanitizes and length-limits them before storing them in lead metadata.

## Admin Attribution Display

`/admin/leads` shows a compact attribution section for FMS application leads only.

Admin-visible fields include:

- Source
- Landing page
- Referrer
- Campaign
- UTM source, medium, and campaign
- FMS SEO page type
- Source page slug
- Submitted from URL
- Browser language
- Submitted timestamp

Attribution is admin-only. It is not shown to applicants, FMS users, importers, public pages, or protected FMS portal users.

## Chinese Metadata Audit

Public FMS routes now use Chinese-first metadata and `zh_CN` Open Graph locale where practical.

Audited routes:

- `/fms`
- `/fms/apply`
- `/fms/china-sourcing-jobs`
- `/fms/factory-match-specialist`
- `/fms/china-procurement-agent`
- `/fms/china/guangzhou`
- `/fms/china/shenzhen`
- `/fms/china/yiwu`
- `/fms/china/foshan`
- `/fms/china/ningbo`
- `/fms/china/shanghai`
- `/fms/china/qingdao`
- `/fms/china/xiamen`
- `/fms/categories/electronics-sourcing`
- `/fms/categories/textile-garment-sourcing`
- `/fms/categories/home-goods-sourcing`
- `/fms/categories/machinery-sourcing`
- `/fms/categories/beauty-packaging-sourcing`
- `/fms/categories/auto-parts-sourcing`
- `/fms/categories/toys-gifts-sourcing`

Chinese keywords are used naturally in page content and metadata, including:

- `工厂对接专员`
- `中国采购代理兼职`
- `外贸采购兼职`
- `巴基斯坦买家对接`
- `中国工厂报价收集`
- `供应商资料收集兼职`
- `工厂验厂协助`
- `1688 采购协助`
- `阿里巴巴供应商对接`
- `中国供应链专员`
- `跨境贸易助理`
- `外贸自由职业`

FMS pages must not claim guaranteed income, guaranteed employment, automatic approval, or public account creation.

## Structured Data

The FMS hub and SEO pages render safe structured data:

- `Organization`
- `FAQPage`
- `JobPosting` on the FMS hub and core FMS opportunity pages only

The JobPosting data is intentionally conservative:

- work type is contractor/sourcing support
- location is China or remote within China
- application URL is `/fms/apply`
- manual review and invitation-only onboarding are stated
- no guaranteed salary is included
- no public signup is promised

If public compensation rules are later approved, salary fields can be added after legal/business review.

## Sitemap And Robots

Public FMS pages are included in `/sitemap.xml`.

Indexable public FMS pages:

- `/fms`
- `/fms/apply`
- `/fms/china-sourcing-jobs`
- `/fms/factory-match-specialist`
- `/fms/china-procurement-agent`
- `/fms/china/*`
- `/fms/categories/*`

Private or tokenized FMS routes are excluded from the sitemap and disallowed in `robots.txt`:

- `/fms/dashboard`
- `/fms/assignments`
- `/fms/notifications`
- `/fms/academy`
- `/fms/application-update`

Other protected portals remain disallowed, including:

- `/admin`
- `/super-admin`
- `/project-manager`
- `/importer`
- `/agent`
- `/payments`
- `/invoices`
- `/refunds`
- `/documents`
- `/files`
- `/api/`

Robots rules are SEO guidance only. Route guards and server actions remain the real access control.

## Webmaster Verification

Optional webmaster verification placeholders are available through environment variables:

- `BAIDU_SITE_VERIFICATION`
- `BING_SITE_VERIFICATION`
- `GOOGLE_SITE_VERIFICATION`

The app renders verification metadata only when a real value is configured. It does not render fake Baidu, Bing, or Google verification IDs.

## Baidu Checklist

1. Create or log in to Baidu Search Resource Platform.
2. Add `chinapakimporthub.com`.
3. Verify ownership using DNS or a real Baidu meta verification value.
4. Add `BAIDU_SITE_VERIFICATION` in Vercel only if using meta verification.
5. Submit `https://chinapakimporthub.com/sitemap.xml`.
6. Submit important FMS URLs manually if Baidu offers manual URL submission.
7. Monitor indexing, crawl errors, blocked URLs, and duplicate metadata.

## Bing Checklist

1. Create or log in to Bing Webmaster Tools.
2. Add `chinapakimporthub.com`.
3. Verify ownership using DNS or a real Bing meta verification value.
4. Add `BING_SITE_VERIFICATION` in Vercel only if using meta verification.
5. Submit `https://chinapakimporthub.com/sitemap.xml`.
6. Inspect representative FMS URLs and request indexing.
7. Monitor crawl errors and sitemap processing.

## Google Checklist

1. Create or log in to Google Search Console.
2. Add the domain property for `chinapakimporthub.com`.
3. Prefer DNS verification; use `GOOGLE_SITE_VERIFICATION` only if meta verification is chosen.
4. Submit `https://chinapakimporthub.com/sitemap.xml`.
5. Inspect `/fms`, `/fms/apply`, and several city/category pages.
6. Confirm protected portal routes are not indexed.

## WeChat Sharing Notes

FMS acquisition pages include mobile-friendly CTAs and copy-link behavior for WeChat sharing.

No fake WeChat QR code is shown. If an official WeChat ID or QR code is configured later, it should be added through a verified config field and reviewed before publication.

## QA Checklist

- Open `/fms` and confirm Chinese-first title/content.
- Open several `/fms/china/*` and `/fms/categories/*` pages.
- Confirm FMS SEO CTAs link to `/fms/apply` with source tracking parameters.
- Submit `/fms/apply` and confirm `unpaid_leads.metadata` stores attribution fields.
- Open `/admin/leads` and confirm FMS application attribution appears only to Admin/Super Admin.
- Confirm no duplicate FMS lead is created by tracking changes.
- Confirm `/fms/application-update/[token]` is excluded from sitemap and disallowed by robots.
- Confirm public FMS SEO pages are included in sitemap.
- Confirm protected portals are not included in sitemap.
- Confirm no fake webmaster verification IDs render when env vars are empty.
- Confirm public FMS signup remains disabled.
