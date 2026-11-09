# PBL LMS V18 — AI Learning Coach × Location Vlog × Learning Event Intelligence
**Research and architecture dossier (DNA 360°) | 2026-11-09 | PBL_LEARNING | P6 English | STATUS: EVIDENCE_SYNTHESIS + STATIC_DEMO / SCHOOL_PRODUCTION_GATED**

## 0. Scope, method, provenance and honest boundaries

**Research question:** How should a teacher-governed English PBL LMS support P6 learners independently and in parallel school-assigned groups while planning and producing authentic site-tour Vlogs, using appropriately scaffolded AI dialogue and a detailed yet privacy-minimised, attributable learning event log?

This research was **targeted multi-source desk review and source-code pattern inspection**, not a peer-reviewed systematic review, an AI-education impact trial, a census of all websites, or proof that every cited software feature is in school PROD. Primary sources include current verified PBL project code, 20 tasks, existing school Master 22 tabs, existing R6 architecture, Canvas, Moodle, Open edX, H5P MIT open source, ADL xAPI, 1EdTech Caliper and LTI, Council of Europe CEFR, PBLWorks, UNESCO, and selected 2025–26 randomized studies with conflicting results.

**Data authority:** existing 22-tab master Sheet ID 1be4OzGn4-NPIjDcmAB251luICjszYjqLRlxd4eCG_8s and operational Drive root ID 1YXDDxN3hRc0B4gA77WyHG00ATDvZaX_z. The newer selected authoring root remains migration CONFLICT_OPEN. No duplicate database, registry, group table, roster, official assessment or PII dataset created.

