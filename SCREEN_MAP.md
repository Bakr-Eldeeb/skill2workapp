Current V4 changes and profile/ticket routes are documented in V4_SCREEN_MAP.md. The inventory below retains the original 31 feature groups.

# Final consolidated navigation

All 31 feature groups below remain implemented. Candidate `/skills`, `/passport` and `/results` use the same Skills workspace with the appropriate active tab. `/assessments` remains the focused assessment flow. Company `/talent` and `/recommendations` use the same discovery workspace; `/applicants` and `/pipeline` use Applicants & hiring. University fair details have Overview / Participating Companies / Registrations / Jobs sections, with `?tab=...` deep links. Existing routes are backward-compatible even when their sidebar entries have been consolidated. Settings is a primary University destination; Candidate Profile/Settings are secondary. The shared Back control uses role-scoped history and appropriate parent fallbacks, hidden on dashboards.

The table retains the approved feature-group mapping. The new final test report supersedes earlier validation notes.

# Approved screen inventory

The 31 approved groups map to the routes below. Essential list/detail/editor subviews are listed within their group. Settings/notifications share components with role-specific shells. The implementation is present for every row. The compiled Angular DOM suite covers all groups through route and workflow tests; visual browser verification is blocked as described in TEST_REPORT_FINAL.md.

| #   | Role / group                       | Routes and subflows                                                                                                                                   |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Public landing                     | `/` — claims → text assessment → evaluated evidence → passport → job matching                                                                         |
| 2   | Sign-in and candidate signup       | `/sign-in`, `/sign-up` — validated email/password, confirmation, required university/track, manual profile onboarding                                 |
| 3   | Company signup and approval states | `/company-sign-up`, `/account-status` — Pending and Rejected; approved role redirect                                                                  |
| 4   | Auth preferences and states        | Public language/theme controls; role settings; guarded redirects, logout, 404                                                                         |
| 5   | Candidate dashboard                | `/candidate/dashboard` — jobs first, compact passport, assessment encouragement, application updates, affiliated fair                                 |
| 6   | Candidate profile                  | `/candidate/profile` — name/location/university/track/bio/education/experience/projects; skills managed in group 7                                    |
| 7   | My skills                          | `/candidate/skills` — add/remove claims, assessed state, specific assess/reassess                                                                     |
| 8   | AI assessment UI                   | `/candidate/assessments?skill=Angular` or no skill for full selection — simulation, one question, timer, recovery, cancellation, cooldown             |
| 9   | Assessment results                 | `/candidate/results` — newest per-skill fixture result, feedback and post-attempt explanations                                                        |
| 10  | Skill Passport                     | `/candidate/passport` — track score, evaluated count, evaluated/claimed skills                                                                        |
| 11  | Job discovery                      | `/candidate/jobs` — search, location, mode, type, skill filters; match ordering after evidence                                                        |
| 12  | Job details and explanation        | `/candidate/jobs/:id` — required-skill evidence mean, coverage and minimum-score breakdown, minima, claimed/missing/assessed indicators               |
| 13  | Apply                              | `/candidate/jobs/:id/apply?fair=:fairId` — same path for everyone, profile + optional letter, success, duplicate protection                           |
| 14  | Applications and interviews        | `/candidate/applications` — statuses; Accept / Decline / Request reschedule                                                                           |
| 15  | Candidate fairs                    | `/candidate/fairs`, `/candidate/fairs/:id` — selected institution only; self-reported Student ID, companies/jobs and fair-attributed application      |
| 16  | Candidate notifications/settings   | `/candidate/notifications`, `/candidate/settings` — read state, account credentials, language/theme, reset                                            |
| 17  | Company dashboard                  | `/company/dashboard` — jobs/applicants/interviews; recommended overview; Create job                                                                   |
| 18  | Company profile                    | `/company/profile` — name, location, description, website                                                                                             |
| 19  | Jobs and editor                    | `/company/jobs`, `/company/jobs/new`, `/company/jobs/:id/edit` — drafts; exact weights/threshold validation, publish and applicant notices on changes |
| 20  | Recommendations                    | `/company/recommendations?job=:id` — eligibility gate and required stable sort                                                                        |
| 21  | Talent Search                      | `/company/talent` — all candidates; name, skill, location, track and claimed/assessed filters                                                         |
| 22  | Applicants and candidate details   | `/company/applicants?job=:id`, `/company/candidates/:id` — all applicants, score/date/summary evidence, no assessment transcript                      |
| 23  | Hiring and interviews              | `/company/pipeline` — statuses, future interview schedule, candidate response reflected                                                               |
| 24  | Company fairs                      | `/company/fairs`, `/company/fairs/:id` — direct participation and existing published job selection                                                    |
| 25  | University dashboard               | `/university/dashboard` — fair summary and Create fair                                                                                                |
| 26  | Fair management                    | `/university/fairs`, `/university/fairs/new`, `/university/fairs/:id/edit` — validated future date, name/location/description                         |
| 27  | University fair details            | `/university/fairs/:id` — participating companies, jobs, registration/application counts                                                              |
| 28  | Fair registrations                 | `/university/registrations` — fair filter, submitted Student IDs labeled unverified                                                                   |
| 29  | University analytics               | `/university/analytics` — aggregate registrations/companies/jobs/fair applications and missing evaluated evidence by required skill                   |
| 30  | Company approvals                  | `/admin/companies` — Pending/Approved/Rejected filter and approve/reject actions                                                                      |
| 31  | University accounts                | `/admin/universities` — create/edit institution and its single admin account                                                                          |

Auxiliary Company `/company/notifications` and `/company/settings`, University `/university/settings`, Admin `/admin/settings`, unknown route `**` → useful 404. These are supporting subflows, not additional major product features.
