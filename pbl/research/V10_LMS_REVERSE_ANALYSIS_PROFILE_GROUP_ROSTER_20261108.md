# T3 PBL CLASSROOM V10 — LMS Reverse Analysis, Profile, Group, School Roster & Security Blueprint

- WORK_ID: PBL_LEARNING_V10_REVERSE_ANALYSIS_20261108
- Project: PBL_LEARNING | Date verified: 8 November 2026 (Asia/Bangkok)
- Scope: Grade P5–P6 English Video Tour / Vlog 20-step learning, with schoolwide roster reference K–P6
- Delivery state: **V10_PUBLIC_FRONTEND_DEPLOYED_AND_CHROME_READBACK_VERIFIED / PRIVATE_AUTH_GROUP_ROSTER_INTEGRATION_OPEN**
- Method: analyze official published documentation and observable workflow contracts of international LMS; compare with original T3 PBL public V9/V10 sources and controlled restricted roster QA. This is **NOT** unauthorized access to proprietary code or student data.
- Source of truth: existing PBL 22-tab Master spreadsheet; existing school source bridge registry; existing public GitHub repository. No new student database or parallel roster.
- Disclosure: this report contains no actual student names, identities, phone numbers, faces, video files, passwords or authentication secrets.

## 1. The exact V10 acceptance boundary

User intent is **QR link -> a student's own profile -> independent language work -> group formation -> teacher-verified team -> shared Vlog project**, while school Admin must manage an actual class roster from a current November 2026 spreadsheet, not generic sample learners.

The implemented **public V10** presently provides a light/Sarabun student homepage, QR/deep-link onboarding, six illustrative P5–P6 class choices, fictional alias + avatar profile, session-local demonstration group join/creation, profile-scoped **browser-local** notes, UI-only TH/EN switching, 20 existing English Video Tour steps, dark separated public Admin workspace, and a roster **metadata/status** tab (not names). It does **not** provide authenticated students, official roster lookup, real cross-device teams, teacher-approved membership, private roster queries, centralized learner logs or a production AI tutor. Do not equate browser aliases or group codes with authenticated persons.

## 2. Reverse engineering of six platform patterns

| Platform / verified official documentation | Actual mechanism | What to adapt for T3 | What NOT to copy literally |
| --- | --- | --- | --- |
| **Canvas LMS** | Instructor-owned Group Sets can enable limited self-sign-up, capacity limits, same-section restrictions; separately students can create ungraded study groups, subject to instructor configuration | Teacher creates/controls group set, 4–5 capacity, one assigned group per course project; optional learner choices before teacher approval | Do not make a student-created public alias a graded official group automatically |
| **Moodle LMS** | No Groups / Separate Groups / Visible Groups with activity-level access; cohort enrolment managed centrally and bulk uploaded by authorized admin | Server-enforced separate group read/write scope and roster import reconciliation | Do not assume hiding HTML cards implements Separate Groups access control |
| **Open edX** | Open team sets can let learners create/join teams; instructor-managed team sets retain staff control; one team per team set | Team state machine, one membership per project, teacher bulk approval, classroom project topics | Do not confuse public discoverable teams with child-safe private teams |
| **Google Classroom** | Join class by link/code/invitation but requires a Google account sign-in; enrolment persists across devices | Keep low-friction QR/class choice, but add a **separate school-approved verification** method for pupils without Google accounts | A class code alone is not an identity proof; do not assume Classroom works without accounts |
| **Microsoft Teams for Education** | Collaboration Groups can work on a single shared submission; Learning Groups receive distinct resources but submit and are graded individually | Separate shared Vlog product from individual speaking/reading/writing evidence and support teacher feedback | Do not let a group upload stand in for all individual English assessments |
| **OWASP session / object authorization** | Server stores authorization state; random opaque session IDs do not contain student data; every request checks object ownership and role | Non-guessable short-lived sessions, class/group tenancy, server-side checks for each read/write, rate limit, revocation | No client-side role flag, URL query, student number, or group join code can override protected data ACL |

References:
1. https://community.instructure.com/en/kb/articles/660878 — Canvas self sign-up Group Sets.
2. https://community.instructure.com/en/kb/articles/661336 — Canvas student-created study groups, distinct from graded group sets.
3. https://docs.moodle.org/500/en/groups — Moodle Separate and Visible group modes.
4. https://docs.moodle.org/501/en/Cohorts — Moodle cohort enrolment and staff-side imports.
5. https://docs.openedx.org/en/latest/educators/concepts/advanced_features/about_teams.html — Open edX team-set concepts.
6. https://docs.openedx.org/en/latest/educators/how-tos/advanced_features/manage_teams.html — Instructor-managed and open team sets.
7. https://support.google.com/edu/classroom/answer/15605102?hl=en — Google Classroom sign-in prerequisite and class joins.
8. https://support.microsoft.com/en-gb/education/assignments/create-group-assignments-or-assign-to-individual-students — Collaboration vs Learning Groups.
9. https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet — session identity and privacy.
10. https://community.owasp.org/attacks/insecure_direct_object_reference — per-object server authorization.

