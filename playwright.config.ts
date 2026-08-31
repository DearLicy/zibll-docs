import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const bundledChromium = '/opt/playwright-chromium-1228/chrome-linux64/chrome';

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  reporter: 'list',
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    launchOptions: existsSync(bundledChromium)
      ? { executablePath: bundledChromium }
      : undefined,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
