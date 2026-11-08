# PBL LMS V13.1 — Brighter student landing, direct dark Admin login
**Mode:** Public anonymous GitHub Pages visual UI; uses existing V13 project and read-only synthetic previews.

- Student landing: boost vivid turquoise/sky blue/warm amber saturation while maintaining an accessible 40% soft/eye-comfort base. No photographs, cartoon graphics, school imagery, slogans, app version or technical banners in the visible first screen.
- Admin control moved out of the top navigation and below the student sign-in card.
- Clicking Admin immediately opens a full-screen **dark-themed login view**, with username `matra160114`, password field and sign-in control visible; focus goes to password if a real approved Apps Script backend is present. Back/Escape/click outside closes and restores the student theme.
- On public GitHub Pages, password and actual sign-in remain disabled to avoid collecting credentials on a static website. A clearly scoped `ดูหน้าจัดการตัวอย่าง` action opens synthetic read-only sample management; user is not misled that this is a real school Admin session.
- Reuses V12 `apiV12` contract and existing 20 lesson workflow. No new schema, permissions, GAS deploy, student PII, money or production secrets.
- Preserves V10, V11, V12 and V13 routes.
- QA executed 8 Nov 2026: Chromium 1440×900, 390×844, 320×568, plus a synthetic Apps Script-like authorized Admin login: **75/75 checks PASS**. Real school principal and Apps Script deployment remain open human gates.
- Public URL after Pages job completes: `https://matra16.github.io/t3-academic-public-portal/pbl/v13.1/`.
