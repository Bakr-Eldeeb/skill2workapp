import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const raw = process.argv[2] ?? process.env.PAGES_BASE_PATH ?? '/skill2work/';
const base = '/' + raw.split('/').filter(Boolean).join('/') + '/';
const baseHref = base === '//' ? '/' : base;
if (!/^\/(?:[a-zA-Z0-9_.-]+\/)*$/.test(baseHref)) throw new Error('Invalid Pages base path.');
const result = spawnSync(
  process.execPath,
  [
    'node_modules/@angular/cli/bin/ng.js',
    'build',
    '--configuration',
    'pages',
    '--base-href',
    baseHref,
  ],
  { stdio: 'inherit' },
);
if (result.status !== 0) process.exit(result.status ?? 1);
writeFileSync('dist/skill2work/browser/.nojekyll', '');
console.log(`Pages artifact ready at dist/skill2work/browser with base ${baseHref}`);
