/** Actual Pages build regression checks in a DOM runtime; no visual-browser claim. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Window } from 'happy-dom';
import { seed } from '../src/app/core/seed.ts';
const folder = 'dist/skill2work/browser';
const html = fs.readFileSync(folder + '/index.html', 'utf8');
const base = html.match(/<base href="([^"]+)"/)[1];
const script = fs.readFileSync(
  folder + '/' + fs.readdirSync(folder).find((f) => /^main-.*\.js$/.test(f)),
  'utf8',
);
const delay = () => new Promise((r) => setTimeout(r, 100));
for (const [role, route] of [
  ['candidate', 'assessments'],
  ['candidate', 'companies/co1'],
  ['candidate', 'applications/a1'],
  ['candidate', 'profile'],
  ['company', 'candidates/c1'],
  ['company', 'profile'],
  ['university', 'profile'],
  ['university', 'analytics'],
  ['university', 'fairs/f1?tab=registrations'],
  ['company', 'dashboard'],
  ['candidate', 'jobs'],
  ['university', 'dashboard'],
  ['admin', 'companies'],
]) {
  test(`Pages ${role}/${route}: hash deep-link boot, repository-relative assets and navigation`, async () => {
    const w = new Window({
      url: 'https://example.github.io' + base + '#/' + role + '/' + route,
      settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true },
    });
    const errors = [];
    w.console.error = (...args) => errors.push(args.map(String).join(' '));
    w.structuredClone = globalThis.structuredClone;
    const d = seed();
    w.localStorage.setItem('skill2work.demo.v1', JSON.stringify(d));
    w.localStorage.setItem(
      's2w.session',
      d.users.find((u) => u.email === role + '@skill2work.demo').id,
    );
    w.document.write(
      html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<link\b[^>]*>/gi, (tag) => (/\.css/.test(tag) ? '' : tag)),
    );
    w.eval(script);
    await delay();
    await delay();
    try {
      assert.ok(w.document.querySelector('main h1'));
      assert.ok(w.document.querySelector('main').textContent.length > 60);
      if (role === 'candidate' && route === 'assessments')
        assert.match(w.document.querySelector('main').textContent, /Assessment overview/);
      const logo = w.document.querySelector('s2w-logo img');
      assert.equal(
        logo.src,
        'https://example.github.io' + base + 'assets/skill2work-logo-light.svg',
      );
      const favicon = w.document.querySelector('link[rel=icon]');
      assert.equal(favicon.href, 'https://example.github.io' + base + 'assets/favicon.svg');
      const beforeHash = w.location.hash;
      w.document.querySelector('.skip-link').click();
      await delay();
      assert.equal(w.location.hash, beforeHash);
      assert.equal(w.document.activeElement.id, 'content');
      const link = w.document.querySelector('.sidebar nav a');
      assert.ok(link.getAttribute('href').includes('#/'));
      link.click();
      await delay();
      assert.ok(w.location.hash.startsWith('#/' + role + '/'));
      assert.equal(errors.length, 0, errors.join('\n'));
    } finally {
      await w.happyDOM.close();
    }
  });
}
test('Pages output has valid base, favicon files, compiled app and .nojekyll marker', () => {
  assert.match(base, /^\/(?:[\w.-]+\/)*$/);
  assert.ok(fs.existsSync(folder + '/.nojekyll'));
  for (const asset of [
    'favicon.svg',
    'favicon.ico',
    'skill2work-logo-light.svg',
    'skill2work-logo-dark.svg',
  ])
    assert.ok(fs.statSync(folder + '/assets/' + asset).size > 0);
});
test('Pages landing section links retain the public route instead of entering a missing route', async () => {
  const w = new Window({
    url: 'https://example.github.io' + base + '#/',
    settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true },
  });
  w.structuredClone = globalThis.structuredClone;
  w.document.write(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<link\b[^>]*>/gi, (tag) => (/\.css/.test(tag) ? '' : tag)),
  );
  w.eval(script);
  await delay();
  await delay();
  try {
    const link = [...w.document.querySelectorAll('a')].find((a) =>
      a.textContent.includes('See how it works'),
    );
    assert.ok(link);
    link.click();
    await delay();
    assert.ok(w.location.hash.startsWith('#/'));
    assert.ok(w.location.hash.includes('how-it-works'));
    assert.match(w.document.querySelector('main h1').textContent, /More than a résumé/);
  } finally {
    await w.happyDOM.close();
  }
});
