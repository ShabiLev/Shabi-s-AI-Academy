import { describe, expect, it } from 'vitest'
import { resolveRouterMode } from './routerMode'

describe('deployment-aware router mode', () => {
  it('selects HashRouter mode only when explicitly requested', () => {
    expect(resolveRouterMode('hash')).toBe('hash')
  })

  it('keeps BrowserRouter mode for local and Vercel builds', () => {
    expect(resolveRouterMode(undefined)).toBe('browser')
    expect(resolveRouterMode('browser')).toBe('browser')
  })
})
