# Master Digital Operations Manual (MDOM)

**Project:** Pakistan-China Import Platform  
**Document Version:** 0.1  
**Document Date:** June 29, 2026  
**Prepared For:** Founder / Product Owner  
**Primary Build Method:** Codex-assisted development  
**Primary Technical Stack:** Next.js + Supabase/PostgreSQL + Cloudflare R2 + Vercel  

---

## Document Status

This is the first structured digital-book edition of the platform blueprint. It captures the business model, locked decisions, workflows, user roles, pricing model, compensation model, platform architecture, and operating principles finalized so far.

This document is intended to become the source of truth for development, operations, training, onboarding, future audits, and expansion.

---

## Table of Contents

1. Executive Summary
2. Locked Decision Register
3. Business Model
4. Target Users and Market Positioning
5. Language and Localization Strategy
6. User Roles and Portals
7. Authentication and Account Access
8. Import Project System
9. Payment, Unpaid Leads, and Refunds
10. Platform-Controlled Communication
11. Integrated Messaging System
12. Factory Database
13. Factory Match Specialist Operations
14. Pakistani Agent System
15. Admin and Super Admin Operations
16. Email and Document Engine
17. Pricing, Unit Economics, and FMS Compensation
18. SEO Strategy
19. Technical Architecture
20. Data Storage, Security, and Privacy
21. Roadmap and Future Expansion
22. Appendix A - Core Workflow Maps
23. Appendix B - Initial Data Model
24. Appendix C - Open Decisions

---

# 1. Executive Summary

The Pakistan-China Import Platform is designed to help Pakistani shopkeepers, wholesalers, retailers, online sellers, small businesses, and first-time importers connect with relevant Chinese factories without needing to travel to China or rely on large local middlemen.

The platform will sell a service, not goods. The core service is factory matching through Chinese-based Factory Match Specialists (FMSs). Importers create an Import Project, provide product requirements, choose a package, and either complete payment or save the project as an unpaid lead. Admins review the project, assign an FMS, manage all communication, review submitted factory information, and deliver approved factory options to the importer.

The platform is designed around one major trust promise: Pakistani importers can verify the business locally before ordering, while the sourcing work is performed in China through vetted FMSs. The long-term business asset is the growing internal factory database created from every project.

The platform should not be built as a basic website. It must be built as a modular operating system with multiple portals sharing one backend: public website, importer portal, FMS portal, agent portal, admin portal, super admin portal, hidden factory portal, and future mobile messaging app.

---

# 2. Locked Decision Register

| ID | Decision | Status |
|---|---|---|
| BP-001 | Platform helps Pakistani local importers source directly from Chinese factories. | Locked |
| BP-002 | Users create Import Projects, not simple orders. | Locked |
| BP-003 | Chinese sourcing workers are called Factory Match Specialists (FMSs). | Locked |
| BP-004 | FMSs never communicate directly with importers. | Locked |
| BP-005 | Admins control and approve all importer-facing communication. | Locked |
| BP-006 | Importers can verify the Pakistani business physically before placing orders. | Locked |
| BP-007 | Pakistani local agents will market and assist shopkeepers/importers. | Locked |
| BP-008 | Factory signup page remains hidden initially but backend support is built from day one. | Locked |
| BP-009 | Factory database is private at launch and becomes a long-term sourcing intelligence asset. | Locked |
| BP-010 | Importer interface is Urdu-first; FMS/factory interface is Chinese-first; English remains optional. | Locked |
| BP-011 | Payment is expected at project submission. | Locked |
| BP-012 | If user cannot pay, the project can be saved as an unpaid lead. | Locked |
| BP-013 | Full refund before FMS assignment. | Locked |
| BP-014 | After FMS assignment, refund is admin-reviewed and milestone-based. | Locked |
| BP-015 | FMS reassignment may be offered before refund. | Locked |
| BP-016 | Internal messaging system is part of the website from day one. | Locked |
| BP-017 | Future dedicated messaging app will use the same backend/project flow. | Locked |
| BP-018 | Blog content is written in each audience's respective language. | Locked |
| BP-019 | Email/document system uses one premium brand identity and document engine. | Locked |
| BP-020 | Recommended stack: Next.js, Supabase/PostgreSQL, Cloudflare R2, Vercel. | Locked |
| BP-021 | Pricing Version 1: PKR 18,000 / 35,000 / 75,000. | Locked |
| BP-022 | FMS pay Version 1: Bronze/Silver/Gold payout tiers. | Locked |
| BP-023 | FMS Academy and certification are required before paid work. | Locked |

---

# 3. Business Model

