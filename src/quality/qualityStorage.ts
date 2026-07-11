import type { IssueSeverity, IssueStatus, IssueType, QaIssue, ReleaseChecklistState } from './types'

export const QA_ISSUES_STORAGE_KEY = 'shabi-ai-academy.qa-issues.v1'
export const QA_CHECKLIST_STORAGE_KEY = 'shabi-ai-academy.qa-checklist.v1'

const issueTypes: IssueType[] = ['bug', 'accessibility', 'performance', 'visual', 'automation', 'technicalDebt']
const issueSeverities: IssueSeverity[] = ['critical', 'high', 'medium', 'low']
const issueStatuses: IssueStatus[] = ['open', 'inProgress', 'resolved', 'acceptedRisk']

export interface QaIssueInput {
  title: string
  description: string
  type: IssueType
  severity: IssueSeverity
  owner: string
  source: string
  targetVersion?: string
  relatedRoute?: string
  relatedTest?: string
  notes?: string
}

export function loadIssues(): QaIssue[] {
  try {
    const raw = localStorage.getItem(QA_ISSUES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isValidIssueShape) : []
  } catch {
    return []
  }
}

function saveIssues(issues: QaIssue[]): void {
  try {
    localStorage.setItem(QA_ISSUES_STORAGE_KEY, JSON.stringify(issues))
  } catch {
    /* storage unavailable; state stays in memory for this session */
  }
}

function isValidIssueShape(value: unknown): value is QaIssue {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.description === 'string' &&
    issueTypes.includes(v.type as IssueType) &&
    issueSeverities.includes(v.severity as IssueSeverity) &&
    issueStatuses.includes(v.status as IssueStatus) &&
    typeof v.owner === 'string' &&
    typeof v.source === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string'
  )
}

export function createIssue(issues: QaIssue[], input: QaIssueInput): { issues: QaIssue[]; created: QaIssue } {
  const now = new Date().toISOString()
  const created: QaIssue = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    type: input.type,
    severity: input.severity,
    status: 'open',
    owner: input.owner,
    source: input.source,
    createdAt: now,
    updatedAt: now,
    targetVersion: input.targetVersion,
    relatedRoute: input.relatedRoute,
    relatedTest: input.relatedTest,
    notes: input.notes,
  }
  const next = [created, ...issues]
  saveIssues(next)
  return { issues: next, created }
}

export function updateIssue(issues: QaIssue[], id: string, patch: Partial<QaIssueInput>): QaIssue[] {
  const next = issues.map((issue) =>
    issue.id === id ? { ...issue, ...patch, updatedAt: new Date().toISOString() } : issue,
  )
  saveIssues(next)
  return next
}

export function setIssueStatus(issues: QaIssue[], id: string, status: IssueStatus): QaIssue[] {
  const next = issues.map((issue) => (issue.id === id ? { ...issue, status, updatedAt: new Date().toISOString() } : issue))
  saveIssues(next)
  return next
}

export function deleteIssue(issues: QaIssue[], id: string): QaIssue[] {
  const next = issues.filter((issue) => issue.id !== id)
  saveIssues(next)
  return next
}

export function exportIssuesJson(issues: QaIssue[]): string {
  return JSON.stringify(issues, null, 2)
}

export interface IssueImportResult {
  accepted: QaIssue[]
  rejectedCount: number
}

/** Validates each imported entry independently; malformed entries are dropped, not the whole import. */
export function parseImportedIssues(value: unknown): IssueImportResult {
  if (!Array.isArray(value)) return { accepted: [], rejectedCount: 0 }
  const accepted: QaIssue[] = []
  let rejectedCount = 0
  for (const entry of value) {
    if (isValidIssueShape(entry)) accepted.push(entry)
    else rejectedCount += 1
  }
  return { accepted, rejectedCount }
}

export function mergeImportedIssues(existing: QaIssue[], imported: QaIssue[]): QaIssue[] {
  const byId = new Map(existing.map((issue) => [issue.id, issue]))
  for (const issue of imported) byId.set(issue.id, issue)
  const next = [...byId.values()]
  saveIssues(next)
  return next
}

interface ChecklistHistory {
  [applicationVersion: string]: ReleaseChecklistState
}

function loadChecklistHistory(): ChecklistHistory {
  try {
    const raw = localStorage.getItem(QA_CHECKLIST_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function saveChecklistHistory(history: ChecklistHistory): void {
  try {
    localStorage.setItem(QA_CHECKLIST_STORAGE_KEY, JSON.stringify(history))
  } catch {
    /* storage unavailable; state stays in memory for this session */
  }
}

/** Starts a fresh, empty checklist the first time a given applicationVersion is seen. */
export function getChecklistForVersion(applicationVersion: string): ReleaseChecklistState {
  const history = loadChecklistHistory()
  return (
    history[applicationVersion] ?? {
      applicationVersion,
      manualChecks: {},
      updatedAt: new Date().toISOString(),
    }
  )
}

export function saveChecklistForVersion(state: ReleaseChecklistState): ReleaseChecklistState {
  const history = loadChecklistHistory()
  const next: ReleaseChecklistState = { ...state, updatedAt: new Date().toISOString() }
  history[state.applicationVersion] = next
  saveChecklistHistory(history)
  return next
}

export function listChecklistVersions(): string[] {
  return Object.keys(loadChecklistHistory())
}
