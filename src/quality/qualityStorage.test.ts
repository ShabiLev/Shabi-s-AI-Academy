import { beforeEach, describe, expect, it } from 'vitest'
import {
  QA_ISSUES_STORAGE_KEY,
  createIssue,
  deleteIssue,
  exportIssuesJson,
  getChecklistForVersion,
  listChecklistVersions,
  loadIssues,
  mergeImportedIssues,
  parseImportedIssues,
  saveChecklistForVersion,
  setIssueStatus,
  updateIssue,
} from './qualityStorage'
import type { QaIssueInput } from './qualityStorage'

const sampleInput: QaIssueInput = {
  title: 'Dashboard overlaps at 320px',
  description: 'The welcome card overlaps the progress bar on narrow viewports.',
  type: 'visual',
  severity: 'medium',
  owner: 'Shabi',
  source: 'manual QA',
}

describe('issue register storage', () => {
  beforeEach(() => localStorage.clear())

  it('loads an empty list when nothing is stored', () => {
    expect(loadIssues()).toEqual([])
  })

  it('returns an empty list for malformed JSON instead of throwing', () => {
    localStorage.setItem(QA_ISSUES_STORAGE_KEY, '{not valid json')
    expect(loadIssues()).toEqual([])
  })

  it('drops entries with the wrong shape instead of throwing', () => {
    localStorage.setItem(QA_ISSUES_STORAGE_KEY, JSON.stringify([{ title: 'missing everything else' }]))
    expect(loadIssues()).toEqual([])
  })

  it('creates an issue with status open and persists it', () => {
    const { issues, created } = createIssue([], sampleInput)
    expect(created.status).toBe('open')
    expect(issues).toHaveLength(1)
    expect(loadIssues()).toHaveLength(1)
  })

  it('edits an issue and bumps updatedAt', () => {
    const { issues, created } = createIssue([], sampleInput)
    const edited = updateIssue(issues, created.id, { title: 'Updated title' })
    expect(edited[0].title).toBe('Updated title')
  })

  it('resolves and reopens an issue', () => {
    const { issues, created } = createIssue([], sampleInput)
    const resolved = setIssueStatus(issues, created.id, 'resolved')
    expect(resolved.find((i) => i.id === created.id)?.status).toBe('resolved')
    const reopened = setIssueStatus(resolved, created.id, 'open')
    expect(reopened.find((i) => i.id === created.id)?.status).toBe('open')
  })

  it('deletes an issue', () => {
    const { issues, created } = createIssue([], sampleInput)
    const next = deleteIssue(issues, created.id)
    expect(next).toHaveLength(0)
    expect(loadIssues()).toHaveLength(0)
  })

  it('exports issues as readable JSON', () => {
    const { issues } = createIssue([], sampleInput)
    expect(JSON.parse(exportIssuesJson(issues))).toHaveLength(1)
  })

  it('validates imported issues and drops malformed entries without rejecting the whole import', () => {
    const { issues } = createIssue([], sampleInput)
    const result = parseImportedIssues([...issues, { bogus: true }, 'not an issue'])
    expect(result.accepted).toHaveLength(1)
    expect(result.rejectedCount).toBe(2)
  })

  it('rejects a non-array import outright', () => {
    const result = parseImportedIssues({ not: 'an array' })
    expect(result).toEqual({ accepted: [], rejectedCount: 0 })
  })

  it('merges imported issues with existing ones by id', () => {
    const { issues, created } = createIssue([], sampleInput)
    const merged = mergeImportedIssues(issues, [{ ...created, title: 'Imported override' }])
    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('Imported override')
  })
})

describe('release checklist storage', () => {
  beforeEach(() => localStorage.clear())

  it('starts a fresh, empty checklist for a version seen for the first time', () => {
    const checklist = getChecklistForVersion('0.5.0')
    expect(checklist.manualChecks).toEqual({})
  })

  it('persists manual checks for a version and reloads them', () => {
    saveChecklistForVersion({ applicationVersion: '0.5.0', manualChecks: { keyboardNav: true }, updatedAt: '2026-07-11T00:00:00.000Z' })
    expect(getChecklistForVersion('0.5.0').manualChecks).toEqual({ keyboardNav: true })
  })

  it('does not carry checked items forward to a new version', () => {
    saveChecklistForVersion({ applicationVersion: '0.5.0', manualChecks: { keyboardNav: true }, updatedAt: '2026-07-11T00:00:00.000Z' })
    expect(getChecklistForVersion('0.6.0').manualChecks).toEqual({})
  })

  it('keeps prior version checklists reviewable in history', () => {
    saveChecklistForVersion({ applicationVersion: '0.4.0', manualChecks: { keyboardNav: true }, updatedAt: '2026-07-11T00:00:00.000Z' })
    saveChecklistForVersion({ applicationVersion: '0.5.0', manualChecks: {}, updatedAt: '2026-07-11T00:00:00.000Z' })
    expect(listChecklistVersions().sort()).toEqual(['0.4.0', '0.5.0'])
    expect(getChecklistForVersion('0.4.0').manualChecks).toEqual({ keyboardNav: true })
  })
})
