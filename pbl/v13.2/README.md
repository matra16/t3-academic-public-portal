# PBL LMS V13.2 — single-title home page

- Removes the redundant top header **from HTML entirely**. Classroom title appears once as the visible main heading; existing footer and student-first flow remain.
- Admin remains below student card, opens existing dark login modal; static GitHub Pages is demo-only and cannot collect real school passwords.
- Logout is retained in a session-only floating control; it does not appear on the initial page.
- No P6 school roster, GAS deployment, database, access policy or other previous version modified.
- Synthetic Chrome QA: **63/63 PASS** at desktop 1440×900, mobile 390×844 and compact mobile 320×568; JavaScript syntax PASS, zero browser errors.
- Proposed public route: https://matra16.github.io/t3-academic-public-portal/pbl/v13.2/
