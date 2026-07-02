# Global Layout, Urdu Typography, And Translation Readiness

Status: presentation-layer fix only. No Supabase schema, migrations, auth guards, payment logic, FMS workflow, report workflow, file workflow, or refund business logic was changed.

## Layout Fixes

The portal shell now uses a stable desktop grid:

- Sidebar: fixed known width.
- Main content: `minmax(0, 1fr)` so it can use the remaining width.
- Main column: `min-w-0` and `overflow-x-hidden` to prevent page-level horizontal drift.

Admin shells no longer center operational content inside restrictive `max-w-*` wrappers. Admin pages use full remaining portal width and normal padding from the portal shell.

Wide admin tables use an internal scroll container:

- `overflow-x-auto`
- Explicit table minimum width
- No forced page-level overflow

This keeps `/admin/projects` aligned near the sidebar and makes right-side action buttons reachable by horizontal scrolling inside the table card when the viewport is narrow.

## Urdu Font Strategy

No proprietary UrduPoint or website-specific font files were copied or bundled.

The global Urdu stack is:

```css
"Noto Nastaliq Urdu", "Nafees Nastaleeq", "Jameel Noori Nastaleeq", "Alvi Nastaleeq", Arial, sans-serif
```

The project defines:

- `--font-urdu`
- `.font-urdu`
- `.urdu-text`
- `.rtl`
- `.ltr`
- `.mixed-language`

Urdu text receives:

- RTL direction
- Right text alignment
- Comfortable Nastaliq line height
- Normal letter spacing

IDs, project codes, invoice numbers, and brand constants should keep Latin-readable styling and may use `translate="no"` where appropriate.

## Language And Direction Strategy

The root document now defaults to:

- `lang="en"`
- `dir="ltr"`

This avoids forcing English/admin pages into RTL. Urdu-heavy importer/public sections explicitly set:

- `lang="ur"`
- `dir="rtl"`
- `.urdu-text`

Chinese support text uses `lang="zh-CN"` or `lang="zh"` where practical.

English admin/FMS/super-admin/agent operational pages remain English/LTR.

## Google / Browser Translation Readiness

The site does not use the deprecated Google Translate Website Translator widget.

Readiness improvements:

- Visible content remains real semantic HTML text.
- Root translation is not blocked globally.
- `translate="no"` is used only for protected constants such as the brand name, numeric step labels, and project/invoice/lead identifiers.
- Urdu, English, and Chinese sections declare language/direction so browser translation can detect them more reliably.
- Mojibake in the shared homepage, brand labels, auth pages, and importer start wizard was replaced with valid Unicode text.

Browser translation readiness is not the same as SEO-grade localization.

## SEO-Grade Localization Future Work

Full multilingual SEO should later add dedicated localized routes and metadata, for example:

- `/ur`
- `/en`
- `/zh`

Those routes should include `alternates.languages` / `hreflang`, localized metadata, and human-written audience-specific content. The current work keeps live browser translation usable without pretending the site has complete localized route architecture.

## Manual QA Pages

Recommended visual checks:

- `/`
- `/login`
- `/signup`
- `/importer/start`
- `/importer/dashboard`
- `/importer/reports`
- `/admin/projects`
- `/admin/payments`
- `/admin/refunds`
- `/admin/fms`
- `/admin/evidence`
- `/admin/factory-submissions`
- `/admin/report-feedback`
- `/fms/dashboard`
- `/fms/assignments`
- `/super-admin/users`

## Remaining Future Work

- Install or load `Noto Nastaliq Urdu` through `next/font/google` only if the deployment environment can reliably fetch Google Fonts during build.
- Add dedicated `/ur`, `/en`, and `/zh` localized public route trees.
- Continue copy QA on deeper portal pages as new workflows are polished.
- Add automated screenshot regression checks for portal table alignment.

