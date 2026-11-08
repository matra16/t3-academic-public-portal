# T3 PBL Classroom V10 — LMS Profile / QR / Group Architecture & Restricted Roster QA
**WorkID:** PBL_LEARNING_V10_20261108 | **Status:** Public profile/group prototype + restricted-roster evidence; live school identity binding NOT approved | **Date:** 2026-11-08.

## Scope and method

Behavioral **reverse engineering**, not decompilation or copying proprietary source code. Compare public official functional behavior, API permission contracts and architectural boundaries, then adapt those patterns to the original P6 project, **T3 English Video Tour — Welcome to Our School and Community**. All work reuses existing `matra16/t3-academic-public-portal/pbl` and existing 22-tab school Master; no new canonical database or repository.

### Reference comparison

| Official platform | Evidence-backed design pattern | T3 V10 adoption | Caveat |
|---|---|---|---|
| Canvas LMS | Instructor-controlled group categories, member limits, optional self-signup; students may create informal groups when teacher allows; profile fields are institution configurable | Separate independent learner practice from teacher-approved 4–5 learner Vlog group. Prototype allows browser-local sample groups, never school membership | No Canvas account/gradebook integration or cloned API |
| Moodle 5.0 | Groups can be absent, separate, or visible. Self enrolment and group enrolment keys are distinct features | Keep class/tenant and group isolation; group code is not proof of identity; teacher gates for real membership | A public static client cannot provide Moodle's role-based protection |
| Google Classroom | Teacher-issued link/code/invite, but actual enrollment requires a signed-in school-compatible Google account | Adopt easy QR entry without a student Google account; model server-issued guest sessions in a future private service | QR URL alone is NOT enrollment authorization; Google Classroom sign-in model is intentionally not copied |
| Microsoft Teams Education | Collaboration Groups share a group submission; Learning Groups provide tailored resources while learners complete individual assignments | Retain independent English proficiency evidence and group Vlog product separately | No Teams student account required for public demo |
| Open edX | Separate enrollments, cohorts, and teams; course admins control membership mechanisms | Distinguish school class cohort, project production team, and per-learner practice evidence | Open edX normally requires accounts |

**Official sources:**
- Canvas student groups: https://community.instructure.com/en/kb/articles/661336-how-do-i-create-a-group-as-a-student
- Canvas groups and categories APIs: https://developerdocs.instructure.com/services/canvas/resources/groups and https://developerdocs.instructure.com/services/canvas/resources/group_categories
- Canvas profile visibility: https://community.instructure.com/en/kb/articles/662892-how-do-i-edit-my-profile-in-my-user-account
- Moodle groups: https://docs.moodle.org/500/en/groups and https://docs.moodle.org/501/en/Self_enrolment
- Google Classroom class entry: https://support.google.com/edu/classroom/answer/15605102?hl=en
- Microsoft assignment groups: https://support.microsoft.com/en-gb/education/assignments/create-group-assignments-or-assign-to-individual-students
- Open edX grouping exploration: https://openedx.atlassian.net/wiki/spaces/OEPM/pages/4928962617/Technical%2BExploration%2Bof%2BExisting%2BUser%2BGrouping%2BMechanisms
- OWASP object access control: https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/

## Original T3 P6 teaching and Vlog contract

**Original school primary sources:** 
- `PBLH-P6 — Research R5 Student Workflow DNA 20 Steps + Digital Tools — Desk Review Phase 1 — 20261031` (Drive Doc ID `1VrjBgQF8A3VUINWGgkhZidXJl78uoKeCTdDOOR6MVfk`).
- `T3 English Vlog Squad! — Student Learning Pack S01–S03 — ป.6 — ฉบับนักเรียนและใบงาน (ไม่ใช้บัญชี)` (Doc ID `1H5kM1zxB2Jt3uP94LBY9MlZhlduKneb3K-SBaYcb-PM`).
- `T3 English Video Tour P6 — R6 DRAFT 20 Detailed Lesson Plans (40h)` (Doc ID `1iVLodMT4uc7SbLMb5GHyvtW0Ho6TGE6nWDnHx0zm7EM`).

Original R5/R6 was **DRAFT**, not a timetable/filming/grade scheme validated in class. It specifies 20 inquiry-to-presentation microsteps / proposed 40 hours, a six-scene 3–4-minute English video per team, and **separate individual English language evidence**. The S01–S03 learner pack explicitly starts with independent practice and holds off permanent groups until lesson 4; do not auto-form official teams at QR scan. Content may introduce school grounds, temple, market and community only after actual place rights, child safety, guardian/school approvals, and verified facts.

## V10 public learner interaction — implemented demonstration

