import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolveDeploymentConfig } from '../../deploymentConfig'

describe('Vercel deployment contract', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    buildCommand: string
    outputDirectory: string
    rewrites: Array<{ source: string; destination: string }>
  }

  it('builds the Vite app from the repository root into dist', () => {
    expect(config.buildCommand).toBe('npm run build')
    expect(config.outputDirectory).toBe('dist')
  })

  it('supports BrowserRouter refreshes without swallowing serverless API routes', () => {
    expect(config.rewrites).toContainEqual({
      source: '/((?!api(?:/|$)).*)',
      destination: '/index.html',
    })
  })

  it('publishes discovery metadata for public routes only', () => {
    const sitemap = readFileSync('public/sitemap.xml', 'utf8')
    expect(sitemap).toContain('/about')
    expect(sitemap).toContain('/login')
    expect(sitemap).not.toContain('/projects')
    expect(readFileSync('public/robots.txt', 'utf8')).toContain('/sitemap.xml')
    expect(readFileSync('index.html', 'utf8')).toContain('rel="canonical"')
  })
})

describe('GitHub Pages deployment contract', () => {
  it('uses the repository base, hash routing, and Pages public URL only for the Pages build', () => {
    expect(resolveDeploymentConfig({
      VITE_BASE_PATH: '/Shabi-s-AI-Academy/',
      VITE_ROUTER_MODE: 'hash',
      VITE_DEPLOYMENT_PROVIDER: 'github-pages',
      VITE_PUBLIC_SITE_URL: 'https://shabilev.github.io/Shabi-s-AI-Academy/',
    })).toEqual({
      basePath: '/Shabi-s-AI-Academy/',
      routerMode: 'hash',
      deploymentProvider: 'github-pages',
      deploymentEnvironment: 'github-pages',
      publicSiteUrl: 'https://shabilev.github.io/Shabi-s-AI-Academy',
    })
  })

  it('keeps root assets, BrowserRouter, and the Vercel URL by default', () => {
    expect(resolveDeploymentConfig({})).toMatchObject({
      basePath: '/',
      routerMode: 'browser',
      deploymentProvider: 'local',
      deploymentEnvironment: 'local',
      publicSiteUrl: 'https://shabi-s-ai-academy.vercel.app',
    })
  })

  it('uses base-aware public assets and official Pages Actions', () => {
    const html = readFileSync('index.html', 'utf8')
    const manifest = readFileSync('public/site.webmanifest', 'utf8')
    const workflow = readFileSync('.github/workflows/deploy-pages.yml', 'utf8')
    const validator = readFileSync('scripts/validate-pages-build.mjs', 'utf8')

    expect(html).toContain('%BASE_URL%favicon.svg')
    expect(html).toContain('%BASE_URL%site.webmanifest')
    expect(manifest).toContain('"start_url": "./"')
    expect(manifest).toContain('"src": "./favicon.svg"')
    expect(workflow).toContain('actions/configure-pages@v5')
    expect(workflow).toContain('actions/upload-pages-artifact@v3')
    expect(workflow).toContain('actions/deploy-pages@v4')
    expect(workflow).toContain('VITE_ROUTER_MODE: hash')
    expect(validator).toContain("rejectMatch(/\\/src\\/main\\.tsx/")
    expect(validator).toContain('localhost URL is present')
    expect(validator).toContain('secretPatterns')
  })
})
