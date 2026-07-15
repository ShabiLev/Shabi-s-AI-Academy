import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'
import { LanguageProvider } from '../i18n/LanguageContext'
import type { AosSnapshot } from '../aos/types'
import { resolveAosSnapshotUrl } from '../aos/useAosSnapshot'

it('resolves the generated snapshot under both local and Pages base paths', () => {
  expect(resolveAosSnapshotUrl('/')).toBe('/generated/aos-snapshot.json')
  expect(resolveAosSnapshotUrl('/Shabi-s-AI-Academy/')).toBe('/Shabi-s-AI-Academy/generated/aos-snapshot.json')
})

function renderApp(path = '/') {
  window.history.replaceState({}, '', path)
  return render(<LanguageProvider><App /></LanguageProvider>)
}

async function demoLogin(user: ReturnType<typeof userEvent.setup>) {
  const loginButton = screen.getByRole('button', { name: 'כניסה למצב הדגמה' })
  await user.click(loginButton)
  await waitFor(() => expect(loginButton).not.toBeInTheDocument())
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
  memory: {
    currentTask: 'Stabilize Version 1.4', currentPhase: 'validation', releaseState: 'blocked', completionPercent: 89,
    requirements: { completed: 24, partial: 2, missing: 2 }, blockers: ['Visual review pending'], blockerCount: 1,
    knownIssueCount: 1, latestEvidenceRunId: 'sample-run', testedCommit: 'abc1234', evidenceCurrent: false, coverage: 76.5,
    research: { sources: 6, candidatesPendingReview: 6, publishedItems: 0 },
    nextActions: [{ id: 'ACTION-001', title: 'Review visuals', priority: 'Critical', requiredRole: 'Human UX reviewer', status: 'blocked' }],
    nextAction: 'Review visuals', handoff: { status: 'inProgress', summary: 'Continue validation', updatedAt: '2026-07-14T12:00:00.000Z' }, updatedAt: '2026-07-14T12:00:00.000Z',
  },
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

  it('handoffs page shows the explicit sanitized handoff honestly', async () => {
    mockSnapshotFetch(sampleSnapshot)
    const user = userEvent.setup()
    renderApp('/aos/handoffs')
    await demoLogin(user)
    expect(await screen.findByText(/inProgress: Continue validation/)).toBeInTheDocument()
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

  it('progress page shows requirement-derived progress and blockers', async () => {
    mockSnapshotFetch(sampleSnapshot); const user = userEvent.setup(); renderApp('/aos/progress'); await demoLogin(user)
    expect(await screen.findByRole('heading', { name: 'התקדמות AOS' })).toBeInTheDocument()
    expect(screen.getByText('Visual review pending')).toBeInTheDocument()
  })

  it('memory page warns when evidence is stale', async () => {
    mockSnapshotFetch(sampleSnapshot); const user = userEvent.setup(); renderApp('/aos/memory'); await demoLogin(user)
    expect(await screen.findByText('הראיות אינן תואמות למצב הנוכחי')).toBeInTheDocument()
  })
})
