import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  
  expect: {
   timeout: 10_000,
    toHaveScreenshot: { maxDiffPixels: 250 },
  },
    
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },

  /* Configure projects for major browsers */
  projects: [
   {
      name: 'chromium',
      use: {
        // Option 1: Spread device but override the conflicting property
        ...devices['Desktop Chrome'],
        deviceScaleFactor: undefined,  
        viewport: null,                 
        launchOptions: {
          headless: false,
          args: ['--start-maximized'],
        },

        // Optional extras for better stability
        ignoreHTTPSErrors: true,
      },
    },
  {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1040 },  
        deviceScaleFactor: undefined,
        isMobile: false,
        launchOptions: {
          headless: false,
        },
      },
    },
  ],
});
