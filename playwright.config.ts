import { defineConfig } from '@playwright/test'

const DATABASE_URL = process.env.TEST_DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is not set')
}

const WEB = 'http://localhost:4000'
export const API = 'http://localhost:4001'

export default defineConfig({
  testDir: 'e2e',
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  expect: { timeout: 10_000 },
  use: { baseURL: WEB, trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'pnpm --filter api exec tsx src/index.ts',
      url: `${API}/health`,
      env: { DATABASE_URL, PORT: '4001', CORS_ORIGIN: WEB },
    },
    {
      command: 'pnpm --filter web build && node web/.output/server/index.mjs',
      url: WEB,
      env: { PORT: '4000', NUXT_PUBLIC_API_BASE: API },
      timeout: 300_000,
    },
  ],
})
