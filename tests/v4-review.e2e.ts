import { test, expect, Page } from '@playwright/test';
import { seed } from '../src/app/core/seed';
async function login(page: Page, role: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email', { exact: true }).fill(role + '@skill2work.demo');
  await page.getByLabel('Password', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/' + role + '/'));
}
test('V4 desktop/mobile visual review, image persistence, ticket PNG and university roster', async ({
  page,
}) => {
  test.setTimeout(180000);
  const d = seed();
  d.registrations = [
    {
      id: 'visual-registration',
      fairId: 'f1',
      candidateId: 'c1',
      studentId: 'ECU-VISUAL',
      ticketToken: '6d035396-9acb-42a8-8cdf-00e247b40587',
    },
  ];
  await page.addInitScript((d) => {
    if (!localStorage.getItem('skill2work.demo.v1'))
      localStorage.setItem('skill2work.demo.v1', JSON.stringify(d));
  }, d);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.screenshot({ path: 'test-results/v4-landing.png', fullPage: true });
  for (const [role, paths] of Object.entries({
    candidate: ['jobs', 'jobs/j1', 'profile', 'skills', 'fairs/f1'],
    company: ['profile', 'candidates/c1'],
    university: ['profile', 'analytics', 'fairs/f1?tab=registrations'],
    admin: ['companies', 'settings'],
  })) {
    await login(page, role);
    for (const path of paths) {
      await page.goto('/' + role + '/' + path);
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(page.locator('main h1')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await page.screenshot({
          path:
            'test-results/v4-' + role + '-' + path.replace(/[^\w]/g, '-') + '-' + width + '.png',
          fullPage: true,
        });
      }
    }
  }
  await login(page, 'candidate');
  await page.goto('/candidate/profile');
  await page.getByRole('button', { name: 'Edit profile', exact: true }).click();
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 200;
    c.height = 200;
    const x = c.getContext('2d')!;
    x.fillStyle = '#6556E8';
    x.fillRect(0, 0, 200, 200);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page
    .locator('input[type=file]')
    .nth(1)
    .setInputFiles({
      name: 'portrait.png',
      mimeType: 'image/png',
      buffer: Buffer.from(png, 'base64'),
    });
  await expect(page.getByText('Preparing image…')).not.toBeVisible();
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await page.reload();
  await expect(page.locator('.profile-identity img')).toBeVisible();
  await page.goto('/candidate/fairs/f1');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG' }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  expect(await download.failure()).toBeNull();
  await page.getByRole('button', { name: 'Change language', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.screenshot({ path: 'test-results/v4-ticket-arabic-dark.png', fullPage: true });
  expect(errors).toEqual([]);
});
