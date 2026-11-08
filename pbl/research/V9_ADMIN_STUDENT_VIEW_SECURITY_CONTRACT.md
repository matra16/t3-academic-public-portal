# T3 PBL Classroom V9 — Admin Workspace and Student View Security Contract

Project: PBL_LEARNING | Date: 2026-11-08 | Stage: PUBLIC_CONFIG_AND_STUDENT_PREVIEW_DEPLOYED

## Canonical release and immutable readback

- Student classroom: https://matra16.github.io/t3-academic-public-portal/pbl/
- Admin workspace: https://matra16.github.io/t3-academic-public-portal/pbl/admin/
- Release-pinned V9 student link: https://matra16.github.io/t3-academic-public-portal/pbl/v9/
- Source: existing GitHub Free public repository `matra16/t3-academic-public-portal`, directory `pbl/`, branch `main`.
- Main student index release commit: `4e496033ce6dc0bcb503587060c453206df0c5a9`.
- Version-pinned V9 student HTML commit: `c45678f533dd38cdd6fab67bc9db560f6328ea5d`.
- Admin student preview pinned-route commit: `ba9ea8dad6d072d8a20249dbd8c138b14370239c`.
- The previous student V8 page remains in Git history for rollback. PBL TRACK production, school Apps Script services, original school academic portal homepage and canonical 22-tab Master were not modified by website release.

## Actual scope — role and privilege matrix

| Access context | Can access? | Can read student private records? | Can modify system config? | Data persistence |
| --- | --- | --- | --- | --- |
| Public visitor to `/pbl/admin/` | Yes, page contains non-sensitive public status | No | No, browser draft only | No |
| GitHub contributor with repository write permission | Yes | Not through public site | Yes, *only* via authenticated GitHub editor/review/commit | Public versioned JSON |
| School admin SSO / teacher RBAC | Not implemented in this public V9 frontend | Not implemented | Not implemented | Would require private server |
| Public student page `/pbl/` | Yes | No authenticated roster | No | Existing browser-local practice |
| `?view=learning&preview=admin` | Yes, read-only preview (not privileged login) | Deliberately does **not** read browser-local student notes/logs | No | No local write |
| `?view=learning&role=demo` | Yes, ordinary learner-practice demo | No other people's private server data | No | Locally scoped example notes |

**Crucial:** The public Admin Workspace is a **management surface with a real authenticated GitHub write handoff**; it is *not* a protected school-admin session. The `preview=admin` URL parameter is a non-privileged **rendering restriction**, never proof of administrator identity. No fake "signed in as school principal" state, client passwords, tokens or claims of server RBAC are allowed.

## User-facing V9 details

- Separate Admin UI in **Dark only**; student UI remains light and retains Sarabun.
- Admin overview presents **real public design facts**, not fabricated learner counts or attendance: version V9, 20 learning steps, six place types, current language-switch configuration.
- Admin settings can prepare a validated JSON patch for `pbl/assets/v9.public.json`: `uiLanguageSwitchEnabled` defaults to true and `defaultUiLanguage` to Thai, with English as supported alternative.
- Admin clicks **Copy validated JSON** and **Open GitHub Editor**. GitHub authenticates its own user and verifies repository write privileges before accepting a commit. Draft changes alone do **not** modify public settings.
- Privileged switches for real AI, official group synchronization, centralized logs, and video uploads are explicitly **forced off**; no public JSON edit can make a safe backend appear.
- Student Preview: no read of prior browser-local notes, disabled textarea/save/coach-clear/log-clear controls, no append to local event log, clear banner and return-to-Admin link. Lesson navigation and practice prompts remain available for visual QA.
- Student Practice: regular local demo mode can save synthetic notes. It never impersonates or enrolls an actual learner and cannot access another student/group's server records.
- `/pbl/v9/` provides a fixed release route to avoid stale CDN cache while canonical `/pbl/` propagates; a same-origin relative `<base href="../">` is allowed under CSP `base-uri 'self'`, preserving proper JS/CSS/QR paths and links.

## Access control analysis and references

- GitHub Pages is a static/public site; client-side passwords, disabled buttons, URL flags, or hidden routes cannot provide school-grade administration. See: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- GitHub Pages protected site visibility is limited to qualifying Enterprise Cloud organization contexts, not assumed for this GitHub Free public site. See: https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site
- GitHub authorized contributor edit and commit is the presently available owner-controlled write gate: https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files
- No private pupil names, IDs, personal data, media or secret application tokens are published in Admin/Student V9 assets.

## QA and release status

- Local browser acceptance, authorized Pariphon: **19/19 pass**, including dark Admin, config read, settings draft, GitHub editor URL, no credential fields, individual demo, read-only preview privacy negative tests and 390px mobile.
- Live GitHub Pages Admin: **6/6 pass** on Chrome, dark rendering, published `v9.public.json`, public notice, GitHub permission gate and student route.
- Live immutable V9 student and Admin combined browser QA on Pariphon: **19/19 pass**. Verified localized student entry, real live group/individual demo local-only, immutable draft/preview isolation and mobile.
- GitHub Pages HTTP readback: public admin, V9 CSS/JS/config, version-pinned V9, and canonical student root all HTTP 200 and serve V9 content. Original public academic portal root unchanged.
- **Open:** protected school Admin SSO/RBAC, real learner roster/groups/logs, server-side audit, child-eligible AI provider, filming/publication permissions, owner-signed school PROD/ACL action. These are not covered by V9 public release.

## Next exact approved work

Continue V10/private backend design against the existing PBL Master/API bridge; verify school administrator principal, per-class roles, authorized sessions and versioned config writes under school-controlled deployment. Do **not** treat the current public Admin Workspace or `?preview=admin` as role authentication, do not send learner PII to external AI and do not create a second school database.
