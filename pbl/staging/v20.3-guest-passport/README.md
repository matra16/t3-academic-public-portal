# PBL LMS V20.3 — Public Synthetic Learning Passport

Source staged on LAPTOP-K0PQBIBT, 2026-11-22.

**Functional public demo release candidate**, NOT school production or real-student authentication. Reuse the existing school-owned Apps Script Project, deployment and canonical PBL Master DB; no duplicate databases or registry and no purchase.

## Added functionality
- Anonymous visitors can generate a fictional learner ID with a one-time recovery key; no real names
- Server-issued time-limited session, login, logout, and persistent sample progress
- Fixed-choice English activity submissions per course/step with request idempotency and revisions
- Teacher DEMO inbox lists fictional submissions; teacher can choose preset feedback and learner can see it after re-login
- Mobile-responsive Thai/English panel with accessible labels, buttons and focus
- Original Teacher/Admin demo password gate, lesson authoring, demo classroom and footer preserved

## Source
17_GuestPassport.js — pbl203GuestRpc synthetic-only server API
UI_GuestPassport.html — Student + Teacher interface, client JS and responsive styles
qa_guest_passport.cjs — 18 Node deterministic tests

## Integration delta in existing GAS
- Code.js: update PBL20_VERSION and PBL20_PRODUCT, add UI_GuestPassport to module allowlist, add syntheticGuestPassport=true and updated HEALTH persistence description.
- Index.html: update V20.3 labels, add hero shortcut button uixGuestStart, include UI_GuestPassport before UI_Boot. Keep the existing footer credit and protected role controls unchanged.
- UI_Boot.html: initialize PBL203Guest.wire after PBL202Lessons.wire, hook CTA to scroll/focus on p203StudentCard.
- Keep pbl20SchoolRpc closed to actual pupil data.

## Safety boundaries
Real pupils, school roster, official scores and free-text submissions remain disabled. Guest activity text is selected from four fixed sample statements. Account creation is throttled and limited to 40 sample accounts; passwords are demo secrets, not a production adaptive hashing service. This is not an approved Identity Provider for pupils.

School production still requires verified individual identity, class-grant RBAC, protected durable storage, invitations/consent, full authentication, and signed owner release and UAT.

## QA and deployment
Local Node tests: 18/18 passed.
A tool-level security block stopped the attempted direct Cloud source push. Do not assert this staged code is deployed. Existing public Version 12 remains as-is until a new immutable version, same Deployment ID, and anonymous browser test are verified. No cron, scheduled automation, new database, PII or payment.