1. Student scans classroom QR / follows link.
2. The public landing shows only application identity and **Enter learning**; deep `?view=learning` links lead to V10 onboarding, not directly to a learning activity.
3. Student chooses **synthetic alias** (2–16 alphanumeric characters), classroom among six P5–P6 sections, and an emoji avatar. The form rejects Thai full names and numeric IDs but cannot prove a typed alias is not someone's real name. UI instructs users not to enter personal data.
4. Browser stores session-only demo profile by default; explicit opt-in is required to persist on device. No server account, official enrollment, roster match or public learner listing exists.
5. Student may create or join a sample group with a random 6-character code, **within the same browser only**, max five demo profile IDs and class-consistency check. All group statuses remain `PENDING_TEACHER`, never teacher-approved.
6. Student continues to original Vlog lesson workspace, individual mode first. Existing 20 steps, offline guided questions, TH/EN interface-only language and QR remain.
7. The V10 notebook key includes the demo profile ID to reduce accidental note disclosure on a shared device. School-owned authentic individual notes/assessments are NOT stored by this public demo.
8. The existing dark public Admin view is unchanged; this publicly viewable Admin page is not a real school-admin login.

### V10 immutable permission boundaries
Public frontend cannot determine real identity from QR, grade/section, nickname, national ID, or group code. Client JSON cannot enable private AI, central logs, official roster writes, real uploads or project team membership. A classroom group code alone is not a credential. For actual synchronized team membership, the server must authenticate teacher-authorized sessions and enforce course/class/group membership on **each** read and write.

## Latest roster file — factual readback and privacy

The newest verified snapshot explicitly titled **“รายชื่อนักเรียน-ปี-2569-อ.1-ป.6-1 พ.ย 69.xlsx”** was discovered in a **restricted** Google Drive folder (not shared with Anyone). Read-only source import examined **21 class worksheets**, **535 numbered entries**, **526 entries with populated given+surname fields**, and **9 missing surname fields** awaiting school correction. Among populated student-number fields, no duplicates were detected; complete given+surname pairs were not duplicated. The P6 tabs show **26 / 26 / 27 entries = 79**, which differs from an earlier 78-learner reference; it is a reconciliation requirement, not a proven enrollment change.

**Do not publish the full roster, names, student IDs, ID-card numbers, age/birthdates, photos, group assignments or the private XLSX to GitHub Pages.** The source remains the school-owned Drive XLSX; the class totals are private provenance/quality metadata, not a new canonical student DB. Incomplete surname fields do NOT authorize deleting a student, inventing data or inferring legal name changes.

### Future protected roster adapter (not live)

A School Tenant owner-controlled server should resolve the **existing restricted source file** via an authorized Drive principal, verify source hash/revision and per-class grain, and expose a minimal `LearnerPseudonym` and `ClassID` only after an authentic teacher or school session. Link `learnerId` to official source IDs strictly in a private mapping under least privilege, not as browser localStorage identity. Reconcile transfers/inactive records, keep versioned snapshots and revision readback; no parallel school register.

**Private API / contract (design only):**
```text
POST /session/guest        ClassInvite -> short-lived scoped token (teacher-authorized)
GET  /me/profile           valid session only; pseudonym, class, optional avatar
PATCH /me/profile          rate limits, scoped editable fields, audit ID, CSRF defense
POST /group/proposal       class-bound, group target 4–5, teacher confirmation required
POST /group/:id/request    valid learner session; capacity and class scope checked
POST /teacher/group/approve  teacher role, affected class only, idempotent revision event
GET  /teacher/roster       school admin/teacher, authorized class and private storage
GET  /student/group        student only own group; no group enumeration
```
Server must recheck every object scope for OWASP BOLA defense, sanitize input, retain only metadata for attendance by school policy, and avoid central raw chat/PII without legal basis and signed owner approval. Student data rights and guardian consent under PDPA Section 20 require school legal assessment; do not infer permission from a QR scan.

## Acceptance and next gates

V10 public acceptance includes synthetically tested alias validation, class selection, avatar, session-only default, group creation / unknown-code rejection, TH/EN UI-only switch, individual-first Vlog 20 steps, profile-scoped local notes, QR deep link and read-only Admin preview. These are **not** production tests of central group collaboration.

**Human gates:** official student source owner + enrollment revision reconcile, 9 missing surnames, P6 79 vs older 78, private school Admin SSO/RBAC, per-pupil enrollment and safe session issuance, group teacher approval and 4–5 capacity, recording/privacy rights, protected storage and backup, signed UAT/PROD. No new paid API or cloud service is assumed.

## Release status
- PUBLIC P5–P6 ONBOARDING / LOCAL-DEMO GROUPS: can be released on existing GitHub Pages after actual QA.
- PRIVATE SCHOOL ROSTER SEARCH / VERIFIED GROUP MEMBERSHIP / CENTRAL STUDENT LOGS / LIVE AI: **NOT DEPLOYED** pending server and Human Gates.
