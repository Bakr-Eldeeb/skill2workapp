import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
const files = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
    );
test('all TypeScript sources parse and object properties are unique, including identifier keys', () => {
  for (const file of files('src').filter((f) => f.endsWith('.ts'))) {
    const tree = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    assert.equal(tree.parseDiagnostics.length, 0, file);
    const visit = (n) => {
      if (ts.isObjectLiteralExpression(n)) {
        const seen = new Set();
        for (const p of n.properties) {
          if (
            p.name &&
            (ts.isStringLiteral(p.name) || ts.isIdentifier(p.name) || ts.isNumericLiteral(p.name))
          ) {
            assert.ok(!seen.has(p.name.text), `${file}: duplicate ${p.name.text}`);
            seen.add(p.name.text);
          }
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(tree);
  }
});
test('no shared secret is printed by Settings and local demo persistence is isolated', () => {
  const template = fs.readFileSync('src/app/features/settings/settings.html', 'utf8');
  assert.doesNotMatch(template, /u\.password|track u\.id/);
  assert.doesNotMatch(template, /Demo123!|demoAccounts/);
  const store = fs.readFileSync('src/app/core/store.ts', 'utf8');
  assert.doesNotMatch(store, /localStorage\./);
  assert.match(store, /DEMO_PERSISTENCE/);
});
test('CSS motion has a global reduced-motion override after the animation rules', () => {
  const css = fs.readFileSync('src/styles.css', 'utf8');
  assert.match(css, /prefers-reduced-motion/);
  const tail = css.slice(css.lastIndexOf('@media (prefers-reduced-motion'));
  assert.match(tail, /animation:\s*none\s*!important/);
  assert.match(tail, /transition:\s*none\s*!important/);
});
