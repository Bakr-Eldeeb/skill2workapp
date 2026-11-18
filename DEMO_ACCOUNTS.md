# Demo accounts and walkthrough

Use fictional information only. These are editable local fixtures, not credentials for a real service. Default password for every seed account: **Demo123!**.

| Role       | Primary email              | Entity                                        |
| ---------- | -------------------------- | --------------------------------------------- |
| Candidate  | candidate@skill2work.demo  | Omar Hassan (`c1`), ECU, Frontend Development |
| Company    | company@skill2work.demo    | Nile Pixel Studio (`co1`), Approved           |
| University | university@skill2work.demo | Egyptian Chinese University (`u1`)            |
| Admin      | admin@skill2work.demo      | System Admin                                  |

Additional candidates: `candidate2@skill2work.demo` through `candidate50@skill2work.demo`. Additional companies: `company2@skill2work.demo` through `company10@skill2work.demo`; company10 begins Pending. Additional universities: `university2@skill2work.demo` (Aswan), `university3@skill2work.demo` (Helwan). The seed includes 50 candidates, 10 fictional companies and 3 universities. Names sharing a first/last name have deterministic suffixes to keep identity consistent.

Every fifth seeded candidate (`c5`, `c10`, etc.) is entirely unassessed. Omar's original Angular 50, TypeScript 61 and Communication 83 produce job `j1` match **59.9%** and Frontend overall **57.7/100**. He is below the Angular minimum 65 and is therefore absent from `j1` recommendations, while remaining visible in Talent Search and Applicants. Seeded evidence is explicitly simulated. Dates are fixed fixtures; new actions use the current time.

## Interconnected demo

1. Company: Jobs → Create job. Enter a title/description/location and a Must-Have skill. An invalid total is blocked; a 100% total can publish. Incomplete drafts can save.
2. Candidate: Find jobs → job → Apply. No assessment is required; the cover letter is optional. The profile is attached, and repeat application is prevented.
3. Company: Applicants or Hiring pipeline → update status. Schedule a future interview. Sign back into Candidate → Applications to Accept, Decline or Request reschedule. Both role views and in-app notifications update.
4. University: Create fair using a future date. Company: Career fairs → fair → choose existing published job(s) → Save participation. Candidate with the same selected university: fair → register using a fictional Student ID → linked job → apply. University Analytics counts only applications submitted through that fair. An existing ordinary application is not retroactively reassigned to a fair.
5. Candidate: Change university in Profile. Registrations are cancelled; historical applications retain their original fair attribution. Different institution fairs become unavailable.
6. Candidate: My skills → Add skill → Assess, or use Assessments to target all skills. Complete the labeled question simulation to see fixture results. A per-skill 24-hour cooldown then applies.
7. New company signup starts Pending. Admin → Company approvals → Approve or Reject. University accounts are created/edited only under Admin → Universities.

## Editing and resetting

Each account can edit its own demo email/password under Settings. Admin can edit a university account's email/password. Credential help displays account roles/emails only; current passwords are never shown in Settings. New-password fields start blank, and blank updates keep the existing credential. Source defaults are defined in `src/app/core/seed.ts` and `DEMO_PASSWORD`. Use Settings → Reset demo data to restore them and sign out. Reset deletes local prototype changes after confirmation.

Passwords and all demo records are readable in localStorage. No encryption, trusted identity, production authentication, real AI verification, server enforcement or cross-device synchronization is claimed. Do not reuse a real password. Tabs share the same local session; signing into another role changes the session in the other tab as well. Data writes are last-write-wins.
