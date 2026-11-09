# PBL LMS V17 — Formative Feedback, Review Queue, Revision History & Portfolio

**Project:** PBL_LEARNING • **Release route:** `https://matra16.github.io/t3-academic-public-portal/pbl/v17/` • **Baseline:** V16.2 • **Target learners:** only ป.6/1–ป.6/3 • **Public release category:** SYNTHETIC_DEMO (no school student records).

## Why V17

The V16.2 baseline already offered 20 sequential PBL English steps, 5 individual + 15 group activities, Admin Dark Mode, mock bulk enrolment, British TTS speaking laboratory and A4 progress reporting. But `24_LMS_WORK.DONE` records completion only: no teacher feedback, genuine rubric, review decision, critique/revision workflow or current feedback delivery.

V17 closes that **specific highest-value pedagogical gap**. The comprehensive 48-domain LMS DNA audit is [LMS_DNA_360_AUDIT.md](./LMS_DNA_360_AUDIT.md), with source-level Canvas/Open edX examples and official Moodle, PBLWorks, WCAG and 1EdTech references. It differentiates features actually built from future needs rather than claiming all world-class LMS facilities are installed.

## New teacher Admin workflow

1. Enter the existing **dark** Admin UI. Static Pages still accepts the publicly known sample PIN `160114` **for fictional demo only**, not as real school authentication.
2. Open the sixth-set navigation's new **ตรวจงานและให้คำแนะนำ** tab (fifth tab, index 4). A teacher-only, read-only queue lists completed submitted work by pupil or approved project group, step number, submission revision, and submitted time.
3. Filter by classroom, individual/team work, review status and name/step. KPI counters show total submissions, waiting review, returned for revision and reviewed.
4. Select a submission to see its work evidence note (Admin only), then type **specific actionable formative feedback**, optionally select four **developmental draft** rubric levels (0 not assessed, 1 starting, 2 developing, 3 reached goal, 4 advanced). Select **NEEDS_REVISION** or **APPROVED**, then explicitly publish.
5. The same submission revision cannot be silently marked twice. A new revision is queued again for review, with older feedback retained as a separate historical record.

**Privacy**: all values are displayed with DOM text nodes, not HTML interpolation. The queue is behind server-side Admin RBAC in the staged GAS adapter; the public demo is independent fictional state. A shared group review is visible to members of that same group, but no individual's private feedback becomes the group score.

## New student learning workflow

1. On entering a learner lesson, the **ตรวจงานและปรับปรุงผลงาน** card shows submission state and the latest teacher comment for the currently viewed step.
2. If returned, the student sees the comment and can return focus to the original task note. Existing `saveStep` revises the current `WORK.REVISION` using concurrency checks.
3. Once resubmitted, previous feedback remains referenced while the new revision is marked awaiting review; there is **no automatic AI marking**.
4. An expandable **20-step portfolio** displays the personal versus shared nature and submission/review states. This is a **workflow portfolio**, not yet a file-based artifact archive.

## Backend engineering — owner gate

`gas/Code.gs` reuses the already-proposed private four LMS tables in the single canonical 22-tab master. New staged RPC actions:

- `adminReviewQueue`: Admin-only read of existing completed work evidence, status, revision, feedback history; includes review schema state.
- `adminReviewStep`: Admin-only new immutable formative review for exact `OWNER_KEY / STEP / SUBMISSION_REVISION`, with server-side rubric, revision, owner and status validation; no overwrite.
- `studentReviews`: authenticated pupil sees only the reviews of `USER:<their UID>` and optionally `GROUP:<their currently assigned group ID>`.

The proposed **new controlled additive tab** `26_LMS_REVIEWS` is **NOT created by opening the website or deploying source**. It can be added by a separately **owner-authorised manual** `ownerSetupV17Reviews_()` **only after** the prior four addenda 22–25 are approved and installed in the existing master, the owner has approved `PBL_V17_SCHEMA_APPROVED=YES`, backup/rollback/revision gates and schema readback are complete.

Header contract: `REVIEW_ID, OWNER_KEY, STEP, SUBMISSION_REVISION, REVIEW_STATUS, FEEDBACK, RUBRIC_JSON, REVIEWED_BY, REVIEWED_AT, CREATED_AT`.

**Not connected to the original `13_ASSESSMENT_EVIDENCE` tab**: that table has separate approved evidence identity, rubric, indicator and score fields. It is not suitable for ungoverned conversion to teacher feedback. No official school/CEFR/O-NET scores were generated. Approval of a school-quality rubric is still OPEN.

## Readiness & test scope

- Browser synthetic UI checks — **180/180 PASS** across desktop 1440×900, mobile 390×844, compact 320×568, landscape 844×390 and tablet 768×1024: Admin review tab, all filters, 4 rubric criteria, fake revision write and duplicate prevention, student private-feedback panel/portfolio, 20 lessons, existing V15 British voice, V16.2 progress compatibility, no JS page errors or horizontal overflow.
- Google Apps Script Node VM synthetic tests — **39/39 PASS**: no anonymous read/write, forced password change, owner schema gate, schema idempotency, latest revision, stale-revision rejection, unapproved grade/owner rejection, private individual/group scoping, public redaction, no new master DB.
- Fake school backend integrated browser tests — **21/21 PASS**: sample PIN does not authenticate, school private login does, teacher feedback becomes visible to the correct student after login, no other individual feedback, A4 V16.2 print preserved, no real student records.
- **Total isolated tests 240/240 PASS**. Tests are simulated/fictional, not a claim that a real school GAS account or student has been used.

**Rollback:** V16.2 remains at `/pbl/v16.2/` and previous routes remain intact. Real school account migration/ACL/consent/PROD still **OPEN**. Owner acceptance for production is separate from public static demo publication.

## Further high-priority LMS gaps

See 48-domain matrix for exact scope, notably authenticated teacher role separate from owner Admin, proper source-verified roster, approved language-indicator rubric, file/video evidence with consent/retention, in-class notifications, group role evidence, self/peer assessment, adapted deadlines, moderated public product, SIS/OneRoster/LTI/Caliper interoperability, offline PWA sync, WCAG UAT, QA and backup gates. No unapproved data source, spreadsheet, registry, external model charge or PII export was created in V17.