## 3.1 Core Offer

The platform sells factory discovery, factory matching, factory comparison, and sourcing support. It does not initially sell products, carry inventory, or guarantee final trade performance between importer and factory unless a future package explicitly includes deeper trade management.

## 3.2 Customer Promise

The platform helps Pakistani importers avoid the main barrier to China imports: lack of reliable factory contacts. It makes sourcing accessible to smaller importers who cannot spend around PKR 1 million traveling to China or hiring expensive end-to-end sourcing firms.

## 3.3 Revenue Streams

Initial revenue sources:

- Paid factory discovery packages.
- Paid factory match packages.
- Paid import partner packages.
- Add-on services such as supplier background checks, video factory tour coordination, price negotiation, sample coordination, and shipping coordination support.
- Future membership for repeat importers.

Future revenue sources:

- Factory profile claiming.
- Featured factories.
- Premium factory access.
- Data insights.
- FMS academy/certification services.
- Mobile app subscriptions.

## 3.4 Competitive Advantage

The moat is not only the website. It is the combination of:

- Local Pakistani trust and verification.
- Chinese FMS network.
- Admin-controlled communication.
- Internal factory database.
- Project history.
- Quality scoring.
- Messaging records.
- AI-assisted translation and matching.

---

# 4. Target Users and Market Positioning

## 4.1 Primary Importer Segment

The initial target is Pakistani small and medium importers with estimated import budgets from PKR 100,000 to PKR 1,000,000. This includes shopkeepers, wholesalers, retailers, Daraz sellers, online sellers, small manufacturers, and first-time importers.

## 4.2 Positioning Statement

"A Pakistan-based platform that helps local businesses find and connect with suitable Chinese factories without traveling to China."

## 4.3 Key Pain Points

- No trusted Chinese factory contacts.
- Fear of scams.
- Language barriers.
- Difficulty understanding MOQ and pricing.
- Inability to travel to China.
- Dependency on big local importers and middlemen.
- Lack of confidence in online supplier directories.

## 4.4 Trust Strategy

Trust is built by emphasizing physical verification in Pakistan, local representatives, agent verification, transparent project tracking, refund protection, and professional documentation.

---

# 5. Language and Localization Strategy

## 5.1 Importer Experience

Importer screens should be Urdu-first, mobile-first, icon-heavy, and simple. English should be optional. Pakistani shopkeepers should not feel they are using a complicated software platform.

## 5.2 FMS Experience

FMS screens should be Chinese-first, with English optional. FMSs should see structured project details, not importer contact information.

## 5.3 Admin Experience

Admin and super admin portals should use English as the primary operating language.

## 5.4 Blog Localization

Blog pages should be written in the respective audience language, not merely translated. Importer SEO content should be in Urdu/English. FMS and factory SEO content should be in Simplified Chinese and optionally English.

## 5.5 AI Translation Layer

The platform should support Urdu-English-Chinese translation across project descriptions, messages, admin notes, FMS reports, factory summaries, and customer updates.

---

# 6. User Roles and Portals

## 6.1 Role List

- Importer
- FMS
- Pakistani Agent
- Admin
- Super Admin
- Factory (hidden/future)

## 6.2 Portal Structure

| Portal | Visibility | Main Users |
|---|---|---|
| Public Website | Public | Visitors, importers, FMS candidates, factories |
| Importer Portal | Public login | Importers |
| FMS Portal | Invitation/approved access | Factory Match Specialists |
| Agent Portal | Approved access | Pakistani representatives |
| Admin Portal | Private/internal | Operations team |
| Super Admin Portal | Private/internal | Founders/system owners |
| Factory Portal | Hidden initially | Factories in future phase |

## 6.3 Permission Principle

No role may access data belonging to another role merely by changing a URL. Permissions must be enforced at backend/API/database level.

---

# 7. Authentication and Account Access

## 7.1 Importer Authentication

Importer signup/login should use phone OTP as the primary method. WhatsApp login/OTP support is preferred. Email/password can exist as a fallback but should not be the main flow.

## 7.2 FMS Authentication

FMS accounts should be approval-based or invitation-based. Public FMS pages may collect applications, but only approved candidates receive dashboard access.

## 7.3 Admin Authentication

Admin and super admin logins should use a private internal URL, strong passwords, and preferably two-factor authentication.

## 7.4 Factory Authentication

Factory signup/login exists in backend architecture from day one but remains hidden until factory onboarding is activated.

---

# 8. Import Project System

## 8.1 Project-Centric Design

Everything revolves around one Import Project ID. The project contains product details, importer profile, package, payment status, assigned FMS, messages, files, factory options, admin notes, refund records, documents, and final outcome.

