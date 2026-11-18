# V4 screen and workflow map

The existing 31 feature groups remain; this upgrade changes their presentation and approved domain rules rather than replacing the app. Read this file alongside SCREEN_MAP.md (legacy inventory). Source root: `skill2work-angular/`.

| Audience   | Route / workspace                                                  | V4 behavior                                                                                                            |
| ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Public     | `/`                                                                | Editorial landing, animated original career scene, process, role paths, About                                          |
| Public     | `/technology`                                                      | Truthful prototype/authentication/assessment/ticket/privacy information                                                |
| Public     | `/sign-in`, `/sign-up`, `/company-sign-up`, `/account-status`      | Existing role-aware accounts and approval states; credentials only in docs                                             |
| Candidate  | `/candidate/dashboard`                                             | V3 Career Home, optional onboarding and real state-driven jobs/activity/fairs                                          |
| Candidate  | `/candidate/jobs`                                                  | Search/filter cards, required-evidence coverage and original Make Your Next Move section                               |
| Candidate  | `/candidate/jobs/:id`                                              | Each actual required score against employer minimum, optional skills separately, coverage and eligibility              |
| Candidate  | `/candidate/jobs/:id/apply`                                        | Existing optional-letter application; no assessment/threshold gate                                                     |
| Candidate  | `/candidate/profile`                                               | View-first profile; Edit opens avatar/cover, contact, structured education/experience and multiple project editors     |
| Candidate  | `/candidate/profile#projects`                                      | Career Boost Projects link scrolls to the gallery; use Edit projects to add proof                                      |
| Candidate  | `/candidate/skills`                                                | Combined Skills & Passport with evidence cards and real overall when applicable                                        |
| Candidate  | `/candidate/passport`, `/candidate/results`                        | Old URLs still open the combined workspace / Results view                                                              |
| Candidate  | `/candidate/assessments`                                           | Visible assessment overview, focused optional practice flow, recovery/cooldown retained                                |
| Candidate  | `/candidate/companies/:id`                                         | Same full company profile presentation as company self-view; approved/published content, no editing                    |
| Candidate  | `/candidate/applications`, `/candidate/applications/:id`           | Actual status/timeline and existing interview Accept/Decline/Request Reschedule                                        |
| Candidate  | `/candidate/fairs`, `/candidate/fairs/:id`                         | Eligible own-university fairs, registration, company/jobs sections, own persistent QR ticket with PNG/print            |
| Company    | `/company/profile`                                                 | Authorized view-first organization profile and editor                                                                  |
| Company    | `/company/jobs`, `/company/jobs/new`, `/company/jobs/:id/edit`     | Independent per-required-skill minimums; optional skills without thresholds; drafts/publish/edit                       |
| Company    | `/company/talent`, `/company/recommendations`                      | All candidates versus threshold-gated recommendations; updated tie breakers                                            |
| Company    | `/company/candidates/:id`                                          | Full candidate profile including contacts/projects/evidence, strictly read-only UI and no private transcripts          |
| Company    | `/company/applicants`, `/company/pipeline`                         | Existing applicant/hiring workspace, candidate links and interview scheduling                                          |
| Company    | `/company/fairs`, `/company/fairs/:id`                             | Join and attach own published jobs, no registration roster access                                                      |
| University | `/university/profile`                                              | One university profile/account destination: identity, campuses, contact, About and upcoming fairs                      |
| University | `/university/dashboard`, `/university/fairs`, new/edit fair routes | Existing overview and fair management                                                                                  |
| University | `/university/fairs/:id?tab=registrations`                          | Registration Tickets: own fair roster/cards, text search plus field filter, individual PNG/print and Print all tickets |
| University | `/university/registrations`                                        | Existing cross-fair registration overview retained                                                                     |
| University | `/university/analytics`                                            | Distinct company demand / job count / claimed student / assessed student aggregate comparisons and explicit heuristic  |
| Admin      | `/admin/companies`, `/admin/universities`                          | Existing approval and university account lifecycle retained                                                            |
| All roles  | Role `/settings`, supported `/notifications`                       | Account/language/theme/reset, contact privacy and Technology link; no account/password table                           |

## Navigation, visual and accessibility review

Profile & Account has useful destinations; University Profile is visible in primary/mobile navigation. Existing Back/old deep links and role guards remain. Desktop profiles use an editorial hero and content/contact split; mobile stacks the content. Fairs have scoped sections and ticket cards. Semantic tokens, local fonts/brand assets, Arabic translations/RTL and dark mode remain. Motion respects reduced-motion preferences and scroll reveal is progressive enhancement.

Browser review cases include 1440px and 390px layouts, landing, Find Jobs, Job Details, own/recruiter profiles, projects, company/university profiles, Skills, ticket/roster, analytics, settings and RTL/dark. **Real-browser execution was blocked in this environment; no screenshots were visually signed off.** Compiled Angular DOM, routes/actions and exported QR structure were tested. See V4_TEST_REPORT.md for evidence and limits.

## Media and ticket walkthrough

Candidate Profile → Edit profile → select cover/avatar, add education/experience or project → Save profile. Sign in as Company → Find candidates / Applicants → View candidate to see the same saved content without editing. Sign in as University → Profile to edit the single institution page.

Candidate fair → enter self-reported Student ID → Register → My Fair Ticket. Revisit returns the same token; View ticket focuses it. University → same fair → Registration Tickets → search/filter or individual View/Download/Print. Print all clears the search and selects every locally known ticket. Registrations on another visitor's device are not present without a future backend. There are no attendance controls.