## 3. T3 authentic pedagogy contract

- Learners start with individual evidence and linguistic scaffolds **before teacher-approved groups**.
- English 4-skill preparation and communication for a real audience lead to **Video Tour / Vlog** visiting school, school grounds, temple, market or community locations.
- Existing 20 milestones preserved: project entry, challenge/criteria, team formation, rotating roles, planning, site selection, research, factual verification, English script, storyboard, pronunciation rehearsal, video capture, editing, feedback, revision, individual reflection, presentation and evaluation.
- Original design expects roughly 4–5 pupils per group at group-formation checkpoint, six storyboard scenes, and an approximately 3–4-minute final product. These are project-plan design inputs; teacher curriculum and current approved project brief prevail if changed.
- Each learner must keep separate evidence of speaking contribution, reading/inquiry, script writing, revision, and individual reflection. A group submission is one project artifact, not a proxy score for all members.
- Teacher signs off site facts and filming safety; student faces, location tags and dissemination/publication require school rights/privacy gates.

## 4. QR/identity/profile/group lifecycle — target architecture

A. PUBLIC_ANONYMOUS: user opens public V10 GitHub Pages or teacher-issued QR. This proves only possession of the link and selected project/class intent. No roster view.

B. STUDENT_PENDING: learner creates a **fictional alias/avatar** and chooses class on public demo. In the future protected flow the school backend issues a short-lived, one-use, teacher-distributed claim token to establish pseudonymous learner identity. Do NOT put class lists, actual student IDs or claim secrets in QR.

C. STUDENT_VERIFIED: teacher or authorized school process reconciles the claim against the restricted roster. Backend grants a per-class session (random secret with expiry/revoke), storing only an opaque student pseudonym in browser. No username/password required from pupils unless owner approves a different school identity method.

D. INDIVIDUAL_WORK: project steps and local drafts use an individual scope; central saving occurs ONLY through protected backend with verified session and server authorization. Public V10 continues as sample-only.

E. GROUP_PROPOSED: teacher opens a class-specific group set and selects assignment policy: teacher-created group by default; optional pupil preference requests; ceiling of five and floor of four as **teaching guideline** (exceptions handled by teacher, not false hard rejection).

F. GROUP_APPROVED: authorized teacher approves membership, checks same class/project and one active group per project. An invitation may suggest membership but cannot activate it without the teacher gate.

G. TEAM_WORK: team tasks, six-scene storyboard, script, draft video and feedback are scoped to approved team; an individual portfolio remains learner-private. Submissions are versioned, critique/revision tracked, and teacher comments are distinct from learner content.

H. RELEASE/REVOKE: transfer/leaver changes role with auditable effective dates; no stale-session cross-class access; student work retention follows school approval; video publication consent independent of project participation.

## 5. Trust boundary — do not confuse public UI and protected school system

  PUBLIC CLIENT: GitHub Pages HTML/CSS/JS — only demo configuration, lesson templates, public class codes, fictional aliases, local sample notes.
     |
     | future protected HTTPS API only after authorization gate
     v
  SCHOOL AUTH GATE: teacher-verified learner claim, short-lived httpOnly Secure SameSite session, CSRF controls, rate limiting, scoped authorization, audit.
     |
     +-- PRIVATE ROSTER ADAPTER: restricted school Drive XLSX 2026-11-01, read-only snapshot + revision/hash, teacher-controlled import.
     +-- EXISTING PBL MASTER DATA CONTRACT: student pseudonym/cohort, project/task/evidence IDs, class and group scope (no new master DB).
     +-- GROUP/PORTFOLIO SERVICE: membership validity, per-learner evidence, versioned group deliverable and teacher feedback.
     +-- AUDIT SERVICE: pseudonymized action metadata, permissions and redacted diagnostics, retention policy.
     +-- OPTIONAL CHILD-APPROVED AI: separate human gate, content-minimized child-safe vendor/licensing review.

Security requirements: allowlist API origin, refuse unauthenticated writes, never trust client-provided role/class/owner ID, validate authorization on every object, no direct public spreadsheet API or embedded service credentials. Group code alone is never an authenticated session. Rate-limit join/claim and protect against enumeration. On shared devices prefer session-only defaults; clearing a visible profile must be accompanied by note/cookie retention controls on protected release.

## 6. Roster source verification — 1 November 2569, RESTRICTED

