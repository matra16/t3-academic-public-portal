# PBL LMS V18 — Vlog AI Coach (guided public demo) + detailed learning-event ledger
**Date 2026-11-09 | Project PBL_LEARNING / P6 English | School PROD gate OPEN**

## Public feature delta after V17

V17 remains unchanged. V18 is a scoped addition to Grade 6 English community-place Vlog production, not a reimplementation of the LMS.

- In the 20-stage learner studio, each step now has a Vlog Project Coach with a place picker: school, temple, market, community or other. Questions are tailored to real site research, English speaking, a six-scene storyboard, permission and film safety.
- Students can switch between **personal** \`USER:<uid>\` and school-assigned **team** \`GROUP:<id>\` contexts. The visible web preview demonstrates isolated fictional threads within that browser tab. It does not sync personal/group talk across devices.
- Socratic help offers one sentence frame and follow-up questions rather than a complete Vlog or fabricated site history. It is **deterministic guided practice**, NOT a generative-LLM response. The demo requests no paid API or external AI inference. Data is not sent to school or outside provider.
- Existing V15 offline/locally available British speech, V16 cohort/group Admin, V16.2 per-learner/group analytics/A4 and V17 feedback/revisions remain.
- Admin dark tab **กิจกรรมและประวัติการเรียน** provides per-learner / per-team event rows and four summary counters. Public demo uses fictional event data only.

## Staged school backend (not installed)

\`gas/Code.gs\` routes authenticated role-checked:
\`coachSessionStart\`, \`coachHistory\`, \`coachAsk\`, \`learningEvent\`, \`adminLearningAnalytics\`.

\`gas/V18Coach.gs\` implements:
- derived actor/group/class scoping from server session; P6 restrictions;
- session IDs with cache TTL; deduplicated request IDs; bounded text (500 chars); PII-pattern screen; client event allowlist;
- **two-row message record** under a script lock for user question and guided response;
- append-only timestamped learner events with pseudonymous ActorUID/OwnerKey, step, session and duration metadata; no raw text/voice in event ledger;
- Admin-only analytics; student access only to own personal or current approved group thread;
- manual \`ownerSetupV18Coach_()\` creating **two proposed tabs** in the same existing canonical school master **only** after approval and backup, never from public RPC.
  \`27_LMS_COACH_MESSAGES\` and \`28_LMS_LEARNING_EVENTS\` are additive **not existing** physical tabs.
- required private Script Properties: \`PBL_V11_MASTER_ID\` for existing controlled account tables; \`PBL_V18_SCHEMA_APPROVED=YES\`, \`PBL_V18_CHAT_CONTENT_APPROVED=YES\`; for currently membership-scoped group access \`PBL_V18_GROUP_HISTORY_APPROVED=YES\` requires human governance. Enabling these flags before privacy/permission/membership snapshots are validated is **not acceptable for PROD**.

**Critical:** Real group chat history lacks an immutable membership-effective-date snapshot (owner gate required), and proposed real AI provider integration is NOT implemented. A production child-facing generative AI assistant needs an approved provider/age/retention/consent contract, source-grounding/RAG, tested hallucination and safety guards, server-only keys, quotas, owner data-processing agreement and school UAT. Do not reuse the public six-digit demo PIN as a school secret.

## Test evidence (synthetic only)

- Browser: **120/120** PASS across desktop 1440×900, phone 390×844, tablet 768×1024 and compact 320×568. Validated both student scopes, topic-specific text and step navigation, Admin 7 tabs, V17 feedback, V16.2 progress, V15 voice, no JS errors and no horizontal overflow.
- Node VM staged GAS: **48/48** PASS on synthetic P6 and non-P6 accounts. Checked owner gate, Admin password change, no anonymous/other student access, session ownership, parallel distinct team keys, PII screening, idempotence, retries, event log schema, Admin-only analytics and text redaction.
- These **168 checks** are NOT a real-school student UAT, not full privacy security review, not an AI learning-quality validation and not production concurrent load testing.

## Research and reusable code

Read [RESEARCH_DNA360_AI_COACH_VLOG.md](./RESEARCH_DNA360_AI_COACH_VLOG.md) for the detailed 64-domain engineering matrix, 20-step learner workflow map, 2025–2026 RCT evidence (mixed effects), Socratic coaching theory, role/permission threat map, standard/source URLs and implementation gaps.

Code files: [student+admin HTML](./index.html), [original app bridge](./app.js), [responsive tabs](./adaptive.js), [coach UI](./coach.js), [bright/dark styling](./coach.css), [staged main GAS](./gas/Code.gs), [staged coach/evidence ledger](./gas/V18Coach.gs).

**Owner gates before school child accounts:** reconcile WEBAPP-4WAY-WF-001 CURRENT with user baseline conflict; B1 quota/provider, B2 adoption ADOPT-014, B3 WM-010, principal ACL, root binding, existing 22-tab Master (no addenda 22–28 yet), identity and retention approval, group membership versioning, pre-write backup, non-PII dry run, protected teacher authenticated UAT, performance/concurrency quota, school legal privacy/consent, separate PROD authorization, rollback and live readback. No automatic paid third-party AI top-up.