## 8.2 Project Creation Inputs

Importer can start a project by:

- Uploading a photo.
- Taking a photo.
- Recording a voice note.
- Typing product name/description.
- Pasting an Alibaba/1688/other product link.

## 8.3 Project Intake Flow

1. Importer identifies product.
2. System collects budget, quantity, category, timeline, and experience level.
3. Importer chooses package.
4. Importer sees project summary.
5. Importer pays or saves project for assistance.
6. Admin reviews project.

## 8.4 Project Statuses

- Draft
- Awaiting Payment
- Payment Received
- Admin Review
- Needs Importer Clarification
- Ready for FMS Assignment
- FMS Assigned
- FMS Working
- Factory Options Submitted
- Admin Quality Review
- Results Released to Importer
- Importer Feedback Requested
- Completed
- Cancelled
- Refunded
- Partially Refunded
- Disputed

---

# 9. Payment, Unpaid Leads, and Refunds

## 9.1 Payment at Submission

Payment should be completed at project submission to begin work. Paid projects enter admin review.

## 9.2 Unpaid Lead Flow

If the user cannot complete payment, they may save the project as an unpaid lead. Work does not begin and no FMS is assigned. Admins or Pakistani agents can follow up to help the customer complete payment.

## 9.3 Payment Problem Reasons

The system should ask why payment was not completed:

- Need more information.
- Do not trust online payments.
- Payment failed.
- Need to arrange funds.
- Want someone to call.
- Other.

## 9.4 Refund Rules

Before FMS assignment: importer can cancel and receive full refund.

After FMS assignment: admin reviews completed milestones and may issue full refund, partial refund, or offer FMS reassignment.

If the promised service is not delivered within the package timeframe, the refund policy should allow full refund, subject to terms and documented exceptions.

---

# 10. Platform-Controlled Communication

## 10.1 Core Rule

The platform is the only communication bridge between importer and FMS. Importers never receive FMS contact details. FMSs never receive importer contact details.

## 10.2 Restricted Information

Importer does not see FMS phone, email, WeChat, WhatsApp, or personal details. FMS does not see importer phone, WhatsApp, email, or direct personal contact data.

## 10.3 Admin Role

Admins review, forward, rewrite, translate, approve, hide, or release messages and files as needed.

## 10.4 Factory Contact Release

Factory contact information is released only if the purchased package and workflow permit it, and only after admin approval.

---

# 11. Integrated Messaging System

## 11.1 Messaging as Core Infrastructure

The website must include its own internal messaging system from day one. This messaging system later becomes the foundation for a dedicated mobile messaging app.

## 11.2 Message Types

- Importer message to platform.
- Admin message to importer.
- Admin message to FMS.
- FMS message/report to admin.
- System status update.
- Payment reminder.
- Refund/dispute communication.
- Future factory communication.

## 11.3 Features

- Project-based threads.
- File uploads.
- Images/videos/voice notes.
- Auto-translation.
- Read receipts.
- Contact-information detection.
- Admin approval queue.
- Audit trail.
- Internal notes.

---

# 12. Factory Database

## 12.1 Purpose

The factory database is the long-term intelligence asset of the company. Every FMS submission and every completed project should improve it.

## 12.2 Initial Visibility

At launch, factory data is internal only. Importers see controlled/approved factory information based on package and workflow. Public factory signup is hidden.

## 12.3 Factory Record Fields

- Factory name.
- Chinese business name.
- Category.
- City/province.
- Contact person.
- WeChat/phone/email.
- Website/Alibaba/1688 link.
- Main products.
- MOQ.
- Price range.
- Production capacity.
- Certifications.
- Photos/videos.
- Submitted by FMS.
- Verification status.
- Last verified date.
- Trust score.
- Admin notes.
- Risk/blacklist flag.

## 12.4 Factory Statuses

- Draft
- Submitted by FMS
- Admin verified
- Active in database
- Invited to claim profile
- Claimed by factory
- Suspended
- Blacklisted

---

# 13. Factory Match Specialist Operations

## 13.1 FMS Definition

Factory Match Specialists are Chinese-based sourcing specialists who research factories, collect factory data, submit comparisons, and support assigned import projects through the platform.

## 13.2 No Direct Importer Contact

FMSs never receive importer contact details and never communicate with importers directly.

## 13.3 FMS Tiers

Bronze FMS: new or entry-level specialists for simple projects.

Silver FMS: experienced specialists for medium-complexity projects.

Gold FMS: senior specialists for complex or high-value projects.

## 13.4 Locked FMS Compensation Version 1

