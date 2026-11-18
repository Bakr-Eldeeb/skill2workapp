import { expect, test } from '@playwright/test';
import { checkJobsFooterLayout } from './jobs-footer-layout.mjs';
import { seed } from '../src/app/core/seed';

for (const [name, width, height, language, theme] of [
  ['desktop', 1440, 900, 'en', 'light'],
  ['mobile RTL', 390, 844, 'ar', 'dark'],
] as const) {
  test(`Find Jobs stops at the footer with a trailing widget on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(
      ({ db, language, theme }) => {
        localStorage.setItem('skill2work.demo.v1', JSON.stringify(db));
        localStorage.setItem('s2w.session', 'uc1');
        localStorage.setItem('s2w.language', language);
        localStorage.setItem('s2w.theme', theme);
      },
      { db: seed(), language, theme },
    );
    await page.goto('/candidate/jobs');
    const pane = page.locator('.workspace.jobs-directory');
    await expect(pane).toBeVisible();
    await page.evaluate(checkJobsFooterLayout);
    await pane.press('Home');
    await expect.poll(() => pane.evaluate((el) => el.scrollTop)).toBe(0);
    await page.locator('.filters input').fill('zzzz-no-such-job');
    await expect(page.locator('s2w-empty')).toBeVisible();
    await page.evaluate(checkJobsFooterLayout);
    await page.locator('.boost-links a').first().click();
    await expect(page).toHaveURL(/\/candidate\/profile$/);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(pane).toHaveCount(0);
  });
}
