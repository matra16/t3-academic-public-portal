# PBL LMS V16 — Dark Admin + approved-roster multi-select enrolment

**Project**: PBL_LEARNING • **URL after release**: `https://matra16.github.io/t3-academic-public-portal/pbl/v16/` • **Baseline**: V15.1 UI, V15 speaking studio, V14 responsive controls, existing V12 private Apps Script authentication contract.

## A. User-visible changes

- Entire Admin workspace is **dark**: heading, tabs, forms, input/select/search, accounts list, project groups, one-time password dialog, Admin password-change screen, session logout control and footer. Student learning remains the existing bright/light theme.
- First Admin tab shows **student selection from approved school roster**. Filter by P6/1–P6/3, type Thai names, check multiple rows, select all visible (up to 30), clear selection, confirm import, then inspect results per learner.
- Distinguish **new**, **already enrolled** and **same name/class — manual identity review required**; do not create an ambiguous second account. Imported users receive individual forced-change temporary passwords (shown to authenticated Admin once, auto-cleared in 60 seconds or at logout).
- Source roster is READ ONLY; the action creates learning accounts and does **not move, delete or overwrite** official student files. Other tabs for groups, accounts and the 20-step English project stay in place.
- Public GitHub Pages currently presents **8 completely fictional source learners**, which can be multi-selected and "enrolled" in the current browser preview (no persistence, no school records). The Admin demonstration PIN from V15.1 is still a *public demo PIN only*.

## B. Reverse-engineered implementation patterns (public documentation and source code)

Studied the published behaviour and selected publicly readable open-source code. Implemented independent GAS/JS logic (no copied platform source):

| Source | Verified pattern | V16 architectural adaptation |
| --- | --- | --- |
| Moodle [cohort management](https://docs.moodle.org/501/en/Cohort), [user importer implementation](https://github.com/moodle/moodle/blob/main/public/admin/tool/uploaduser/classes/process.php) | Available-list → selected-list → cohort; permission checks and membership existence check before adding | Checked roster list, select visible, verify duplicates and current Admin role |
| Canvas [SIS CSV contract](https://canvas.instructure.com/doc/api/file.sis_csv.html), [SIS import service](https://github.com/instructure/canvas-lms/blob/master/lib/sis/enrollment_importer.rb) | Stable source IDs, separate users/enrolments, validate and process bounded batches; caution about destructive full-batch import | Opaque stable student reference, bounded batch 30, non-destructive upsert/skip; no full-batch delete |
| Open edX [bulk enrolment](https://docs.openedx.org/en/latest/educators/how-tos/student_management/manage_course_enrollments.html), [enrolment APIs](https://docs.openedx.org/projects/edx-platform/en/latest/references/lms_apis.html) | Staff/Admin membership controls, multiple learners per action, server-side role authorisation and per-user enrolment response | Private `adminRosterCandidates` and `adminEnrollBatch` guarded by existing Admin session and result categories |

These are design patterns, not evidence that Moodle/Canvas/Open edX runs inside this system. Only a limited set of relevant official docs and selected code was reviewed; no claim of exhaustive platform research.

## C. School source identity / OWNER_GATE

The existing canonical `P6_PROJECT_TEACHING_MASTER_DB_AY2569` (22 tabs) remains the only PBL operational master. Its `12_STUDENT_COHORT` headers are `STUDENT_PSEUDONYM, ACADEMIC_YEAR, CLASS_GROUP, ENROLLMENT_STATUS, PROJECT_GROUP_ID, BASELINE_STATUS, MASTERY_STATUS, PRIVACY_CLASS, NOTES` — **there is no actual full-name field**. Do **not** guess real identities or publish a full roster in the public static bundle.

The *staged-only* `gas/Code.gs` reuses the existing V12 `apiV12` adapter and its proposed 22–25 LMS tabs **only after the owner has approved and installed those exact controlled additions**; it DOES NOT run setup or migrate data by opening the Pages preview. It will read an existing, owner-approved roster Sheet, rather than creating a second source registry. Mandatory private Script Properties, never committed to GitHub:

```
PBL_V16_ROSTER_APPROVED=YES
PBL_V16_ROSTER_SPREADSHEET_ID=<verified existing source ID>
PBL_V16_ROSTER_SHEET_NAME=<verified existing tab>
PBL_V16_SOURCE_ID_HEADER=<verified stable student UID header, NOT national ID>
PBL_V16_SOURCE_NAME_HEADER=<verified full name header>
PBL_V16_SOURCE_CLASS_HEADER=<verified class header>
```

Optional verified status filtering: `PBL_V16_SOURCE_STATUS_HEADER` and `PBL_V16_ACTIVE_STATUS_VALUE` (defaults ACTIVE). The adapter fails closed without approval/configuration or with mismatched/duplicated IDs. Source IDs are converted to keyed opaque references using the private pepper already held by the server. Only authenticated Admin may list or import. Import uses a lock, one-to-one deterministic account UID, duplicate checks, per-account randomly generated first-login password, minimal audit metadata, and per-row result reporting. A confirmed identity match by name alone never silently binds two people. No child national IDs are used as credentials.

**Real production status: OWNER_GATE_OPEN / NOT_DEPLOYED.** School-owner permission, principal/ScriptID, schema review, source mapping, password setup, privacy/consent, GAS RBAC negative UAT, backup, revision and explicit production release approval are still required. No production sheet writes, deployment ACL changes, student PII exports or extra paid APIs happened in this release.

## D. Verification and rollback

- Local simulated Chrome UI: **124/124 PASS** across 1440×900, 390×844, 320×568, 844×390. Dark panels, filters, multi-select, bulk import preview, duplicates, password UI, group tabs, no horizontal overflow, no unexpected network writes, and retained V15 voice lab / 20 PBL steps.
- Node VM Apps Script tests: **25/25 PASS**, including source-scoped P6 filtering, inactive exclusion, stable opaque identities, idempotency, blocked anonymous calls, duplicate source IDs, same-name ambiguity, first-login password and unchanged master source.
- Synthetic secure-backend Chrome integration: **14/14 PASS**, including three-name batch import, server RPC invocation, one-time password cleanup, account-list readback and safe logout. No real pupil data or speech tested.
- Existing URLs /pbl/ and /pbl/v15.1/ remain unchanged and are rollback targets.

**NEXT_EXACT_ACTION** for live accounts: verify the actual approved P6 full-name source and its unique ID/class/status columns under the school account, then obtain owner approval for existing master LMS accounts schema and Apps Script private deployment; conduct real owner-only UAT and readback before production enrolment.