| Tier | Suggested Payout | Approx. CNY Equivalent | Use Case |
|---|---:|---:|---|
| Bronze | PKR 5,000-7,000 | ¥120-170 | Starter/simple projects |
| Silver | PKR 9,000-12,000 | ¥220-290 | Business/medium projects |
| Gold | PKR 15,000-25,000 | ¥370-610 | Import Partner/complex projects |

## 13.5 FMS Academy

Before paid assignments, each FMS should complete platform onboarding and certification covering workflow, confidentiality, anti-bypass rules, factory verification, reporting quality, and evidence standards.

---

# 14. Pakistani Agent System

## 14.1 Purpose

Pakistani agents build local trust, educate shopkeepers, assist with onboarding, verify the business physically, and help unpaid leads complete payment.

## 14.2 Agent Verification

The platform should include an agent verification page where users can enter an agent code and see active/inactive status, name, city/market, and approved contact details.

## 14.3 Agent Activities

- Market visits.
- Product request assistance.
- Payment assistance.
- Trust-building conversations.
- Lead generation.
- Follow-up on unpaid projects.

## 14.4 Agent Commission

Version 1 recommendation: use package-based commission with configurable values in admin settings. Initial examples: Starter PKR 1,000, Business PKR 2,000, Import Partner PKR 3,000 or percentage-based commission when approved.

---

# 15. Admin and Super Admin Operations

## 15.1 Admin Dashboard Modules

- Dashboard overview.
- Import Projects.
- Importer management.
- FMS management.
- Factory database.
- Assignments.
- Payments.
- Customer support.
- Agents.
- Reports.
- Platform settings.
- Audit center.

## 15.2 Admin Responsibilities

Admins review new projects, request clarification, assign FMSs, approve factory data, manage messages, handle refunds, release final results, and close projects.

## 15.3 Super Admin Responsibilities

Super Admins manage permissions, pricing, packages, payment gateways, users, platform settings, AI rules, security, and audit logs.

---

# 16. Email and Document Engine

## 16.1 Brand Identity

Emails, invoices, receipts, PDFs, reports, and official notices should use one premium identity:

- Deep navy blue.
- White background.
- Gold accent.
- Green for paid/success.
- Orange for pending/warning.
- Red for refund/error.
- Clean typography such as Inter, Roboto, or Noto Sans.

## 16.2 Email Types

Transactional, operational, marketing, recruitment, and security emails.

## 16.3 Role-Based Sending Addresses

Recommended addresses include support@, projects@, payments@, refunds@, fms@, factories@, careers@, agents@, security@, and no-reply@.

## 16.4 Invoice Format

Invoices should look like formal business/bank documents, not marketing flyers. They must include invoice number, date, project ID, company details, customer details, service package, amount, taxes/discounts if any, payment method, transaction ID, status, QR verification, and support/legal footer.

## 16.5 Document Engine

The platform should not create separate disconnected templates. It should use a reusable document engine that assembles documents from shared components: header, summary box, line items, CTA, footer, verification QR, version number, and signature area.

---

# 17. Pricing, Unit Economics, and FMS Compensation

## 17.1 Locked Package Pricing Version 1

| Package | Price | Best For | Factory Options | Delivery Target |
|---|---:|---|---:|---|
| Factory Discovery | PKR 18,000 | First-time/small importers | 3 | 5-7 business days |
| Factory Match Plus | PKR 35,000 | Established shopkeepers | 5 | 7-10 business days |
| Import Partner | PKR 75,000 | Serious importers | 8-10 | 10-15 business days |

## 17.2 Add-ons Version 1

- Extra factory options: PKR 5,000.
- Supplier background check: PKR 12,000.
- Video factory tour coordination: PKR 20,000-35,000.
- Sample coordination: PKR 15,000.
- Price negotiation support: PKR 20,000.
- Shipping coordination support: PKR 15,000.
- Urgent processing: +40%.

## 17.3 Profit Principle

Do not pay FMSs based purely on customer price. Pay based on difficulty, milestone completion, quality, and tier. Package pricing can later be changed without rewriting all FMS contracts.

---

# 18. SEO Strategy

## 18.1 Three SEO Ecosystems

The platform should build separate SEO ecosystems for Pakistani importers, Chinese FMS recruitment, and Chinese factories.

## 18.2 Importer SEO

Urdu and English content should target searches around importing from China, finding Chinese factories, avoiding scams, MOQ, sourcing from China, and China-to-Pakistan import education.

## 18.3 FMS SEO

Chinese content should target career and opportunity searches around working with international buyers, sourcing consultant work, foreign buyer sourcing, export assistance, and flexible sourcing jobs.

