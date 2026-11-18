# V4 test report — 18 November 2026 (Cairo)

Current acceptance record for Skill2Work_Real_Platform_Experience.zip. Foundation: latest complete V3 source. Previous V3/final reports are historical. No public repository was pushed or deployed.

## Find Jobs footer correction

A trailing widget with a broken greeting image and the text “iAmYourCareerCopilot” reproduced the reported appearance in Chrome against the previous release. The inspected Angular source contains no such widget. Its origin on the reporting device is unknown.

Both production builds passed. The compiled application DOM and V4/media suites passed all 24 cases, the Pages suite passed all 15 cases, and the source and domain suites passed 3 and 7 cases respectively.

The updated normal and Pages builds were also exercised in managed Chrome at 1440 × 900 (English, light) and 390 × 844 (Arabic, RTL, dark). All four combinations passed with a populated list and an empty search result. A late document insert containing a frame left the list height unchanged. At maximum scroll the footer aligned with the pane edge, its technology link remained exposed, the illustration loaded, the CSS chevrons rendered and the pane had no horizontal overflow. The profile action navigated out of the directory in all four combinations. Desktop and mobile screenshots were inspected at the bottom of the page. This exercises a simulated trailing widget; it does not identify the source of the user's local markup.

The repeatable layout assertions are in `tests/jobs-footer-layout.mjs`. Run `npx playwright test tests/jobs-footer.e2e.ts` for the desktop and mobile scenarios in an environment with a working Playwright Chromium launcher. Here the managed Chrome run executed the shared layout assertions. The system Chromium binary failed its separate launch probe before opening a page.

## Original V4 verification

| Command / check                        | Result                                                                                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                               | Successful install from the updated lockfile, including QR encoder                                                                                          |
| `npm run build`                        | Production Angular AOT build successful; no remaining TS/template compilation errors                                                                        |
| `npm run test:domain`                  | 7 passed: evidence mean/null/zero, minimums, optional ranking, separate overall, validation and assessment invariants                                       |
| `npm run test:source`                  | 3 passed: syntax/unique keys, persistence/credential boundary and reduced-motion source checks                                                              |
| `npm run test:dom`                     | 11 passed: compiled Angular routes and complete cross-role workflows, including visible `/candidate/assessments`                                            |
| `npm run test:ux`                      | 10 passed: Back, consolidated workspaces, fair sections, account privacy, assessment recovery/cooldown                                                      |
| `npm run test:v3`                      | 10 passed: retained Career Home/evidence/application/onboarding/fair/empty-state and Arabic/dark behavior, updated for V4 rules                             |
| `npm run test:v4`                      | 13 passed: migration, threshold/ranking, independent QR decoding, scoped aggregates, safe URLs/media and new profile/ticket workflows                       |
| `npm run test:server`                  | Real `npm start` readiness and 12 HTTP title/route/brand-asset checks passed                                                                                |
| `npm run build:pages`                  | Production Pages build succeeded with `/skill2work/`, hash routing and relative assets                                                                      |
| `npm run test:pages` after Pages build | 15 passed: four roles, old/new profile/application/company/fair/assessment/analytics/job deep links, branding, skip focus/navigation and artifact structure |

Total: **69 distinct automated tests passed, plus 12 HTTP checks**. Repeated runs are not additional distinct cases. Compiled UI tests run the emitted production Angular JavaScript in Happy DOM, which is not a visual browser. HTTP checks alone do not verify rendering.

An early `test:pages` invocation against the ordinary clean-routing production build failed because that artifact was not the Pages variant. Rebuilt using `build:pages` and reran the Pages suite successfully. Run this suite only after its Pages artifact is built. During implementation, compiler/selector/translation defects found by checks were repaired before packaging; no failing application test is being reported as passed.

## New-rule and workflow evidence

- Required skill scores are averaged over all Must-Haves; missing evidence has no contribution, not a fabricated individual zero. No required evidence yields null. Coverage and all-minimum eligibility remain separate. Optional assessed count/average, track overall and stable ID tie breakers are covered.
- Version 1 migration retains application IDs/interviews, removes weights/optional minima, preserves required minima, recovers malformed requirement lists as drafts and is idempotent. Actual compiled bootstrap saves v2 and maintains stable unique tokens after reload.
- The generated SVG QR is rasterized from its actual module path and decoded using independent `jsqr`. Decoded content exactly matches the opaque token payload and excludes Student ID/contact data. This proves encoding/scannability structurally, not phone-camera performance on a physical print.
- Own profile editing stores structured work/contact/project data. Company sees the full shared read-only profile and safe contact/design links. Candidate role routes remain unavailable to company users; public visits remain guarded. New accounts initialize empty project collections.
- Media tests reject SVG/oversized files before decode, reject external/unbounded references and exercise an invalid upload without changing saved data. HTTPS-only URL tests reject executable/data/http/credential URLs.
- Tickets retain their token across revisits and role switches; university filtering/ownership and cancellation on university change work. University aggregates independently count distinct companies, postings, claimed students and assessed students within the selected university.
- Find Jobs contains the local illustration and three working contextual links, with no alien embeds. Technology explicitly states local-only authentication/data and practice grading/ticket boundaries.
- Existing sign-up/approval, publishing and job edits, apply-without-assessment, applicant visibility, scheduling/responses/statuses, fair attribution and localization/theme workflows pass.

## Clean-source delivery verification

A source-only checkpoint was extracted into a separate directory. `npm ci`, production build, domain/source/DOM/UX/V3/V4 suites, real server HTTP checks, Pages build/tests and formatting all passed there. Final source changes were synchronized and the affected compiled UI suites rerun before packaging. The final ZIP is checked for CRC integrity, complete source/configuration/docs/workflow/assets and absence of dependency/build/cache folders. The workflow and five supplied SVG/favicon assets were byte-compared with V3.

## Original full-suite Chromium launch limitation

Executed `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`. System Chromium aborted at launch with `process_singleton_posix.cc: socket() failed: Operation not permitted`, before page assertions. All 13 selected browser cases were blocked at launch, not passed. Updated authored browser suites include V4 desktop/mobile captures, successful media upload/IndexedDB reload, PNG download, profiles, fair tickets/roster, analytics, landing and RTL/dark checks.

The original full-suite run produced no browser screenshots. The later Find Jobs checks above cover the directory and its footer. Therefore CSS geometry/overflow, painted colors/fonts/contrast, animation appearance, touch comfort, successful canvas PNG download, real image compression/IndexedDB success, and print dialog/physical sheet output remain browser-unverified. PNG/print/upload actions are implemented, but their successful browser path is not claimed as tested by Happy DOM. The two supplied reference screenshots were inspected as design inputs.

To run browser verification on Windows:

```powershell
npm ci
npx playwright install chromium
npm run test:e2e
```

## Reproduce build and behavioral tests

```powershell
npm ci
npm run build
npm run test:domain
npm run test:source
npm run test:dom
npm run test:ux
npm run test:v3
npm run test:v4
npm run test:server
npm run build:pages
npm run test:pages
npm run format:check
```

Authentication, assessment scores, profiles, media and QR issuance remain browser-local prototype functions. These tests do not establish production authentication, real AI grading, shared cross-device registrations or secure admission. Future backend/security/privacy contracts are in API_INTEGRATION.md.
