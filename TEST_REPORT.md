> **Historical baseline report (before UX & Motion Refined changes).** For tests actually rerun on the modified source, read `UX_TEST_REPORT.md`. Original successful build/DOM/HTTP counts below must not be interpreted as newly executed validation.

# Executed validation report

Task date: 17 November 2026. Environment: Linux cloud workspace, Node 24.22.1, npm 11.9.0. The actual Angular application source was installed, compiled, started and executed through a DOM integration harness. **Real-browser visual QA is blocked, not passed.**

## Executed commands and results

| Command / check                  | Actual result                                                                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `node -v`, `npm -v`              | Node 24.22.1 / npm 11.9.0                                                                                                               |
| `npm install`                    | Passed; project dependencies and lockfile created. Additional dev-only Happy DOM and Prettier dependencies installed afterward.         |
| `npx ng build`                   | Passed; production AOT build, no TypeScript/template errors or final compiler warnings                                                  |
| `npm start`                      | Passed after changing the development host from wildcard to loopback. Server startup and HTTP checks executed by `npm run test:server`. |
| `npm run test:domain`            | **6 passed**, 0 failed                                                                                                                  |
| `npm run test:dom`               | **11 passed**, 0 failed; compiles and runs the actual emitted Angular AOT bundle in Happy DOM                                           |
| `npm run test:server`            | **12 HTTP checks passed**: six SPA routes/titles and six supplied brand/icon assets                                                     |
| `npm run format:check`           | Formatting verification run before packaging                                                                                            |
| ZIP integrity/content validation | Performed before handoff; checks archive CRCs, expected root/source/config/docs/assets, and excluded generated/dependency directories   |

## Domain checks executed

1. Deterministic seed includes 50 candidates, 10 companies, 3 universities; every seeded published job has valid requirements.
2. Exact job match and track-weighted overall formulas; null/no evidence and actual zero score differ; missing/unrelated skills; track changes; case-insensitive matching.
3. Must-Have gate requires every skill assessed and every individual minimum met.
4. Recommendation tie-break order: match, evaluated Nice-to-Have count, overall, stable ID.
5. Publish validation: under/over 100%, empty/duplicate names, no Must-Have, out-of-range thresholds/weights.
6. Easy/Medium/Hard per-skill question counts, full multi-skill coverage, deterministic MCQ rounding, no answer/rubric fields in live question DTOs.

## Compiled Angular DOM journeys executed

These tests drive real rendered Angular inputs, buttons, forms and route handlers in Happy DOM; they do not substitute hand-written static HTML or bypass the UI to execute the workflow.

1. **39 protected routes/subviews** across Candidate, Company, University and Admin render meaningful `<main>` content and a heading. Direct bootstrap of `/candidate/assessments` displays **Assessment overview**, skill/difficulty controls and **Start assessment**. Role guards, logout redirects and useful 404 checked.
2. Candidate signup, password mismatch validation, manual profile save, claimed skill addition, apply **without assessment**, duplicate prevention, and visibility under Company Applicants/Talent Search; unassessed candidate excluded from recommendations.
3. Company signup → Pending → protected-route denial → Rejected → Admin Approved → login; invalid 70% publish blocked → draft → edit to 100% → publish → Candidate discovers job.
4. Simulated assessment: visible single question, timer/control presence, MCQ and open-ended answers, submission, deterministic results and feedback, 24-hour cooldown, query-target updates, confirm/reject cancellation.
5. Recruiter status update and future interview invitation → Candidate Accept / Decline / Request reschedule with note → recruiter sees response; Hired status appears for Candidate; changed published requirements generate in-app notices without removing applications.
6. University creates future fair → Company publishes and links a job → affiliated Candidate sees only own institution fairs → self-reported ID registration → fair job application → University aggregate metrics and registration list update. Ordinary application is not counted as fair-origin. Changing university cancels registrations and preserves historical fair application attribution; old fair access denied.
7. Search empty state/reset, Arabic meaningful labels + `dir=rtl`, theme/storage values, mobile navigation/More DOM, editable demo email and subsequent sign-in.
8. Admin creates and edits university account; new university can sign in; explicit reset restores seed and signs out.
9. Storage-event handler updates visible skills; session revocation redirects to Sign In without uncaught errors. This dispatches browser-like events in DOM; actual multi-tab browser synchronization is unverified.
10. Attempt recovery: saved question index/answers restore when the app bootstraps again; cancellation clears attempt storage.
11. A previously eligible candidate reassesses below a job-specific threshold, disappears from recommendations, and remains in Applicants with their original application.

A discovered assessment route reuse bug was fixed: after completion the app navigates to Results, and query-selected skills update on return. A session-revocation render race was fixed by hiding protected child content before redirect. Final DOM runs pass these regressions.

## Actual server checks

The script spawns the real `npm start`, waits for HTTP readiness, fetches `/`, `/sign-in`, `/candidate/assessments`, `/company/dashboard`, `/university/dashboard`, `/admin/companies`, and confirms HTTP 200, the exact required title and Angular root. It also checks HTTP 200 and nonempty bytes for the supplied SVG/ICO favicon, light/dark full logos, mark and touch icon. This verifies deep-link serving and assets **at HTTP level**; it does not prove an image visually painted in a browser.

## Browser execution blocker and remaining checks

`npx playwright install chromium` was attempted; downloads returned corrupt/truncated ZIP content. The system Chromium at `/usr/bin/chromium` was then used with the authored Playwright suite. All nine tests were blocked at launch before their browser assertions could run: Chromium aborted with `socket() failed: Operation not permitted` in its process-singleton initialization. The environment rejected the request for the socket permissions needed to launch it. The separate cloud browser was also attempted and returned `net::ERR_CONNECTION_REFUSED` for the local application. No browser pass or screenshot review is claimed.

The first wildcard-host `npm start` also hit `uv_interface_addresses` permission failure; loopback binding resolved server startup. The first `tsx --test` command hit a Unix-socket permission failure; `node --import tsx --test` resolved domain test execution. Happy DOM required a harness-only Node `structuredClone` injection; modern browser production code uses native structuredClone.

**Unverified:** CSS rendering/contrast, actual logo painting, browser favicon display, screenshot comparison against Stitch, 1440×900 and 390×844 clipping/overflow, actual browser keyboard interaction/focus, screen-reader behavior, real timer throttling, and real-tab storage synchronization. DOM checks verify content/state/control events but cannot verify these browser/layout properties.

The complete Playwright suite in `tests/workflows.e2e.ts` contains route/content/title/favicon checks, desktop/mobile captures, role journeys, locale/theme, storage and workflow assertions. Run on Windows or another environment with browser support:

```powershell
npm install
npx playwright install chromium
npm run test:e2e
```

Review screenshots generated under `test-results/` and resolve any environment-specific visual defects before treating this as production-ready. These temporary outputs are excluded from the delivered ZIP. Real ASP.NET/SQL/LLM/model integration is future work described in API_INTEGRATION.md and is not represented as tested backend functionality.
