import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 120000, // 2 minutes timeout for tests
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/prod-results.json' }],
    ['junit', { outputFile: 'test-results/prod-results.xml' }]
  ],
  /* Custom output directory for test results */
  outputDir: 'test-results',
  use: {
    baseURL: process.env.BASE_URL || 'https://secure.bge.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
}); 