# PBL LMS protected learning records — canonical schema map and release gates

Status: **PROPOSAL_ONLY / OWNER_GATE_OPEN**. No live school records were created or modified by this proposal. This file contains no real pupil records, names, IDs, credentials or links to private school sheets.

## Reuse first: existing canonical 22-tab PBL Master DB

This proposal explicitly retains the current PBL Master DB and does not create a parallel spreadsheet or registry. Existing tabs and confirmed column headers:

| Existing tab | Verified grain and columns | Safe intended use | Not equivalent to |
|---|---|---|---|
| 07_PROJECT_TASKS | TASK_ID, PROJECT_ID, PHASE, TASK, LEARNING_TARGET, INDICATOR, MEDIA_ASSET_IDS, ASSESSMENT_ID, OWNER, DUE_OR_SEQUENCE, STATUS, EVIDENCE_ID | Link assigned tasks by existing TASK_ID after approved class/project binding; check task status before write | Individual submission rows |
| 08_LESSON_PLAN_REGISTER | PLAN_ID, PROJECT_ID, UNIT, LESSON_NO, TITLE, INDICATORS, OBJECTIVES_KPA, CLT_2W3P_KOLB, MEDIA_ASSETS, ASSESSMENTS, STATUS, FILE_ID | Connect authored lessons to approved plan and referenced learning media | Learner activity ledger |
| 12_STUDENT_COHORT | STUDENT_PSEUDONYM, ACADEMIC_YEAR, CLASS_GROUP, ENROLLMENT_STATUS, PROJECT_GROUP_ID, BASELINE_STATUS, MASTERY_STATUS, PRIVACY_CLASS, NOTES | Approved pseudonymous learner identifier and class membership; never use real national ID | Authentication identity provider |
| 13_ASSESSMENT_EVIDENCE | EVIDENCE_ID, STUDENT_OR_GROUP_ID, PROJECT_ID, PLAN_ID, INDICATOR, EVIDENCE_TYPE, INSTRUMENT, RAW_SCORE, MAX_SCORE, QUALITY_LEVEL, DATE, FILE_ID, EVIDENCE_LABEL, QA_STATUS | Teacher-approved assessment evidence ONLY after per-student provenance and score validation | Login/session/task-view event |
| 14_INTERVENTION_MASTERY | INTERVENTION_ID, STUDENT_OR_GROUP_ID, WEAKNESS_ID, ERROR_CODE, TARGET, ACTIVITY, ASSET_IDS, PRE_EVIDENCE, POST_EVIDENCE, RECURRENCE_RATE, MASTERY_STATE, REPAIR_RULE, STATUS | Mastery progress, intervention and reteach after reviewed evidence | Raw access logs |
| 19_VERSION_CHANGE_LOG | CHANGE_ID, ENTITY_TYPE, ENTITY_ID, FROM_VERSION, TO_VERSION, CHANGE_TYPE, RATIONALE, SOURCE, ACTOR, TIMESTAMP, STATUS | Revision and schema migration audit under owner change gate | Every learner interaction |
| 20_GAP_RISK_REGISTER | REGISTER_ID, TYPE, WORKSTREAM, DESCRIPTION, SEVERITY, OWNER, MITIGATION, BLOCKER_CLASS, STATUS, EVIDENCE | Project-level security/release gaps | Student-level alerts containing PII |
| 21_QA_RELEASE | QA_ID, GATE, SCOPE, TEST, EXPECTED, ACTUAL, RESULT, EVIDENCE_ID, CHECKED_AT, NOTES | Release and negative RBAC UAT evidence | Authentication logs |

## Required contract gaps, NOT yet provisioned

1. **Protected identity and invitations:** credential provider with adaptive password hashing, nonenumerating per-learner single-use invite, activation, revocation and verified class/teacher grants. Persist provider-owned credential hashes; never use public JavaScript or unprotected Google Sheet passwords.
2. **Protected sessions:** opaque short-lived server sessions, per-device logout, forced expiration, password epoch and revocation, school tenant and per-class scope. Prefer provider-managed session store; do not put plaintext bearer tokens in an LMS Sheet.
3. **Durable append-only learning event log:** uniqueness by (tenant, requestId), timestamp, actor pseudonym resolved by server, verified class/project/task/version, event type, trace and retention. Need journal/recovery and idempotency, server-side RBAC, not script cache.
4. **Durable work/submissions/revisions:** per-student assignment evidence, revision chain, teacher feedback and readback across sessions/cache expiry. Map accepted assessment records to existing tab 13 rather than duplicating it.
5. **Real deployment/ACL/consent:** authorized school owner approval before any schema extension, identity migration or actual student activation.

These are logical contracts, *not* authorization to add five new tabs. The school owner first reviews whether a protected existing system can supply each contract; if not, approve the minimal schema extension **inside the existing canonical DB** with exact revision and rollback, or a school-approved provider for credentials/sessions only. No new parallel public DB.

## Security and test matrix required before PII activation

- Invitation: cannot enumerate learners publicly; wrong/expired/reused/swap-class invitation denied; no account-state leaks.
- Authentication: never share the same password as sole identity proof; unique invitation + fresh private replacement password; adaptive hash verified by a trusted provider; throttling, reset/lockout policy and audit.
- Sessions: expiry, logout, password-change revocation, session fixation prevention, cross-device logout and CSRF/origin handling.
- Read: learner A cannot access B, other groups, other classes, grades or draft feedback; teacher T only assigned class; anonymous read returns non-personal lesson content only.
- Write: expired/replayed requestId, changed task status, membership revocation, wrong class, stale revision, injected studentId and forged teacher role denied.
- Durability: disconnect/retry, cache eviction, lock contention, simultaneous submit, crash/restart, exact audit and work readback, replay collision and backup restore.
- Assessment: exact evidence provenance and per-individual rubric in addition to group work; teacher review and individual feedback visible only to authorized actors.
- Privacy: consent/authority, retention, purpose limitation, deletion request, backup encryption, mobile access, accessible Thai UI, synthetic fallback never mixed with real data.

## Acceptance gates

| Gate | Required evidence | Current status |
|---|---|---|
| A. Synthetic gateway contract | Local deterministic tests, GitHub PR-only CI | **TESTED** (45/45); not UAT |
| B. Approved credential provider | Actual provider config, password policy, unique invites, encrypted secrets | **OPEN** |
| C. Canonical DB mapping | School-approved schema/permissions, migration dry-run/rollback/readback | **OPEN** |
| D. Integrated backend | All reads and writes bound to server-verified student+class+teacher grants | **OPEN** |
| E. Durable learner evidence | Cross-day test and incident recovery with realistic synthetic records | **OPEN** |
| F. Browser/UAT | Authenticated positive + cross-student/class negative + teacher/admin checks | **OPEN** |
| G. Owner human release | Revisioned sign-off for PII, publication, ACL and production | **OPEN** |

**Do not mark COMPLETE_VERIFIED or deploy pupil data before B–G pass.** Public Version 12 is synthetic and remains separate. No time-based automation is authorized. The CI workflow runs only when a pull request changes the sanitized files.
