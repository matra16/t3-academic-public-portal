# PBL English classroom — V13

**Route:** `/pbl/v13/` • **release type:** public, anonymous static student-facing demo only.

Changes from V12: increase visual color saturation/contrast through vivid turquoise, sky blue and a small warm amber accent; maintain legibility. Fix the Admin button apparent failure: V12 opened its panel below the fold and disabled real login on GitHub Pages. V13 moves the dialog into a root-level centered fixed overlay (responsive 320/390/1440), with focus handling, Escape/backdrop close and a working `เปิดหน้าผู้ดูแล` route to **synthetic, read-only admin preview**. No real passwords accepted on GitHub Pages. Preserve student-first name search, 20 learning steps, P6-only source scope, anonymous lesson preview and exact footer `© 2569 พัฒนาโดย Mr.Matra Yodchan`.

**Server adapter:** Reuse existing `pbl/v12/gas/Code.gs` (API `apiV12`), stored with the V12 version and not deployed by this PR. No new DB/roster/schema/API/Google Apps Script deployment required for this visual fix. Owner-approved Apps Script `/exec`, privacy review, back-end identity/password gates and real P6 roster remain separate OPEN gates; do not equate public GitHub Pages with live Admin authentication.

**QA:** static Chrome / mobile modal and learning tests 69/69 PASS on 1440×900, 390×844 and 320×568; zero JS errors. No school student data was used. V10 and V11/V12 remain accessible without modification.
