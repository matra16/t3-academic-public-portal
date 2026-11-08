# T3 PBL Classroom V8 — Public Design, Vlog Learning Flow & AI Safety

Status: **Public practice release only — real student AI, official logs and cross-device group editing are NOT enabled.**
Date: 2026-11-08 | Audience: English project-based learning, upper primary.

## V8 changes

1. **Homepage:** application name and a single “Enter learning” action. Project activities only appear after entry.
2. **UI language:** Thai/English affects navigation, controls, forms and notices only. Lesson content, English practice sentences, student notes and Vlog task prompts are independent of UI language. UI switch is enabled by default.
3. **Owner-controlled UI configuration:** `pbl/assets/v8.public.json` has `uiLanguageSwitchEnabled: true`. A person with authorized write access to this existing GitHub repository can set it to `false`; after publication and reload, the public frontend hides its language selector and uses the configured default UI language. **This is configuration control, not an authenticated school Admin dashboard or security entitlement.**
4. **Learning content:** an English video tour/Vlog with six scenes and about 3–4 minutes as an earlier unapproved project plan. Twenty inquiry-to-revision microsteps; school, school grounds, temple, market, community and other sites are topic choices, *not filming permissions*.
5. **Modes:** individual and demonstration group G-DEMO have separate browser-local drafts. This does NOT create member identities or true multi-device group collaboration.
6. **Guided practice:** rule-based offline learning prompts use Socratic questions and short English scaffolds. **This is not generative AI** and is clearly labelled.
7. **Event audit:** bounded local demo events with date, event type and synthetic mode (INDIVIDUAL_DEMO / GROUP_DEMO); no raw student prompts, videos, real names, grades or teacher roster. Not an official centralized school attendance or student activity log.
8. **QR link:** static GitHub Pages invitation to the practice learning area without learner or group IDs; QR generator is included locally in this repository.

## Research basis / original project

The existing school planning documentation defines the **T3 English Video Tour** concept using an authentic visitor audience, fact verification, English speaking practice for *each learner*, storyboard, rights checklist, filming, feedback, revision and reflection. A six-scene video and twenty learning steps are described in a **draft** 40-hour/20-lesson plan. The official project identity, timetable and child-filming permissions are not confirmed here. Older school plans emphasize individual practice before teacher-approved grouping, normally four to five learners per group. The public classroom is not a replacement for the school roster or approved student media archive.

## Evidence and legal/education safeguards

- Google Gemini API Additional Terms (effective **2026-03-23**): https://ai.google.dev/gemini-api/terms . Under the current terms, developers must be 18+ and must not build Gemini API clients directed to or likely accessed by minors. This excludes directly adding this API to a P.5–6 student-facing public app; the free quota is also unsuitable for confidential student content.
- Google Workspace for Education announcement (2026-08-04): https://workspaceupdates.googleblog.com/2026/08/gemini-in-google-classroom-is-expanding-to-users-of-all-ages-with-contextualized-Gemini-starter-prompts-for-students.html . Gemini in Classroom may be available to K–12 learners under institution-managed age, role and administrator controls; it is not a no-login custom API for this web app.
- UNESCO, Guidance for Generative AI in Education and Research: https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research — privacy, human oversight and independent child use require safeguards.
- PBLWorks Gold Standard PBL: https://www.pblworks.org/gold-standard/pbl-teaching-practices — inquiry, student agency, critique, revision, reflection and authentic audiences.
- GitHub Pages hosting: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site — this public site is static and does not provide a secure server-side identity, authoritative audit or AI backend.
- Thai PDPA Section 20 (secondary legal text): https://deka.in.th/laws/%E0%B8%840136-1b-0001/20 — school owner/legal reviewer must decide applicable notices, lawful basis, guardian/child permissions and retention.

## Future protected backend contract (not deployed)

School-controlled session gateway with server-validated role/class/group membership; group and individual AI contexts isolated by tenant; no AI provider calls without explicit school/legal and provider age-eligibility checks. Append-only server event IDs, opaque pseudonyms, optional GroupID, event type, source revision and idempotency key, with retention and access policies. Never use raw message text, IP address, facial/video data, passwords or child identity as default audit metadata. Teacher signs off on filming rights, fact bank, script, storyboard, submission and public release. Group edits require revision checks and conflict resolution.

A synthetic localhost test exercised 4 sample teams and 3 sample individual contexts concurrently (23 operations), including cross-group denial, expiry/signature checks, idempotency and conflict handling. This is **not** proof of production authorization, real-model performance or school logging.

## Release boundary

Public V8 can be published on the existing `/pbl/` GitHub Pages route after browser/QA verification. No new database, repository or Google Apps Script is required. The separate protected Admin remains Dark-only and unchanged, as do previously published school tracking systems. Official student data, real AI tutoring and centralized logging remain behind explicit owner, rights and UAT gates.
