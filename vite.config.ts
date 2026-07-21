import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import coverageThresholds from './quality/config/coverageThresholds.cjs'
import { resolveDeploymentConfig } from './deploymentConfig'

function gitOutput(command: string): string | undefined {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || undefined
  } catch {
    return undefined
  }
}

const appVersion: string = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version
const commitSha = process.env.VITE_DEPLOY_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || gitOutput('git rev-parse HEAD')
const branch = process.env.VERCEL_GIT_COMMIT_REF || gitOutput('git rev-parse --abbrev-ref HEAD')
const deployment = resolveDeploymentConfig(process.env)

export default defineConfig({
  base: deployment.basePath,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'deployment-html-metadata',
      transformIndexHtml(html) {
        return html.replaceAll('__PUBLIC_SITE_URL_HTML__', deployment.publicSiteUrl)
      },
    },
  ],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __COMMIT_SHA__: JSON.stringify(commitSha ?? ''),
    __BRANCH__: JSON.stringify(branch ?? ''),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEPLOYMENT_ENVIRONMENT__: JSON.stringify(deployment.deploymentEnvironment),
    __PUBLIC_SITE_URL__: JSON.stringify(deployment.publicSiteUrl),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) return 'react-vendor'
          if (/[\\/]node_modules[\\/]@supabase[\\/]/.test(id)) return 'supabase-vendor'
          if (/[\\/]src[\\/](course[\\/]courseData|prompts[\\/]catalog[\\/]starterCatalog|prompts[\\/]packs[\\/]promptPacks|agents[\\/]catalog[\\/]starterAgents)\.ts$/.test(id)) return 'academy-catalogs'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    // Bound concurrent jsdom workers so async UI assertions are not starved on
    // developer machines or shared CI runners.
    maxWorkers: 4,
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
