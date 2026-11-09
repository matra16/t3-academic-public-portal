# PBL LMS V18.1 — hardening for school-managed Vlog coaching

**Project:** PBL_LEARNING • **Scope:** ป.6/1–6/3 • **Public route:** `/pbl/v18.1/` • **School data:** NOT DEPLOYED • **Date:** 2026-11-10

This release continues **V18** without changing any predecessor URLs, original school root, or the 22 original Master DB tabs. It is a tested **static guided-coach preview** and a **staged/owner-gated** private server adapter, **not** a deployed school LMS with GenAI.

## Verified delta from V18

1. **Group membership-epoch isolation.** The staged GAS `v181GroupEpoch_` derives an HMAC-protected conversation owner key from the **current approved group ID, class and sorted member set** using a secret only in school-controlled Script Properties `PBL_V18_GROUP_SCOPE_PEPPER` (minimum 32 characters). The pepper is never put in GitHub, Drive KB, browser or API response. Any change to a group's member set derives a **new owner key**, leaving the prior thread in restricted school storage and denying new/removed members access to the old thread through student RPC. An old session cannot be used to post to the new membership epoch. A missing pepper **fails closed**. This is an access-isolation measure, not a legal retention or historic consent policy.
2. **Finer-grained Admin-only engagement log overview.** The existing Dark Mode activity workspace gains an expandable summary for **individual actor IDs and team context IDs**, displaying event count, observed session starts, question count, and **estimated** visible-window seconds from bounded 30-second pulses. It excludes raw child's chat content, videos, recordings and password details. The table reflects only the selected log window/filter, not cumulative lifetime achievement or grade. A per-cohort panel retains the 20-step PBL and V17 feedback.
3. **Explicit collection scope and retention readback.** School-side event reports declare `LATEST_500_EVENTS` and truncation, rather than presenting an incomplete window as all-time history. A separate owner-only, **READ-ONLY** `ownerPreviewV181Retention_()` estimates event rows older than 90 days and message rows older than 30 days. It **does not delete** or automatically process child records. Consent/owner data retention policy and permanent export/delete flow remain separate owner gates.
4. **Regression-tested existing flows.** Responsive P6 student welcome/search, fixed personal/15 group task semantics, location Vlog prompts (school/temple/market/community), short English speaking lab, V17 review queue, V16.2 progress and printable reports unchanged.

## School server: STAGED ONLY, not installed

`gas/Code.gs` reuses the existing staged school `apiV12` identity and RBAC. `gas/V18Coach.gs` holds scoped session, chat/event append-only and Admin activity read APIs, now versioned by group membership epoch. The backend uses **the original canonical PBL Master** if and only if an authorised owner deploys it after receiving explicit source/ACL/schema/consent approval.

Proposed additive tabs `27_LMS_COACH_MESSAGES` and `28_LMS_LEARNING_EVENTS` have **not been created**. Existing 22–26 LMS addenda are likewise not live in the current canonical 22-tab Master. Do not make a parallel DB or use public GitHub Pages to publish child identity, notes, password hashes or voice files.

**Mandatory before approved live use:** school-owned authenticated GAS ScriptID/DeploymentID and principals; owner-approved class roster and password onboarding; approved consent, minimum-age/vendor contract, retention and deletion; exact baseline 22-tab backup; approved additive schema with revision/CAS/rollback; HMAC pepper in secret school property; verification of transferred-member history; real concurrent three-class quota/performance UAT; abuse/moderation/security/CSRF controls; documented safeguarding of on-location filming and rights; explicit teacher/owner acceptance. A public `160114` demo PIN does not authenticate a real Admin.

**Generative AI is still not connected.** The locally confirmed desktop has no installed Ollama/LM Studio and approx. 8GB RAM, with no verified local model. The last B1 provider entitlement was historical and did not establish fresh zero-incremental-cost child-safe inference. Do not automatically buy tokens or send any child messages to a provider. The V18.1 "coach" remains deterministic Socratic question guidance.

## Synthetic QA (2026-11-10)

- **Chrome UI**: **136/136 PASS**, 4 viewport profiles: 1440×900 desktop, 390×844 mobile, 768×1024 tablet, 320×568 compact. Tests include Admin 7 tabs, new actor/group breakdowns/filters, coach personal vs team, Vlog place, 20 steps, UK voice, prior feedback/analytics and no horizontal scroll/JS errors.
- **School-shaped GAS VM**: **64/64 PASS**, including all prior 48 baseline tests plus membership change, removed-member deny, stale-session deny, group history continuity separate from other group, new-member deny old messages, sorted member order stable, private-pepper missing fails closed, 12 groups and 36 fictional users distributed across 3 classrooms, group scope and owner-only retention preview. Each synthetic request runs in VM, **not** a genuine simultaneous Google Apps Script load test.
- **Safety:** all accounts, credentials and work content are fictional fixtures. No real student PII or school data writes, no paid provider call, no new Drive/Google Master schema.

## Hand-off

**READBACK**: Main GitHub Pages V18.1 200 + CSS/JS and browser on public route after merge. **Source/version**: PR merge SHA to be filled by actual GitHub readback. **PREPROD acceptance:** 200/200 synthetic PASS. **Owner gate:** REAL_CHILD_DATA, PROVIDER, GAS_NATIVE, SCHEMA, RETENTION, TEACHER_RUBRIC and SCHOOL_PROD still OPEN. **Rollback:** previous V18 URL remains available.

Related background: [V18 64-domain AI Tutor and Vlog research](../v18/RESEARCH_DNA360_AI_COACH_VLOG.md), [V18.1 staged group scoped backend](./gas/V18Coach.gs), [V18 code archive in Active Drive](https://docs.google.com/document/d/1lfWi_cE_iGqGuaYeFCHxNxrGDwIDW2aLrvNEr1U311A/edit), [Active project DNA360 research](https://docs.google.com/document/d/1zyYiJ3OaSEUe8C7vSen3Ul6uZ355uupkH85UiB0jzz4/edit).

**Status contract:** `PUBLIC_DEMO_UAT_PASS` / `PRIVATE_STAGED_ONLY` / `OWNER_GATE_OPEN`. Never `COMPLETE_VERIFIED` for real school use without live signed owner readback.