**Current-state labels:** \`BASELINE\` = already coded V17; \`V18_DEMO\` = public static fake practice; \`V18_STAGED\` = owner-gated GAS source not installed; \`GAP\` = not built/validated; \`HUMAN_GATE\` = permission/consent/PROD checks required. A static deterministic prompt helper MUST NOT be advertised as generative AI.

## 1. Real project and site-specific authentic challenge

**Driving question:** "How can our Grade 6 English Vlog help real visitors understand a place in or near our community accurately, respectfully, and safely?"

**Site types:** (1) school buildings/grounds *as locations only, not mandated homepage artwork*, (2) temple/wat grounds with custodian permission and sensitive cultural etiquette, (3) market with vendors and transaction/price facts requiring confirmation, (4) neighbourhood, river/community landmark, local cultural/social place, (5) other owner-approved place. **Site facts must originate with supervised student inquiry, approved local source records and verified location custodians.** No invented address, history, opening time, manager permission or real person name.

**Product specifications (teacher proposal, not school approved):**
- Original learner-created 6-scene Vlog with a real audience and safeguarded publication.
- Accurate visual script: What, where, why important, two distinguishing features, respectful visit guidance, closing.
- A shot list/storyboard mapped to cited facts and approved filming sites. Captions and attributable media, original/group contributions and individually observed English speaking evidence.
- Teacher-approved consent and public showcase gates; default storage PRIVATE, never upload or publish unapproved child video.
- Five individual evidence checkpoints and fifteen shared team checkpoints preserved from V17.

## 2. Source-derived 20-step learner workflow crosswalk

| Stage | Owner in current LMS | Authentic Vlog work | Recommended AI dialog move | Evidence / event | Teacher checkpoint |
|---|---|---|---|---|---|
|01 Project Entry|INDIVIDUAL|audience + 3 things visitors want|ask who audience is|STEP_VIEW, COACH_ASK, TASK_SAVED|own English ideas|
|02 Challenge & Criteria|INDIVIDUAL|driving question, learner choices|elicit audience/constraints|TASK_SAVED|personal intent|
|03 Team Formation|GROUP|school-assigned 4–5 group, contract|ask balanced contribution|GROUP_REVIEW|roster & membership|
|04 Role Rotation|GROUP|researcher/writer/speaker/editor roles|ask who has tried each role|ROLE_CHANGE proposed|check individual turns|
|05 Project Planning|GROUP|milestones/deadlines|ask first/next/last|TASK_SAVED|reasonable schedule|
|06 Site Selection|GROUP|school/temple/market/community|ask permission/site facts|PERMISSION_CHECK proposed|supervised safe site|
|07 Inquiry & Research|GROUP|two sources + site custodian|ask source and source quality|EVIDENCE_LINK proposed|fact verification|
|08 Fact Checking|GROUP|recheck claims/citations|ask “How do you know?”|FACT_CHECK proposed|truth/citation review|
|09 English Input|INDIVIDUAL|directions, introduction, polite asks|one short sentence frame|VOICE_PLAY/RECORD|own pronunciation|
|10 Scriptwriting|GROUP|6 short scenes and roles|give scaffold, not final script|SCRIPT_REVISION proposed|language feedback|
|11 Storyboard|GROUP|6 frames with shot/audio/speech|ask what camera shows|STORYBOARD_VERSION proposed|complete shot mapping|
|12 Production Planning|GROUP|permission, kit, backup, safety|ask private filming safeguard|SAFETY_CHECK proposed|teacher approval|
|13 Speaking Rehearsal|INDIVIDUAL|spoken description without reading|model Q&A, prompt rehearsal|VOICE_RECORD_START/STOP|individual English|
|14 Filming & Audio|GROUP|approved scenes/sound|ask clarity and noise|MEDIA_CAPTURE proposed|permission audit|
|15 File Management|GROUP|RAW/EDIT/FINAL filenames no names|ask file naming/rights|ASSET_VERSION proposed|no PII filenames|
|16 Editing|GROUP|6 scenes/captions/sound|ask sequence and audience|MEDIA_EDIT proposed|copyright/quality|
|17 Critique & Feedback|GROUP|specific peer/teacher review|ask what changed/why|TEACHER_REVIEW (V17)|feedback evidence|
|18 Revision|GROUP|revise facts/script/pacing/audio|ask justification, compare revisions|WORK_REVISION (V17)|recheck changes|
|19 Audience & Review|GROUP|protected preview to authorized audience|ask what visitors learned|SHOWCASE_REVIEW proposed|owner publication gate|
|20 Reflection|INDIVIDUAL|what *I* learned and contributed|ask evidence and next goal|REFLECTION_ENTRY proposed|individual assessment|

Stages, owner split, titles and questions are taken from V17 \`STEPS\` in \`pbl/v17/app.js\`; event names marked "proposed" are **not** proof of implemented event tracking.

## 3. Instructional theory × software pattern × domain decision

1. **Gold Standard PBL (PBLWorks)**: authenticity, agency, sustained inquiry, reflection, critique/revision and public product; AI can support inquiry without taking over authorship.
2. **Communicative Language Teaching / TBLT**: meaningful audience and language output; model short functional English for introductions/directions/visitor questions, not long completed scripts.
3. **CEFR Companion Volume (2020)**: oral production, interaction, spoken monologue, online interaction, collaboration/mediation and repair as *reference constructs*; grade-specific cut scores are not inferred without local curriculum and assessor validation.
4. **Scaffolding / gradual release / social constructivism**: show one sentence frame, ask a question, request learner re-expression, fade help; group role rotation preserves peer interaction.
5. **Self-regulated learning (SRL)**: plan → monitor → adapt → reflect; teacher feedback and authentic goal progress, not just message counts.
6. **Retrieval and productive struggle**: AI asks what the learner already knows and requests a short attempt; avoid instant long authoritative answers and over-scaffolding.
7. **Human-in-the-loop tutoring (Tutor CoPilot)**: teacher supervises pedagogical moves; role of AI is to prompt explanations and surface evidence gaps.
8. **Universal Design for Learning / inclusive literacy (inference)**: plain bilingual instructions, short messages, reduced cognitive load, captioned learner-authored video, keyboard access and school alternatives.
9. **Age-appropriate GenAI (UNESCO)**: education institution must check age, data minimisation and approved vendor policies; direct independent chat for minors cannot be enabled merely because a public page exists.
10. **Evidence-centred design**: observed submission/teacher review distinct from login/engagement and from actual individual language proficiency; link contributions to evidence and criterion IDs.

## 4. Evidence evaluation: selected 2025–2026 empirical studies (DOI and transfer limitations)

**EV-AI-01 — Kestin et al., 2025, Scientific Reports**. Exact title: "AI tutoring outperforms in-class active learning: an RCT introducing a novel research-based design in an authentic educational setting." DOI 10.1038/s41598-025-97652-6. RCT with university students; supported structured AI tutor in that context; does **not** establish effects in Thai P6 English or independent group Vlogs. Source https://www.nature.com/articles/s41598-025-97652-6. Type ORIGINAL RESEARCH.

**EV-AI-02 — Liu et al., October 2026, Brown EdWorkingPaper / IZA discussion paper**. Exact title: "The Effects of Course-Integrated AI Tutoring on Student Performance and Engagement: A Randomized University Trial." DOI 10.26300/y3f8-vh05. RCT 2,379 undergrads in 30-instructor multi-course setting; access associated with -0.37 SD grades and -0.90 SD LMS participation. **Working paper, university, context specific, not transferable as effect estimate to P6**. Important counterevidence to naive AI adoption. Source https://doi.org/10.26300/y3f8-vh05. Type ORIGINAL RESEARCH / WORKING PAPER.

**EV-AI-03 — Fütterer et al., April 2026, Educational Psychology Review**. Exact title: "Enhancing School Students’ Self-Regulated Learning through Generative AI Support: A Randomized Controlled Trial." DOI 10.1007/s10648-026-10133-8. 371 secondary pupils, grades 7–9, six 45-minute physics/English sessions: AI utility-value support helped trajectory of perceived utility value, no robust effect on tested subject knowledge/strategy use. **Younger Grade 6 and Vlogs not tested**. Source https://link.springer.com/article/10.1007/s10648-026-10133-8. Type PEER-REVIEWED RCT.

**EV-AI-04 — Robinson, Gormley, Ribeiro & Loeb, June 2026, EdWorkingPaper/ERIC ED681902**. Exact title: "Access Is Not Enough: Human Support Improves Engagement with AI Tutoring." DOI 10.26300/pz7p-p388. Two RCTs with elementary literacy AI platform, teacher/human support raised engagement 71–80% yet did not improve reading achievement; exposure alone not a learning gain. **Task was reading and grade 1–5, not P6 Vlogs**. Sources https://eric.ed.gov/?id=ED681902 and https://doi.org/10.26300/pz7p-p388. Type ORIGINAL RESEARCH / WORKING PAPER.

**EV-AI-05 — Wang et al., 2025, Tutor CoPilot**. Exact title: "Tutor CoPilot: A Human-AI Approach for Scaling Real-Time Expertise." DOI 10.26300/81nh-8262. RCT, >700 tutors and >1000 underserved students, human-in-the-loop AI improved math mastery by about 4 percentage points; benefits linked to asking probing questions. **Teacher-mediated math tutoring rather than unsupervised child text chat**. Source https://doi.org/10.26300/81nh-8262. Type RCT / WORKING PAPER.

**EV-AI-06 — Babaei-Balderlou & Shakya, 2026**. Exact title: "Can structured AI tutoring and study groups improve learning outcomes? Evidence from a randomized controlled trial." DOI 10.1080/00220485.2026.2695361. Four-arm undergraduate macroeconomics trial: AI+group condition showed larger exam gains than control, but group differences are course/age-specific. **Cannot infer 4–5 P6 Vlog groups will benefit equivalently**. Source https://www.tandfonline.com/doi/full/10.1080/00220485.2026.2695361. Type ORIGINAL JOURNAL RCT.

**EV-AI-07 — Yang, Van Alstyne & Dellarocas, September 2026, arXiv preprint**. Exact title: "When AI Tutors Speak: Evidence from a Randomized Field Experiment." arXiv:2609.23958. Preregistered graduate MBA study, N=86, structured tutoring mattered more to learning than voice-vs-text; voice raised interaction and delivery costs. **Preprint, graduate course, cannot prescribe modality for Thai primary pupils**. Source https://arxiv.org/abs/2609.23958. Type PREPRINT / EXPERIMENT.

**Evidence synthesis:** Effects vary in sign and by age, pedagogy, human support and study design. This justifies a cautious hybrid pilot with authentic individual English output, teacher supervision, logs and independent outcome measurements. No promise of outcome improvement, mastery or safer learning solely from AI feature adoption.

## 5. Source-code reverse engineering: checked patterns, reusable ideas and non-copy policy

| Source | Exact entry point / evidence | Architectural lesson | Licensing / copy rule |
|---|---|---|---|
| V17 own app | https://github.com/matra16/t3-academic-public-portal/blob/main/pbl/v17/app.js | 20 steps, identity, group scoped work | reuse own source delta |
| V17 own GAS | https://github.com/matra16/t3-academic-public-portal/blob/main/pbl/v17/gas/Code.gs | auth, session, P6, immutable review metadata | owner-gated schema |
| Moodle AI subsystem | https://docs.moodle.org/502/en/AI_tools | placements → actions → provider abstraction | official docs pattern; no claim code clone |
| Moodle AI developer plugin architecture | https://github.com/moodle/devdocs/blob/main/docs/apis/plugintypes/ai/index.md | provider/placement decoupled through manager | cite/source, do not copy third-party code blindly |
| H5P Interactive Video | https://github.com/h5p/h5p-interactive-video | annotations and interactive overlays on media | MIT open source; retain license if reused |
| H5P interactive editor | https://github.com/h5p/h5p-editor-interactive-video | authoring workflow distinct from consuming media | MIT, upstream source; full build not yet integrated |
| Canvas submission model | https://github.com/instructure/canvas-lms/blob/master/app/models/submission.rb | work attempts, role-scope, assessment separation | selected read; source license/version verification before code use |
| Canvas rubric model | https://github.com/instructure/canvas-lms/blob/master/app/models/rubric_assessment.rb | policy-governed criteria & learner feedback | selected read; no copied source |
| Open edX Grades data model | https://docs.openedx.org/projects/edx-platform/en/latest/references/docs/lms/djangoapps/grades/docs/data-model.html | graded work must not collapse into activity log | official technical docs |
| ADL xAPI | https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md | Actor–Verb–Object with context, timestamp | xAPI-inspired; V18 not LRS conformant |
| 1EdTech Caliper | https://www.1edtech.org/standards/caliper | Session, Tool Use, Media, Feedback event profiles | V18 original event schema, not Caliper certified |
| 1EdTech OneRoster | https://www.1edtech.org/standards/oneroster | verified roster interoperability upstream | not implemented |
| W3C WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | accessible authentication, device/focus/contrast | manual human screen reader UAT open |

**Implementation pattern adapted (ORIGINAL, not copied):** \`Learning UI (placement)\` → \`PBLCoachService (action)\` → \`SchoolPolicy/Session/GroupScope\` → \`GuidedProvider\` now; an approved \`LLMProvider\` only after school provider/cost/child-data approval. Cross-cutting \`EventLedger\` records bounded, verified access- and task-state events. Group history must be checked by server-side membership ACL. Admin sees metadata not raw child chat by default.

## 6. DNA 360° reference matrix — 64 capabilities, with truthful status

Definitions: B=V17 baseline, D=V18 public demo, S=V18 staged school-only code, G=unbuilt, H=human approval necessary.

**A. Learner identity, enrollment and permission (1–8):** 01 P6-only roster (B source-only H); 02 server login (S H); 03 anonymous demo isolation (D); 04 personal pseudonymous actor id (S); 05 teacher Admin role (B S H); 06 limited per-group view (S H); 07 historic membership ACL snapshot (G H); 08 guardian/privacy consent/retention verification (G H).

**B. Project and Vlog learning (9–16):** 09 20-step curriculum (B); 10 5 individual +15 group distinction (B); 11 authentic site category picker (D); 12 six-scene shot planner (D scaffold); 13 historical/cultural fact evidence (G); 14 site safety/permissions script (D prompt, H approvals); 15 site-specific video metadata (G); 16 audience & public showcase rights gates (G H).

**C. Coaching interaction (17–24):** 17 one-to-one chat interface (D); 18 shared group chat thread (D in one demo browser; S persisted if approved); 19 independent group scope keys (D S); 20 prompt scaffold by stage (D S); 21 site-specific response rules (D S); 22 LLM-powered natural-language generation (G H); 23 retrieval from teacher-approved source library (G H); 24 age-appropriate refusal and content detection (D S partial; safety UAT G).

**D. English production pedagogy (25–32):** 25 bilingual teacher-aligned help (D); 26 functional intro/directions frames (B D); 27 listening en-GB voice (B); 28 speed/repeat voices (B); 29 private speaking recording (B); 30 individual productive speech evidence (G H); 31 verified CEFR descriptor mapping (G H); 32 no AI completed Vlog impersonation (D S guidance, unvalidated).

**E. Collaboration and versioning (33–40):** 33 admin-assigned team ownership (B S); 34 team visibility and scope (S); 35 share simultaneous non-blocking messages (S; performance UAT open); 36 independent personal history (D S); 37 teammate contributions/roles by member (G); 38 immutable group membership intervals (G H); 39 shared artifact version history (B revision only, G immutable); 40 server dedup/idempotency on requests (S).

**F. Event and audit telemetry (41–48):** 41 login (S optional gate); 42 logout (S optional gate); 43 activity view/step (D S client event); 44 active-session pulse ≤30s with visibility check (D S); 45 AI request/reply (D S); 46 voice button events metadata (D S); 47 accepted save event via server (S); 48 immutable per-event ID, timestamp, actor, owner, step and policy version (S).

**G. Teacher management and analytics (49–56):** 49 dark Admin workspace (B); 50 logged activity table (D S); 51 filter by P6 class (D S); 52 per-actor and per-group distinctions (D S); 53 aggregate counters separate from performance (D S); 54 protected raw chat reading/export (G H); 55 learner/teacher interventions with decision audit (G); 56 A4 academic progress printing (B; adding AI activity export G H).

**H. Operational, security, integration (57–64):** 57 no default external vendor call (D S); 58 auth tokens never returned in logs (S); 59 no personal data GitHub (D S); 60 school owner/cost/provider/child AI consent gate (H); 61 incident/report retention/delete request workflow (G H); 62 offline retry and network recovery (G); 63 real xAPI/Caliper/LTI/OneRoster certification (G); 64 live school GAS end-to-end UAT/PRD deployment (G H).

## 7. School-private data contracts for multi-team simultaneous use

- \`ThreadKey = PROJECT(VLOG20) + OWNER_KEY + STEP\`; \`OWNER_KEY = USER:<serverUid>\` for private learning, \`GROUP:<school-approved groupId>\` for shared thread. Client-supplied groupId is **ignored** for ownership.
- \`SessionID = server random\`, TTL ≤30 minutes, bound to server-authenticated learner and stage/scope; never used as authorization by itself.
- \`ClientRequestID\` for idempotency (at-least-once network/retry); class and role from authenticated record.
- **Append-only messages proposed:** \`27_LMS_COACH_MESSAGES\` 12 fixed headers: MESSAGE_ID, OWNER_KEY, STEP, ROLE, ACTOR_UID, PLACE, CONTENT_TEXT, CLIENT_REQUEST_ID, CREATED_AT, COACH_MODE, SESSION_ID, QUALITY_FLAG. Owner must approve content retention and deletion policy.
- **Append-only events proposed:** \`28_LMS_LEARNING_EVENTS\` 14 fixed headers: EVENT_ID, ACTOR_UID, OWNER_KEY, CLASS, STEP, EVENT_TYPE, OBJECT_ID, SESSION_ID, EVENT_AT, DURATION_SEC, CLIENT_REQUEST_ID, CHANNEL, DETAIL_JSON, DATA_POLICY_VERSION. No actual student names, national ID, transcript or audio bytes in event details.
- Existing \`25_LMS_AUDIT\` stays separate for security actions. No automatic xAPI/Caliper certification.
- Event-derived "active minutes" can only estimate visible-window interaction, not verified on-task attention, understanding, attendance or speaking achievement. Max pulse 30s; disconnected events marked missing, not invented.
- \`27\` and \`28\` are **proposed** additional rows only under the same canonical DB, and **are not installed**. Existing physical school master still 22 tabs.
- Concurrency model: Google Apps Script LockService serializes append writes and deduplicates retries; scale and Google Apps Script quotas must be tested with 3 simultaneous P6 classes before live operation. Polling group history about every 12 seconds is not real-time websockets; rate and quota must be evaluated.
- ACL risk: V18 staged source gates team access with \`PBL_V18_GROUP_HISTORY_APPROVED\`; member history snapshots and legally correct historical visibility remain unimplemented. This **must** be resolved before real children use changing teams.

## 8. Safety, privacy and threat model

- **Minors and data flows:** NEVER send real child names, student videos, speech recordings, full conversation or specific school location to an external AI provider by default. The offline guided demo uses no external model calls; do not market it as GenAI.
- **Provider contract:** B1 OMNI owns provider ID, usage quotas and live approved provider; B2 engineering owns adapter; B3 project owner policy; ChatGPT is planner/QA, MiniMax Code primary coder if paid quota verified, GitHub Free for sanitized source, DRC local testing only. No automatic purchase/top-up/PAYG. No embedding credentials in client.
- **Prompt injection:** site notes, web documents, uploaded PDF/video descriptions are untrusted; AI must ignore attempts to alter school roles, publish children, change marks, or read other groups' messages.
- **Factual hallucinations:** require source IDs; in direct reply distinguish "idea" vs "verified fact". A place name alone is not proof of history, opening times, staff permission or official access.
- **Over-assistance/academic integrity:** ask first, scaffold one phrase, encourage revisions; refuse to write all 6 scenes as a finished assessed learner work.
- **PII screening limits:** client+server regex for 9–13 digit IDs/phones/email/password is defence-in-depth only, not guaranteed anonymisation. Teachers and parents must supervise; retention requirements unresolved.
- **Group leakage:** current membership-only access is not enough for members joining/leaving; historical snapshots, access revocation and audit must be added before school real group chat.
- **Event tampering:** server must derive actor, group, class and timestamp. Client event names and duration are untrusted hints; synthetic tests do not prove a student attended or spoke.
- **School security:** default no Google login for pupils only after privacy and access gate approved; password rotation, brute-force protection, CSRF/abuse limits, sensitive access checks and owner release readback required.
- **Accessibility and inclusion:** nonvisual keyboard controls, high contrast, language set, screen-reader transcript, adjustable text and captions; WCAG 2.2 audit and low-bandwidth mobile UAT remain OPEN.

## 9. Outcome measurement (future UAT study, not already measured)

**Primary individual learning outcomes:** independent English speaking (observable oral rubric after teacher review), factual accuracy of one site claim with source trace, ability to revise English after feedback, comprehension from audience interaction. **Group outcomes:** approved 6-scene Vlog, citation/rights check, equitable role rotation, revision evidence. **Process indicators:** number of inquiries, read/approved feedback, subgroup contribution, elapsed visible time; process metrics MUST NOT be used as proxies for school grades.

Design option: before/after individually scored P6 performance task, counterbalanced/ethically assigned scaffold intensity (without denying baseline support), teacher calibration and fidelity observation, consent/minimal logs, missing data disclosure, falsification checks, no causal claim without suitable design.

## 10. Deliverable and release semantics

**Built in source (V18 candidate):** \`pbl/v18/index.html\`, \`app.js\`, \`adaptive.js\`, \`coach.js\`, \`coach.css\`, \`gas/Code.gs\`, \`gas/V18Coach.gs\`. Public demo learns with deterministic guided responses and fictional messages; multi-user sharing across browsers is **NOT** claimed before school server is deployed.

**Not yet built / gates:** true generative AI provider; owner-approved teacher-source RAG, school real child auth, native GAS PROD, migration of 22..28 addenda, retention/consent, membership history snapshot, moderation, video upload/store, teacher-developed official rubrics, verified 3-class concurrent load and privacy audit.

**Reproducibility:** GitHub release commit, full original source, source-register DOI/links, deterministic browser and fake GAS VM tests, Drive KB doc and canonical source/module/gap/version/QA registration. No PII in GitHub source or Drive KB.

**Rights:** HTML/JS created for this PBL project is original. External open-source repositories remain upstream; do not copy full vendor source or redistribute article PDFs without checking precise license and access permission. Link directly to source and preserve source URI, license and version. Accessible web link is not proof of authorized redistribution or available binary in the school's Drive.

## 11. Authoritative URL ledger (checked as source pointers in this research)

- V17 code: https://github.com/matra16/t3-academic-public-portal/tree/main/pbl/v17
- V17 DNA KB: https://docs.google.com/document/d/1mln_OVv9s5dirktT-7WiNOdHJDys5Xl0WAFZe3n1ENg/edit
- R6 existing workflow source: https://docs.google.com/document/d/1Gor4-gWjlQajkr7kjoMJmSoXjTBsxbL1qGYS8zk0vVA/edit
- UNESCO GenAI guidance: https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research
- UNESCO student AI competency: https://www.unesco.org/en/articles/ai-competency-framework-students
- UNESCO teacher AI competency: https://www.unesco.org/en/articles/ai-competency-framework-teachers
- Council of Europe CEFR in classrooms: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-in-the-classroom
- CEFR 2020 official companion: https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4
- PBLWorks Gold Standard: https://www.pblworks.org/what-is-pbl/gold-standard-project-based-learning
- Moodle AI tools: https://docs.moodle.org/502/en/AI_tools
- Moodle AI plugin code documentation: https://github.com/moodle/devdocs/blob/main/docs/apis/plugintypes/ai/index.md
- H5P Interactive Video: https://github.com/h5p/h5p-interactive-video
- H5P editor for Interactive Video: https://github.com/h5p/h5p-editor-interactive-video
- Canvas submission open-source: https://github.com/instructure/canvas-lms/blob/master/app/models/submission.rb
- Open edX grades data model: https://docs.openedx.org/projects/edx-platform/en/latest/references/docs/lms/djangoapps/grades/docs/data-model.html
- ADL xAPI Statement Data Spec: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md
- 1EdTech Caliper: https://www.1edtech.org/standards/caliper
- 1EdTech OneRoster: https://www.1edtech.org/standards/oneroster
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Nature AI RCT DOI: https://doi.org/10.1038/s41598-025-97652-6
- Brown 2026 RCT DOI: https://doi.org/10.26300/y3f8-vh05
- School SRL AI 2026 RCT: https://doi.org/10.1007/s10648-026-10133-8
- Elementary AI engagement RCT: https://doi.org/10.26300/pz7p-p388
- Tutor CoPilot RCT: https://doi.org/10.26300/81nh-8262
- Structured AI+group 2026 RCT: https://doi.org/10.1080/00220485.2026.2695361
- Voice modality 2026 preprint: https://arxiv.org/abs/2609.23958

**Last source verification:** 2026-11-09. Some URLs are rolling \`main\`/\`latest\` pages and their contents may change; a stable GitHub commit and DOI should be captured in future research revision when available. This dossier explicitly distinguishes DOI access, publisher abstract, and code-level inspection; not every PDF full text or vendor repository was downloaded or inspected.
