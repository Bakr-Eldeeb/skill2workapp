# Skill2Work — Real Platform Experience (V4)

Incremental upgrade of the latest V3 source. See V4_CHANGELOG.md, V4_SCREEN_MAP.md and V4_TEST_REPORT.md. Previous V3/final reports describe historical versions. No public repository has been changed or deployed.

## Windows: extract and start

Use **Node 24.15+ within 24.x**, **Node 22.22.3+ within 22.x**, or **Node 26.x**. Tested with Node **24.22.1**, npm **11.9.0**, Angular **22.2.6**. Compatible dependencies are pinned in package-lock.json; do not replace TypeScript with an unsupported major version.

Extract the ZIP, then open PowerShell or Command Prompt **inside `skill2work-angular`**, beside `package.json`:

```powershell
node --version
npm --version
npm ci
npm start
```

Open **http://localhost:4200/**. No Git repository, API account, SQL Server, .NET service or secret is needed. Use fictional data only.

### If port 4200 is occupied

First stop the earlier Angular terminal with **Ctrl+C**. Then run `npm start` again; the default remains 4200. If you cannot find the terminal, identify the listener before stopping anything:

```powershell
Get-NetTCPConnection -LocalPort 4200 -State Listen | Select-Object OwningProcess
Get-Process -Id THE_PID
```

Stop that process only if it is your old development server (Task Manager → Details can also identify it). As a nondisruptive alternative:

```powershell
npx ng serve --port 4201
```

Open http://localhost:4201/. A different host/port is a different browser origin and has separate demo storage.

## Seed credentials

All seed accounts use **Demo123!**. Settings never prints/prefills current passwords. Blank New password means keep the current password.

| Role         | Email                      |
| ------------ | -------------------------- |
| Candidate    | candidate@skill2work.demo  |
| Company      | company@skill2work.demo    |
| University   | university@skill2work.demo |
| System Admin | admin@skill2work.demo      |

More accounts and the cross-role walkthrough are in [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md). Separate sign-ins are required for roles. New companies need Admin approval; university accounts are Admin-created.

## Simpler workspaces

- Candidate: jobs first, My Skills with Passport/Results tabs, Applications, affiliated Fairs; Profile/Settings are secondary. Anyone can apply without assessment.
- Company: jobs/drafts, candidate discovery with All/Recommended views, one Applicants & Hiring workspace, fairs and profile.
- University: fair creation and Overview/Companies/Registrations/Jobs sections, aggregate-only analytics.
- Admin: company approvals and university accounts.

Shared Back controls use role-safe internal history or the appropriate parent after refresh/direct access. Old routes such as `/candidate/passport`, `/candidate/results`, `/company/recommendations`, `/company/pipeline` and `/university/registrations` still work.

## Demo state and assessment boundaries

The dataset contains 50 fictional Egyptian candidates, 10 fictional companies and 3 universities including ECU. Data persists across refreshes/sign-ins at the same browser origin and synchronizes through storage events. It is not shared between devices. Settings → Reset demo data asks for confirmation and restores fixtures.

Local authentication is deliberately demo-only: passwords are stored locally as fixtures, and route guards are not production security. Do not use personal information or a real password.

Assessments are text-only **Demo Simulation**, not LLM grading. Fixed scores do not evaluate answer quality. Full initial assessment targets all unassessed claims; eligible full reassessment targets evaluated skills beyond the 24-hour cooldown. Easy/Medium/Hard use 4/6/8 questions per targeted skill with `Math.round(count * 0.3)` MCQs and the remainder open-ended. Demo timer duration is `DEMO_QUESTION_SECONDS` in `src/app/core/assessment.ts`. Server-controlled timing is future API work.

Typed drafts recover in the same tab. Timeouts preserve partial text and store a separate timeout status, never an invented response. Recoverable errors retain the attempt; deliberate cancellation asks before discarding it. Newest successfully saved results replace previous visible skill results. Practice/preview disclosures are concentrated in assessment/result details and the dedicated Technology page. No genuine AI verification is claimed.

