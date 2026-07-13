import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

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
