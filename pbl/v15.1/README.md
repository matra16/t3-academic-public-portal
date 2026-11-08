# PBL LMS V15.1 — Immediate Admin password entry

Public route: `/pbl/v15.1/`. Baseline: V15 British speaking laboratory (unchanged).

**Requested UX change**
- Admin login password is now immediately editable and submit is enabled in the GitHub Pages preview. Focus goes directly to the password field when the dark Admin window opens.
- User-requested initial PIN: `160114`. On **static GitHub Pages only**, this is a **demonstration PIN** unlocking the existing **synthetic, read-only** Admin screen. It is NOT school authentication. No real roster, passwords, audit logs or groups can be modified through this demo.
- Wrong PIN is rejected with an inline Thai message; correct demo PIN clears the field and enters the mock Admin. The separate mock shortcut button and “waiting to open account” label are removed from the visible Admin flow.
- Demo Admin displays an explicit notice that the roster is fictitious and saving school records is unavailable.
- Under a real, school-owner-authorised Apps Script backend, the adapter does **not** install or accept this public demo PIN. The existing server `apiV12('login')` authenticates the user. A genuine initial Admin password needs private server-side configuration and forced replacement, rate limiting and owner approval, not a public 6-digit password in source code.
- V14 responsive/auto-focus/search + V15 British listening/speaking + all earlier URLs remain unchanged. No added database, permissions, paid API, real child data or GAS deployment.

**QA** (synthetic only, 8 Nov 2026): Chrome 1440×900, 390×844, 320×568, 844×390 plus mocked protected Apps Script: **99/99 PASS**. Includes PIN success/failure, immediate focus, no network POST from demo, no storage of entered PIN, no school-data writes, responsive learning studio, real server rejecting the public demo PIN, 20 PBL lessons, V15 voice studio and zero JavaScript errors.

**Status**: Github Pages public preview release, **NOT verified school production login**. Real GAS /exec and student roster remain owner/privacy release gates.
