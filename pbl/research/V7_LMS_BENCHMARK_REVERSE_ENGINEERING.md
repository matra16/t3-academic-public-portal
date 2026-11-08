# PBLH V7 — LMS Homepage Reverse Engineering and TH/EN Localization Research

Project: PBL_LEARNING | WorkID: PBLH-V7-UX-I18N-20261108
Research date: 2026-11-08 | Source category: official public LMS help, public developer documentation, W3C accessibility standards.
Status: RESEARCH VERIFIED; implementation local QA pass; live publication to be verified separately.
Scope boundary: only functional UX reverse engineering based on publicly available pages and documented behavior. No login bypass, private-data acquisition, source copying, decompilation or fabricated student data. Reuse canonical 22-tab PBL Master and existing GitHub Pages path. Protected Admin dark-only; untouched.

## Comparative LMS evidence and specific V7 decisions

1. Canvas LMS (Instructure):
- Source: https://community.instructure.com/en/kb/articles/664620-how-do-i-use-the-dashboard (updated 2026-10-17)
- Source: https://community.instructure.com/en/kb/articles/664424-how-do-i-customize-my-dashboard-as-a-student (updated 2026-09-16)
- Source: https://community.instructure.com/en/kb/articles/662893-unknown (language preference, updated 2026-10-05)
- Observed from docs: global navigation, Course Cards, List or Recent Activity dashboard; customizable student widgets based on availability, and language preference can be overridden at course level.
- Adaptation: top-level Home / Projects / How it works / My space nav, meaningful course cards and a clear primary action. Do not invent fake deadlines, grade cards, unread counters, submission statuses or enrollment information.

2. Moodle LMS:
- Source: https://docs.moodle.org/en/User_quick_guide (My courses, search and course overview)
- Source: https://docs.moodle.org/502/en/admin/setting/langsettings (language preference and force-language hierarchy)
- Source: https://docs.moodle.org/dev/String_API (localized string identifiers)
- Observed from docs: course discovery cards, filtering, and explicit site/course/user language configuration; string identifiers instead of hard-coded translated pages.
- Adaptation: classroom search, localized message keys, language-aware course data, translated labels and actions. A public student sample must not gain a fake teacher setting or secret admin control.

3. Google Classroom, updated 2026:
- Source: https://support.google.com/edu/classroom/answer/17231999?hl=en
- Source: https://workspaceupdates.googleblog.com/2026/07/redesigned-google-classroom-homepage-with-tailored-views-based-on-users-role.html (2026-07-21)
- Observed from docs: role-tailored homepage with tasks and course cards; learners may see upcoming work while teachers see review modules; empty modules can disappear.
- Adaptation: give students short, obvious next actions; summarize only the 2 actual public sample projects and the notes genuinely stored on THIS browser. Since no authenticated roster or assignment API exists, V7 does NOT pretend to show school coursework due or class grades.

4. Open edX:
- Source: https://docs.openedx.org/en/latest/learners/concepts/open_edx_platform/what_is_course_dashboard.html
- Source: https://github.com/openedx/frontend-base/blob/main/docs/how_tos/i18n.rst
- Source: https://help.edx.org/edxlearner/s/article/How-can-I-change-the-language?language=en_US
- Observed from docs: real course statuses and filters, runtime locale switching, translation key files, current-session update, locale persistence, html lang changes, supported-language/fallback rules. Site UI language and course content translation need not be identical.
- Adaptation: 119 matched TH/EN locale keys; runtime rerender of navigation, home, classroom cards, steps, notes, profile, QR, accessible labels, toast messages, title/meta description. Thai guidance and English guidance both authored; English learning prompts and useful frames stay English intentionally.

5. Adobe Learning Manager (comparison only):
- Source: https://experienceleague.adobe.com/en/docs/learning-manager/using/learner/learner-home-page (2026-10-07)
- Observed from docs: redesigned learner home uses a masthead, concise widgets and structured cards; features depend on edition/rollout and mobile availability.
- Adaptation: visually clear content hierarchy; no imitation of proprietary graphics, no enterprise upsell widgets and no pretend licensed features.

## Accessibility and Thai font choices

- W3C reference: https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html
- W3C reference: https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts
- W3C reference: https://www.w3.org/International/questions/qa-html-language-declarations.en
- Sarabun source: https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap
- User-specified font is Google Fonts Sarabun, not TH Sarabun New. Sarabun loaded on the client; Tahoma and Leelawadee UI fallback. Google Fonts may see normal request metadata, never learner ID.
- Locale immediately controls HTML lang=th/en and updates page title, accessibility labels, placeholders, feedback, course card content, forms, sharing labels and notebook messages. English target-language phrases are marked lang=en, including in the Thai interface. Keyboard focus, mobile menu, 390px no-overflow test, reduced-motion and readable contrast apply.

## Project-based learning structure (Gold Standard PBL informed, not misrepresented)

- Home hero: authentic question / explore / create / present-reflect preview, no fabricated course progress.
- Course discovery: two synthetic example projects only, with public case descriptions.
- Lesson view: meaningful English question prompts, useful sentence frames, Thai/English task support, local drafts, reflection, optional self-notes.
- Public QR: GitHub Pages URL with allowlisted class slug and optional non-sensitive locale, no third-party shortener.
- Actual separate school learning management features (group submission, rubric evidence, feedback, score, class roster, official due date, individual grade) remain OPEN_GAP and require owner-approved schema, RBAC, consent and validation.

## V7 localization contract and test coverage

- Locale priority: explicit URL ?lang=th/en; saved V7 locale; compatible V6 profile.language; default Thai.
- Persistence: V7 language key stored locally; existing GitHub Pages V6 note/profile keys reused on same site origin. Draft text kept in memory when switching languages; stored learning notes not translated or overwritten.
- Translating both interface and pedagogical instructions is intentional; English communicative prompts and sentence models remain in English to preserve PBLL outcomes.
- Negative tests: no runtime Google Apps Script, no /exec iframe or attribution banner, no fake grades, no private Google Drive/Sheets student API, no project registry duplication, no protected Admin theme changes.
- Isolated local static QA: 360 of 360 checks pass, including 119 complete keys per language and 5 sampled contrast checks above 4.5:1.
- Isolated Chrome interactions: 33 of 33 checks pass, including language switching during unsaved note entry, search, English scaffold, save note, share QR URL locale, profile, menu and actual Sarabun loading.
- Chrome CDP emulated smartphone 390 x 844: Thai and English viewport/document/body widths all 390, no horizontal scroll, mobile menu visible and translated.
- Test screenshots and DOM are saved on authorized Pariphon under C:\Users\parip\PBL_LMS_V1_DEPLOY\V7_STAGING_GITHUB_PAGES.

## Product ownership and rollout

- Existing public GitHub repository: matra16/t3-academic-public-portal, path pbl/.
- Publish new V7 CSS/JS assets first; verify 200; then update existing pbl/index.html as final gated commit; preserve V6 in Git history. No repository, DB, GAS script or registry duplication.
- PBL TRACK Public V34 and Protected Admin V31 must not be modified. Existing standalone PBL LMS GAS V2 Version3 remains unchanged and separate.
- Only the public student static classroom is in V7 scope. The separate protected admin surface remains dark-only. Reverse engineering does not authorize copying third-party source code or importing private student data.

Next exact gate: verify live GitHub Pages V7, real Chrome TH and EN, class QR and school-safe release readback, then append the V7 source pointers/version/QA into the existing Master DB without overwriting earlier rows.