# PBL LMS DNA 360° Reverse-Engineering & Gap Register — V17

**PROJECT_CODE:** PBL_LEARNING | **Audit date:** 2026-11-09 (Asia/Bangkok) | **Baseline:** V16.2 commit `3d6885d9cf4c2e412277dd2336beb456e1058310` | **Branch:** `feat/pbl-v17-review-feedback-portfolio-20261109` | **Authority:** owner-approved Grade 6 English project, canonical 22-tab school master (unchanged).

## Executive findings: original systems vs requested LMS

**Verified local source**: V16.2 includes (a) public student-name search and static demo Admin PIN, (b) 20 sequential English PBL steps, 5 individual steps and 15 team steps, (c) group membership UI, (d) stageable GAS `22_LMS_ACCOUNTS` / `23_LMS_GROUPS` / `24_LMS_WORK` / `25_LMS_AUDIT`, (e) stageable Admin-only progress aggregation, (f) A4 completion reports, (g) optional on-device British TTS, private microphone practice, and (h) V16 bulk fake roster enrolment. **None of the proposed school account tables existed in the actual canonical 22-tab master at this audit**. No approved school login was in operation on GitHub Pages. Public previews **must not be mistaken for production student accounts**.

**Critical educational gap**: a `DONE:true` activity only tells whether a note was submitted, not whether an educator has reviewed it, whether the language is accurate, or whether an individual learned from a shared group product. The missing formative learning loop was the top priority: **Submit → Teacher Review → Feedback → Revision → Resubmit → Re-review**.

**Scope and method**: examined V16.2 source, staged GAS code and school DB headers, then analysed selected current official Moodle/Canvas/Open edX, PBLWorks, W3C and 1EdTech docs; inspected selected open-source Canvas LMS `app/models/submission.rb`, `app/models/rubric_assessment.rb`, `lib/gradebook_exporter.rb` and Open edX `lms/djangoapps/grades/docs/data-model.rst`. The Moodle files were not accessible through the source connector; Moodle findings are from official documentation rather than direct code inspection. This is a deep **targeted architectural review**, **not** an unsupported claim of surveying every LMS/provider/guru/repository on Earth. V17 code is original and does not copy proprietary platform implementations.

## 1) Reverse-engineered reference patterns