## 18.4 Factory SEO

Chinese content should target factories that want Pakistani buyers, export opportunities, verified buyer leads, and international wholesale growth.

---

# 19. Technical Architecture

## 19.1 Recommended Stack

- Next.js for frontend, portals, API routes, dashboards, SEO, and app structure.
- Supabase/PostgreSQL for database, auth, realtime, and admin-friendly backend services.
- Cloudflare R2 for file/media storage.
- Vercel for deployment.
- Resend initially for email; Amazon SES later if scale requires.

## 19.2 Architecture Principle

Use one backend with multiple portals. Do not build separate disconnected applications for each role.

## 19.3 Configurable Rules

Packages, prices, timeframes, refund rules, FMS payouts, agent commissions, factory visibility, roles, permissions, and languages should be configurable from admin settings wherever possible.

---

# 20. Data Storage, Security, and Privacy

## 20.1 Storage Layers

Structured data belongs in PostgreSQL. Files and videos belong in object storage. Sensitive contact/company data should be encrypted and access-controlled.

## 20.2 File Storage

Images, videos, quotations, certificates, PDFs, voice notes, and factory evidence should be stored in Cloudflare R2 or equivalent object storage. The database stores metadata, not the large file itself.

## 20.3 Access Control

Importer sees only approved project information. FMS sees only assigned work data. Admin sees operational data. Super Admin sees everything. Factory access is limited to its own profile and approved requests when activated.

## 20.4 Audit Logs

Every important event should be logged: login, view, download, edit, message approval, file release, refund decision, FMS assignment, factory status change, price change, package change, and permission change.

---

# 21. Roadmap and Future Expansion

## 21.1 Phase 1

Importer signup, project creation, payment/unpaid lead flow, admin dashboard, internal factory database, basic FMS assignment.

## 21.2 Phase 2

FMS portal, messaging, milestones, file uploads, refund center, email/document engine.

## 21.3 Phase 3

AI translation, AI project summaries, AI factory matching suggestions, AI customer support.

## 21.4 Phase 4

Agent portal, commissions, verification system, local market operations.

## 21.5 Phase 5

Factory portal, factory claim system, public factory onboarding, factory SEO expansion.

## 21.6 Phase 6

Mobile messaging app and full import operating system.

---

# 22. Appendix A - Core Workflow Maps

## 22.1 Paid Project Flow

Visitor -> Importer signup/login -> Create Import Project -> Choose package -> Payment -> Admin review -> FMS assignment -> FMS research -> Admin review -> Results released -> Importer feedback -> Complete -> FMS payout.

## 22.2 Unpaid Lead Flow

Visitor -> Create Import Project -> Choose package -> Cannot pay/save project -> Project status Awaiting Payment -> Admin/agent follow-up -> Payment completed -> Admin review.

## 22.3 Refund Flow

Importer requests refund -> System checks whether FMS assigned -> If no FMS assigned, full refund path -> If FMS assigned, admin milestone review -> Possible reassignment/full refund/partial refund/rejection.

## 22.4 FMS Submission Flow

FMS receives assigned project -> Reviews requirements -> Researches factories -> Uploads evidence -> Submits report -> Admin reviews -> Factory data stored -> Approved results released to importer.

---

# 23. Appendix B - Initial Data Model

Core entities:

- Users
- User roles
- Importer profiles
- FMS profiles
- Agent profiles
- Factory records
- Import projects
- Project files
- Project messages
- Message approvals
- Payments
- Refunds
- Packages
- Add-ons
- Milestones
- FMS payouts
- Agent commissions
- Audit logs
- Notifications
- Email events
- Document records
- Factory ratings
- FMS quality scores

---

# 24. Appendix C - Open Decisions

The following items must still be decided by the founder/product owner before final build or public launch:

| Area | Open Decision |
|---|---|
| Brand | Final company/platform name |
| Domain | Primary domain name |
| Legal | Pakistani registration structure |
| Payment | Exact local payment gateways/methods |
| Office | Public verification address |
| Support | Official WhatsApp/phone numbers |
| Email | Final domain email addresses |
| Legal Docs | Final Terms, Privacy, Refund Policy, FMS Agreement, Agent Agreement |
| Team | First admin/support operators |
| Operations | First FMS recruitment process |
| Compliance | Data handling and business compliance review |

---

## End of Version 0.1

This manual is intended to evolve into the complete operating system for the Pakistan-China Import Platform. Future versions should expand each section into detailed screen-by-screen PRDs, database specifications, API requirements, templates, SOPs, and acceptance tests.
