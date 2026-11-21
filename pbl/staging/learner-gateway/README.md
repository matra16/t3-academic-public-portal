# PBL LMS — Protected Learner Gateway (sanitized staging)

**State:** STAGING_CONTRACT_TESTED · NOT INTEGRATED · NOT APPROVED FOR CHILD DATA

This folder contains generic, school-independent source code with fictional test users only. It is a proposed delta to the existing canonical PBL LMS, not a new application or database.
No real roster, school ID, access token, password, owner name, or student record belongs here.

## Why this exists

A public LMS may allow anonymous reading of non-personal lesson materials, but real pupil submissions and performance logs must not inherit public/demo studentId selection or expire from a short-lived cache. Pupil identity must be established by a server-verifiable session, not a role tab, synthetic learner selector, or shared class password.

## Contracts

- pblCreateLearnerGateway_(dependencies) returns dispatch(input).
- release: explicit SYNTHETIC_QA with syntheticOnly=true, or school production gate containing all owner, privacy, schema, auth-provider, class-grant and revision approvals. Any missing gate denies all operations.
- directory: tenant-bound pseudonymous UID, active flag, class, staff grants, password epoch.
- invites: high-entropy, unique per pupil, expiry-bound, single-use onboarding invite; only the invited pupil's display name is revealed after code verification.
- credentials: an approved dedicated password service with adaptive salted hashing and policy, including one-time bootstrap verification and epoch rotation.
- sessions: opaque server-issued tokens, test TTL, server-side lookup and revocation.
- throttle: server-enforced retry limits on invitation and password endpoints.
- repository: injected existing canonical school data repository adapter for tasks, own work, events and staff-visible assignments. Requires transaction semantics and exact post-write readback. Do not silently create another Sheet/DB.
- digest: server-only digest for idempotency fingerprints; this is not a password hash.
- now: test clock abstraction.

## Proposed operations

CLAIM (unique invitation -> only that learner's name), ACTIVATE (one-time invite, temporary password and new password), LOGIN, READ_OWN, STEP_VIEW, TASK_START, TASK_SUBMIT, FEEDBACK_READ, REVISION, SESSION_END and LOGOUT.

Teachers must use separately verified staff identities with explicit classroom grants for READ_CLASS and TEACHER_REVIEW. Client-supplied role, learner ID and class cannot grant access. requestId provides idempotency and replay collision detection. Work revisions use optimistic concurrency; events are append-only.

## Critical remaining integration

1. Owner gate: approve student login policy, class grants, storage schema, consent and retention before accepting personal educational records.
2. Bind the existing private student roster server side; never expose public roster or national ID. Reuse canonical project DB / existing registers. Do not log the shared initial password or store it in HTML, ScriptProperties, or plaintext Sheets.
3. Use a real credential provider with adaptive password hashes, reset, rate limiting and account revocation. Apps Script hash loops are not a substitute.
4. Implement a bounded, journaled, crash-recoverable storage adapter. Google Sheets append/update calls are not ACID transactions. An in-memory fake repository is suitable only for unit tests. Prove durability across browser logout, cache eviction and days.
5. Implement unique invitation creation/revocation inside authenticated staff workspace and deliver through teacher-approved private channels.
6. Add accessible mobile learner login and teacher assignment/feedback UI in the existing Apps Script project without altering the protected pbl20SchoolRpc fail-closed gate.
7. Run manual authenticated teacher and pupil UAT and negative RBAC probes against staging, obtain owner release approval, then exact deployed version and /exec readback.

## Tests

Run: node --test GatewayTests.cjs (Node >=18). Test users are fictional and the fixture strings are not school credentials.

Assertions cover one-time invitation, negative login, expiry, role/session, classroom boundaries, tampering with learner UID, idempotency and collisions, stale revision, readback, rollback in the fake transaction adapter, teacher grants, feedback, logout and throttling.

## Integration safety

Do not copy this module directly to a public deployment and enable it for real children. Existing pbl20SchoolRpc remains fail-closed and the public synthetic LMS remains unchanged until storage, identity and production policies are accepted. This is a contract/staging artifact.
