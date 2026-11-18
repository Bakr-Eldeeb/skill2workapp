# Skill2Work — UX & Motion update

## What changed

- Simplified primary desktop navigation: candidate (Dashboard, Jobs, Skills & Passport, Applications, Fairs), company (Dashboard, Jobs, Find candidates, Applicants & hiring, Fairs), university (Dashboard, Manage fairs, Analytics). Lesser-used destinations live under **More**.
- Explicit candidate mobile navigation: Home / Jobs / Skills / Applications / More.
- Existing deep links remain available: candidate passport redirects to skills; company recommendations are a view of talent; company pipeline is a view of applicants.
- Common Back button in authenticated portal, Home back link in Sign In and Sign Up; role-scoped back fallback.
- Shared university workspace segmented tabs: Overview / Registrations / Analytics.
- Added short entrance transitions for pages, cards, and toasts; animated skill progress bars; restrained hover/focus/pressed feedback; tiny Demo status pulse. No extra UI library dependency; CSS-only motion.
- Honors OS **prefers-reduced-motion** and maintains RTL transform direction.
- Accounts page never displays or prefills current passwords; authentication remains local demo-only.
- Full initial assessment focuses on unassessed skills; explicit mode for full reassessment (24-hour cooldown); unanswered timeouts are recorded as blank, not as a fabricated response.
- Demo question duration is centralized in `core/assessment.ts`, currently 120 seconds. Server-side authoritative timing is future backend work.
- Job weights validated using integer hundredths (e.g. 33.33 + 33.33 + 33.34 = 100.00), with max 2 decimal places.

## Remaining limits

- Full integration of an asynchronous domain facade and production authentication remains backend-integration work. Existing components still use `DemoRepository` synchronously.
- Demo skill scores are deterministic fixtures independent of responses; they are consistently labeled simulated and are NOT AI grading.
- Real browser/mobile screenshots, a successful Angular build, and Playwright E2E must be confirmed in a local environment with a compatible Node release and npm packages. This environment did not have npm registry access.
- Validate Arabic translations and keyboard flows with human visual QA.

## Local acceptance checklist (Windows)

1. Use compatible Node: >=22.22.3 on Node 22, >=24.15.0 on Node 24, or Node >=26.0.0.
2. `npm ci` then `npm run build`, `npm run test:domain`, `npm run test:dom`, `npx playwright install chromium`, `npm run test:e2e`, `npm start`.
3. Verify landing, all four portal dashboards, hover/focus, dark mode, Arabic RTL, 390px mobile, and that the Back button returns appropriately.
4. Check Reduced Motion in OS/DevTools; cards and bars should not animate when enabled.
5. Candidate: assess new skills, review results, select reassessment, test cooldown and question expiration; Company: talent/recommendations tabs and applicants/pipeline; University: shared tabs and fair flows.
6. Check `http://localhost:4200/candidate/assessments` renders actual content and no browser errors.
