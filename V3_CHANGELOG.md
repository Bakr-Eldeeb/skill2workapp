# Skill2Work V3 changelog

Delivered 17 November 2026. Updated the existing Final UX Polished Angular project incrementally. No repository was pushed, modified remotely, or published.

## The eight approved improvements

1. **Career Home:** personal welcome and career track, relevant published jobs, one next action, actual profile completion, eligible upcoming fairs and recent application activity. Unassessed candidates see normal jobs and encouragement, without a fabricated match score.
2. **Company Showcase:** approved fictional Egyptian company identities, editorial cover, story, working environment, actual published jobs and a stack derived from those jobs. Company links lead to `/candidate/companies/:id`. Fictional content is explicitly labeled; no real endorsements.
3. **Explain My Match:** separates assessed scores, claimed unassessed skills, missing skills and assessed skills below employer minimums. Shows requirement type, weight and score contribution using the existing matching functions. Eligibility remains separate from matching; assessment never gates application.
4. **Skill Passport:** evidence cards inside the existing My Skills workspace show actual status, score, assessment date, feedback and inline details. Overall score appears only when applicable. Verification means assessed and scored, not certified or passed.
5. **Application Journey:** scannable application cards and `/candidate/applications/:id` details with an accessible timeline. Only recorded/current stages are marked; unknown earlier transitions are labeled Not recorded. Actual interviews retain Accept, Decline and Request Reschedule actions.
6. **Guided Onboarding:** four lightweight optional steps, persistent per-account dismissal and job-exploration progress, plus restore. Profile/skill completion derives from actual data. No mandatory wizard or assessment gate.
7. **Career Fair Experience:** university identity, event hero, date, registration state, company identities, linked jobs and internal sections. Existing university eligibility, registration and company participation logic remain.
8. **Smart Empty States:** contextual artwork and a useful action for missing applications, claims/evidence, jobs/search results, fairs, company applicants, talent search, university registrations, notifications and pending admin approvals.

## Shared implementation

- Aurora Flow colors, supplied logos/favicon, bundled Plus Jakarta Sans/Tajawal, light/dark modes and English/Arabic remain. Added Arabic presentation strings, logical RTL layout, responsive styles, visible focus and reduced-motion treatment.
- Existing concise/consolidated navigation and reusable Back remain. Company/university counters use compact summaries rather than repetitive KPI grids.
- Presentation components: match explanation, application timeline and onboarding. `company-stories.ts` supplies explicitly fictional presentation copy. `experience-state.ts` uses a separate `s2w.experience.v3` sidecar for UI progress, with no backend contract additions; Settings demo reset clears it too.
- Fixed stale content when Angular reuses a component after a job/company/application/fair route parameter changes.
- Existing domain models, matching, store, assessment engines, API contracts, guards and seed were byte-compared with the supplied final ZIP and remain unchanged. All five supplied logo/favicon brand files remain byte-identical.
- Existing GitHub Actions workflow is byte-identical. The local Pages builder now defaults to `/skill2work/`, retaining configured base-path overrides and hash routing. Source folder remains `skill2work-angular`.

## Scope and integration

No Save Jobs, posting wizard, feeds, CV parsing, chatbot, certificates, QR check-in, booths or extra scheduling features. Local authentication is demo-only; assessment is a declared simulation, not operational AI grading. Existing API integration documents and screen inventory remain in the source. Dependency manifests/lockfile retain the existing dependency set.

See V3_SCREEN_REVIEW.md for review routes and V3_TEST_REPORT.md for executed verification and its limitations.
