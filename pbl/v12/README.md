# PBL LMS — V12 student search and class projects
Status: PUBLIC STATIC PREVIEW READY, PROTECTED SCHOOL AUTH REQUIRES OWNER APPROVAL.

- Public URL after GitHub Pages deployment: https://matra16.github.io/t3-academic-public-portal/pbl/v12/
- Source of truth: existing school PBL master (22 tabs, unchanged), no cloned school spreadsheet and no public pupil roster.
- Front end: name search (typed 3+ chars), selected student, password, teacher-led group assignment, twenty preserved PBL steps. Admin entry is a muted button and the user-facing copyright is exactly © 2569 พัฒนาโดย Mr.Matra Yodchan. No student Google account required for the intended approved Apps Script release.
- The GitHub Pages public site DOES NOT provide real school login. Its searchable names are fictional examples only, and real password input is disabled. “สำรวจบทเรียน” displays a non-saving sample.
- The Apps Script server adapter is staged at gas/Code.gs and reuses V11's existing proposed account/group/work/audit schema; it does not create tabs, provision accounts or deploy anything by loading the public site. Owner-only setup uses private Script Properties and explicit approval.
- V12 server RPC apiV12 supports bounded public searchStudents (three-character minimum, up to eight matches), per-user password login, forced password change, admin password resets, teacher-assigned groups and ordered step evidence. No national-ID credentials.
- SECURITY GATE: public search of actual pupil names is personally identifiable and can be enumerated despite query-length and result-count limits. The school's authorized data owner must explicitly approve this disclosure, permissions/consent/retention and complete native GAS RBAC negative UAT BEFORE a real Anyone /exec school-login deployment. Do not automatically enable the real roster.
- Source role: GitHub Pages is an anonymous static UI; ANYONE_ANONYMOUS in appsscript.json is a deployment *candidate*, not proof of production publication.
- Rollback: preserve unchanged V10 at /pbl/ and V11 at /pbl/v11/.
- Synthetic QA (8 Nov 2026): desktop + mobile static Chrome 38/38 PASS, backend mock 35/35 PASS, JavaScript/Apps Script syntax PASS. No real student rows, national IDs, passwords or school records tested.
- OWNER GATE REQUIRED: correct school Google principal; existing canonical source/revision and P6-only roster validation; private password pepper & admin password set outside chat; approved restricted columns/tabs; backend publish permissions; privacy protection, rate limiting, negative RBAC and mobile UAT; exact GAS ScriptID/DeploymentID readback.
