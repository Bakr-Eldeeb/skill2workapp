import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { seed } from '../src/app/core/seed.ts';
import { migrateState } from '../src/app/core/state-migration.ts';
import {
  match,
  eligible,
  recommended,
  requiredCoverage,
  jobErrors,
} from '../src/app/core/matching.ts';
import { safeUrl, validateLinks } from '../src/app/core/profile-tools.ts';
import { universitySkillGaps } from '../src/app/core/skill-gaps.ts';
import { ticketPayload, ticketSvg } from '../src/app/core/tickets.ts';
import { app, go, click, fill, find, main, data, pause, text, login } from './app-harness.mjs';
test('v2 migration preserves applications and interviews, removes employer weights and is idempotent', () => {
  const d = seed();
  d.version = 1;
  d.jobs[0].skills = [
    { name: 'Angular', must: true, weight: 80, minimum: 65 },
    { name: 'SQL', must: false, weight: 20, minimum: 99 },
  ];
  d.applications[0].interview = { date: '2027-01-01', response: 'Accepted' };
  d.registrations = [{ id: 'old', candidateId: 'c1', fairId: 'f1', studentId: 'ID' }];
  delete d.candidates[0].portfolio;
  const migrated = migrateState(d);
  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.applications, d.applications);
  assert.deepEqual(migrated.jobs[0].skills, [
    { name: 'Angular', must: true, minimum: 65 },
    { name: 'SQL', must: false },
  ]);
  assert.ok(migrated.registrations[0].ticketToken);
  assert.equal(migrated.candidates[0].portfolio.length, 1);
  assert.deepEqual(migrateState(migrated), migrated);
  const malformed = { ...d, jobs: [{ ...d.jobs[0], skills: null }] };
  const fixed = migrateState(malformed);
  assert.equal(fixed.jobs[0].published, false);
  assert.deepEqual(fixed.applications, d.applications);
});
test('required evidence mean, partial coverage, optional evidence and all recommendation tie breakers', () => {
  const d = seed(),
    c = d.candidates[0],
    j = {
      ...d.jobs[0],
      skills: [
        { name: 'Angular', must: true, minimum: 70 },
        { name: 'SQL', must: true, minimum: 65 },
        { name: 'Figma', must: false },
      ],
    };
  assert.equal(match({ ...c, skills: [{ name: 'Angular', score: 80 }] }, j), 40);
  assert.deepEqual(requiredCoverage({ ...c, skills: [{ name: 'Angular', score: 80 }] }, j), {
    assessed: 1,
    total: 2,
  });
  assert.equal(match({ ...c, skills: [{ name: 'Figma', score: 100 }] }, j), null);
  assert.equal(
    eligible(
      {
        ...c,
        skills: [
          { name: 'Angular', score: 100 },
          { name: 'SQL', score: 64 },
        ],
      },
      j,
    ),
    false,
  );
  const make = (id, score, nice, other = 50) => ({
    ...c,
    id,
    skills: [
      { name: 'Angular', score },
      { name: 'SQL', score },
      { name: 'Communication', score: other },
      ...(nice === null ? [] : [{ name: 'Figma', score: nice }]),
    ],
  });
  const rows = [
    make('d', 75, null),
    make('c', 75, 50),
    make('b', 75, 80),
    make('a', 75, 80),
    make('top', 90, null),
    make('below', 64, 100),
  ];
  assert.deepEqual(
    recommended(rows, j, d.trackWeights).map((c) => c.id),
    ['top', 'a', 'b', 'c', 'd'],
  );
  assert.deepEqual(jobErrors(j.skills), []);
  assert.ok(jobErrors([{ name: 'Angular', must: true, minimum: 101 }]).length);
  assert.ok(jobErrors([{ name: 'SQL', must: false }]).length);
});
test('generated SVG QR is independently decodable and encodes no student/contact data', () => {
  const r = {
    id: 'r1',
    candidateId: 'c1',
    fairId: 'f1',
    studentId: 'PRIVATE-ID',
    ticketToken: crypto.randomUUID(),
  };
  const svg = ticketSvg(r);
  const size = Number(svg.match(/viewBox="0 0 (\d+)/)[1]);
  const scale = 8,
    width = size * scale;
  const rgba = new Uint8ClampedArray(width * width * 4);
  rgba.fill(255);
  for (const [, sx, sy] of svg.matchAll(/M(\d+) (\d+)h1/g)) {
    for (let y = Number(sy) * scale; y < (Number(sy) + 1) * scale; y++)
      for (let x = Number(sx) * scale; x < (Number(sx) + 1) * scale; x++) {
        const i = (y * width + x) * 4;
        rgba[i] = rgba[i + 1] = rgba[i + 2] = 0;
      }
  }
  const decoded = jsQR(rgba, width, width);
  assert.equal(decoded?.data, ticketPayload(r));
  assert.doesNotMatch(decoded.data, /PRIVATE-ID|c1|@/);
  assert.equal(svg, ticketSvg(r));
  const other = { ...r, ticketToken: crypto.randomUUID() };
  assert.notEqual(ticketPayload(r), ticketPayload(other));
});
test('skill gaps count distinct requesting companies, self-reported claims and assessed students separately', () => {
  const d = seed();
  d.candidates = [
    { ...d.candidates[0], skills: [{ name: 'Angular', score: 20 }] },
    { ...d.candidates[1], universityId: 'u1', skills: [{ name: 'angular' }] },
    { ...d.candidates[2], universityId: 'u2', skills: [{ name: 'Angular', score: 100 }] },
  ];
  d.jobs = [
    { ...d.jobs[0], id: 'one' },
    { ...d.jobs[0], id: 'two' },
    { ...d.jobs[0], id: 'three', companyId: 'co2' },
  ];
  d.fairs[0].companies = [
    { companyId: 'co1', jobIds: ['one', 'two'] },
    { companyId: 'co2', jobIds: ['three'] },
  ];
  const gap = universitySkillGaps(d, 'u1').find((g) => g.name.toLowerCase() === 'angular');
  assert.deepEqual(
    [gap.companies, gap.jobs, gap.claimed, gap.assessed, gap.total, gap.level],
    [2, 3, 2, 1, 2, 'red'],
  );
  assert.equal(universitySkillGaps(d, 'u2').find((g) => g.name === 'Angular').companies, 0);
});
test('safe profile URLs reject executable, non-HTTPS and credential URLs', () => {
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,hello',
    'http://example.test',
    'https://user:pass@example.test',
    'not a url',
  ])
    assert.equal(safeUrl(url), '');
  assert.equal(safeUrl('https://example.test/work'), 'https://example.test/work');
  assert.throws(() => validateLinks(['javascript:alert(1)']));
  assert.doesNotThrow(() => validateLinks(['', 'https://example.test']));
});
test('candidate profile editing, structured portfolio and full recruiter read-only view preserve contact privacy', async () => {
  const a = await app('/candidate/profile', 'candidate');
  try {
    await click(a, 'Edit profile');
    await fill(a, 'Headline', 'Thoughtful frontend engineer');
    await fill(a, 'Contact email', 'portfolio@example.test');
    await fill(a, 'Phone', '+20 100 000 0000');
    await fill(a, 'Portfolio website', 'https://example.test/portfolio');
    await click(a, 'Add project');
    const cards = a.w.document.querySelectorAll('#projects-editor .entry-editor');
    const last = cards[cards.length - 1];
    await fill(a, 'Project title', 'Design without GitHub', last);
    await fill(a, 'Description', 'Accessible campus service', last);
    await fill(a, 'Behance / Dribbble', 'https://example.test/case-study', last);
    await click(a, 'Save profile');
    assert.match(main(a), /Design without GitHub/);
    assert.equal(
      a.w.document.querySelector('a[href="mailto:portfolio@example.test"]').textContent,
      'portfolio@example.test',
    );
    await login(a, 'company');
    await go(a, '/company/candidates/c1');
    assert.match(main(a), /Thoughtful frontend engineer/);
    assert.match(main(a), /Design without GitHub/);
    assert.ok(a.w.document.querySelector('a[href="tel:+20 100 000 0000"]'));
    assert.equal(a.w.document.querySelector('form'), null);
    assert.equal(
      [...a.w.document.querySelectorAll('button')].some((e) => text(e).includes('Edit profile')),
      false,
    );
    assert.equal(
      a.w.document.querySelector('a[href="https://example.test/case-study"]').rel,
      'noopener noreferrer',
    );
    await go(a, '/candidate/profile');
    assert.equal(a.w.location.pathname, '/company/dashboard');
  } finally {
    await a.close();
  }
});
test('company and university view-first profiles persist edits and have meaningful navigation', async () => {
  const a = await app('/company/profile', 'company');
  try {
    await click(a, 'Edit profile');
    await fill(a, 'Industry', 'Creative technology');
    await fill(a, 'Website', 'https://example.test/team');
    await click(a, 'Save profile');
    await login(a, 'candidate');
    await go(a, '/candidate/companies/co1');
    assert.match(main(a), /Creative technology/);
    assert.equal(a.w.document.querySelector('form'), null);
    await login(a, 'university');
    await go(a, '/university/profile');
    await click(a, 'Edit profile');
    await fill(a, 'Branches / campuses', 'Cairo · East campus');
    await click(a, 'Save profile');
    assert.match(main(a), /East campus/);
    assert.ok(a.w.document.querySelector('.sidebar a[href="/university/profile"]'));
    await go(a, '/university/analytics');
    assert.match(main(a), /Requesting companies/);
    assert.match(main(a), /Students claiming skill/);
    assert.match(main(a), /Students assessed/);
    assert.ok(a.w.document.querySelector('.supply-label'));
  } finally {
    await a.close();
  }
});
test('fair tickets persist across role/reload, filter, deny other institutions and cancel on university change', async () => {
  const a = await app('/candidate/fairs/f1', 'candidate');
  try {
    await fill(a, 'Student ID', 'ECU-TICKET');
    await click(a, 'Register');
    assert.match(main(a), /My Fair Ticket/);
    const r = data(a).registrations[0];
    assert.ok(r.ticketToken);
    assert.equal(a.w.document.querySelectorAll('.fair-ticket').length, 1);
    await go(a, '/candidate/fairs');
    await go(a, '/candidate/fairs/f1');
    assert.equal(data(a).registrations[0].ticketToken, r.ticketToken);
    await click(a, 'View ticket');
    assert.equal(a.w.document.activeElement.id, 'tickets-title');
    await login(a, 'university');
    await go(a, '/university/fairs/f1?tab=registrations');
    assert.match(main(a), /ECU-TICKET/);
    await fill(a, 'Search registered students', 'not here');
    assert.equal(a.w.document.querySelectorAll('.fair-ticket').length, 0);
    await click(a, 'Clear filters');
    assert.equal(a.w.document.querySelectorAll('.fair-ticket').length, 1);
    await go(a, '/university/fairs/f2?tab=registrations');
    assert.doesNotMatch(main(a), /ECU-TICKET/);
    await login(a, 'candidate');
    await go(a, '/candidate/profile');
    await click(a, 'Edit profile');
    await fill(a, 'University', 'u2');
    await click(a, 'Save profile');
    assert.equal(data(a).registrations.length, 0);
  } finally {
    await a.close();
  }
});
test('Find Jobs has only bundled illustration and contextual actions; Technology tells the boundaries', async () => {
  const a = await app('/candidate/jobs', 'candidate');
  try {
    const section = a.w.document.querySelector('.career-boost');
    assert.ok(section);
    assert.equal(section.querySelector('img').getAttribute('src'), 'assets/career-desk.svg');
    assert.equal(section.querySelectorAll('a').length, 3);
    assert.doesNotMatch(main(a), /iAmYourCareerCopilot|Premium|Demo Mode|100% weights/);
    assert.equal(a.w.document.querySelector('iframe,script[src^="http"]'), null);
    await go(a, '/technology');
    assert.match(main(a), /not production secure/);
    assert.match(main(a), /does not synchronize across devices/);
    assert.match(main(a), /not real AI grading/);
    assert.match(main(a), /not secure admission/);
  } finally {
    await a.close();
  }
});
test('v1 browser persistence migrates on bootstrap without deleting application, generates stable unique tokens', async () => {
  const d = seed();
  d.version = 1;
  d.jobs[0].skills = [{ name: 'Angular', must: true, minimum: 65, weight: 100 }];
  d.registrations = [
    { id: 'r1', fairId: 'f1', candidateId: 'c1', studentId: 'STU1' },
    { id: 'r2', fairId: 'f1', candidateId: 'c4', studentId: 'STU2' },
  ];
  const a = await app('/candidate/fairs/f1', 'candidate', { state: d });
  try {
    const state = data(a);
    assert.equal(state.version, 2);
    assert.equal(state.applications[0].id, 'a1');
    assert.equal(state.jobs[0].skills[0].weight, undefined);
    assert.notEqual(state.registrations[0].ticketToken, state.registrations[1].ticketToken);
    const b = await app('/candidate/fairs/f1', 'candidate', { state });
    try {
      assert.equal(data(b).registrations[0].ticketToken, state.registrations[0].ticketToken);
    } finally {
      await b.close();
    }
  } finally {
    await a.close();
  }
});
test('unsafe image input fails without changing saved profile; fresh accounts can edit project collections', async () => {
  const a = await app('/candidate/profile', 'candidate');
  try {
    await click(a, 'Edit profile');
    const input = a.w.document.querySelector('input[type=file]');
    const before = data(a).candidates[0];
    const transfer = new a.w.DataTransfer();
    transfer.items.add(new a.w.File(['<svg/>'], 'unsafe.svg', { type: 'image/svg+xml' }));
    input.files = transfer.files;
    input.dispatchEvent(new a.w.Event('change', { bubbles: true }));
    await pause();
    assert.match(main(a), /Choose a JPG, PNG or WebP/);
    assert.deepEqual(data(a).candidates[0], before);
  } finally {
    await a.close();
  }
  const d = seed();
  delete d.candidates[0].portfolio;
  delete d.candidates[0].educationEntries;
  delete d.candidates[0].experienceEntries;
  d.candidates[0].projects = '';
  d.candidates[0].education = '';
  d.candidates[0].experience = '';
  const b = await app('/candidate/profile', 'candidate', { state: d });
  try {
    await click(b, 'Edit profile');
    await click(b, 'Add project');
    assert.equal(b.w.document.querySelectorAll('#projects-editor .entry-editor').length, 1);
    assert.equal(b.errors.length, 0);
  } finally {
    await b.close();
  }
});
test('landing process and About anchors preserve the Angular route', async () => {
  const a = await app('/');
  try {
    find(a, 'a', 'See how it works').click();
    await pause();
    await pause();
    assert.equal(a.w.location.pathname, '/');
    assert.equal(a.w.location.hash, '#how-it-works');
    assert.match(main(a), /More than a résumé/);
    find(a, 'a', 'About us').click();
    await pause();
    await pause();
    assert.equal(a.w.location.hash, '#about');
    assert.match(main(a), /Potential deserves to be seen/);
  } finally {
    await a.close();
  }
});
