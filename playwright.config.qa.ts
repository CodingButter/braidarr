import { defineConfig, devices } from '@playwright/test';

/**
 * QA Testing Configuration for Braidarr
 * Comprehensive test setup for arr ecosystem application
 */
export default defineConfig({
  testDir: './test',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3300',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on retry */
    video: 'retain-on-failure',
    
    /* Global timeout for each action */
    actionTimeout: 10000,
    
    /* Global timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
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

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./test/global-setup.ts'),
  globalTeardown: require.resolve('./test/global-teardown.ts'),

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'cd packages/server && npm run dev',
      port: 3301,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'test',
        PORT: '3301',
        DATABASE_URL: 'postgresql://test:test@localhost:3302/braidarr_test'
      }
    },
    {
      command: 'cd packages/web && npm run dev',
      port: 3300,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'test',
        VITE_API_URL: 'http://localhost:3301'
      }
    }
  ],

  /* Test timeout */
  timeout: 60000,
  
  /* Expect timeout */
  expect: {
    timeout: 10000
  },

  /* Output directory for test artifacts */
  outputDir: 'test-results/',
  
  /* Test pattern matching */
  testMatch: [
    '**/*.e2e.test.ts',
    '**/*.spec.ts',
    '**/*.test.ts'
  ],

  /* Test ignore patterns */
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ],

  /* Global test metadata */
  metadata: {
    project: 'Braidarr',
    environment: 'QA Testing',
    version: '1.0.0',
    testSuite: 'Comprehensive Arr Ecosystem Testing',
    qaEngineer: 'Claude Code',
    testPorts: {
      web: 3300,
      api: 3301,
      database: 3302,
      webSocket: 3303,
      e2eServices: '3304-3310'
    }
  },

  /* Test file organization */
  testDir: './test',
  outputDir: './test-results',
  
  /* Custom test configuration for different test types */
  // You can extend this config for specific test suites
  projects: [
    // Security Testing Project
    {
      name: 'security-tests',
      use: { 
        ...devices['Desktop Chrome'],
        // Specific settings for security testing
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Braidarr-QA-Security-Bot/1.0'
      },
      testMatch: '**/*security*.test.ts',
      retries: 0, // No retries for security tests
    },

    // API Testing Project  
    {
      name: 'api-tests',
      use: {
        ...devices['Desktop Chrome'],
        // API testing specific settings
        extraHTTPHeaders: {
          'User-Agent': 'Braidarr-QA-API-Bot/1.0',
          'Accept': 'application/json'
        }
      },
      testMatch: '**/*api*.test.ts',
    },

    // UI Testing Project
    {
      name: 'ui-tests',
      use: {
        ...devices['Desktop Chrome'],
        // UI testing specific settings
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        timezoneId: 'America/New_York'
      },
      testMatch: '**/*ui*.spec.ts',
    },

    // Arr Ecosystem Testing Project
    {
      name: 'arr-ecosystem-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Arr ecosystem specific settings
        extraHTTPHeaders: {
          'User-Agent': 'Braidarr-QA-Arr-Bot/1.0'
        }
      },
      testMatch: '**/*arr*.test.ts',
    },

    // Performance Testing Project
    {
      name: 'performance-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Performance testing settings
        viewport: { width: 1920, height: 1080 },
        video: 'off', // Disable video for performance tests
        trace: 'off'   // Disable trace for performance tests
      },
      testMatch: '**/*performance*.test.ts',
    },

    // Cross-browser Testing
    {
      name: 'cross-browser-chrome',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*cross-browser*.test.ts',
    },
    {
      name: 'cross-browser-firefox', 
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/*cross-browser*.test.ts',
    },
    {
      name: 'cross-browser-safari',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/*cross-browser*.test.ts',
    },

    // Mobile Testing
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/*mobile*.test.ts',
    },
    {
      name: 'mobile-ios',
      use: { ...devices['iPhone 12'] },
      testMatch: '**/*mobile*.test.ts',
    },
  ],

  /* Test environment variables */
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3300',
    
    // Custom properties for QA testing
    apiBaseURL: process.env.API_BASE_URL || 'http://localhost:3301',
    testApiKey: process.env.TEST_API_KEY || undefined,
    testUserEmail: process.env.TEST_USER_EMAIL || 'qa-test@example.com',
    testUserPassword: process.env.TEST_USER_PASSWORD || 'qapassword123',
    
    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Screenshots and traces
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    
    // Browser context options
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Custom headers for testing
    extraHTTPHeaders: {
      'X-Test-Environment': 'QA',
      'X-Test-Suite': 'Braidarr-Comprehensive'
    },
    
    // Ignore HTTPS errors in testing
    ignoreHTTPSErrors: true,
    
    // Reduce motion for consistent testing
    reducedMotion: 'reduce',
  }
});