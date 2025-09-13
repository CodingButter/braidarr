import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 * QA Engineer port range: 3300-3399
 */
export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  use: {
    // QA Test Server URL
    baseURL: 'http://localhost:3300',
    
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Test timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: [
    {
      command: 'pnpm run dev:web',
      port: 3300,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        WEB_PORT: '3300',
        NODE_ENV: 'test'
      }
    },
    {
      command: 'pnpm run dev:server',
      port: 3301,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: '3301',
        NODE_ENV: 'test'
      }
    }
  ],
});