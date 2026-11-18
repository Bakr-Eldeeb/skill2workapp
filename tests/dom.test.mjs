import { test } from 'node:test';
import assert from 'node:assert/strict';
import { app, go, find, fill, click, login, main, data, pause, text } from './app-harness.mjs';
test('AOT app renders every primary route, nested routes, deep-link assessment and guard redirects', async () => {
  const routes = {
    candidate: [
      'dashboard',
      'profile',
      'skills',
      'assessments',
      'results',
      'passport',
      'jobs',
      'jobs/j1',
      'jobs/j2/apply',
      'applications',
      'fairs',
      'fairs/f1',
      'notifications',
      'settings',
    ],
    company: [
      'dashboard',
      'profile',
      'jobs',
      'jobs/new',
      'jobs/j1/edit',
      'recommendations',
      'talent',
      'candidates/c1',
      'applicants',
      'pipeline',
      'fairs',
      'fairs/f1',
      'notifications',
      'settings',
    ],
    university: [
      'dashboard',
      'fairs',
      'fairs/new',
      'fairs/f1',
      'fairs/f1/edit',
      'registrations',
      'analytics',
      'settings',
    ],
    admin: ['companies', 'universities', 'settings'],
  };
  for (const [role, paths] of Object.entries(routes)) {
    const a = await app('/' + role + '/' + paths[0], role);
    try {
      for (const p of paths) {
        await go(a, '/' + role + '/' + p);
        assert.ok(a.w.document.querySelector('main h1'), p);
        assert.ok(main(a).length > 60, p);
        assert.ok(a.w.document.querySelector('s2w-logo img[src^="assets/skill2work-logo-"]'));
      }
      assert.equal(a.errors.length, 0, a.errors.join('\n'));
    } finally {
      await a.close();
    }
  }
  const a = await app('/candidate/assessments', 'candidate');
  try {
    assert.match(main(a), /Assessment overview/);
    assert.ok(find(a, 'button', 'Start assessment'));
    await go(a, '/admin/companies');
    assert.equal(a.w.location.pathname, '/candidate/dashboard');
    await click(a, 'Sign out');
    await go(a, '/candidate/assessments');
    assert.equal(a.w.location.pathname, '/sign-in');
    await go(a, '/does-not-exist');
    assert.match(main(a), /Page not found/);
  } finally {
    await a.close();
  }
});
test('public signup, password validation, mandatory university, manual profile, claim skill and apply without assessment', async () => {
  const a = await app('/sign-up');
  try {
    await fill(a, 'Name', 'Test Candidate');
    await fill(a, 'Email', 'newcandidate@skill2work.demo');
    await fill(a, 'Password', 'Demo123!');
    await fill(a, 'Confirm password', 'Different123!');
    await fill(a, 'University', 'u1');
    await click(a, 'Create account');
    assert.match(main(a), /Passwords do not match/);
    await fill(a, 'Confirm password', 'Demo123!');
    await click(a, 'Create account');
    assert.equal(a.w.location.pathname, '/candidate/dashboard');
    assert.match(main(a), /Not Assessed Yet/);
    await go(a, '/candidate/profile');
    await click(a, 'Edit profile');
    await fill(a, 'About', 'I build useful interfaces.');
    await click(a, 'Save profile');
    await go(a, '/candidate/skills');
    await fill(a, 'Skill name', 'Angular');
    await click(a, '+ Add skill');
    assert.match(main(a), /Claimed/);
    await go(a, '/candidate/jobs/j1/apply');
    await fill(a, 'Cover letter (optional)', 'Ready to contribute.');
    await click(a, 'Submit application');
    assert.match(main(a), /Application submitted/);
    await go(a, '/candidate/jobs');
    await go(a, '/candidate/jobs/j1/apply');
    assert.match(main(a), /Already applied/);
    const id = data(a).users.find((u) => u.email === 'newcandidate@skill2work.demo').entityId;
    assert.equal(data(a).applications.filter((x) => x.candidateId === id).length, 1);
    await login(a, 'company');
    await go(a, '/company/applicants');
    assert.match(main(a), /Test Candidate/);
    await go(a, '/company/talent');
    await fill(a, 'Search', 'Test Candidate');
    assert.match(main(a), /Test Candidate/);
    await go(a, '/company/recommendations');
    await fill(a, 'Search', 'Test Candidate');
    assert.match(main(a), /No eligible candidates yet/);
  } finally {
    await a.close();
  }
});
test('company pending/rejected/approved states, draft, publish validation and cross-role discovery', async () => {
  const a = await app('/company-sign-up');
  try {
    await fill(a, 'Company name', 'Test Nile Team');
    await fill(a, 'Email', 'newcompany@skill2work.demo');
    await fill(a, 'Password', 'Demo123!');
    await fill(a, 'Confirm password', 'Demo123!');
    await click(a, 'Create account');
    assert.equal(a.w.location.pathname, '/account-status');
    await go(a, '/company/jobs/new');
    assert.equal(a.w.location.pathname, '/account-status');
    await login(a, 'admin');
    let card = [...a.w.document.querySelectorAll('article')].find((e) =>
      text(e).includes('Test Nile Team'),
    );
    await click(a, 'Reject', card);
    await login(a, 'company', 'newcompany@skill2work.demo');
    assert.match(main(a), /Account rejected/);
    await login(a, 'admin');
    await fill(a, 'Account type', 'Rejected');
    card = [...a.w.document.querySelectorAll('article')].find((e) =>
      text(e).includes('Test Nile Team'),
    );
    await click(a, 'Approve', card);
    await login(a, 'company', 'newcompany@skill2work.demo');
    await go(a, '/company/jobs/new');
    await fill(a, 'Job title', 'Test Angular Engineer');
    await fill(a, 'Description', 'Build accessible experiences.');
    await fill(a, 'Skill name', 'Angular');
    await fill(a, 'Minimum', '101');
    await click(a, 'Publish job');
    assert.match(text(a.w.document.querySelector('[role=alert]')), /between 0 and 100/);
    await click(a, 'Save draft');
    assert.match(main(a), /Draft/);
    find(a, 'a', 'Edit job').click();
    await pause();
    await pause();
    await fill(a, 'Minimum', '60');
    await click(a, 'Publish job');
    assert.match(main(a), /Published/);
    await login(a, 'candidate');
    await go(a, '/candidate/jobs');
    await fill(a, 'Search jobs', 'Test Angular Engineer');
    assert.match(main(a), /Test Angular Engineer/);
  } finally {
    await a.close();
  }
});
test('live simulated assessment has visible question, timer, MCQ/open controls, results and cooldown', async () => {
  const a = await app('/candidate/skills', 'candidate');
  try {
    await fill(a, 'Skill name', 'Figma');
    await click(a, '+ Add skill');
    await go(a, '/candidate/assessments?skill=Figma');
    await click(a, 'Start assessment');
    assert.ok(a.w.document.querySelector('.question'));
    assert.ok(a.w.document.querySelector('.timer'));
    assert.equal(a.w.document.querySelectorAll('.question').length, 1);
    const radio = a.w.document.querySelector('input[type=radio]');
    radio.click();
    await pause();
    await click(a, 'Next question');
    for (let i = 0; i < 3; i++) {
      await fill(a, 'Answer', 'Explain decisions with examples and tests.');
      await click(a, i === 2 ? 'Submit assessment' : 'Next question');
    }
    await new Promise((r) => setTimeout(r, 800));
    assert.match(main(a), /Assessment results/);
    assert.match(main(a), /Strengths/);
    assert.equal(data(a).results.length, 1);
    assert.equal(data(a).results[0].simulated, true);
    await go(a, '/candidate/assessments?skill=Figma');
    await click(a, 'Start assessment');
    assert.match(main(a), /24 hours/);
    await go(a, '/candidate/assessments?skill=Angular');
    await click(a, 'Start assessment');
    a.w.confirm = () => false;
    await click(a, 'Cancel assessment');
    assert.ok(a.w.document.querySelector('.question'));
    a.w.confirm = () => true;
    await click(a, 'Cancel assessment');
    assert.match(main(a), /Assessment overview/);
  } finally {
    await a.close();
  }
});
test('recruiter status and interviews synchronize with candidate responses and notices', async () => {
  const a = await app('/company/applicants', 'company');
  try {
    await fill(a, 'Application status', 'Shortlisted', a.w.document.querySelector('article'));
    await click(a, 'Save status');
    await fill(a, 'Date and time', '2027-01-10T10:00');
    await click(a, 'Schedule interview');
    assert.match(main(a), /Pending/);
    await login(a, 'candidate');
    await go(a, '/candidate/applications');
    await click(a, 'Accept');
    assert.match(main(a), /Accepted/);
    await click(a, 'Decline');
    assert.match(main(a), /Declined/);
    await fill(a, 'Note (optional)', 'Please meet at 14:00.');
    await click(a, 'Request reschedule');
    await login(a, 'company');
    await go(a, '/company/pipeline');
    assert.match(main(a), /Reschedule requested/);
    assert.match(main(a), /Please meet at 14:00/);
    await fill(a, 'Application status', 'Hired', a.w.document.querySelector('article'));
    await click(a, 'Save status');
    await go(a, '/company/jobs/j1/edit');
    await fill(a, 'Minimum', '90');
    await click(a, 'Publish job');
    await login(a, 'candidate');
    await go(a, '/candidate/applications');
    assert.match(main(a), /Hired/);
    await go(a, '/candidate/notifications');
    assert.match(main(a), /Job requirements updated/);
    assert.match(main(a), /Application update: Hired/);
  } finally {
    await a.close();
  }
});
test('career fair chain preserves fair attribution, updates aggregates, enforces institution and cancels registrations', async () => {
  const a = await app('/university/fairs/new', 'university');
  try {
    await fill(a, 'Fair name', 'Test Campus Fair');
    await fill(a, 'Date and time', '2027-01-20T10:00');
    await fill(a, 'Location', 'Cairo campus');
    await fill(a, 'Description', 'A fictional event.');
    await click(a, 'Save fair');
    const id = a.w.location.pathname.split('/').pop();
    await login(a, 'company');
    await go(a, '/company/jobs/new');
    await fill(a, 'Job title', 'Fair Only Engineer');
    await fill(a, 'Description', 'Build a fictional service.');
    await fill(a, 'Skill name', 'Angular');
    await click(a, 'Publish job');
    await go(a, '/company/fairs/' + id);
    const boxes = [...a.w.document.querySelectorAll('input[type=checkbox]')];
    boxes.at(-1).click();
    await pause();
    await click(a, 'Save participation');
    assert.match(main(a), /Nile Pixel Studio/);
    await login(a, 'candidate');
    await go(a, '/candidate/fairs');
    assert.doesNotMatch(main(a), /Aswan Career Connections/);
    await go(a, '/candidate/fairs/' + id);
    await fill(a, 'Student ID', 'ECU-DEMO-123');
    await click(a, 'Register');
    assert.match(main(a), /Registered/);
    find(a, 'a', 'View job').click();
    await pause();
    await pause();
    find(a, 'a', 'Apply now').click();
    await pause();
    await pause();
    await click(a, 'Submit application');
    assert.match(main(a), /Application submitted/);
    assert.equal(data(a).applications.filter((x) => x.fairId === id).length, 1);
    assert.equal(data(a).applications.find((x) => x.id === 'a1').fairId, undefined);
    await login(a, 'university');
    await go(a, '/university/analytics');
    assert.equal(text(a.w.document.querySelector('[data-testid=registration-count]')), '1');
    assert.equal(text(a.w.document.querySelector('[data-testid=fair-application-count]')), '1');
    assert.doesNotMatch(main(a), /Omar Hassan/);
    await go(a, '/university/registrations');
    assert.match(main(a), /ECU-DEMO-123/);
    await login(a, 'candidate');
    await go(a, '/candidate/profile');
    await click(a, 'Edit profile');
    await fill(a, 'University', 'u2');
    await click(a, 'Save profile');
    assert.equal(data(a).registrations.length, 0);
    assert.equal(data(a).applications.filter((x) => x.fairId === id).length, 1);
    await go(a, '/candidate/fairs/' + id);
    assert.match(main(a), /Page not found/);
  } finally {
    await a.close();
  }
});
test('Arabic copy and RTL, themes, empty search, account edits and More navigation exist', async () => {
  const a = await app('/candidate/jobs', 'candidate');
  try {
    await fill(a, 'Search jobs', 'no such job');
    assert.match(main(a), /No matching results/);
    await click(a, 'Reset filters');
    assert.equal(a.w.document.querySelectorAll('s2w-job-card').length, 9);
    await click(a, 'عربي');
    assert.equal(a.w.document.documentElement.dir, 'rtl');
    assert.equal(text(a.w.document.querySelector('main h1')), 'اكتشف الوظائف');
    a.w.document.querySelector('[aria-label="Toggle theme"]').click();
    await pause();
    assert.equal(a.w.document.documentElement.dataset.theme, 'dark');
    assert.equal(a.w.localStorage.getItem('s2w.theme'), 'dark');
    assert.ok(a.w.document.querySelector('.mobile-nav'));
    await click(a, 'الحساب');
    assert.ok(a.w.document.querySelector('.more-sheet'));
    await go(a, '/candidate/settings');
    await click(a, 'English');
    await fill(a, 'Email', 'edited@skill2work.demo');
    await click(a, 'Save account');
    await login(a, 'candidate', 'edited@skill2work.demo');
    assert.equal(a.w.location.pathname, '/candidate/dashboard');
  } finally {
    await a.close();
  }
});
test('admin creates and edits university accounts; university can sign in; reset data', async () => {
  const a = await app('/admin/universities', 'admin');
  try {
    await click(a, '+ Create university account');
    await fill(a, 'Name', 'Demo Future University');
    await fill(a, 'Location', 'Aswan');
    await fill(a, 'Email', 'newuniversity@skill2work.demo');
    await fill(a, 'Password', 'Demo123!');
    await click(a, 'Save account');
    let card = [...a.w.document.querySelectorAll('article')].find((e) =>
      text(e).includes('Demo Future University'),
    );
    await click(a, 'Edit', card);
    await fill(a, 'Location', 'Cairo');
    await click(a, 'Save account');
    assert.match(main(a), /Demo Future University/);
    await login(a, 'university', 'newuniversity@skill2work.demo');
    assert.match(text(a.w.document.querySelector('.identity')), /Demo Future University/);
    await go(a, '/university/settings');
    a.w.confirm = () => true;
    await click(a, 'Reset demo data');
    assert.equal(a.w.location.pathname, '/sign-in');
    assert.equal(data(a).universities.length, 3);
  } finally {
    await a.close();
  }
});

