# Phase 16: Representative Verification Workflow

## Status

Phase 16 adds a controlled MVP workflow for manual representative verification.

This phase does not add public representative signup, agent self-approval, payment collection through representatives, direct importer-representative messaging, public FMS/admin signup, payment gateway integration, or schema changes outside the focused representative verification tables.

## Data Model

Migration:

- `supabase/migrations/021_representative_verification_workflow.sql`

New enums:

- `representative_code_status`: `active`, `suspended`, `revoked`
- `representative_status`: `active`, `pending`, `suspended`, `archived`
- `representative_verification_result`: `verified`, `invalid`, `suspended`, `revoked`

New tables:

- `representatives`
- `representative_verification_attempts`

`representatives` stores admin-managed local representative records:

- `full_name`
- `display_name`
- `verification_code`
- `code_status`
- `representative_status`
- `province`
- `city`
- `service_area`
- `role_title`
- optional `linked_user_id`
- optional `agent_profile_id`
- `public_notes`
- `internal_notes`
- lifecycle timestamps and audit fields

`representative_verification_attempts` stores public lookup attempts:

- entered code
- normalized code
- matched representative id when available
- result
- optional user agent
- created timestamp

RLS is enabled on both tables. There is no broad public read policy.

## Verification Code Behavior

Codes are generated server-side in this format:

```text
CPIH-REP-XXXXX
```

The public verifier normalizes input by trimming/case-folding and accepts either the full code or the final five-character suffix.

Regenerating a code replaces the current public code and stores the previous code in metadata for admin audit context. Old codes no longer verify because the current `verification_code` is replaced.

## Admin Workflow

Route:

- `/admin/representatives`

Allowed roles:

- `admin`
- `super_admin`

Admins can:

- list representatives
- search by name, code, city, province, area, and status
- create representatives manually
- edit safe public/admin fields
- copy verification code
- activate/reactivate representatives
- suspend representatives
- archive representatives
- regenerate verification codes
- view recent verification attempts

Representatives do not need an auth account or agent profile for MVP launch.

All admin mutations write `audit_logs` entries for:

- `representative_created`
- `representative_updated`
- `representative_suspended`
- `representative_reactivated`
- `representative_archived`
- `representative_code_regenerated`

Audit rows never store passwords or private payment data.

## Public Verification Workflow

Route:

- `/verify/representative`

Public users can enter a representative code. The public server action returns only sanitized fields:

- display name
- city
- province
- service area
- role title
- active status
- public notes
- verification timestamp

The public result never exposes:

- private phone
- private email
- CNIC
- direct address
- bank/payment details
- internal notes
- auth user ids
- agent profile ids
- audit metadata

Invalid codes return:

```text
No active representative was found for this code.
```

Suspended or revoked codes return:

```text
This representative code is not currently active.
```

No private representative details are shown for invalid, suspended, or revoked results.

## Safety Messaging

The public page clearly states:

- verification only confirms the person/code is registered with ChinaPak ImportHub
- users must not send money to personal accounts
- official payments must follow platform instructions only
- users should contact support when a code is invalid, suspended, or unclear

## Public Links

Representative verification is linked from:

- `/verify`
- `/verify/representative`
- homepage trust section
- contact page
- footer
- admin portal navigation for management

## Security Notes

- Public users cannot read `representatives` directly.
- Public verification uses a server action and returns a sanitized result object.
- Admin/super_admin role checks are required before management actions.
- Service-role Supabase access remains server-only.
- Private representative contact fields are not part of the MVP data model or public result.
- The workflow does not allow public representative signup or self-approval.
- Representatives cannot collect payments through this workflow.
- Existing importer/FMS/admin role guards are unchanged.

## Manual QA Checklist

1. Login as admin or super admin.
2. Open `/admin/representatives`.
3. Create a representative with full name, display name, city/province, service area, public notes, and internal notes.
4. Confirm a code like `CPIH-REP-XXXXX` is generated.
5. Copy the code.
6. Open `/verify/representative` in a public session.
7. Enter the active code and confirm only sanitized public fields are shown.
8. Suspend the representative in admin.
9. Re-check the public code and confirm it no longer shows an active verified result.
10. Reactivate the representative and confirm the code verifies again.
11. Regenerate the code and confirm the old code fails while the new code verifies.
12. Confirm recent attempts appear in admin.
13. Confirm `/admin/representatives` is blocked for non-admin roles.

## Future Improvements

- QR code generation for representative cards.
- Representative photo/ID review.
- SMS/email confirmation before code activation.
- Agent portal self-profile updates with admin approval.
- Territory assignment and lead routing.
- Commission tracking integration.
- Public minimal verification API with rate limiting.
- IP hashing once privacy/legal policy is finalized.
