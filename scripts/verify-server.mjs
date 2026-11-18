import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const windows = process.platform === 'win32';
const server = spawn(windows ? 'npm.cmd' : 'npm', ['start'], {
  shell: windows,
  detached: !windows,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
server.stdout.on('data', (b) => (log += b));
server.stderr.on('data', (b) => (log += b));
try {
  let ready = false;
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch('http://127.0.0.1:4200/');
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(ready, log);
  for (const route of [
    '/',
    '/sign-in',
    '/candidate/assessments',
    '/company/dashboard',
    '/university/dashboard',
    '/admin/companies',
  ]) {
    const r = await fetch('http://127.0.0.1:4200' + route);
    assert.equal(r.status, 200);
    const html = await r.text();
    assert.match(html, /<title>Skill2Work \| Prove Skills\. Find Work\.<\/title>/);
    assert.match(html, /<app-root>/);
    console.log('PASS HTTP route + title: ' + route);
  }
  for (const asset of [
    'favicon.svg',
    'favicon.ico',
    'skill2work-logo-light.svg',
    'skill2work-logo-dark.svg',
    'skill2work-mark.svg',
    'apple-touch-icon.png',
  ]) {
    const r = await fetch('http://127.0.0.1:4200/assets/' + asset);
    assert.equal(r.status, 200);
    assert.ok((await r.arrayBuffer()).byteLength > 50);
    console.log('PASS asset response: ' + asset);
  }
  console.log(
    'npm start readiness and 12 HTTP checks passed. These HTTP checks do not prove browser rendering.',
  );
} finally {
  if (windows) spawn('taskkill', ['/pid', String(server.pid), '/T', '/F']);
  else
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      server.kill();
    }
}
