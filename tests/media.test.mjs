import '@angular/compiler';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateImage, MediaStore } from '../src/app/core/media.ts';
test('media rejects unsafe types/oversize files before decoding; fallback references are bounded', async () => {
  assert.throws(() => validateImage({ type: 'image/svg+xml', size: 500 }));
  assert.throws(() => validateImage({ type: 'image/png', size: 6 * 1024 * 1024 }));
  assert.doesNotThrow(() => validateImage({ type: 'image/webp', size: 1000 }));
  const media = new MediaStore();
  assert.equal(await media.source('https://third-party.test/image.png'), '');
  assert.equal(await media.source('data:image/webp;base64,' + 'x'.repeat(120000)), '');
  assert.equal(await media.source('assets/career-desk.svg'), 'assets/career-desk.svg');
});
