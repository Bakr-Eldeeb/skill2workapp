# V3 executed test report

Date: 17 November 2026. Foundation: supplied `Skill2Work_Final_UX_Polished_Frontend.zip`. Implementation was tested in the cloud execution environment. No public repository or deployment was changed.

## Executed successfully

| Command / check                                       | Result                                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm ci`                                              | Installed locked dependencies successfully                                                                   |
| `npm run build` / `npx ng build` through test scripts | Production Angular compilation successful                                                                    |
| `npm run test:source`                                 | 3 passed: source/translation/accessibility constraints                                                       |
| `npm run test:domain`                                 | 7 passed: established domain calculations and rules                                                          |
| `npm run test:dom`                                    | 11 passed: compiled application, 39 legacy routes and cross-role workflows                                   |
| `npm run test:ux`                                     | 10 passed: existing consolidated UX regressions                                                              |
| `npm run test:v3`                                     | 10 passed: new V3 rendered DOM interactions                                                                  |
| `npm run test:server`                                 | Started real `npm start`; readiness plus 12 HTTP route/title/asset checks passed                             |
| `npm run build:pages`                                 | Successful production Pages output with `/skill2work/` base and hash routing                                 |
| `npm run test:pages`                                  | 7 passed: four roles, new company/application deep links, relative assets, skip focus and artifact structure |

Total: **48 automated test cases passed**, plus **12 HTTP checks**. Angular DOM tests use Happy DOM against compiled application JavaScript. HTTP success alone is not counted as rendered-page verification.

Legacy workflow tests execute sign-in/sign-up, job publication, candidate application, matching/eligibility, hiring changes, interview responses, fairs, localization and theme behavior. `/candidate/assessments` explicitly has visible main content and a working assessment entry. V3 tests additionally verify unassessed home, actual contribution math, four evidence states, truthful timeline milestones, company publication filtering, optional persistent onboarding, fair ownership/sections, contextual empty actions, route parameter reuse and legacy links.

## Packaging and clean extraction verification

The source ZIP passed CRC validation and includes Angular configuration, locked dependencies, all source/assets, tests, documentation and the GitHub Actions workflow. It excludes node_modules, build output, caches and browser test output. A fresh extraction was independently verified with `npm ci`, `npm run build`, then 17 domain/V3 tests, all passing. These repeated cases are not added to the 48 distinct-case total. `npm run format:check` passed; Playwright discovery listed 12 browser cases without executing them.

## Browser/end-to-end limitation

Attempted `npx playwright install chromium`: downloads were corrupt/truncated (ZIP central directory errors). Then executed `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e -- --grep 'V3 experience review'` using installed Chromium. The process aborted before page assertions: `process_singleton` reported `socket() failed: Operation not permitted`.

Consequently **no real-browser E2E pass or visual desktop/mobile inspection is claimed**. The selected V3 browser test was blocked at browser launch; the remaining browser cases were not executed. Existing E2E suites and the new four-role desktop/mobile V3 review case are included for execution elsewhere. RTL/theme attributes and DOM navigation passed, but browser layout, actual color contrast, animation rendering and touch comfort remain visually unverified.

## Preservation checks

Byte comparison against the supplied final source confirmed unchanged core models, matching, store, assessment, assessment engine, API contracts, guards, seed and GitHub Actions deployment workflow. Five supplied SVG/favicon brand files also matched. No remote deployment test was performed; local Pages artifact tests are not proof of public publication.

## Reproduce

```powershell
npm ci
npm run build
npm run test:source
npm run test:domain
npm run test:dom
npm run test:ux
npm run test:v3
npm run test:server
npm run build:pages
npm run test:pages
npm run format:check
npx playwright install chromium
npm run test:e2e
```

Use the supported Node versions in README.md. Authentication and grading remain local demo simulations, with no production security or operational AI claims.