1. **Canvas LMS / SpeedGrader & Submission API**: distinct submitted attempt, rubric association, published feedback, group-vs-individual feedback, re-submission awareness, grading/preview permissions. Inspect [submission source](https://github.com/instructure/canvas-lms/blob/master/app/models/submission.rb), [rubric assessment model](https://github.com/instructure/canvas-lms/blob/master/app/models/rubric_assessment.rb), [official SpeedGrader](https://community.instructure.com/en/kb/articles/662775-what-is-speedgrader), [group marking](https://community.instructure.com/en/kb/articles/664276), [resubmit](https://community.instructure.com/en/kb/articles/660692-can-a-student-resubmit-canvas-assignments).
2. **Open edX / learner progress, Gradebook, instructor data**: separate completion from competence/grades; formal grading-policy version and grade history; student-specific identity and progress joins. See [grades data model](https://github.com/openedx/openedx-platform/blob/master/lms/djangoapps/grades/docs/data-model.rst), [learner progress](https://docs.openedx.org/en/latest/educators/references/data/progress_page.html), [grades / reporting](https://docs.openedx.org/en/latest/educators/how-tos/data/view_learner_grades.html).
3. **Moodle / assignments, rubrics and completion**: stage and capability boundaries between submitted, feedback, marking workflow and course-completion rules; rubric and grading guides. See [Assignment activity](https://docs.moodle.org/en/Assignment_activity), [Advanced grading methods](https://docs.moodle.org/en/Advanced_grading_methods), [Course completion](https://docs.moodle.org/en/Course_completion). *Documentation-derived: raw selected Moodle source paths returned unavailable, not inspected.*
4. **Gold Standard PBL**: authentic audience, sustained inquiry, voice/choice, reflection, **critique and revision**, public product; formative quality checks during inquiry, not one-time submission. Source [PBLWorks Gold Standard PBL](https://www.pblworks.org/what-is-pbl/gold-standard-project-based-learning).
5. **1EdTech**: modular interoperability, not pretending a Google Sheet is OneRoster, LTI or Caliper. [OneRoster](https://www.1edtech.org/standards/oneroster) covers exchanging school roster/course/grades; [LTI 1.3 / Advantage](https://www.1edtech.org/standards/lti) covers secure launch, NRPS/AGS; [1EdTech specifications](https://www.1edtech.org/specifications) and Caliper event architecture inform future contracts.
6. **WCAG 2.2**: keyboard focus visibility/not obscured, target sizes, accessible authentication and consistent help. Source [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/). Screens need automated and manual accessibility tests before school production.

## 2) System DNA coverage (evidence vs design, 48 dimensions)

Legend: **BASELINE** = present in V16.2 source/preview, **V17 IMPLEMENTED** = in V17 source/public preview or private staged adapter (specified), **OPEN** = not yet implemented, **GATE** = requires school approval before operating on real records. Status does not imply production use.

| # | Dimension / domain | World-class capability | V16.2 state | V17 delta / required next action | Priority |
|---|---|---|---|---|---|
| 01 | Course/program identity | Course → cohort → enrollment keys | PBL20 single project | Reuse VLOG20, P6 only; no parallel project | P0 |
| 02 | User/roster provenance | verified SIS IDs, source lineage | Proposed roster bridge, demo 8 | No change to underlying identity; still GATE | P0 |
| 03 | Admin/teacher RBAC | separate staff roles and assignments | ADMIN / STUDENT only | Admin checks retained; genuine Teacher role OPEN | P0 |
| 04 | Login/session | server-backed auth and expiration | Staged GAS only | No bypass from public demo PIN; GATE | P0 |
| 05 | Credential recovery | forced change, resets, rate limits | Staged | Retained; hardened login UAT needed | P0 |
| 06 | Classroom ownership/tenancy | class/school scoping enforced server side | P6 only + admin scope | Review is admin-only, student scoped own/group | P0 |
| 07 | Group contracts | fixed members, shared artifact ownership | V16 group | Shared-feedback visibility to group, no member score propagation | P0 |
| 08 | Cohort promotion | start/end years and archived cohorts | Not operational | OPEN, prevent cross-year mixing | P1 |
| 09 | Enrollment life-cycle | active, withdrawn, re-enrolled | Active flag | OPEN enrollment date/revision provenance | P1 |
| 10 | Staff/parent portal | least privilege dashboards | No parent | OPEN after consent and school approval | P2 |
| 11 | Curriculum linkage | standards and CEFR descriptors | 20-step fixed content | OPEN class-curriculum authoritative map | P0 |
| 12 | Content authoring | editable modules, item approval | hard-coded 20 steps | OPEN school-reviewed authored resource catalog | P1 |
| 13 | Prerequisites/sequencing | mandatory vs optional, mastery gates | server sequential save | Retain; teacher override/reteach OPEN | P1 |
| 14 | Voice & choice | student-designed inquiry paths | limited | OPEN within safety/grade scopes | P1 |
| 15 | English scaffolding | questions, frames, progression | present | Retain, CEFR validation OPEN | P0 |
| 16 | Listening TTS | en-GB voice female/male, speed | V15 local-only | Retain, hardware-specific real QA still needed | P1 |
| 17 | Speaking evidence | oral practice with consent | local microphone playback | Retain; protected optional evidence capture OPEN/GATE | P1 |
| 18 | Multimodal assets | files, images, links, video, captioning | notes only | OPEN secure signed upload & rights | P0 |
| 19 | Time planning | due dates, grace, availability | not in data model | OPEN task deadlines and per-class exceptions | P1 |
| 20 | Assignment submission | student vs group immutable attempt | current note + revision | V17 review uses owner + step + revision; full immutable submission history OPEN | P0 |
| 21 | Instructor review queue | submissions awaiting teacher decision | absent | **V17 IMPLEMENTED** fake UI + staged secure Admin API | P0 |
| 22 | Formative text feedback | next-action teacher suggestions | absent | **V17 IMPLEMENTED** original comment & replay | P0 |
| 23 | Critique/revision cycle | returned → resubmit → re-review | revision number only | **V17 IMPLEMENTED** review per revision & PENDING on resubmit | P0 |
| 24 | Revision integrity | optimistic concurrency, attempt lineage | work revision guard | V17 append-only review records; full diff OPEN | P0 |
| 25 | Rubric descriptors | teacher-scored dimensions/criteria | absent | **V17 IMPLEMENTED** 4 formative draft categories (0=not assessed; 1–4 level), *NOT official score* | P0 |
| 26 | Rubric governance | authority/instrument ID, calibrated scoring | absent | GATE: approved indicators, descriptors, weightings, QA | P0 |
| 27 | Peer review | moderated student critique | absent | OPEN consent & moderation model | P1 |
| 28 | Self-assessment | learner reflection/confidence | implicit reflection step | OPEN structured self-rubric/evidence | P1 |
| 29 | Separate individual language evidence | no group-grade proxy | 5 individual/15 group stages | V17 feedback remains owner-scoped; direct speaking/writing rubrics OPEN | P0 |
| 30 | Portfolio | per-learner artifact/revisions | no integrated view | **V17 IMPLEMENTED** 20-step visual portfolio + teacher feedback indicators; authentic file archive OPEN | P1 |
| 31 | Public authentic product | teacher-moderated showcase | absent | OPEN owner consent, publication license/withdrawal | P1 |
| 32 | Collaboration responsibilities | role rotation, trace who did what | role lesson text only | OPEN structured team role/participation evidence | P1 |
| 33 | Discussion & notifications | learner-teacher messaging, alerts | none | OPEN Inbox/notifications server-scoped | P1 |
| 34 | Assignment feedback history | published, immutable, versioned comments | none | **V17 IMPLEMENTED** append-only record per submitted attempt after owner schema gate | P0 |
| 35 | Student feedback visibility | own and group only | not present | **V17 IMPLEMENTED** server checks User + membership + Group ID | P0 |
| 36 | Analytics completion | progress separate from assessed mastery | V16.2 dashboard 5/15 | Retain; include review status on review tab | P0 |
| 37 | Workflow metrics | pending/revise/approved counts | no teacher review counts | **V17 IMPLEMENTED** teacher KPI + status filters | P0 |
| 38 | Learning mastery | criterion-based assessed competence | no genuine grades | OPEN evidence-register integration (13_ASSESSMENT_EVIDENCE) | P0 |
| 39 | Intervention flags | at-risk criteria + human review | absent | OPEN due-date/valid baseline dependent; no invented AI diagnosis | P1 |
| 40 | Reports | professional A4 + provenance | V16.2 print | Retained; review event provenance added in UI | P1 |
| 41 | Versioned exports | privacy-safe CSV and re-import | no secure export | OPEN principal-reviewed schema and permissions | P2 |
| 42 | School review / PLC | teacher workflow, coaching, fidelity | not operational | OPEN verified school PLC data model | P2 |
| 43 | OneRoster interoperability | real CSV/REST mapping | not implemented | OPEN technical adapter; no false compliance claims | P2 |
| 44 | LTI Advantage | secure tool launch, AGS/NRPS | not implemented | OPEN OAuth2/JWT/LTI contract and vendor test | P2 |
| 45 | Caliper / event analytics | timestamped normalized event schema | simple audit only | OPEN privacy-preserving event pipeline | P2 |
| 46 | Offline / low bandwidth | PWA, queued sync with conflicts | responsive only | OPEN offline cache & consent, no silent uploads | P1 |
| 47 | Accessibility | WCAG 2.2 keyboard/contrast/resize | partly implemented focus | V17 controls keyboard-friendly, formal WCAG audit OPEN | P1 |
| 48 | Cyber/privacy release | staff authorisation, backups, audit, retention, rollback | policy gate only | GATE: PROD, real PII, group ACL, backups, security UAT, signed owner approval | P0 |

## 3) V17 engineered contracts

**Existing source of truth**: `PBL11` in the existing stage-only Apps Script with `22_LMS_ACCOUNTS`, `23_LMS_GROUPS`, `24_LMS_WORK`, `25_LMS_AUDIT`; still **not** live in the original master. The school original `13_ASSESSMENT_EVIDENCE` has fields `EVIDENCE_ID, STUDENT_OR_GROUP_ID, PROJECT_ID, PLAN_ID, INDICATOR, EVIDENCE_TYPE, INSTRUMENT, RAW_SCORE, MAX_SCORE, QUALITY_LEVEL, DATE, FILE_ID, EVIDENCE_LABEL, QA_STATUS`. It is **not** used as a convenient feedback storage table because it lacks feedback/revision/status and has separate governance. No altered canonical column or duplicate DB was performed.

**New owner-gated child table only**: proposed `26_LMS_REVIEWS`, under the existing master **after** `PBL_V17_SCHEMA_APPROVED=YES`, prior four LMS tabs are approved/installed, owner backups/readback are complete, and `ownerSetupV17Reviews_()` is manually executed. Its exact headers:

```
REVIEW_ID, OWNER_KEY, STEP, SUBMISSION_REVISION, REVIEW_STATUS,
FEEDBACK, RUBRIC_JSON, REVIEWED_BY, REVIEWED_AT, CREATED_AT
```

**State transitions**:
- `WORK.DONE && no review matching latest REVISION` → `PENDING`
- Admin authenticates → `adminReviewQueue` → selects owner/step/revision → formative feedback + review → `APPROVED` or `NEEDS_REVISION`.
- Student `studentReviews` reveals only `USER:<own uid>` and, if currently assigned, `GROUP:<approved own group ID>`; students never read other individuals' feedback, draft review notes, password hashes or group work outside their own group.
- Resubmission uses **existing server-side saveStep optimistic revision**. Old review stays in immutable history; new work revision is **PENDING**, not incorrectly marked approved.
- Correction of a *published review* requires a separate reviewed correction pathway (**OPEN**); V17 refuses silent overwrites of an already reviewed attempt.
- Rubric `0..4` values are **formative developmental markers, not grades**. There is no official conversion to O-NET, CEFR, outcome mastery or school scores.

**Public static Pages**: teacher/admin can manipulate **fictional** sample submissions, publish fake feedback, and see it as the fictional student in the same browser tab. This deliberately makes no school write requests and stores no student PII. The six-digit publicly exposed sample PIN is NOT a real school-admin password. Real GAS anonymous student availability has its own privacy and threat-model review.

**QA design**: backend negative auth, missing approval, schema mismatch, stale revision, duplicate review, unknown owner, wrong grade, group-vs-person ACL, output redaction, no extra DB, plus browser mobile/desktop/responsive, submission list, rubric, filter, student feedback, portfolio, compatibility of V15 voice and V16.2 progress.

## 4) Unresolved owner gates and exact next cursor

- **CURRENT (verified)**: root registered ID `1YXDDxN3hRc0B4gA77WyHG00ATDvZaX_z`; original master ID `1be4OzGn4-NPIjDcmAB251luICjszYjqLRlxd4eCG_8s`, 22 baseline tabs; P6-only; B2/ADOPT-014 owner policy recorded, technical adoption review pending; B3/WM-010 Native GAS UAT and owner release open; workflow doc `WEBAPP-4WAY-WF-001` live currently titled V1.0 CURRENT (conflicts with user's requested baseline 1.1.0; do not pretend reconciliation).
- **V17 static Pages**: source and fake UI can be released independently of real school privacy gates. Does not open school PROD.
- **GATE / NEXT_EXACT_ACTION**: reconcile current B1/B2/B3/WorkID and owner release, verify school principal permissions; approve existing 22–25 staged schema before 26; make backup + revision-specific minimal diff; approve formative instrument and retention; deploy only with owner permission into school-controlled GAS staging; run real signed-in Admin and anonymous student negative/positive tests on P6 fictitious/UAT identities; check report/feedback access scope, audit readback, backups; explicit owner PROD approval before creating real reviews.
