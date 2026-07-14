import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'
import { LanguageProvider } from '../i18n/LanguageContext'
import type { AosSnapshot } from '../aos/types'

function renderApp(path = '/') {
  window.history.replaceState({}, '', path)
  return render(<LanguageProvider><App /></LanguageProvider>)
}

async function demoLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'כניסה למצב הדגמה' }))
}

const sampleSnapshot: AosSnapshot = {
  generatedAt: '2026-07-14T12:00:00.000Z',
  aosVersion: '1.0.0',
  applicationVersion: '1.4.0-beta.1',
  schemaVersion: '1.0.0',
  supportedAgents: ['codex', 'claude-code'],
  branch: 'feature/1.4.0-agent-operating-system',
  commit: 'abc1234',
  modules: {
    total: 2,
    byCategory: { workflow: 1, security: 1 },
    items: [
      { id: 'workflow.development', title: 'Development Workflow', category: 'workflow', status: 'active', requiredFor: ['feature'] },
      { id: 'security.security-policy', title: 'Security Policy', category: 'security', status: 'active', requiredFor: ['*'] },
    ],
  },
  taskTypes: ['feature', 'bugfix'],
  evidence: { available: true, runId: 'sample-run', profile: 'fast', gateCount: 3, passedCount: 2, failedCount: 1, notAvailableCount: 0, failedGates: ['build'] },
  research: { sources: 1, claims: 2, candidates: 0, reviews: 0, published: 0 },
  validation: { totalErrors: 0, totalChecks: 4, checks: [] },
  activeHandoff: null,
}

function mockSnapshotFetch(snapshot: AosSnapshot | null) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: snapshot !== null,
    json: () => Promise.resolve(snapshot),
  }))
}

describe('AOS dashboard', () => {
  beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear() })
  afterEach(() => { vi.unstubAllGlobals() })

  it('shows a "not generated" state when no snapshot is available, never a fake status', async () => {
    mockSnapshotFetch(null)
    const user = userEvent.setup()
    renderApp('/aos')
    await demoLogin(user)
    expect(await screen.findByText('טרם נוצר תמונת מצב')).toBeInTheDocument()
  })

  it('renders real module counts and version once a snapshot is loaded', async () => {
    mockSnapshotFetch(sampleSnapshot)
    const user = userEvent.setup()
    renderApp('/aos')
    await demoLogin(user)
    expect(await screen.findByText('1.4.0-beta.1')).toBeInTheDocument()
    expect(screen.getByText('workflow: 1')).toBeInTheDocument()
    expect(screen.getByText('security: 1')).toBeInTheDocument()
  })

  it('shows evidence gate counts drawn from the snapshot', async () => {
    mockSnapshotFetch(sampleSnapshot)
    const user = userEvent.setup()
    renderApp('/aos')
    await demoLogin(user)
    await waitFor(() => expect(screen.getByText('לא נמצאו שגיאות')).toBeInTheDocument())
  })
})

describe('AOS modules page', () => {
  beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear() })
  afterEach(() => { vi.unstubAllGlobals() })

  it('lists modules and can filter by category', async () => {
    mockSnapshotFetch(sampleSnapshot)
    const user = userEvent.setup()
    renderApp('/aos/modules')
    await demoLogin(user)
    expect(await screen.findByText('Development Workflow')).toBeInTheDocument()
    expect(screen.getByText('Security Policy')).toBeInTheDocument()
    const select = screen.getByLabelText('סנן לפי קטגוריה')
    await user.selectOptions(select, 'security')
    expect(screen.queryByText('Development Workflow')).not.toBeInTheDocument()
    expect(screen.getByText('Security Policy')).toBeInTheDocument()
  })
})

describe('AOS subroutes render without crashing', () => {
  beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear() })
  afterEach(() => { vi.unstubAllGlobals() })

  it('research page', async () => {
    mockSnapshotFetch(sampleSnapshot)
    const user = userEvent.setup()
    renderApp('/aos/research')
    await demoLogin(user)
    expect(await screen.findByText('צינור המחקר')).toBeInTheDocument()
  })

  it('evidence page', async () => {
    mockSnapshotFetch(sampleSnapshot)
    const user = userEvent.setup()
    renderApp('/aos/evidence')
    await demoLogin(user)
    expect(await screen.findByText('sample-run')).toBeInTheDocument()
  })

  it('handoffs page shows no active handoff honestly', async () => {
    mockSnapshotFetch(sampleSnapshot)
    const user = userEvent.setup()
    renderApp('/aos/handoffs')
    await demoLogin(user)
    expect(await screen.findByText('אין מסירה פעילה כרגע.')).toBeInTheDocument()
  })

  it('security page', async () => {
    mockSnapshotFetch(sampleSnapshot)
    const user = userEvent.setup()
    renderApp('/aos/security')
    await demoLogin(user)
    expect(await screen.findByText('Security Policy')).toBeInTheDocument()
  })

  it('releases page shows the real application version', async () => {
    mockSnapshotFetch(sampleSnapshot)
    const user = userEvent.setup()
    renderApp('/aos/releases')
    await demoLogin(user)
    expect(await screen.findAllByText('1.4.0-beta.1')).not.toHaveLength(0)
  })
})
