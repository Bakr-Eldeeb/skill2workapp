import { test } from 'node:test';
import assert from 'node:assert/strict';
import { app, go, find, fill, click, login, main, data, pause, text } from './app-harness.mjs';
import { seed } from '../src/app/core/seed.ts';
import { questions } from '../src/app/core/assessment.ts';
import { parentRoute } from '../src/app/core/navigation-rules.ts';
test('parent fallback is role scoped and preserves job/fair context', () => {
  for (const [url, role, expected] of [
    ['/candidate/jobs/j2/apply?fair=f1', 'candidate', '/candidate/jobs/j2?fair=f1'],
    ['/candidate/jobs/j2', 'candidate', '/candidate/jobs'],
    ['/company/jobs/j1/edit', 'company', '/company/jobs'],
    ['/company/candidates/c1', 'company', '/company/talent'],
    ['/university/fairs/f1/edit', 'university', '/university/fairs/f1'],
    ['/university/fairs/f1', 'university', '/university/fairs'],
    ['/candidate/assessments', 'candidate', '/candidate/skills'],
    ['/candidate/jobs/j1', 'company', '/company/dashboard'],
  ])
    assert.equal(parentRoute(url, role), expected);
});
test('Back works with meaningful history, direct deep links and no auth/cross-role fallback', async () => {
  for (const [url, role, parent] of [
    ['/candidate/jobs/j2', 'candidate', '/candidate/jobs'],
    ['/company/jobs/j1/edit', 'company', '/company/jobs'],
    ['/university/fairs/f1/edit', 'university', '/university/fairs/f1'],
    ['/candidate/assessments', 'candidate', '/candidate/skills'],
  ]) {
    const a = await app(url, role);
    try {
      assert.ok(a.w.document.querySelector('main s2w-back .back-button'));
      await click(a, 'Back', a.w.document.querySelector('s2w-back'));
      assert.equal(a.w.location.pathname, parent);
      assert.equal(a.errors.length, 0, a.errors.join('\n'));
    } finally {
      await a.close();
    }
  }
  const a = await app('/candidate/dashboard', 'candidate');
  try {
    assert.equal(a.w.document.querySelector('.back-button'), null);
    await go(a, '/candidate/jobs?filter=remote');
    await go(a, '/candidate/jobs/j2');
    await go(a, '/candidate/jobs/j2/apply');
    await click(a, 'Back', a.w.document.querySelector('s2w-back'));
    assert.equal(a.w.location.pathname, '/candidate/jobs/j2');
    await click(a, 'Back', a.w.document.querySelector('s2w-back'));
    assert.equal(a.w.location.pathname, '/candidate/jobs');
    assert.equal(a.w.location.search, '?filter=remote');
    await login(a, 'company');
    await go(a, '/company/talent');
    await click(a, 'Back', a.w.document.querySelector('s2w-back'));
    assert.equal(a.w.location.pathname, '/company/dashboard');
  } finally {
    await a.close();
  }
});
test('consolidated Skills tabs preserve passport/results deep links and mobile navigation priorities', async () => {
  const a = await app('/candidate/passport', 'candidate');
  try {
    assert.match(main(a), /Skills & Passport/);
    assert.ok(find(a, 'button', 'Skills & Passport').getAttribute('aria-pressed') === 'true');
    await click(a, 'Skills & Passport', a.w.document.querySelector('.view-switch'));
    await fill(a, 'Skill name', 'Accessible UX');
    await click(a, '+ Add skill');
    assert.match(main(a), /Accessible UX/);
    await go(a, '/candidate/results');
    assert.equal(find(a, 'button', 'Assessment results').getAttribute('aria-pressed'), 'true');
    assert.match(main(a), /No results yet/);
    const primary = [...a.w.document.querySelectorAll('.sidebar nav>a')];
    assert.equal(primary.length, 5);
    const mobile = [...a.w.document.querySelectorAll('.mobile-nav>a')].map((e) =>
      e.getAttribute('href'),
    );
    assert.deepEqual(mobile, [
      '/candidate/dashboard',
      '/candidate/jobs',
      '/candidate/skills',
      '/candidate/applications',
    ]);
  } finally {
    await a.close();
  }
});
test('talent discovery tabs retain eligibility gate and backward-compatible active navigation', async () => {
  const a = await app('/company/recommendations', 'company');
  try {
    assert.equal(find(a, 'button', 'Recommended for a job').getAttribute('aria-pressed'), 'true');
    assert.equal(
      a.w.document.querySelector('.sidebar nav a.active').getAttribute('href'),
      '/company/talent',
    );
    await click(a, 'All candidates', a.w.document.querySelector('.view-switch'));
    assert.equal(a.w.document.querySelectorAll('.grid>article').length, 50);
    await click(a, 'Recommended for a job');
    assert.ok(a.w.document.querySelectorAll('.grid>article').length < 50);
    await go(a, '/company/pipeline');
    assert.match(main(a), /Applicants & hiring/);
    assert.equal(
      a.w.document.querySelector('.sidebar nav a.active').getAttribute('href'),
      '/company/applicants',
    );
  } finally {
    await a.close();
  }
});
test('fair sections keep registrations inside the fair and expose no individual assessment', async () => {
  const d = seed();
  d.registrations.push({ id: 'rt', candidateId: 'c1', fairId: 'f1', studentId: 'ECU-TEST' });
  const a = await app('/university/fairs/f1', 'university', { state: d });
  try {
    assert.ok(find(a, 'button', 'Overview'));
    await click(a, 'Registration Tickets', a.w.document.querySelector('.view-switch'));
    assert.match(main(a), /ECU-TEST/);
    assert.match(main(a), /Registration ticket/);
    assert.doesNotMatch(main(a), /Skill Passport|Strengths|Assessment results/);
    await click(a, 'Jobs', a.w.document.querySelector('.view-switch'));
    assert.match(main(a), /Frontend Developer/);
    await click(a, 'Participating companies', a.w.document.querySelector('.view-switch'));
    assert.match(main(a), /Nile Pixel Studio/);
  } finally {
    await a.close();
  }
});
test('settings and university edit never prefill/reveal passwords, and blank updates keep credentials', async () => {
  const a = await app('/candidate/settings', 'candidate');
  try {
    assert.equal(a.w.document.querySelector('input[name=password]').value, '');
    assert.doesNotMatch(main(a), /Demo123!/);
    await fill(a, 'Email', 'changed@skill2work.demo');
    await click(a, 'Save account');
    assert.equal(data(a).users.find((u) => u.id === 'uc1').password, 'Demo123!');
    await login(a, 'candidate', 'changed@skill2work.demo');
    await login(a, 'admin');
    await go(a, '/admin/universities');
    await click(a, 'Edit', a.w.document.querySelector('article'));
    assert.equal(a.w.document.querySelector('input[formcontrolname=password]').value, '');
    await fill(a, 'Location', 'Updated Cairo');
    await click(a, 'Save account');
    assert.equal(data(a).users.find((u) => u.id === 'uu1').password, 'Demo123!');
  } finally {
    await a.close();
  }
});
test('full initial assessment targets unassessed skills; full reassessment only eligible evaluated skills', async () => {
  const d = seed();
  d.candidates[0].skills = [
    { name: 'Angular', score: 80, date: new Date().toISOString() },
    { name: 'SQL' },
    { name: 'Figma' },
    { name: 'TypeScript', score: 75, date: '2026-11-01T10:00:00Z' },
  ];
  const a = await app('/candidate/assessments', 'candidate', { state: d });
  try {
    await click(a, 'Start assessment');
    let attempt = JSON.parse(a.w.sessionStorage.getItem('s2w.attempt'));
    assert.deepEqual([...new Set(attempt.questions.map((q) => q.skill))], ['SQL', 'Figma']);
    assert.equal(attempt.questions.length, 8);
    a.w.confirm = () => true;
    await click(a, 'Cancel assessment');
    await fill(a, 'Full assessment mode', 'all');
    await click(a, 'Start assessment');
    attempt = JSON.parse(a.w.sessionStorage.getItem('s2w.attempt'));
    assert.deepEqual([...new Set(attempt.questions.map((q) => q.skill))], ['TypeScript']);
    assert.equal(attempt.questions.length, 4);
  } finally {
    await a.close();
  }
});
test('timed out responses preserve actual partial text and drafts survive reload', async () => {
  const attempt = {
    candidateId: 'c1',
    difficulty: 'Easy',
    questions: questions(['Angular'], 'Easy'),
    answers: ['My own partial response'],
    index: 0,
    deadline: Date.now() - 100,
  };
  const a = await app('/candidate/assessments', 'candidate', { attempt: JSON.stringify(attempt) });
  let b;
  try {
    await new Promise((r) => setTimeout(r, 600));
    const saved = JSON.parse(a.w.sessionStorage.getItem('s2w.attempt'));
    assert.equal(saved.index, 1);
    assert.equal(saved.answers[0], 'My own partial response');
    assert.equal(saved.responses[0].status, 'timed-out');
    assert.equal(saved.responses[0].answer, 'My own partial response');
    await fill(a, 'Answer', 'An unfinished open-ended draft');
    b = await app('/candidate/assessments', 'candidate', {
      state: data(a),
      attempt: a.w.sessionStorage.getItem('s2w.attempt'),
    });
    assert.equal(b.w.document.querySelector('textarea').value, 'An unfinished open-ended draft');
  } finally {
    await a.close();
    if (b) await b.close();
  }
});
test('recoverable profile conflict preserves completed attempt and retry commits only the latest results', async () => {
  const a = await app('/candidate/assessments?skill=Angular', 'candidate');
  try {
    await click(a, 'Start assessment');
    a.w.document.querySelector('input[type=radio]').click();
    await pause();
    await click(a, 'Next question');
    for (let i = 0; i < 2; i++) {
      await fill(a, 'Answer', 'A real entered response.');
      await click(a, 'Next question');
    }
    await fill(a, 'Answer', 'Final entered response.');
    const before = data(a);
    const conflicting = structuredClone(before);
    conflicting.candidates[0].skills = conflicting.candidates[0].skills.filter(
      (s) => s.name !== 'Angular',
    );
    a.w.localStorage.setItem('skill2work.demo.v1', JSON.stringify(conflicting));
    a.w.dispatchEvent(
      new a.w.StorageEvent('storage', {
        key: 'skill2work.demo.v1',
        newValue: JSON.stringify(conflicting),
      }),
    );
    await pause();
    await click(a, 'Submit assessment');
    await new Promise((r) => setTimeout(r, 650));
    assert.match(main(a), /Unable to save results/);
    assert.ok(a.w.sessionStorage.getItem('s2w.attempt'));
    assert.equal(data(a).results.length, 0);
    a.w.localStorage.setItem('skill2work.demo.v1', JSON.stringify(before));
    a.w.dispatchEvent(
      new a.w.StorageEvent('storage', {
        key: 'skill2work.demo.v1',
        newValue: JSON.stringify(before),
      }),
    );
    await pause();
    await click(a, 'Retry');
    await new Promise((r) => setTimeout(r, 650));
    assert.equal(a.w.location.pathname, '/candidate/results');
    assert.equal(data(a).results.length, 1);
    assert.equal(data(a).results[0].responses.length, 4);
    assert.equal(a.w.sessionStorage.getItem('s2w.attempt'), null);
  } finally {
    await a.close();
  }
});

test('Skip to content focuses main without changing the current route', async () => {
  const a = await app('/candidate/jobs', 'candidate');
  try {
    const before = a.w.location.href;
    a.w.document.querySelector('.skip-link').click();
    await pause();
    assert.equal(a.w.location.href, before);
    assert.equal(a.w.document.activeElement.id, 'content');
  } finally {
    await a.close();
  }
});
