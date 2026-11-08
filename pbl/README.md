# T3 PBL Classroom V7 — Public Project Learning Classroom (English P.5–6)

Status: DEPLOYED_VERIFIED_PUBLIC_ONLY | Date: 2026-11-08 | Project: PBL_LEARNING
Home: https://matra16.github.io/t3-academic-public-portal/pbl/
Existing repository: matra16/t3-academic-public-portal, only pbl/ content updated. No additional GitHub repository, database, Google Apps Script or student authentication created.

## Student experience
- Professional LMS-inspired landing page with permanent navigation, one primary course action, four-step PBL learning pathway, two public synthetic sample course cards, and actual browser-local notes count.
- Thai and English UI switcher is always visible. Runtime translation covers the home, navigation, course search, cards, lesson instructions, notes, toasts, profile, accessibility labels, QR sharing, footer, page title and description.
- Localization dictionaries have 119 matched keys in each language. Initial locale order: ?lang=th/en, saved V7 preference, compatible V6 profile language, default Thai. All UI state updates without a full page reload. English communicative learning prompts stay English for language-learning purposes, marked with HTML lang=en.
- Thai typeface is Google Fonts Sarabun, weights 400–800 with local fallback Tahoma/Leelawadee UI. Font actually loaded in Chromium QA.
- Browser notes/profile retain existing GitHub Pages V6 localStorage keys on the SAME origin. Unsaved drafts remain intact if learners switch interface language; nothing is saved to school servers.
- Local QR library, no external URL shortener; QR destination includes only public class slug and selected language. Mobile tested at 390px Thai/English, without horizontal overflow.

## Public code and URLs
- pbl/index.html — V7 public page; no iframe/link to GAS.
- pbl/assets/styles-v7.css — student light palette, Sarabun typography and responsive layout.
- pbl/assets/app-v7.js — local content, translation state, notes and public QR.
- pbl/assets/qrcode.min.js and license — existing local copies preserved.
- pbl/research/V7_LMS_BENCHMARK_REVERSE_ENGINEERING.md — documented comparison of Canvas, Moodle, Google Classroom, Open edX and Adobe Learning Manager with exact official sources and privacy boundaries.
- Examples: ?class=clean-school&lang=th and ?class=my-community&lang=en, no student PII.

## Release readback and QA
- Release commit: 7c0b76c8c94be471d77691a88dd2a372f568c680; older V6 contents preserved in Git history.
- GitHub Pages HTTP200 live home, CSS, JS; Chrome Incognito live tests 10/10, including Sarabun loaded, locale switch, localized QR and deep link. Local browser behavior tests 33/33. Static dictionary/contrast checks 360/360. Device-emulated 390px layout no horizontal overflow in TH/EN.
- The older school-owned PBL LMS V2 GAS Script and V3 deployment remain separate and untouched; this frontend is not served from GAS, therefore it has no Apps Script attribution bar.
- Protected Admin: no implementation in this public site; the separately protected Admin Dark-only policy remains unchanged. PBL TRACK OS Public V34/Admin V31 remain untouched.

## Security, privacy, scope and rollback
- Public demonstration course content only. No real student rosters, login, grades, assignments, submissions, feedback records, protected administrative APIs or private Drive/Sheet access.
- Google Fonts requests may reveal standard network metadata to Google; no student identifiers are sent.
- Notes on a shared browser may be visible to others using that browser. The clear-local-data action is provided.
- Restore the prior pbl/index.html and assets through GitHub commit history to roll back; main academic portal root index was not modified. School official learning records and Admin capability require separate authorization, RBAC, schema and privacy assessment.