Verified restricted Excel source label: **รายชื่อนักเรียน-ปี-2569-อ.1-ป.6-1 พ.ย 69.xlsx**.
Source SHA-256 (for future exact revision reconciliation):
70d638e51f1b8317d9831ef220ffe9b67f1e1cbc5106213f2dc8b70cc5793f06

Source-level non-PII QA confirmed:
- **21 class worksheets; 535 numbered entries.**
- **526** rows with both given name and surname fields, **9** require source clarification; do not invent names or silently delete.
- Populated source student-number values: **0 duplicated** according to this audit; uniqueness in the school StudentID registry beyond this file is still to be verified.
- P6: 6/1=26, 6/2=26, 6/3=27, total **79**, versus historical cohort references of **78**. Resolve enrollment/dates, not by overwriting older test cohorts.
- Nine blank-surname review cursors (no names): อ.2.1 row5, อ.3.1 row17, อ.3.2 row19, 2.1 row31, 2.2 row18 and row26, 4.2 row17, 4.3 row15, 5.2 row9.
- Google Drive source ACL metadata listed **named owner/writer principals only** (not Anyone). The existing PBL Master was likewise found to have named owner/writer access.
- The new November workbook is in the school-project-analysis folder; the older central source bridge registry points to a different school roster folder with domain SOURCE_CANDIDATE. Resolve authority and migration/reference pointer before claiming this file is the formal operational master. Never create another roster database.

The roster is an immutable provenance-candidate snapshot until the school owner validates the authoritative file, academic year and student-transfer adjustments. Admin V10 currently displays **aggregate source and verification status only**, no identifiable pupil rows. Actual class rosters need the future school session/RBAC, not GitHub Pages.

## 7. Reuse existing canonical PBL 22-tab Master, not a second DB

Verified spreadsheet schema includes:
- 12_STUDENT_COHORT: STUDENT_PSEUDONYM, ACADEMIC_YEAR, CLASS_GROUP, ENROLLMENT_STATUS, PROJECT_GROUP_ID, BASELINE_STATUS, MASTERY_STATUS, PRIVACY_CLASS, NOTES.
- 06_PROJECT_REGISTER: project identity, driving question, product, duration and status.
- 07_PROJECT_TASKS: task/project/phase/learning target/sequence/evidence IDs.
- 13_ASSESSMENT_EVIDENCE: per learner or group evidence owner, project, instrument and score fields.
- 17_WEBAPP_MODULES: module/scope/data source/write target/runtime/QA.
- 03_SOURCE_REGISTER / 18_BRIDGE_REGISTRY: preserve exact source URLs/versions and deduplication contracts, without exposing restricted file pointers on public GitHub.
- 19_VERSION_CHANGE_LOG / 20_GAP_RISK_REGISTER / 21_QA_RELEASE: change, risk and acceptance readback.

For whole-school K–P6 importing into P6-focused Master, first validate tenancy and scope; do not quietly treat a P6 cohort as K–P6 canonical roster. Need an approved schoolwide roster adapter using existing cross-project bridge (not duplicate DB). Do not promote the public demo alias into the existing STUDENT_PSEUDONYM column until teacher verification.

## 8. Recommended minimum protected API contract (DESIGNED_NOT_DEPLOYED)

- POST /v1/identity/claim: one-time teacher-issued token; return short-lived opaque session only after server verifies class+roster+token+consent/approval.
- GET /v1/me: self only; never return full roster; include pseudonym, allowed class/project scopes, and workflow state.
- POST /v1/groups/propose: create pending group intent (server enforces class/project/size).
- POST /v1/groups/{id}/join-request: request membership; no automatic privilege.
- POST /v1/teacher/groups/{id}/approve: TEACHER_CLASS permission and class ownership, revision precondition.
- GET /v1/groups/{id}: approved member or authorized teacher only; public route denied.
- POST /v1/evidence/individual: person-scoped artifact, idempotency key and revision.
- POST /v1/evidence/group: approved membership plus group/project scope; school media policy check.
- GET /v1/audit/me: limited own redacted events; teacher reports query only own classes.
- POST /v1/teacher/roster/import-validate: dry run non-destructive report; owner-approved eventual commit in existing protected registry.
- Every mutation: revision/readback/rollback, server-side role/class/group checks, abuse limits and centralized audit.
- No endpoint above exists or is claimed functional in the published V10 public frontend.

## 9. Security attack cases and acceptance tests (design gates)

