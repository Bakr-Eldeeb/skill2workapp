import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.e2e.ts',
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:4200',
    viewport: { width: 1440, height: 900 },
    launchOptions: process.env['CHROMIUM_PATH']
      ? { executablePath: process.env['CHROMIUM_PATH'], args: ['--no-sandbox'] }
      : {},
    screenshot: 'only-on-failure',
  },
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
