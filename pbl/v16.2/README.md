# PBL LMS V16.2 — Tracking, individual/group dashboards, A4 reporting

**Project:** PBL_LEARNING • **Scope:** ป.6/1–6/3 only • **Route:** `/pbl/v16.2/` on the existing public Pages site • **Source:** existing V16 dark Admin & V15 British voice, unchanged V10–V16 routes.

## 1. Reverse-engineering of international LMS implementations

Reviewed **official operating documentation** and inspected *selected code/data-model files* in public repositories to extract independent patterns; V16.2 contains original JavaScript and GAS code and does **not copy** any platform's protected code or claim to have examined every LMS.

| LMS | Observed source/behaviour | Adopted in V16.2 |
|---|---|---|
| **Moodle** | Activity/course completion differentiates evidence of completion from grading and permits criterion-based completion; course completion is a reporting concern, not an access rule. [Moodle Course Completion](https://docs.moodle.org/400/en/Course_completion) | Track `DONE` from activity/work entries, but **do not label completion as a grade, language proficiency, or teacher-evaluated outcome** |
| **Canvas LMS** | Gradebook offers class-wide and individual perspectives and grade history. In source [`lib/gradebook_exporter.rb`](https://github.com/instructure/canvas-lms/blob/master/lib/gradebook_exporter.rb), export enumerates enrollments and structured columns, batching enrolled learners. [Canvas Gradebook](https://community.instructure.com/en/kb/articles/660826-how-do-i-use-the-gradebook) | Class filters, individual detail view, separate personal/group completion columns, explicit A4 report table and summary with source timestamp |
| **Open edX** | [Gradebook & learner progress](https://docs.openedx.org/en/latest/educators/how-tos/data/view_learner_grades.html) separately report course progress, grading, and interventions; grade exports contain restricted student data. Its [grades data model](https://github.com/openedx/openedx-platform/blob/master/lms/djangoapps/grades/docs/data-model.rst) distinguishes course-user progress and per-block grades, with timestamps. | Account-linked progress, 20-step breakdown, dated readback, confidential Admin-only print report and no fabricated scores or insights |

## 2. Classroom semantics

The existing 20-step PBL English project has **5 personal steps (1, 2, 9, 13, 20)** and **15 shared group steps**. V16.2 honours this existing contract:

- **Individual completion**: step records owned by `USER:<UID>`; total 5. Never infer an individual's learning from someone else's submission.
- **Group completion**: step records owned by `GROUP:<GROUP_ID>`; total 15. Every team member may see the shared group work count, but the report explicitly identifies this as a **shared project artifact**, not an individual score.
- **Individual total**: own completed steps + team's completed shared steps / 20, a *workflow completion* display only.
- **Group report**: shared work / 15 and **separate** aggregate member individual submissions / (5 × member count). No fabricated grades, mastery, rubric score, automatic attendance, speaking performance or inferred individual participation.
- Shows completed/uncompleted step tiles, latest recorded timestamp, individual/group filters, class filters, name search, and read-only KPI overview.

## 3. Professional reporting

Authenticated Admin can choose Individual or Group, filter by class/name, then **print A4** via the browser's built-in Print / Save as PDF dialog. Includes institutional title, academic level, report type, generated timestamp, data-source status, KPI summary, structured table, methodology note, footer and spaces for preparer/reviewer. Clicking a row shows a **detailed 20-step learner** or **15-step group** report, with separately displayed members' individual work when group. Page breaks, recurring table headers, typography and print-only colors are styled for A4 portrait.

- Public preview prints only fictional sample people and carries a prominent **ข้อมูลสมมติ** notice.
- Live report requires an explicit privacy confirmation at print time. Admin controls, form inputs, session notes and any real student report data are cleared from the progress view on logout. No analytics or report data are written to browser storage.
- No external PDF/AI services, storage, or additional paid APIs are needed.

## 4. Private server integration — not deployed

`pbl/v16.2/gas/Code.gs` extends existing school Apps Script `apiV12` with only one read-only Admin-guarded RPC: `adminProgress`. It reads the **existing** previously owner-gated `22_LMS_ACCOUNTS`, `23_LMS_GROUPS`, `24_LMS_WORK` tables in the existing 22-tab master (when/if their additive schema has been separately approved), never creating new tables, sheets or registries. The source records are filtered to P6. It returns only completion flags, revisions, timestamps, class/group/member structure, not submitted notes, audio, password hashes, salts or national IDs. The RPC requires an active Admin session and refuses initial passwords pending mandatory change. No CRUD actions or actual roster imports are triggered by this release.

**OWNER_GATE_OPEN:** The master sheet live readback confirms only the original **22 tabs** and no approved production LMS accounts/work schema. Hence the live Pages route is **PUBLIC DEMO ONLY**; no real pupil tracking, school-grade reports, or live `/exec` account login is claimed. Separate approval, private GAS deployment and UAT are required for real records.

## 5. QA — fictional-only

- Browser page/printing tests: **175/175** PASS at desktop 1440×900, phone 390×844, compact 320×568, landscape 844×390, and tablet 768×1024. Includes A4 PDF bytes, row-specific report, multiple filters, step tiles, group/member split, no horizontal overflow, clean logout, V15 voice and 20-step regression, zero JS errors.
- Apps Script VM tests: **25/25** PASS, including Admin-only read, forced password change, P6 scope, duplicate revision handling, 5/15 grouping, no notebook/notes or hashed credentials exposure, unchanged master tab count.
- Fake private-backend integration: **18/18** PASS, including non-public Admin login, no demo PIN bypass, live-source UI, printer privacy confirmation, evidence separation, and logout removal.

**READBACK required on merge:** GitHub Pages success, HTTP 200 for `/pbl/v16.2/` and all new static assets, browser E2E QA on live URL.

**Next release step for real accounts:** owner approval + exact school master/checkpoint and source reference readback → minimal backup/diff → private GAS UAT with Admin/Student RBAC negative tests → explicit PROD gate and revisioned deployment → report readback.