A01: Public GET /pbl/ renders without login, but private roster APIs always reject anonymous requests.
A02: Editing ?class=6.3, ?role=admin, ?group=XYZ, or browser localStorage never grants server rights.
A03: Guessing another group's ID, setting a learnerId in a request or copying a QR cannot read unrelated group files (IDOR negative).
A04: Two different devices require validated school identity and server group membership to collaborate; browser-local code cannot pretend to synchronize.
A05: Teacher A may not approve learner B outside authorized classes (RBAC and school tenant).
A06: Alias untrusted text encoded using textContent; no HTML/script injection.
A07: Group member cap, duplicate membership, join race and learner transfers handled atomically server side.
A08: Offline local demo data cannot be mistaken for official submission, attendance or scoring.
A09: Roster data remains restricted; server never sends entire class list to public JS bundle, GitHub commits or AI.
A10: Media upload/filming requires authorized privacy, consent, retention and rights; open share links forbidden by default.
A11: Child AI not launched merely because a free API key exists; verify provider age/educational terms and school authorization.
A12: Production release requires school owner exact principal/WorkID, authenticated QA, rollback and reproducible readback.

## 10. V10 code-level reverse inspection and validated behavior

GitHub: https://github.com/matra16/t3-academic-public-portal/tree/main/pbl
Live canonical site: https://matra16.github.io/t3-academic-public-portal/pbl/
Version-pinned V10: https://matra16.github.io/t3-academic-public-portal/pbl/v10/
Dark Admin: https://matra16.github.io/t3-academic-public-portal/pbl/admin/

Current module map:
- pbl/index.html: student minimal landing and V10 onboarding form with class, pseudonym alias, avatar and group fields.
- pbl/assets/v10-core.js: teaching stage, language UI, 20-step Vlog workflow, profile-scoped local notes, Admin preview read-only behavior.
- pbl/assets/v10-onboarding.js: six P5–P6 class selections, profile validation, demo group codes and local state, no real pupil IDs.
- pbl/assets/v10-onboarding.css: accessible/mobile responsive light student theme, Sarabun inherited.
- pbl/admin/index.html and admin-v10.js: separate Dark Admin, metadata-only restricted roster panel, viewer-safe policy/config with actual writes gated in authenticated GitHub.
- pbl/assets/v10.public.json: UI language switch ON by default; all sensitive backend/AI/media flags forced OFF.
- The existing PBL TRACK School Administration app and standalone LMS GAS are **different products**. No PBL TRACK production or school-private master/ACL was changed by this public V10 release.

Verified QA:
- Source static JavaScript parse PASS, no public roster names/IDs bundled.
- Pariphon **local Student Chrome 22/22**, published version-pinned **Student Chrome 22/22**, **canonical homepage Chrome 22/22**.
- Pariphon **local Admin Chrome 11/11**, published **Admin Chrome 11/11**.
- All required canonical, version-pinned, admin, JS, CSS, and config resources HTTP 200 after GitHub Pages propagation.
- Fixed a **QA-only local server route** that previously mapped /v9/ instead of /v10/; this was not a Cloud deploy or child-access issue.
- Readback distinguishes PUBLIC_V10_DEPLOYED from SCHOOL_AUTH_ROSTER_NOT_DEPLOYED.

## 11. Four-way, authority, privacy and cost checkpoints

- ChatGPT Plus = architecture, orchestration, QA and records; owner has selected free-cost PBL override.
- Google AI Plus / Antigravity when legitimately included/available = authorized engineering assistant only with anonymized synthetic inputs.
- Desktop Commander Pro on owner-authorized Pariphon = local execution, no external child PII transfer.
- GitHub Free = public sanitized site and version history; do not store private school source workbook or secrets.
- No ChatGPT Work credit, no paid browser automation, no PAYG, no auto top-up.
- B1 PBL R-014 free scoped, R-015 Anyone anonymous class access; B2 ADOPT-014 quality/RBAC standards, B3 WM-010, current WEBAPP-4WAY-WF-001 and exact PBL operational root stay binding.
- Human Gates: school principal/owner approval for roster authority, real identity verification, child PII persistence, protected backend production, ACL changes, AI under-18 integration, image/video dissemination.

## 12. Handoff and honest status

- COMPLETE_VERIFIED for PUBLIC V10 visual/anonymous learning shell and local synthetic profile/group demo, subject to above published QA.
- RESEARCH_REVIEWED for published LMS patterns; no reverse engineering of non-public proprietary implementation.
- VERIFIED_SOURCE_CANDIDATE for dated restricted roster metadata and aggregate quality; **NOT YET APPROVED** as formal schoolwide roster source.
- OPEN_GAP for real school Admin SSO/RBAC, verified student profile login without Google, persistent cross-device group creation, roster-level enrolment/withdrawal management, teacher group approval, official submissions & individual logs, consent/media workflow and authorized child-safe AI.
- NEXT_EXACT_ACTION: owner approve authoritative roster source and protected server identity design; use existing PBL cohort and school bridge with minimal revisioned schema/adapter delta; UAT with dummy identities; then restricted real roster import under school principal session and audited readback. Public V10 demo must remain separated from protected data until then.
