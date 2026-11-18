# V3 screen review

This is an implementation review inventory, not a claim of completed visual browser inspection. Compiled Angular DOM behavior was exercised; real desktop/mobile screenshots could not be produced because Chromium could not launch in this environment. Responsive appearance, clipping, contrast, touch comfort and animations still need a human browser review.

## Representative review routes

Use the account for each role. All seed passwords are `Demo123!`; accounts are listed in DEMO_ACCOUNTS.md. Local startup: `npm ci`, `npm start`, then http://localhost:4200/. On Pages use `/skill2work/#/` followed by the route.

| Role / surface        | Route                                                    | What changed / what to review                                                                                   |
| --------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Candidate Career Home | `/candidate/dashboard`                                   | Personal hero, jobs, one next action, checklist, activity and own upcoming fair; test an unassessed account too |
| My Skills / Passport  | `/candidate/skills`                                      | Evidence cards, inline feedback, real scores/dates, consolidated tabs and useful empty states                   |
| Assessment overview   | `/candidate/assessments`                                 | Legacy deep link remains visible and functional; assessment flow retained                                       |
| Job details           | `/candidate/jobs/j1`                                     | Four evidence states, must/nice requirements, exact contribution and eligibility distinction, Apply action      |
| Company Showcase      | `/candidate/companies/co1`                               | Fictional identity/story, cover, working environment and published jobs                                         |
| Applications          | `/candidate/applications`                                | Scannable status summaries and actual interview responses                                                       |
| Application detail    | `/candidate/applications/a1`                             | Honest recorded/current timeline, no invented milestone completion                                              |
| Career fairs          | `/candidate/fairs`                                       | Event cards, own-university eligibility and registration state                                                  |
| Fair detail           | Open a fair from its list                                | Event hero, university, overview/companies/jobs sections and actual registration CTA                            |
| Company               | `/company/dashboard`, `/company/jobs`, `/company/talent` | Compact summary, preserved publishing/talent/pipeline actions and contextual empty states                       |
| University            | `/university/dashboard`, `/university/fairs`             | Compact summary, event management and registrations scoped to own university                                    |
| Admin                 | `/admin/companies`                                       | Approval workflow and calm pending-approval completion state                                                    |
| Shared settings       | Role Settings                                            | Language, theme and shared demo reset; onboarding sidecar reset included                                        |

## Responsive and accessibility review checklist

The supplied `tests/v3-review.e2e.ts` prepares desktop (1440px) and mobile (390px) representative captures for all four roles. Run `npx playwright install chromium` and `npm run test:e2e` on a machine that supports browser execution.

Check hero/card wrapping, comfortable touch targets, bottom navigation, timeline stacking, internal fair tabs, Back navigation, Arabic RTL, dark mode, keyboard focus, skip link and reduced-motion behavior. No V3 screenshots have been visually signed off here.

## Route continuity

Existing SCREEN_MAP.md still lists the approved 31 feature groups. Old routes and consolidated redirects were retained, including assessment, passport/results, company recommendations/pipeline and university registrations. New company/application details do not add sidebar destinations. State and role ownership are enforced by the existing guards/store; fair sections do not expose candidate registrations to another role.

## Evidence available

Compiled-DOM tests cover all four roles, legacy workflows, new V3 views, route reuse, Arabic/dark attributes, ownership, empty states and Pages hash links/assets. These checks establish rendered content and actions in a DOM runtime, not visual layout or browser accessibility certification. See V3_TEST_REPORT.md.
