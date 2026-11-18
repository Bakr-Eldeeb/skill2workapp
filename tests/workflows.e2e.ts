import { test, expect, Page } from '@playwright/test';
import { seed } from '../src/app/core/seed';
const password = 'Demo123!';
async function login(page: Page, role: string, email = role + '@skill2work.demo') {
  await page.goto('/sign-in');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(
    new RegExp(
      '/' +
        (role === 'admin'
          ? 'admin/companies'
          : role === 'company'
            ? '(company/dashboard|account-status)'
            : role + '/dashboard'),
    ),
  );
}
async function state(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('skill2work.demo.v1')!));
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript((d) => {
    if (!localStorage.getItem('skill2work.demo.v1'))
      localStorage.setItem('skill2work.demo.v1', JSON.stringify(d));
  }, seed());
});
test('all screen groups, deep reloads, role guards, branding, favicon and responsive content', async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page).toHaveTitle('Skill2Work | Prove Skills. Find Work.');
  expect((await page.request.get('/assets/favicon.svg')).status()).toBe(200);
  await page.screenshot({ path: 'test-results/landing-desktop.png', fullPage: true });
  for (const publicRoute of ['/sign-in', '/sign-up', '/company-sign-up']) {
    await page.goto(publicRoute);
    await expect(page.locator('main h1')).toBeVisible();
  }
  const routes: Record<string, string[]> = {
    candidate: [
      'dashboard',
      'profile',
      'skills',
      'assessments',
      'results',
      'passport',
      'jobs',
      'jobs/j1',
      'jobs/j2/apply',
      'applications',
      'fairs',
      'fairs/f1',
      'notifications',
      'settings',
    ],
    company: [
      'dashboard',
      'profile',
      'jobs',
      'jobs/new',
      'jobs/j1/edit',
      'recommendations',
      'talent',
      'candidates/c1',
      'applicants',
      'pipeline',
      'fairs',
      'fairs/f1',
      'notifications',
      'settings',
    ],
    university: [
      'dashboard',
      'fairs',
      'fairs/new',
      'fairs/f1',
      'fairs/f1/edit',
      'registrations',
      'analytics',
      'settings',
    ],
    admin: ['companies', 'universities', 'settings'],
  };
  for (const [role, paths] of Object.entries(routes)) {
    await login(page, role);
    for (const path of paths) {
      await page.goto('/' + role + '/' + path);
      await expect(page.locator('main h1')).toBeVisible();
      if (
        [
          'skills',
          'assessments',
          'jobs/j1',
          'applications',
          'jobs/new',
          'talent',
          'applicants',
          'fairs/f1',
          'universities',
        ].includes(path)
      ) {
        await page.screenshot({
          path: 'test-results/final-' + role + '-' + path.replaceAll('/', '-') + '-desktop.png',
          fullPage: true,
        });
      }
      expect((await page.locator('main').innerText()).length).toBeGreaterThan(60);
      await expect(page.locator('s2w-logo img').first()).toBeVisible();
      expect(
        await page
          .locator('s2w-logo img')
          .first()
          .evaluate((el: HTMLImageElement) => el.naturalWidth),
      ).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.goto('/' + role + '/' + paths[0]);
    await page.screenshot({ path: 'test-results/' + role + '-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.mobile-nav')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: 'test-results/' + role + '-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  await login(page, 'candidate');
  await page.goto('/candidate/assessments');
  await page.reload();
  await expect(page.locator('main')).toContainText('Assessment overview');
  await expect(page.getByRole('button', { name: 'Start assessment', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/assessments-desktop.png', fullPage: true });
  await page.goto('/admin/companies');
  await expect(page).toHaveURL(/candidate\/dashboard/);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.goto('/candidate/assessments');
  await expect(page).toHaveURL(/sign-in/);
  expect(errors).toEqual([]);
});
test('candidate signup, validation, manual profile, claimed skills and apply without assessment across roles', async ({
  page,
}) => {
  await page.goto('/sign-up');
  await page.getByLabel('Name', { exact: true }).fill('Test Candidate');
  await page.getByLabel('Email', { exact: true }).fill('newcandidate@skill2work.demo');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill('Wrong123!');
  await page.locator('select[formcontrolname=universityId]').selectOption('u1');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Passwords do not match');
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/candidate\/dashboard/);
  await expect(page.locator('main')).toContainText('Not Assessed Yet');
  await page.goto('/candidate/profile');
  await page.getByRole('button', { name: 'Edit profile', exact: true }).click();
  await page.getByLabel('About', { exact: true }).fill('I build useful interfaces.');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await page.goto('/candidate/skills');
  await page.getByLabel('Skill name').fill('Angular');
  await page.getByRole('button', { name: 'Add skill', exact: false }).click();
  await expect(page.locator('main')).toContainText('Claimed');
  await page.goto('/candidate/jobs/j1/apply');
  await page.getByLabel('Cover letter (optional)').fill('Ready to contribute.');
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(page.locator('main')).toContainText('Application submitted.');
  await page.reload();
  await expect(page.locator('main')).toContainText('Already applied');
  await page.goto('/candidate/applications');
  await expect(page.locator('main')).toContainText('Frontend Developer');
  await login(page, 'company');
  await page.goto('/company/applicants');
  await expect(page.locator('main')).toContainText('Test Candidate');
  await page.goto('/company/talent');
  await page.getByLabel('Search', { exact: true }).fill('Test Candidate');
  await expect(page.locator('main')).toContainText('Test Candidate');
  await page.goto('/company/recommendations');
  await page.getByLabel('Search', { exact: true }).fill('Test Candidate');
  await expect(page.locator('main')).toContainText('No eligible candidates yet.');
});
test('company signup, pending/rejected guards, approval, invalid publish, draft and valid publish', async ({
  page,
}) => {
  await page.goto('/company-sign-up');
  await page.getByLabel('Company name').fill('Test Nile Team');
  await page.getByLabel('Email', { exact: true }).fill('newcompany@skill2work.demo');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/account-status/);
  await page.goto('/company/jobs/new');
  await expect(page).toHaveURL(/account-status/);
  await login(page, 'admin');
  const card = page.locator('article').filter({ hasText: 'Test Nile Team' });
  await card.getByRole('button', { name: 'Reject', exact: true }).click();
  await login(page, 'company', 'newcompany@skill2work.demo');
  await expect(page.locator('main')).toContainText('Account rejected');
  await login(page, 'admin');
  await page.getByLabel('Account type').selectOption('Rejected');
  await page
    .locator('article')
    .filter({ hasText: 'Test Nile Team' })
    .getByRole('button', { name: 'Approve', exact: true })
    .click();
  await login(page, 'company', 'newcompany@skill2work.demo');
  await page.goto('/company/jobs/new');
  await page.getByLabel('Job title').fill('Test Angular Engineer');
  await page
    .getByLabel('Description', { exact: true })
    .fill('Build accessible Angular experiences.');
  await page.locator('.skill-row').getByLabel('Skill name').fill('Angular');
  await page.locator('.skill-row').getByLabel('Minimum').fill('101');
  await page.getByRole('button', { name: 'Publish job', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('between 0 and 100');
  await expect(page).toHaveURL(/jobs\/new/);
  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect(page.locator('main')).toContainText('Draft');
  await page.getByRole('link', { name: 'Edit job' }).click();
  await page.locator('.skill-row').getByLabel('Minimum').fill('60');
  await page.getByRole('button', { name: 'Publish job', exact: true }).click();
  await expect(page.locator('main')).toContainText('Published');
  await login(page, 'candidate');
  await page.goto('/candidate/jobs');
  await page.getByLabel('Search jobs').fill('Test Angular Engineer');
  await expect(page.locator('main')).toContainText('Test Angular Engineer');
});
test('assessment visible, one question, timer, MCQ/open answers, result, cooldown and cancellation', async ({
  page,
}) => {
  await login(page, 'candidate');
  await page.goto('/candidate/skills');
  await page.getByLabel('Skill name').fill('Figma');
  await page.getByRole('button', { name: 'Add skill', exact: false }).click();
  await page.goto('/candidate/assessments?skill=Figma');
  await page.getByRole('button', { name: 'Start assessment', exact: true }).click();
  await expect(page.locator('.question')).toBeVisible();
  await expect(page.locator('.timer')).toContainText('s');
  await expect(page.locator('.question')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.question')).toBeVisible();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Next question' }).click();
  for (let i = 0; i < 3; i++) {
    await page
      .getByLabel('Answer', { exact: true })
      .fill('I compare expected behavior with observed results and explain the trade-offs.');
    await page
      .getByRole('button', { name: i === 2 ? 'Submit assessment' : 'Next question' })
      .click();
  }
  await expect(page).toHaveURL(/candidate\/results/);
  await expect(page.locator('main h2').first()).toContainText('Assessment results');
  await expect(page.locator('main')).toContainText('Strengths');
  await expect(page.locator('main')).toContainText('Practice assessment');
  await page.goto('/candidate/assessments?skill=Figma');
  await page.getByRole('button', { name: 'Start assessment', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('24 hours');
  await page.goto('/candidate/assessments?skill=Angular');
  await page.getByRole('button', { name: 'Start assessment', exact: true }).click();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Cancel assessment' }).click();
  await expect(page.locator('main')).toContainText('Assessment overview');
});
test('hiring updates, interview scheduling, accept/decline/reschedule, notices and requirement edits', async ({
  page,
}) => {
  await login(page, 'company');
  await page.goto('/company/applicants');
  const card = page.locator('article').filter({ hasText: 'Omar Hassan' });
  await card.getByLabel('Application status').selectOption('Shortlisted');
  await card.getByRole('button', { name: 'Save status' }).click();
  await card.getByLabel('Date and time').fill('2027-01-10T10:00');
  await card.getByRole('button', { name: 'Schedule interview' }).click();
  await expect(card).toContainText('Pending');
  await login(page, 'candidate');
  await page.goto('/candidate/applications');
  await expect(page.locator('main')).toContainText('Interview');
  await page.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect(page.locator('main')).toContainText('Accepted');
  await page.getByRole('button', { name: 'Decline', exact: true }).click();
  await expect(page.locator('main')).toContainText('Declined');
  await page.getByLabel('Note (optional)').fill('Could we meet at 14:00?');
  await page.getByRole('button', { name: 'Request reschedule' }).click();
  await login(page, 'company');
  await page.goto('/company/pipeline');
  await expect(page.locator('main')).toContainText('Reschedule requested');
  await expect(page.locator('main')).toContainText('Could we meet at 14:00?');
  await page.locator('article').getByLabel('Application status').selectOption('Hired');
  await page.getByRole('button', { name: 'Save status' }).click();
  await page.goto('/company/jobs/j1/edit');
  await page.locator('.skill-row').first().getByLabel('Minimum').fill('90');
  await page.getByRole('button', { name: 'Publish job', exact: true }).click();
  await login(page, 'candidate');
  await page.goto('/candidate/applications');
  await expect(page.locator('main')).toContainText('Hired');
  await page.goto('/candidate/notifications');
  await expect(page.locator('main')).toContainText('Job requirements updated');
  await expect(page.locator('main')).toContainText('Application update: Hired');
});
test('university fair, company join, candidate registration, attributed application, analytics and university change', async ({
  page,
}) => {
  await login(page, 'university');
  await page.goto('/university/fairs/new');
  await page.getByLabel('Fair name').fill('Test Campus Fair');
  await page.getByLabel('Date and time').fill('2027-01-20T10:00');
  await page.getByLabel('Location', { exact: true }).fill('Cairo campus');
  await page.getByLabel('Description', { exact: true }).fill('A fictional campus event.');
  await page.getByRole('button', { name: 'Save fair' }).click();
  const id = page.url().split('/').pop()!;
  await login(page, 'company');
  await page.goto('/company/fairs/' + id);
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Save participation' }).click();
  await expect(page.locator('main')).toContainText('Nile Pixel Studio');
  await login(page, 'candidate');
  await page.goto('/candidate/fairs');
  await expect(page.locator('main')).not.toContainText('Aswan Career Connections');
  await page.goto('/candidate/fairs/' + id);
  await page.getByLabel('Student ID', { exact: true }).fill('ECU-DEMO-123');
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await expect(page.locator('main')).toContainText('Registered');
  await page.getByRole('link', { name: 'View job' }).click();
  await page.getByRole('link', { name: 'Already applied' }).click();
  await expect(page.locator('main')).toContainText('Already applied');
  let d = await state(page);
  expect(d.applications.find((a: any) => a.id === 'a1').fairId).toBeUndefined();
  await login(page, 'company');
  await page.goto('/company/jobs/new');
  await page.getByLabel('Job title').fill('Fair Only Engineer');
  await page.getByLabel('Description', { exact: true }).fill('Build a fictional service.');
  await page.locator('.skill-row').getByLabel('Skill name').fill('Angular');
  await page.getByRole('button', { name: 'Publish job', exact: true }).click();
  await page.goto('/company/fairs/' + id);
  await page.getByRole('checkbox').last().check();
  await page.getByRole('button', { name: 'Save participation' }).click();
  await login(page, 'candidate');
  await page.goto('/candidate/fairs/' + id);
  await page
    .locator('s2w-job-card')
    .filter({ hasText: 'Fair Only Engineer' })
    .getByRole('link', { name: 'View job' })
    .click();
  await page.getByRole('link', { name: 'Apply now' }).click();
  await page.getByRole('button', { name: 'Submit application' }).click();
  await login(page, 'university');
  await page.goto('/university/analytics');
  await expect(page.getByTestId('registration-count')).toHaveText('1');
  await expect(page.getByTestId('fair-application-count')).toHaveText('1');
  await page.goto('/university/registrations');
  await expect(page.locator('main')).toContainText('ECU-DEMO-123');
  await login(page, 'candidate');
  await page.goto('/candidate/profile');
  await page.getByRole('button', { name: 'Edit profile', exact: true }).click();
  await page.locator('select[formcontrolname=universityId]').selectOption('u2');
  await page.getByRole('button', { name: 'Save profile' }).click();
  d = await state(page);
  expect(d.registrations.filter((r: any) => r.candidateId === 'c1')).toHaveLength(0);
  expect(d.applications.filter((a: any) => a.fairId === id)).toHaveLength(1);
  await page.goto('/candidate/fairs/' + id);
  await expect(page.locator('main')).toContainText('Page not found');
});
test('Arabic RTL, dark mode persistence, mobile More, filters, empty states and account editing', async ({
  page,
}) => {
  await login(page, 'candidate');
  await page.goto('/candidate/jobs');
  await page.getByLabel('Search jobs').fill('no such job');
  await expect(page.locator('main')).toContainText('No matching results.');
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.locator('s2w-job-card')).toHaveCount(9);
  await page.getByRole('button', { name: 'Change language' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('main h1')).toHaveText('اكتشف الوظائف');
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/arabic-dark-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'الحساب' }).click();
  await expect(page.locator('.more-sheet')).toBeVisible();
  await page.locator('.more-sheet').getByRole('link', { name: 'الإعدادات' }).click();
  await expect(page.locator('main h1')).toHaveText('الإعدادات');
  await page.getByRole('button', { name: 'Change language' }).click();
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.getByLabel('Email', { exact: true }).fill('edited@skill2work.demo');
  await page.getByRole('button', { name: 'Save account' }).click();
  await login(page, 'candidate', 'edited@skill2work.demo');
  await expect(page).toHaveURL(/candidate\/dashboard/);
});
test('admin creates and edits university account and new institution can sign in', async ({
  page,
}) => {
  await login(page, 'admin');
  await page.goto('/admin/universities');
  await page.getByRole('button', { name: 'Create university account' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Demo Future University');
  await page.getByLabel('Location', { exact: true }).fill('Aswan');
  await page.getByLabel('Email', { exact: true }).fill('newuniversity@skill2work.demo');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Save account' }).click();
  const row = page.locator('article').filter({ hasText: 'Demo Future University' });
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Location', { exact: true }).fill('Cairo');
  await page.getByRole('button', { name: 'Save account' }).click();
  await expect(row).toContainText('Cairo');
  await login(page, 'university', 'newuniversity@skill2work.demo');
  await expect(page.locator('.identity')).toContainText('Demo Future University');
});
test('storage event sync between tabs and explicit demo reset', async ({ page, context }) => {
  await login(page, 'candidate');
  const other = await context.newPage();
  await other.goto('/candidate/skills');
  await page.goto('/candidate/skills');
  await page.getByLabel('Skill name').fill('Cross-tab Skill');
  await page.getByRole('button', { name: 'Add skill', exact: false }).click();
  await expect(other.locator('main')).toContainText('Cross-tab Skill');
  await page.goto('/candidate/settings');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Reset demo data', exact: true }).click();
  await expect(page).toHaveURL(/sign-in/);
  await expect(other).toHaveURL(/sign-in/);
  expect((await state(page)).candidates).toHaveLength(50);
});
