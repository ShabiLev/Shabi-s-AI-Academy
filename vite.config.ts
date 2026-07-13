import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import coverageThresholds from './quality/config/coverageThresholds.cjs'

function gitOutput(command: string): string | undefined {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || undefined
  } catch {
    return undefined
  }
}

const appVersion: string = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || gitOutput('git rev-parse --short HEAD')
const branch = process.env.VERCEL_GIT_COMMIT_REF || gitOutput('git rev-parse --abbrev-ref HEAD')
const deploymentEnvironment = process.env.VERCEL_ENV || 'local'
const publicSiteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://shabi-s-ai-academy.vercel.app'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __COMMIT_SHA__: JSON.stringify(commitSha ?? ''),
    __BRANCH__: JSON.stringify(branch ?? ''),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEPLOYMENT_ENVIRONMENT__: JSON.stringify(deploymentEnvironment),
    __PUBLIC_SITE_URL__: JSON.stringify(publicSiteUrl),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
    reporters: ['default', ['json', { outputFile: 'quality/generated/vitest-results.json' }]],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/test/**',
        'src/vite-env.d.ts',
        'src/auth/types.ts',
        'src/course/types.ts',
        'src/i18n/types.ts',
      ],
      // See quality/config/coverageThresholds.cjs for the measured baseline and rationale.
      thresholds: coverageThresholds,
    },
  },
})
