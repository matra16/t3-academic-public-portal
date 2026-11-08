# T3 PBL Classroom V6 — GitHub Pages Public Classroom
Project: PBL_LEARNING | Date: 2026-11-08 | State: DEPLOYED_VERIFIED on GitHub Pages, public content only; 2026-11-08 11:02 ICT.
Canonical Pages site: https://matra16.github.io/t3-academic-public-portal/pbl/
GitHub repo reused: matra16/t3-academic-public-portal (PUBLIC, existing Pages).
App scope: P.5–6 English PBL demonstration lessons only. The hero heading is ระบบห้องเรียนโครงงาน; do not publish any "ทุกคนเข้าได้" claim.

## Source / Architecture
The five public static files to publish under pbl/ are index.html, assets/styles.css, assets/app.js, assets/qrcode.min.js, assets/QRCODE_LICENSE.txt. No new database, GAS deployment, authentication, server-side API or cloud write introduced. Existing PBL LMS V2 GAS stays available solely as independent rollback; no GAS iframe, redirect or link in V6 student UI. This eliminates the Google Apps Script attribution banner through actual standalone hosting (not CSS concealment). Existing school admin/PBL TRACK admin is unaffected and remains Dark-only.
Noto Sans Thai loads from Google Fonts CSS. Tahoma is the offline fallback. Google Fonts may receive normal website request metadata, but no classroom-specific learner data is sent to the font provider. The QR library is self-hosted under its license (see assets/QRCODE_LICENSE.txt). No external URL shortening or QR libraries are used.
QR links use the same GitHub Pages origin and only public class slug query parameters (clean-school, my-community). Browser nickname, avatar and notes stay in localStorage on this domain and are not official submissions. Previous browser-local notes stored under the GAS origin do NOT automatically transfer to the new GitHub Pages origin.

## Publishing / Rollback
Target: reuse current Github Pages main branch /root publication. New files are only under pbl/, and existing portal index.html/README.md/Apps Script script or canonical DB must remain unmodified. Validate no pbl/ path existed before upload.
Rollback by restoring or removing the pbl/ folder in the GitHub repo, without altering the existing portal. V2 GAS deployed URL is kept unchanged.
Release gates: Node syntax, no GAS references, browser title/font/QR, live GitHub Pages HTTP200 and Chrome incognito. GitHub Pages may take time to publish, so do not claim live success based only on a GitHub file commit.
## Live V6 acceptance readback
- GitHub Pages `https://matra16.github.io/t3-academic-public-portal/pbl/`: uncookied GET HTTP200 and displayed T3 PBL Classroom V6 in actual Chrome Incognito. No Google Apps Script attribution banner in the page (not served from script.google.com). No claim of universal learner access.
- Static assets CSS, JS and local QR library returned HTTP200 and expected content types.
- Actual Chrome share screen displayed a QR for `?class=my-community`, with public GitHub Pages URL, Copy Link, Print QR and homepage link.
- Headless Chrome DOM for `?class=clean-school` opened the lesson view (lesson section visible; home section hidden), title Our Clean & Green School present.
- Noto Sans Thai stylesheet responded HTTP200 and rendered in desktop live browser; Tahoma fallback exists. Protected Admin is separate, Dark-only policy unchanged and not modified in this public site.
- Existing public portal root `index.html` unchanged, no new DB, repository, GAS project or learner identity information.
- Local exact checkpoint and screenshots: `C:\Users\parip\PBL_LMS_V1_DEPLOY\V6_STAGING_GITHUB_PAGES`.
