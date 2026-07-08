# Webmaster Verification And Sitemap Submission

## Current Implementation

ChinaPak ImportHub renders webmaster verification meta tags from server-side environment variables in the global app metadata.

Supported variables:

- `GOOGLE_SITE_VERIFICATION`
- `BING_SITE_VERIFICATION`
- `BAIDU_SITE_VERIFICATION`

The app also accepts the older `NEXT_PUBLIC_*` verification variable names as a fallback, but production should use the server-side names above.

No verification tag renders when the configured value is blank, a placeholder, or a full HTML tag. Only the content value should be stored in Vercel.

Rendered tags:

```html
<meta name="google-site-verification" content="..." />
<meta name="msvalidate.01" content="..." />
<meta name="baidu-site-verification" content="..." />
```

Do not commit real verification IDs into the repo. They are not API secrets, but keeping them in Vercel env makes production ownership changes cleaner.

## Google Search Console

1. Add property as URL prefix:
   `https://chinapakimporthub.com/`
2. Choose HTML tag verification.
3. Copy only the `content` value from the meta tag.
4. Add it in Vercel env:
   `GOOGLE_SITE_VERIFICATION`
5. Redeploy production.
6. View page source and confirm `google-site-verification` exists.
7. Click Verify in Google Search Console.
8. Submit sitemap:
   `https://chinapakimporthub.com/sitemap.xml`

## Bing Webmaster Tools

Option A:

- Import the site from Google Search Console after Google is verified.

Option B:

1. Add site:
   `https://chinapakimporthub.com`
2. Choose HTML meta tag verification.
3. Copy only the `content` value from `msvalidate.01`.
4. Add it in Vercel env:
   `BING_SITE_VERIFICATION`
5. Redeploy production.
6. Confirm `msvalidate.01` appears in page source.
7. Click Verify.
8. Submit sitemap:
   `https://chinapakimporthub.com/sitemap.xml`

## Baidu Search Resource Platform

1. Add site:
   `https://chinapakimporthub.com`
2. Choose HTML/meta tag verification.
3. Copy only the `content` value.
4. Add it in Vercel env:
   `BAIDU_SITE_VERIFICATION`
5. Redeploy production.
6. Confirm `baidu-site-verification` appears in page source.
7. Click Verify in Baidu.
8. Submit sitemap:
   `https://chinapakimporthub.com/sitemap.xml`
9. Manually submit priority FMS URLs if Baidu provides manual URL submission.

Priority FMS URLs:

- `https://chinapakimporthub.com/fms`
- `https://chinapakimporthub.com/fms/apply`
- `https://chinapakimporthub.com/fms/china-sourcing-jobs`
- `https://chinapakimporthub.com/fms/factory-match-specialist`
- `https://chinapakimporthub.com/fms/china-procurement-agent`
- `https://chinapakimporthub.com/fms/china/guangzhou`
- `https://chinapakimporthub.com/fms/china/shenzhen`
- `https://chinapakimporthub.com/fms/china/yiwu`
- `https://chinapakimporthub.com/fms/categories/electronics-sourcing`
- `https://chinapakimporthub.com/fms/categories/textile-garment-sourcing`

## Vercel Env Commands

Use either the dashboard:

`Vercel Dashboard -> Project -> Settings -> Environment Variables`

Or the CLI:

```bash
vercel env add GOOGLE_SITE_VERIFICATION production
vercel env add BING_SITE_VERIFICATION production
vercel env add BAIDU_SITE_VERIFICATION production
vercel --prod
```

After each value is added or changed, redeploy production before clicking Verify in the webmaster tool.

## Sitemap And Robots

Production sitemap:

- `https://chinapakimporthub.com/sitemap.xml`

Production robots:

- `https://chinapakimporthub.com/robots.txt`

`robots.txt` should include:

- `Sitemap: https://chinapakimporthub.com/sitemap.xml`

Public FMS SEO pages should remain indexable and present in the sitemap:

- `/fms`
- `/fms/apply`
- `/fms/china-sourcing-jobs`
- `/fms/factory-match-specialist`
- `/fms/china-procurement-agent`
- `/fms/china/*`
- `/fms/categories/*`

Protected/private routes must remain excluded from the sitemap and blocked/noindex/private by route guards and robots guidance:

- `/admin`
- `/super-admin`
- `/project-manager`
- `/importer`
- `/fms/dashboard`
- `/fms/assignments`
- `/fms/notifications`
- `/fms/application-update`
- tokenized/private routes

Robots is not security. Protected route guards and server-side authorization remain the real access controls.

## Local Verification Checklist

- Build with no verification env values and confirm no verification tags render.
- Build with one real local test value at a time and confirm only that tag renders.
- Confirm no duplicate `google-site-verification`, `msvalidate.01`, or `baidu-site-verification` tags render.
- Confirm `/sitemap.xml` builds.
- Confirm `/robots.txt` builds and points to the configured production sitemap URL.
- Confirm public FMS SEO pages remain in the sitemap.
- Confirm protected routes remain out of the sitemap.
- Confirm public FMS signup remains disabled.
