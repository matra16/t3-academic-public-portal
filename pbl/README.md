# T3 PBL Classroom V8 — English Vlog Project Learning

**Status:** Public practice frontend DEPLOYED / QA VERIFIED; real child-facing generative AI, official cross-device team collaboration and centralized student logs NOT DEPLOYED.
**Date:** 2026-11-08 | **Project:** PBL_LEARNING

**Public site:** https://matra16.github.io/t3-academic-public-portal/pbl/

## What changed from V7

1. **Minimal homepage:** app name plus one "Enter learning" button; class activities appear only inside the learning workspace.
2. **UI-only language selection:** Thai/English switch affects menus, navigation, inputs, tooltips, notices, statuses and buttons. It **never changes lesson content, English communication prompts or saved learner text**.
3. **Owner-controlled configuration:** `pbl/assets/v8.public.json` has `uiLanguageSwitchEnabled: true` by default. Only an authorized GitHub repository contributor can change the source-controlled JSON. Setting it to false hides the switch on the public site after publication and reload. This is not an authenticated Admin interface; existing school protected Admin remains separate and Dark-only.
4. **Vlog learning studio:** original P6 project "T3 English Video Tour" (DRAFT) uses 6 scenes / 3–4-minute target and 20 student microtasks. Location topics include School, School Grounds, Temple, Market, Community and Other; actual filming/publication requires school and site permissions.
5. **Individual and sample group modes:** browser-local drafts for a sample individual and G-DEMO group. No roster, genuine membership verification or synchronization across separate learners' devices.
6. **Guided offline practice:** rule-based prompts and English sentence frames. **Not generative AI** and not represented as such. Real AI Expert mode is disabled pending lawful child-compatible provider, safety, authentication and cost verification.
7. **Activity log demonstration:** up to 100 local synthetic events, retained no longer than 7 days, no raw prompt contents or personal information, no central attendance/official school audit.
8. **QR invite:** self-hosted QR library points to the GitHub learning area; no student identity in URL. Sarabun font remains in the light student UI.

## Sources and rationale

[Public V8 study and AI safety boundary](https://github.com/matra16/t3-academic-public-portal/blob/main/pbl/research/V8_PUBLIC_DESIGN_AND_AI_SAFETY.md) covers:
- Original authentic English Vlog project (school guide, field research, speaking, storyboard, video, feedback, revision)
- Gemini API 2026 age rules, institution-managed Gemini for Classroom and free-tier data processing caveats
- PBLWorks, UNESCO and Thai PDPA minor-data safeguards
- School-owned future server session / per-group isolation / minimal event log design (DRAFT only).

## Static bundle and release

- `pbl/index.html`: minimal public homepage and demo studio; no GAS attribution banner.
- `pbl/assets/v8.css`: student-only light Sarabun theme, accessible/mobile layout.
- `pbl/assets/v8.js`: TH/EN UI-only, 20-step sample project, offline rule coach, local notes and bounded audit demo.
- `pbl/assets/v8.public.json`: owner-editable public UI preference; privileged toggles always forced off in client.
- `pbl/assets/qrcode.min.js` and license: reused existing self-hosted QR library.

**QA in authorized Pariphon environment:** Node/static 153/153, local Chrome 20/20, live GitHub Pages Chrome 13/13, synthetic local scope-isolation check 4 teams + 3 individuals (23 concurrently requested operations). No real learner tests, AI inference or school data writes were performed.

**Rollback:** Git commit history preserves V7; `pbl/index.html` and V8 static assets can be reverted in existing repo with owner review. Original standalone PBL LMS GAS and PBL TRACK OS untouched. Never commit confidential student content, scripts or school service credentials to this PUBLIC repo.

## Open human gates

School-approved project identity and timetable; actual child group assignment and role/membership; private session tokens and server RBAC; AI provider licensing (including under-18 access), school privacy/consent notice and cost; filming/site permissions and restricted media hand-in; official event log retention and authorized teacher readback; security UAT and owner approval before real student data.

GitHub Pages is a static host. It is not itself a secure authenticated backend for multi-user edits, AI keys, protected roster or official student activity logs.
