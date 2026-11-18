/** Runs the actual AOT-compiled Angular bundle in Happy DOM. Not a visual/browser test. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Window } from 'happy-dom';
import { seed } from '../src/app/core/seed.ts';
const output = 'dist/skill2work/browser';
const bundle = fs.readFileSync(
  output + '/' + fs.readdirSync(output).find((f) => /^main-.*\.js$/.test(f)),
  'utf8',
);
const pause = () => new Promise((r) => setTimeout(r, 40));
const text = (el) => el?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
async function app(path = '/', role, restore) {
  const w = new Window({ url: 'http://localhost:4200' + path });
  w.document.write(
    '<!doctype html><html><head><base href="/"></head><body><app-root></app-root></body></html>',
  );
  w.structuredClone = globalThis.structuredClone;
  const d = restore?.state ?? seed();
  if (restore?.experience) w.localStorage.setItem('s2w.experience.v3', restore.experience);
  if (restore?.attempt) w.sessionStorage.setItem('s2w.attempt', restore.attempt);
  w.localStorage.setItem('skill2work.demo.v1', JSON.stringify(d));
  if (role)
    w.localStorage.setItem(
      's2w.session',
      d.users.find((u) => u.email === role + '@skill2work.demo').id,
    );
  const errors = [];
  w.console.error = (...args) => errors.push(args.map(String).join(' '));
  w.eval(bundle);
  await pause();
  await pause();
  return { w, errors, close: () => w.happyDOM.close() };
}
async function go(a, path) {
  a.w.history.pushState({}, '', path);
  a.w.dispatchEvent(new a.w.PopStateEvent('popstate'));
  await pause();
  await pause();
  assert.equal(a.errors.length, 0, a.errors.join('\n'));
}
function find(a, selector, name, root = a.w.document) {
  const elements = [...root.querySelectorAll(selector)];
  const el =
    elements.find((e) => text(e) === name) ||
    elements.find((e) => text(e).startsWith(name)) ||
    elements.find((e) => text(e).includes(name));
  assert.ok(
    el,
    `Missing ${selector}: ${name}. Main: ${text(a.w.document.querySelector('main')).slice(0, 500)}`,
  );
  return el;
}
async function fill(a, label, value, root) {
  const el = find(a, 'label', label, root).querySelector('input,select,textarea');
  assert.ok(el);
  el.value = value;
  el.dispatchEvent(new a.w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  await pause();
}
async function click(a, name, root) {
  find(a, 'button', name, root).click();
  await pause();
  await pause();
}
async function login(a, role, email = role + '@skill2work.demo') {
  await go(a, '/sign-in');
  await fill(a, 'Email', email);
  await fill(a, 'Password', 'Demo123!');
  await click(a, 'Sign in');
}
function main(a) {
  return text(a.w.document.querySelector('main'));
}
function data(a) {
  return JSON.parse(a.w.localStorage.getItem('skill2work.demo.v1'));
}

export { app, go, find, fill, click, login, main, data, pause, text };
