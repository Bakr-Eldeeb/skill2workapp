import { test, expect, Page } from '@playwright/test';
import { seed } from '../src/app/core/seed';
async function login(page: Page, role: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email', { exact: true }).fill(role + '@skill2work.demo');
  await page.getByLabel('Password', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/' + role + '/'));
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript((d) => {
    if (!localStorage.getItem('skill2work.demo.v1'))
      localStorage.setItem('skill2work.demo.v1', JSON.stringify(d));
  }, seed());
});
test('final Back parent/history, skill sections and empty password field', async ({ page }) => {
  await login(page, 'candidate');
  await expect(page.locator('.back-button')).toHaveCount(0);
  await page.goto('/candidate/jobs/j2/apply');
  await page.reload();
  await page.locator('s2w-back').getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/candidate\/jobs\/j2$/);
  await page.goto('/candidate/passport');
  await expect(
    page.locator('.view-switch').getByRole('button', { name: 'Skills & Passport', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page
    .locator('.view-switch')
    .getByRole('button', { name: 'Assessment results', exact: true })
    .click();
  await expect(page.locator('main')).toContainText('No results yet.');
  await page.goto('/candidate/settings');
  await expect(page.getByLabel('New password')).toHaveValue('');
  await expect(page.locator('main')).not.toContainText('Demo123!');
});
test('fair sections and Arabic mobile reduced-motion review', async ({ page }) => {
  await login(page, 'university');
  await page.goto('/university/fairs/f1');
  await page
    .locator('.view-switch')
    .getByRole('button', { name: 'Registration Tickets', exact: true })
    .click();
  await expect(page.locator('main')).toContainText('No fair registrations yet.');
  await page.locator('.view-switch').getByRole('button', { name: 'Jobs', exact: true }).click();
  await expect(page.locator('main')).toContainText('Frontend Developer');
  await login(page, 'candidate');
  await page.goto('/candidate/skills');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Change language' }).click();
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: 'test-results/final-skills-arabic-dark-mobile.png',
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/candidate/jobs');
  const bar = page.locator('.match-track i').first();
  await expect(bar).toBeVisible();
  expect(await bar.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});
