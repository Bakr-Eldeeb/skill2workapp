import { test, expect, Page } from '@playwright/test';
import { seed } from '../src/app/core/seed';
async function login(page: Page, role: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email', { exact: true }).fill(role + '@skill2work.demo');
  await page.getByLabel('Password', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/' + role + '/'));
}
test('V3 experience review across desktop, mobile, four roles, RTL and dark mode', async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript((d) => {
    if (!localStorage.getItem('skill2work.demo.v1'))
      localStorage.setItem('skill2work.demo.v1', JSON.stringify(d));
  }, seed());
  for (const route of ['/', '/sign-in']) {
    await page.goto(route);
    await expect(page.locator('main h1')).toBeVisible();
    await page.screenshot({
      path: 'test-results/v3-' + (route === '/' ? 'landing' : 'sign-in') + '.png',
      fullPage: true,
    });
  }
  const paths: Record<string, string[]> = {
    candidate: [
      'dashboard',
      'skills',
      'profile',
      'jobs',
      'jobs/j1',
      'companies/co1',
      'applications/a1',
      'fairs/f1',
      'assessments',
    ],
    company: ['profile', 'candidates/c1', 'dashboard', 'talent', 'applicants'],
    university: ['profile', 'analytics', 'dashboard', 'fairs/f1'],
    admin: ['companies', 'universities'],
  };
  for (const [role, routes] of Object.entries(paths)) {
    await login(page, role);
    for (const path of routes) {
      await page.goto('/' + role + '/' + path);
      for (const viewport of [
        { width: 1440, height: 900 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(viewport);
        await expect(page.locator('main h1')).toBeVisible();
        expect(await page.locator('main').innerText()).not.toBe('');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await page.screenshot({
          path:
            'test-results/v3-' +
            role +
            '-' +
            path.replaceAll('/', '-') +
            '-' +
            viewport.width +
            '.png',
          fullPage: true,
        });
      }
    }
  }
  await login(page, 'candidate');
  await page.goto('/candidate/companies/co1');
  await page.getByRole('button', { name: 'Change language' }).click();
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'test-results/v3-company-arabic-dark-mobile.png', fullPage: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page.locator('.organization-hero').evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  expect(errors).toEqual([]);
});
