import { defineConfig, devices } from '@playwright/test'

const origin = 'http://127.0.0.1:43991'
const basePath = '/Shabi-s-AI-Academy/'

export default defineConfig({
  testDir: './e2e/specs',
  testMatch: /pages-deployment\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `${origin}${basePath}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build:pages && npm run preview:pages -- --port 43991 --strictPort',
    url: `${origin}${basePath}`,
    reuseExistingServer: false,
    timeout: 120000,
  },
})
