# PBL LMS V19 — Anyone Public Admin Demo
Version: 19.0.0-public-demo | 2026-11-10
URL: https://matra16.github.io/t3-academic-public-portal/pbl/v19/

This is a **synthetic-data-only public UI preview**. It DOES NOT authenticate school administrators, access student accounts, communicate with Google Sheets/Apps Script, persist evaluations, or release private class information. Admin RBAC and school production remain NOT DEPLOYED.

Includes 9 Admin areas: dashboard, mock learners, mock groups, mock submission reviews, 20 PBL lesson stages, analytics, RBAC blueprint, local-only audit, settings. Browsers may locally generate demonstration CSV exports. Revision actions affect memory only and disappear on reload.

Source lineage: V18.1 GitHub commit fccefca64d09aae7481a0e2727b62742ea4e3c9a. The student learning route is preserved and linked, rather than copied or modified.
Release QA: 21/21 static/mock assertions and 13/13 DOM mock assertions (2026-11-10). Real Chrome browser/UAT and production backend negative-RBAC tests NOT VERIFIED. Never use this preview for real pupil data.
Owner approval: user request to deploy V19 Anyone public demo (2026-11-10). No school Production deployment.
