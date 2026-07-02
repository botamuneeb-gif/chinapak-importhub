# AGENTS.md

## Project Identity

- Brand name: ChinaPak ImportHub
- Domain: chinapakimporthub.com
- Main tagline: Direct China Factory Access for Pakistani Importers
- Urdu line: چین کی فیکٹری سے پاکستان کے کاروبار تک
- Core promise: Help Pakistani importers access suitable Chinese factories, review factory-side product evidence before shipment, reduce unnecessary middlemen, and import from China without traveling to China.

ChinaPak ImportHub should feel like a trustworthy trade platform for practical import decisions, not a flashy e-commerce site. Build for Pakistani shopkeepers and importers first: clear, mobile-first, Urdu-first, and easy to understand.

## Project Source Of Truth

- The primary business and product source of truth is `docs/MDOM.md`.
- Before implementing major features, read the relevant section of `docs/MDOM.md`.
- The PDF version at `docs/PRD-v0.1.pdf` is for human reading only.
- If `AGENTS.md` and `docs/MDOM.md` conflict, follow `AGENTS.md` and flag the conflict in the task summary.

## Business Model And Rules

- The platform connects Pakistani importers with suitable Chinese factories through Factory Match Specialists.
- FMS means Factory Match Specialist.
- Importers must never communicate directly with FMSs.
- All importer-FMS communication must be controlled by the platform/admin.
- Do not expose FMS contact details to importers.
- Do not expose importer contact details to FMSs.
- Do not build direct chat between importer and FMS.
- Everything revolves around an Import Project ID.
- The factory database starts internal and private.
- The factory portal exists in the architecture but must remain hidden until future activation.
- Payment is encouraged at project submission.
- If a user cannot pay, they may save the project as an unpaid lead.
- Full refund is allowed before FMS assignment.
- After FMS assignment, refund is admin-reviewed based on completed milestones.
- Admin may reassign an FMS before issuing a refund.
- Avoid hard-coding business rules that should later become configurable admin settings.

When implementing flows, make it obvious where behavior is placeholder-only. Avoid fake backend behavior that looks production-real unless it is clearly marked as a placeholder.

## User Roles

- Importer
- FMS
- Pakistani Local Agent
- Admin
- Super Admin
- Factory, hidden until future activation

Keep every route and component ready for future auth and role protection, even before Supabase auth is added.

## Language Strategy

- Importer experience: Urdu-first, optional English.
- FMS and factory experience: Chinese-first, optional English.
- Admin experience: English.
- Design all copy and content structures for future Urdu, English, and Simplified Chinese localization.
- Prefer structured content/config files where practical instead of scattering user-facing copy across components.
- Blog and audience content should be written for the target audience language and context, not mechanically translated.

## Technology Direction

- Use Next.js App Router.
- Use TypeScript.
- Use Tailwind CSS.
- Use clean, reusable components.
- Use Supabase/PostgreSQL later for database and auth.
- Use Cloudflare R2 or compatible object storage later for files.
- Keep deployment Vercel-compatible.
- Use semantic HTML, accessible labels, buttons, headings, and form controls.
- Keep components small, readable, and aligned with existing project patterns.

## Brand Design

Use the brand palette consistently:

- Primary: Deep Navy `#0B1F3A`
- Secondary: Emerald Green `#138A4A`
- Accent: Trade Gold `#C99A2E`
- Background: `#F7F9FC`
- Text: `#111827`
- Muted text: `#6B7280`
- Warning: `#F59E0B`
- Error: `#DC2626`

Design should communicate trust, trade reliability, admin oversight, and practical factory access. Prefer restrained layouts, clear hierarchy, and strong mobile usability over decorative effects.

## SEO And Positioning

Build content for three audiences:

- Pakistani importers
- Chinese FMS candidates
- Chinese factories

Avoid aggressive claims against Alibaba, Amazon, or marketplaces. Safer positioning: traditional marketplaces and middle channels may involve multiple layers between the buyer and the actual factory.

Emphasize ChinaPak ImportHub advantages:

- Factory-level visibility
- Fewer unnecessary middlemen
- Factory-side photos and videos
- Admin-reviewed factory options
- No China travel required

## Coding Rules

- Create only the files needed for the requested task.
- Do not scaffold the app unless explicitly asked.
- Do not make unrelated changes.
- Keep content in structured config files where practical.
- Add comments only where they clarify non-obvious business logic.
- Prefer clear data models and route boundaries that can later connect to Supabase.
- Never implement importer-to-FMS direct messaging.
- Never expose private contact details across role boundaries.
- Treat factory-facing features as future architecture unless explicitly asked to activate them.
- Keep placeholders visibly marked as placeholders.

## Verification

After each task:

- Run formatting, lint, and type checks when configured.
- Summarize changed files.
- Mention anything intentionally left as placeholder.
- Mention any checks that could not be run and why.
- Do not hide known gaps or unfinished behavior.
