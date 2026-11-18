/** V3 behavioral review of the real compiled Angular UI. Does not claim visual layout. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { app, go, find, fill, click, login, main, data, pause, text } from './app-harness.mjs';
import { seed } from '../src/app/core/seed.ts';
test('Career Home welcomes an unassessed candidate, offers ordinary jobs and only own upcoming fair', async () => {
  const d = seed();
  d.users.find((u) => u.id === 'uc1').entityId = 'c5';
  const a = await app('/candidate/dashboard', 'candidate', { state: d });
  try {
    assert.match(main(a), /Good to see you, Ahmed/);
    assert.match(main(a), /No assessment needed/);
    assert.match(main(a), /Not Assessed Yet/);
    assert.doesNotMatch(main(a), /0\/100|0% Match/);
    assert.equal(a.w.document.querySelectorAll('.home-jobs s2w-job-card').length, 3);
    assert.match(
      text(a.w.document.querySelector('.campus-invitation')),
      /Aswan Career Connections/,
    );
    assert.doesNotMatch(text(a.w.document.querySelector('.campus-invitation')), /ECU Skills/);
    assert.equal(a.w.document.querySelectorAll('.stats').length, 0);
    assert.equal(a.w.document.querySelectorAll('.career-hero .primary').length, 1);
    assert.equal(a.errors.length, 0, a.errors.join('\n'));
  } finally {
    await a.close();
  }
});
test('Company Showcase uses fictional identity, real published jobs and derives its stack from job requirements', async () => {
  const d = seed();
  d.jobs.push({
    ...d.jobs[0],
    id: 'draft',
    title: 'Hidden Draft',
    published: false,
    skills: [{ name: 'SecretSkill', weight: 100, must: true, minimum: 50 }],
  });
  const a = await app('/candidate/companies/co1', 'candidate', { state: d });
  try {
    assert.match(main(a), /Company profile/);
    assert.match(main(a), /Nile Pixel Studio/);
    assert.equal(a.w.document.querySelectorAll('#organization-openings s2w-job-card').length, 1);
    assert.doesNotMatch(main(a), /Hidden Draft|SecretSkill/);
    assert.match(main(a), /Angular/);
    await click(a, 'Explore jobs', a.w.document.querySelector('.organization-hero'));
    assert.equal(a.w.document.activeElement.id, 'organization-openings');
    assert.ok(a.w.document.querySelector('s2w-back .back-button'));
    await go(a, '/candidate/companies/co10');
    assert.match(main(a), /Profile unavailable/);
    assert.equal(a.errors.length, 0);
  } finally {
    await a.close();
  }
});
test('Explain My Match separates assessed, below-minimum, claimed and missing evidence without blocking Apply', async () => {
  const d = seed();
  d.candidates[0].skills = [
    { name: 'Angular', score: 50, date: '2026-11-01', simulated: true },
    { name: 'TypeScript', score: 61, date: '2026-11-01', simulated: true },
    { name: 'Communication' },
  ];
  d.jobs[0].skills = [
    { name: 'Angular', must: true, weight: 40, minimum: 65 },
    { name: 'TypeScript', must: false, weight: 30, minimum: 0 },
    { name: 'Communication', must: false, weight: 20, minimum: 0 },
    { name: 'Figma', must: true, weight: 10, minimum: 60 },
  ];
  const a = await app('/candidate/jobs/j1', 'candidate', { state: d });
  try {
    const area = a.w.document.querySelector('s2w-match-explanation');
    assert.match(text(area), /25/);
    assert.equal(area.querySelectorAll('[data-evidence="Below minimum"]').length, 1);
    assert.equal(area.querySelectorAll('[data-evidence="Assessed"]').length, 1);
    assert.equal(area.querySelectorAll('[data-evidence="Claimed, not assessed"]').length, 1);
    assert.equal(area.querySelectorAll('[data-evidence="Missing from profile"]').length, 1);
    assert.match(text(area), /Eligibility is separate/);
    assert.match(text(area), /not a zero proficiency score/);
    const apply = find(a, 'a', 'Already applied');
    assert.ok(apply.getAttribute('href').includes('/apply'));
    const link = a.w.document.querySelector('.company-context-link');
    assert.equal(link.getAttribute('href'), '/candidate/companies/co1');
  } finally {
    await a.close();
  }
});
test('Skill Passport uses evidence cards and does not invent an overall score without relevant assessed skills', async () => {
  const d = seed();
  d.candidates[0].skills = [
    { name: 'Angular' },
    {
      name: 'Unrelated',
      score: 80,
      date: '2026-11-01',
      summary: 'Fixture feedback',
      simulated: true,
    },
  ];
  const a = await app('/candidate/passport', 'candidate', { state: d });
  try {
    assert.equal(a.w.document.querySelector('.passport-overall'), null);
    assert.equal(a.w.document.querySelectorAll('.evidence-card').length, 2);
    assert.match(main(a), /Claimed/);
    assert.match(main(a), /80/);
    assert.match(main(a), /Assessment date/);
    assert.match(main(a), /Fixture feedback/);
    assert.ok(find(a, 'a', 'Reassess'));
    await go(a, '/candidate/skills');
    assert.equal(a.w.document.querySelectorAll('.evidence-card').length, 2);
    assert.equal(a.errors.length, 0);
  } finally {
    await a.close();
  }
});
test('Application timeline only records actual status/events, including rejection, and restricts ownership', async () => {
  const d = seed();
  d.applications[0].status = 'Offer';
  const a = await app('/candidate/applications/a1', 'candidate', { state: d });
  try {
    assert.match(main(a), /Application journey/);
    assert.equal(
      text(a.w.document.querySelector('.application-timeline .is-current strong')),
      'Offer',
    );
    assert.deepEqual(
      [...a.w.document.querySelectorAll('.application-timeline .is-recorded strong')].map(text),
      ['Applied', 'Offer'],
    );
    assert.equal(
      a.w.document.querySelectorAll('.application-timeline li:not(.is-recorded)').length,
      3,
    );
    assert.match(main(a), /Not recorded/);
    await login(a, 'company');
    await go(a, '/company/applicants');
    await fill(a, 'Application status', 'Rejected', a.w.document.querySelector('article'));
    await click(a, 'Save status');
    await login(a, 'candidate');
    await go(a, '/candidate/applications/a1');
    assert.equal(
      text(a.w.document.querySelector('.application-timeline .is-current strong')),
      'Rejected',
    );
    assert.doesNotMatch(text(a.w.document.querySelector('.application-timeline')), /Hired/);
    await go(a, '/candidate/applications/not-owned');
    assert.match(main(a), /This application is not available/);
  } finally {
    await a.close();
  }
});
test('Guided onboarding is optional, account scoped, dismissible and persistent across reload', async () => {
  const a = await app('/candidate/dashboard', 'candidate');
  let b, c;
  try {
    assert.equal(a.w.document.querySelectorAll('.checklist li').length, 4);
    assert.match(text(a.w.document.querySelector('s2w-onboarding')), /Optional/);
    a.w.document.querySelector('.checklist a[href="/candidate/jobs"]').click();
    await pause();
    await pause();
    assert.equal(
      JSON.parse(a.w.localStorage.getItem('s2w.experience.v3')).users.uc1.exploredJobs,
      true,
    );
    await go(a, '/candidate/dashboard');
    a.w.document.querySelector('[aria-label="Dismiss getting started"]').click();
    await pause();
    assert.equal(a.w.document.querySelector('.onboarding-panel'), null);
    b = await app('/candidate/dashboard', 'candidate', {
      state: data(a),
      experience: a.w.localStorage.getItem('s2w.experience.v3'),
    });
    assert.equal(b.w.document.querySelector('.onboarding-panel'), null);
    await click(b, 'Show getting started');
    assert.equal(b.w.document.querySelectorAll('.checklist li.is-done').length, 4);
    const d = data(a);
    d.users.find((u) => u.id === 'uc1').id = 'another-user';
    c = await app('/candidate/dashboard', 'candidate', {
      state: d,
      experience: a.w.localStorage.getItem('s2w.experience.v3'),
    });
    assert.ok(c.w.document.querySelector('.onboarding-panel'));
    assert.equal('onboarding' in data(a), false);
  } finally {
    await a.close();
    if (b) await b.close();
    if (c) await c.close();
  }
});
test('Career Fair Experience presents university/date/company/jobs and does not allow a candidate registrations tab', async () => {
  const a = await app('/candidate/fairs/f1?tab=registrations', 'candidate');
  try {
    assert.match(text(a.w.document.querySelector('.fair-hero')), /Egyptian Chinese University/);
    assert.match(text(a.w.document.querySelector('.fair-hero')), /ECU Skills to Careers Fair/);
    assert.match(main(a), /Student ID/);
    assert.ok(a.w.document.querySelector('.event-date-art'));
    assert.equal(a.w.document.querySelectorAll('.fair-company').length, 1);
    assert.equal(a.w.document.querySelectorAll('s2w-job-card').length, 1);
    assert.doesNotMatch(text(a.w.document.querySelector('.view-switch')), /Registrations/);
    await fill(a, 'Student ID', 'ECU-V3-DEMO');
    await click(a, 'Register');
    assert.match(text(a.w.document.querySelector('.fair-hero')), /Registered/);
    await go(a, '/candidate/fairs/f2');
    assert.match(main(a), /Page not found/);
  } finally {
    await a.close();
  }
});
test('Smart empty states have one relevant action for applications, skills, search and admin completion', async () => {
  const d = seed();
  d.applications = [];
  d.candidates[0].skills = [];
  d.companies.forEach((c) => (c.status = 'Approved'));
  const a = await app('/candidate/applications', 'candidate', { state: d });
  try {
    assert.match(main(a), /No applications yet/);
    assert.equal(
      a.w.document.querySelector('.empty-action a').getAttribute('href'),
      '/candidate/jobs',
    );
    await go(a, '/candidate/skills');
    await click(a, 'Add your first skill');
    assert.equal(a.w.document.activeElement.id, 'add-skill-input');
    await go(a, '/candidate/jobs');
    await fill(a, 'Search jobs', 'no-such-job');
    assert.equal(a.w.document.querySelectorAll('.empty-action button').length, 1);
    await click(a, 'Clear filters');
    assert.equal(a.w.document.querySelectorAll('s2w-job-card').length, 9);
    await login(a, 'admin');
    assert.match(main(a), /All caught up/);
    assert.equal(a.w.document.querySelectorAll('.empty-action button').length, 1);
    await click(a, 'View approved companies');
    assert.equal(a.w.document.querySelectorAll('article').length, 10);
  } finally {
    await a.close();
  }
});
test('Zero published jobs and no upcoming fair offer useful browsing/profile paths, never fabricated matches', async () => {
  const d = seed();
  d.jobs.forEach((j) => (j.published = false));
  d.fairs = [];
  const a = await app('/candidate/dashboard', 'candidate', { state: d });
  try {
    assert.match(main(a), /Your next opportunity is still ahead/);
    assert.match(text(a.w.document.querySelector('.campus-invitation')), /No upcoming fair/);
    await go(a, '/candidate/jobs');
    assert.match(main(a), /No open roles yet/);
    assert.equal(
      a.w.document.querySelector('.empty-action a').getAttribute('href'),
      '/candidate/profile',
    );
    assert.doesNotMatch(main(a), /0% Match/);
  } finally {
    await a.close();
  }
});
test('V3 Arabic/dark preferences, consolidated navigation and old deep links continue to render', async () => {
  const a = await app('/candidate/companies/co1', 'candidate');
  try {
    a.w.document.querySelector('[aria-label="Change language"]').click();
    a.w.document.querySelector('[aria-label="Toggle theme"]').click();
    await pause();
    assert.equal(a.w.document.documentElement.dir, 'rtl');
    assert.equal(a.w.document.documentElement.dataset.theme, 'dark');
    assert.match(main(a), /ملف الشركة/);
    assert.equal(a.w.document.querySelectorAll('.sidebar nav>a').length, 5);
    for (const route of ['/candidate/passport', '/candidate/results', '/candidate/assessments']) {
      await go(a, route);
      assert.ok(a.w.document.querySelector('main h1'));
    }
    assert.match(main(a), /نظرة عامة على التقييم/);
    assert.equal(a.errors.length, 0, a.errors.join('\n'));
  } finally {
    await a.close();
  }
});
