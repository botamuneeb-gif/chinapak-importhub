# FMS China SEO Acquisition Foundation

## What Was Connected

The public FMS area now has a Chinese-first acquisition funnel for China-based Factory Match Specialist candidates.

Public routes added:

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

The `/fms` page is now the public acquisition hub. It remains separate from protected FMS portal routes such as `/fms/dashboard` and `/fms/assignments`.

## Chinese Keyword Map

The FMS pages use the following keyword themes naturally in Simplified Chinese copy:

- 工厂对接专员
- 中国采购代理兼职
- 外贸采购兼职
- 巴基斯坦买家对接
- 中国工厂报价收集
- 供应商资料收集兼职
- 工厂验厂协助
- 1688 采购协助
- 阿里巴巴供应商对接
- 中国供应链专员
- 跨境贸易助理
- 外贸自由职业

## Application Lead Behavior

`/fms/apply` is an application/interest form only.

It does not:

- create a Supabase auth user
- create an FMS profile
- assign the `fms` role
- approve a candidate
- enable public FMS signup

Submissions are saved in `unpaid_leads` with metadata:

- `source: public_fms_application`
- `intended_role: fms`
- `account_creation: not_created`
- `admin_review_required: true`

Admin can review these records in `/admin/leads`, where they are labeled as FMS applications.

Admin can pre-screen, request more information, decline at admin screening, or forward suitable applications to Super Admin. Normal Admin cannot final-approve FMS users.

When a candidate supplies an email address, the system records and attempts a confirmation email after successful `/fms/apply` submission. In disabled email mode, the application still saves and the public success message remains simple; technical delivery status is kept internal.

## Admin Review Behavior

FMS application leads remain admin-review records until Super Admin final review.

When Admin forwards a suitable application, Super Admin reviews it in:

- `/super-admin/fms-applications`

After Super Admin approval, the system attempts secure Supabase invite-based onboarding when an email is available and not already tied to a conflicting role. If invite setup is unavailable, the lead is marked approved pending manual account setup.

Final onboarding creates or repairs:

- `user_profiles`
- active `role_assignments` role `fms`
- active/approved `fms_profiles`

The application lead itself is never assignable to FMS work.

The workflow never creates a default weak password and never enables public FMS signup.

Super Admin final decisions also create candidate-facing decision emails when an email address is available:

- Approved applicants receive a professional approval email and are told to use the secure invite/password setup email. They are not told to publicly sign up.
- Declined applicants receive a polite decision email with the applicant-facing reason and reapply guidance.
- More-info applicants receive a request explaining what additional sourcing/factory information is needed.

Internal admin notes stay internal. Only the separate applicant-facing message is included in decline or more-info emails. If app email delivery is disabled, the workflow still saves and tells Super Admin to contact the candidate manually.

More-information emails use a secure existing-application update link instead of sending candidates back to `/fms/apply`. The link points to `/fms/application-update/[token]`, is noindex, is excluded from sitemap, and updates only the matching `unpaid_leads` record. The public `/fms/apply` page remains for new applications only.

Admin request-info and forward actions also use applicant-facing messages:

- Request Candidate Info requires a candidate message and sends/queues the more-info email.
- Forward to Super Admin notifies Super Admin internally and can send/queue a candidate final-review update.
- Super Admin decisions notify Admin internally after final action.

Approved applicants are not told to use public signup. The operational approval email explains that FMS access is secure invitation-only, tells the candidate to check the separate Supabase invite email, explains that `Accept Invitation` opens `/auth/invite` for password setup, and describes `/fms/login` only as the login route after activation.

The FMS login/invitation frontend now labels the invitation path as `Already have an invitation?` instead of `Need invitation help?`, matching the invite acceptance/account-setup flow.

## Sitemap And Robots Behavior

The public FMS acquisition routes are included in `publicSitemapRoutes`, so `/sitemap.xml` can expose them for indexing.

`robots.ts` continues to disallow protected FMS portal paths:

- `/fms/dashboard`
- `/fms/assignments`
- `/fms/messages`
- `/fms/notifications`
- `/fms/earnings`
- `/fms/academy`

Public FMS pages such as `/fms`, `/fms/apply`, city pages, category pages, and core acquisition pages remain indexable.

Candidate update links under `/fms/application-update/[token]` are not SEO landing pages. They are noindex and disallowed in robots because they are secure workflow links sent by email.

## Hidden Features Kept Disabled

The following remain disabled or admin-controlled:

- public FMS account signup
- automatic FMS approval
- direct importer-FMS messaging
- payment gateway
- factory contact release
- importer contact visibility to FMS
- public factory signup

## Future China Channels

Future off-site acquisition work can include:

- Baidu Webmaster setup
- WeChat Official Account articles
- Zhihu educational posts
- Xiaohongshu/RedNote posts
- Bilibili sourcing education videos
- Douyin short videos
- WeChat QR/contact routing after official account setup

## Manual QA Checklist

- `/fms` loads as a Chinese-first public FMS acquisition page.
- `/fms/apply` submits an admin-review lead only.
- More-info emails update the existing application through `/fms/application-update/[token]` and do not create duplicate FMS leads.
- No auth user, FMS role, or FMS profile is created from the public form.
- `/admin/leads` clearly labels public FMS applications.
- Public FMS SEO pages load without login.
- Protected FMS portal pages remain protected/noindex.
- Sitemap includes public FMS SEO pages.
- Robots does not expose protected routes.
- Public FMS signup remains disabled.
- No direct messaging or gateway payment is enabled.
