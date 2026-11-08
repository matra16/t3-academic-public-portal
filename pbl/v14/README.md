# PBL Learning V14 — Adaptive UI for devices and viewports

**Release route:** `/pbl/v14/` on existing public GitHub Pages. Extends V13.2 without modifying earlier V10–V13.2 routes or the canonical student database.

## Scope

- The interface adjusts itself using **actual viewport dimensions, orientation, touch/pointer capability, mobile/tablet user-agent hints, visualViewport changes and available space**, rather than a fixed desktop/mobile CSS breakpoint alone.
- Covers smartphone portrait and landscape, tablet portrait and landscape, notebook/laptop, desktop and compact windows. Browser APIs **cannot reliably distinguish a desktop chassis from a notebook/laptop**, so both use the computer-class layout and the viewport governs fit.
- The first screen adapts typography, spacing, header, icon size, login card, admin launcher, and footer to actual viewport height. On short landscape phones, the lesson-preview and Admin controls share one row.
- Student learning replaces the long on-page 20-step list with an accessible dropdown and back/next controls. The existing 20-step learning content and permissions are preserved.
- Admin management uses four explicit tabs for adding students, managing groups, learner accounts and group overview. Controls remain interactive only when original backend permissions allow them.
- Window resizing, orientation change, mobile keyboard appearance and font loading refresh the layout automatically.
- **No visible page-level vertical/horizontal scrollbar tracks**. Outer document is non-scrolling, and the home layout fits within tested viewports. Long learning responses, Admin forms, search suggestions, and enlarged accessibility text remain *internally scrollable without a visible scrollbar* to avoid truncating content; touch, keyboard, and wheel scrolling still work. It is not technically safe to promise that every possible browser zoom/font scale can fit without any scrolling.
- No cloud AI inference or device fingerprinting. Device adaptation is local, deterministic, data-minimizing, fast and free.
- Reuses original V13.2 UI and JavaScript/API contracts, preserves dark Admin dialog, sample student name-search and footer. Static GitHub Pages is still demo-only, and no real Admin/student credentials can be entered until owner-authorized Apps Script deployment.

## QA (synthetic browser checks, 8 Nov 2026)

**221/221 PASS** across 16 browser viewports: 320×480, 320×568, 360×640, 375×667, 390×844, 430×932, 600×800, 768×1024, 800×600, 1024×768, 1366×768, 1440×900, 1920×1080, 844×390, 667×375 and 1024×600. Covers no horizontal overflow, screen-fitting first-page controls, footer visibility, keyboard-safe Admin dialog, compact lesson navigator, all 20 milestones, Admin tabs, no demo data writes, rotation/resizing and zero JavaScript page errors.

**Release gate:** Public safe-preview Pages only. Real roster, student accounts, secure server login and GAS /exec require separate school-owner approval, private data source review and native release QA. No new database, permissions, external AI cost or real student data used.