test('storage-event synchronization and account revocation redirect use the real app event handlers', async () => {
  const a = await app('/candidate/skills', 'candidate');
  try {
    const d = data(a);
    d.candidates[0].skills.push({ name: 'Synced Skill' });
    a.w.localStorage.setItem('skill2work.demo.v1', JSON.stringify(d));
    a.w.dispatchEvent(
      new a.w.StorageEvent('storage', { key: 'skill2work.demo.v1', newValue: JSON.stringify(d) }),
    );
    await pause();
    await pause();
    assert.match(main(a), /Synced Skill/);
    a.w.localStorage.removeItem('s2w.session');
    a.w.dispatchEvent(new a.w.StorageEvent('storage', { key: 's2w.session', newValue: null }));
    await pause();
    await pause();
    assert.equal(a.w.location.pathname, '/sign-in');
    assert.equal(a.errors.length, 0, a.errors.join('\n'));
  } finally {
    await a.close();
  }
});
test('assessment attempt recovery restores current question and answers after a reload', async () => {
  const a = await app('/candidate/assessments?skill=Angular', 'candidate');
  let b;
  try {
    await click(a, 'Start assessment');
    a.w.document.querySelector('input[type=radio]').click();
    await pause();
    await click(a, 'Next question');
    const attempt = a.w.sessionStorage.getItem('s2w.attempt');
    assert.equal(JSON.parse(attempt).index, 1);
    b = await app('/candidate/assessments', 'candidate', { state: data(a), attempt });
    assert.ok(b.w.document.querySelector('.question'));
    assert.match(main(b), /Question 2 \/ 4/);
    b.w.confirm = () => true;
    await click(b, 'Cancel assessment');
    assert.equal(b.w.sessionStorage.getItem('s2w.attempt'), null);
  } finally {
    await a.close();
    if (b) await b.close();
  }
});
test('reassessment below a job threshold removes recommendation without deleting the existing application', async () => {
  const a = await app('/company/jobs/new', 'company');
  try {
    await fill(a, 'Job title', 'Threshold Regression Job');
    await fill(a, 'Description', 'Require evaluated Angular evidence.');
    await fill(a, 'Skill name', 'Angular');
    await fill(a, 'Minimum', '80');
    await click(a, 'Publish job');
    const job = data(a).jobs.find((j) => j.title === 'Threshold Regression Job');
    const name = data(a).candidates.find((c) => c.id === 'c19').name;
    await go(a, '/company/recommendations?job=' + job.id);
    await fill(a, 'Search', name);
    assert.match(main(a), new RegExp(name));
    await login(a, 'candidate', 'candidate19@skill2work.demo');
    await go(a, '/candidate/jobs/' + job.id + '/apply');
    await click(a, 'Submit application');
    await go(a, '/candidate/assessments?skill=Angular');
    await click(a, 'Start assessment');
    a.w.document.querySelector('input[type=radio]').click();
    await pause();
    await click(a, 'Next question');
    for (let i = 0; i < 3; i++) {
      await fill(a, 'Answer', 'Concrete reasoning and examples.');
      await click(a, i === 2 ? 'Submit assessment' : 'Next question');
    }
    await new Promise((r) => setTimeout(r, 800));
    assert.equal(
      data(a)
        .candidates.find((c) => c.id === 'c19')
        .skills.find((s) => s.name === 'Angular').score,
      77,
    );
    await login(a, 'company');
    await go(a, '/company/recommendations?job=' + job.id);
    await fill(a, 'Search', name);
    assert.match(main(a), /No eligible candidates yet/);
    await go(a, '/company/applicants?job=' + job.id);
    assert.match(main(a), new RegExp(name));
    assert.equal(
      data(a).applications.filter((x) => x.candidateId === 'c19' && x.jobId === job.id).length,
      1,
    );
  } finally {
    await a.close();
  }
});