Jobs use per-Must-Have minimum assessed scores (0–100), with optional Nice-to-Haves and no employer-entered weights. Required Skill Evidence Score is the arithmetic mean across all Must-Haves; missing/unassessed adds no evidence contribution. With none assessed the score is absent. Coverage and eligibility are separate. Eligible recommendations sort by required evidence score, assessed optional count, optional average, career-track overall, then candidate ID. Overall still uses separate career-track importance weights. Applying never requires assessment.

## Profiles, media and fair tickets

Candidate Profile is view-first with structured education/experience and multiple projects (code, design, video or live site). Approved signed-in recruiters see the same complete read-only profile and contact details; public visitors cannot. Company and University profiles use one shared organization presentation, with authorized editing only. University analytics is aggregate-only; registration tickets contain identities only within that university's fair management.

Image uploads accept JPG/PNG/WebP up to 5 MB, resize to at most 1400px, encode WebP and cap the stored blob at 400 KB. IndexedDB stores media; snapshots store references. A bounded small-image data URL fallback is used when IndexedDB is unavailable. Quota/decode failures preserve the saved profile and show an error. Media remains on the same browser origin and is not a server upload. Source ZIPs do not contain users' uploaded browser media.

Version 2 snapshots retain the existing localStorage key and accounts. Migration removes employer skill weights, preserves required minimums, strips optional minimums, adds profile collections and stable opaque ticket tokens, and preserves applications/interviews. Invalid legacy requirement lists become repairable drafts. Do not clear browser storage to upgrade.

Fair registration creates a correct QR using the bundled `qrcode` encoder. It encodes only an opaque random token, not Student ID or contacts. The candidate can download a complete ticket PNG or print; university fair Registration Tickets supports search, individual view/export and a bulk print sheet. Print all clears the search filter. No scanning, check-in, attendance or secure admission feature is provided. Tickets are client-side prototype presentation artifacts, not secure credentials. They are consistent across roles in ONE browser only: another device/browser cannot see these registrations without a future shared backend. University changes cancel previous registrations.

## Build and verification commands

```powershell
npm run build
npm run test:source
npm run test:domain
npm run test:dom
npm run test:ux
npm run test:server
```

`test:dom` builds and executes the real emitted Angular app in Happy DOM. `test:ux` uses that build for behavioral navigation/assessment/password regressions; run it after build or test:dom. DOM is not a visual browser.

For browser tests on a machine that can run Chromium:

```powershell
npx playwright install chromium
npm run test:e2e
```

The Playwright runner starts the app if needed. Browser binaries and screenshots are not shipped. This delivery environment could not launch Chromium; visual quality, mobile clipping, focus rendering and animation appearance are explicitly **unverified**. See V4_TEST_REPORT.md for current results and limitations.

## Architecture and future backend

`core/store.ts` is the signal-backed domain facade. `demo-persistence.ts` isolates storage behind a token; `assessment-engine.ts` defines the asynchronous simulation/provider boundary. `matching.ts` contains pure scoring/validation. Feature pages use facade commands rather than editing localStorage. Shared headers/Back/loading/scores and semantic CSS tokens keep the UI consistent.

[API_INTEGRATION.md](API_INTEGRATION.md) describes ASP.NET Core/SQL Server/LLM/integrity-service boundaries. No API key is in the frontend. Real authentication, authorization, grading and integrity review must live on the backend.

## Optional GitHub Pages

The previously requested Pages configuration is included. See [GITHUB_PAGES_AR.md](GITHUB_PAGES_AR.md). `npm run build:pages -- /YOUR_REPOSITORY/` and `npm run test:pages` verify the hash-routing variant; the workflow reads the repository base path automatically. Remote publication requires your GitHub connection and a successful deployment; no published URL is claimed.
"# skill2workapp" 
