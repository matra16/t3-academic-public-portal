# PBL LMS V11 — School Account / Teacher-Defined Groups

**Project:** PBL_LEARNING • **work package:** PBL_LEARNING_V11_SCHOOL_AUTH_RBAC_STAGE_20261108  
**Status:** SOURCE_STAGED / SYNTHETIC_TESTED • NOT SCHOOL GAS DEPLOYED • NO REAL ROSTER IMPORTED  
**Owner-facing version:** V11 • **Safe public path:** /pbl/v11/ preview UI (if merged) • **V10 stays untouched at** /pbl/.

## Explicit cohort: Grade 6 only

**Allowed classes: P.6/1, P.6/2 and P.6/3 (6.1 / 6.2 / 6.3).** Only Grade 6 student accounts may be created, listed, authenticated, reset, enabled, grouped or assigned progress in V11. Admin is authorized separately. Server RPC rejects other class identifiers, even if an older configuration still contains class codes. This is a hard restriction on the Apps Script adapter, not just a dropdown filter. No Kindergarten or Grades P1–P5 roster data is required or permitted for this PBL project. The restricted P6 official roster still requires owner source reconciliation and privacy review before account import.

## User workflow

- Admin account **username**: \`matra160114\`. The initial password is **not** defined in repository code or chat. School owner configures it privately and must change it on first login.
- Admin creates class access codes, verifies/imports learner identities from the approved school roster, creates individual learner accounts with per-student one-time temporary passwords, assigns 4–5 learners to project groups, can disable accounts and reset a learner's password. **No admin interface reveals any existing password.**
- Student follows a class-specific QR/invite or class code, chooses their name, enters their individual password, changes temporary password at first sign-in, then sees **20 ordered PBL/Vlog tasks**. Tasks 1,2,9,13,20 are individual evidence. Other tasks are shared by the school-admin-assigned group.
- A group cannot be created/changed by learners. Access to group work is checked server-side on every request; individual responses remain scoped to each student. Group edits use revision checks to reject lost updates. Student national ID numbers are **never** authentication credentials.
- If learner forgets their password, Admin generates a new temporary password and gives it **privately**; the old session is revoked. No email or Google account is required for a learner.

## Software components

1. \`pbl/v11/index.html\` — accessible student/admin UI. On public GitHub Pages **it is a clearly marked demo only**; password inputs and privileged operations are disabled. The public URL is not an actual roster login.
2. \`pbl/v11/v11.css\` — responsive UI, desktop/mobile.
3. \`pbl/v11/v11.js\` — browser controller. Uses **google.script.run** only when served inside an authorized Apps Script HtmlService origin. Exposes no API keys or roster payload in repository.
4. \`pbl/v11/gas/Code.gs\` — opt-in **Apps Script server** with anonymous-access page, server-side role/session/row/group authorization, class-code-gated name selection, hashed/salted/peppered credentials, 30-minute server cache sessions, per-account failed-password throttling, version-based session revocation, a private change log, and 20-step prerequisite validation. Real GAS deployment is **not automatic**.

## Owner approval before enabling real student accounts

**Stop:** New columns/tabs, private roster import, ScriptID/DeploymentID and access-policy mutations are sensitive school-owner gates. An authenticated connector to Drive is not blanket authorization. The existing PBL master currently contains **22 tabs**; V11 code does not run any schema write automatically.

After owner-approved backup/revision and scope decision, the school can attach **four additive tabs to the SAME canonical PBL spreadsheet** (not a second DB):

| Tab | Purpose | Privacy |
| --- | --- | --- |
| 22_LMS_ACCOUNTS | Pseudonymous UID / class / display name / salted credential hash / account state | **RESTRICTED STUDENT + SECURITY** |
| 23_LMS_GROUPS | Admin-owned group membership by UID and project | RESTRICTED STUDENT |
| 24_LMS_WORK | Individual/group step evidence, edit revision, last editor | RESTRICTED STUDENT |
| 25_LMS_AUDIT | Admin creates/resets/disables, group management, password-change events; **no secrets** | RESTRICTED AUDIT |

The existing 22-tab workbook is **P6-project-teaching** focused, matching this newly confirmed Grade 6-only scope. Import only approved P6 records, using the existing restricted source and owner gate. Never import K–P5 learners, create a schoolwide roster clone or copy student names to GitHub Pages, public JSON, public admin UI or external AI.

## Owner-controlled GAS installation checklist (not yet executed)

1. Verify correct school owner principal, latest PBL master revision, 22-tab schema, school source roster, enrollment corrections and rights. Create an access-controlled backup; approve minimal additive schema and retention/consent policy.
2. In the **owner's Apps Script project**, add \`Code.gs\` from \`pbl/v11/gas/Code.gs\`, and add \`Index.html\` by copying \`pbl/v11/index.html\` as the HTML file \`Index\`. Keep the CSS and JavaScript on the approved, immutable school-reviewed GitHub release, or vendor the exact reviewed assets into Apps Script. Do not silently substitute new credential origins or add parallel databases.
3. In owner-only **Script Properties** set \`PBL_V11_MASTER_ID\` to the approved existing Master spreadsheet ID, and \`PBL_V11_ADMIN_INIT_PASSWORD\` to a strong, private initial password for \`matra160114\`. **Never paste the value in chat, GitHub or screenshots.** Do not use the administrator username as its password. Do not use any learner's national identification number.
4. Run \`ownerSetupV11_\` **manually as the owner only after backup and schema approval**. It checks/adds only the four approved tabs, installs the Admin credential once, generates a private server pepper and deletes the initial-password property. Do not run this without owner approval or against a different master.
5. Inspect sheet ACL/readback, account hash cells (not plaintext), admin password-change state, class-code scope, and audit. Protect new tabs from unnecessary editors; document rollback and permissible data retention.
6. Under separate owner approval, deploy an Apps Script **Web app → Execute as owner → Who has access: Anyone** (anonymous permitted). Only this verified GAS \`/exec\` URL can support actual student and Admin sign-in. A public GitHub Pages URL alone **cannot** authenticate school users safely.
7. With **fictional students only**, run the positive/negative UAT: login throttling; role mismatch; forced password change; password reset revoking old sessions; one-student one-group; 4–5 group limit; denied cross-class/group access; group revision conflict; non-sequential step rejection; URL/HTML script injection; public roster visibility; mobile and shared-device logout. Record owner acceptance and deployment/script IDs in existing version, release and audit registers.
8. Only after human sign-off, import **verified real school roster** through the protected Admin process, issue credentials privately, test revocation and readback. Do not collect student national IDs as passwords. Do not publish video/child names without consent.

## Explicit security limits

- Apps Script \`CacheService\` sessions can expire/evict early and are not high-assurance enterprise IAM.
- Server-side salted HMAC with private pepper and repeated HMAC is a **staged implementation**, not an independently audited Argon2id/bcrypt KDF. External security review, threat modelling, Apps Script quota/performance UAT, credential recovery/rate-limit tests and access logging are **required before school production**.
- A class invite code only gates roster display. It is **not student identity proof**; a per-student password is always required.
- If students have duplicate names, Admin must reconcile identities with school records and communicate an unambiguous authorized display label, not infer from name alone.
- No actual school student roster, password, PII, extra paid API, SSO, new spreadsheet or GAS deployment was created during source staging. V10 remains rollback.
- The GitHub Pages demo has **no live school authentication**. The 20-step secure back-end requires the owner-authorized Apps Script runtime.

## Tests executed on synthetic fixtures (8 Nov 2026)

- Front-end JavaScript \`node --check\`: PASS.
- Browser static preview at 800×600 and 390×844: **22/22 PASS**, zero page errors; password inputs disabled, sample roster only, write controls disabled.
- Node Apps Script-compatible **mock service**: **43/43 PASS** for setup, Admin login/change, class gate, individual passwords/resets, group scope, ordered steps, CAS conflicts, cross-role denial and lockout. Tests **do not assert real Apps Script runtime performance**.
- Chrome mock-backend UI flow: **14/14 PASS** for class dropdown, student login/forced password change, progress save, Admin login, group selection and password-reset view, without any real student data.
- **Live GAS owner/Anyone/deployment QA: NOT RUN.** No production release claim.

**NEXT_EXACT_ACTION:** \`V11_BRANCH_REVIEW -> PUBLIC_SAFE_PREVIEW_RELEASE -> SCHOOL_OWNER_SCHEMA_AND_CREDENTIAL_GATE -> NATIVE_GAS_STAGING_UAT -> OWNER_APPROVED_ANYONE_EXEC_DEPLOY -> LIVE_ROLE_READBACK\`
