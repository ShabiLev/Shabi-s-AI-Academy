import { describe, expect, it } from 'vitest'
import { computeReleaseStatus, releaseStatusFromLoadResult } from './qualityStatus'
import { makeReport } from './qualityFixtures'

describe('computeReleaseStatus', () => {
  it('is blocked when the build fails', () => {
    const report = makeReport({ gates: { ...makeReport().gates, build: { status: 'failed' } } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked when lint fails', () => {
    const report = makeReport({ gates: { ...makeReport().gates, lint: { status: 'failed' } } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked when unit tests fail', () => {
    const report = makeReport({ gates: { ...makeReport().gates, unitTests: { status: 'failed' } } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked when E2E fails', () => {
    const report = makeReport({ gates: { ...makeReport().gates, e2eFast: { status: 'failed' } } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked when coverage is below threshold', () => {
    const base = makeReport()
    const report = makeReport({ coverage: { ...base.coverage!, statements: 10 } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked on a serious or critical accessibility violation even if the gate says warning', () => {
    const base = makeReport()
    const report = makeReport({
      gates: { ...base.gates, accessibility: { status: 'warning' } },
      accessibility: { ...base.accessibility!, violationsBySeverity: { critical: 1, serious: 0, moderate: 0, minor: 0 } },
    })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked when the git diff check fails', () => {
    const report = makeReport({ gates: { ...makeReport().gates, gitDiff: { status: 'failed' } } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked when mandatory visual validation does not pass', () => {
    const report = makeReport({ gates: { ...makeReport().gates, visual: { status: 'warning' } } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked when mandatory performance validation does not pass', () => {
    const report = makeReport({ gates: { ...makeReport().gates, performance: { status: 'warning' } } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked when a mandatory E2E result is missing', () => {
    const report = makeReport({ gates: { ...makeReport().gates, e2eFull: { status: 'notRun' } } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is blocked when the manual checklist explicitly fails', () => {
    const report = makeReport({ gates: { ...makeReport().gates, manualChecklist: { status: 'failed' } } })
    expect(computeReleaseStatus(report, true)).toBe('blocked')
  })

  it('is Ready with warnings when the manual checklist is incomplete', () => {
    expect(computeReleaseStatus(makeReport(), false)).toBe('readyWithWarnings')
  })

  it('is Ready when every gate passes and the checklist is complete', () => {
    expect(computeReleaseStatus(makeReport(), true)).toBe('ready')
  })
})

describe('releaseStatusFromLoadResult', () => {
  it('is Not evaluated for an empty load result', () => {
    expect(releaseStatusFromLoadResult({ kind: 'empty' }, true)).toBe('notEvaluated')
  })

  it('is Not evaluated for an invalid load result', () => {
    expect(releaseStatusFromLoadResult({ kind: 'invalid', reason: 'bad' }, true)).toBe('notEvaluated')
  })

  it('is Not evaluated for an unsupported schema version', () => {
    expect(releaseStatusFromLoadResult({ kind: 'unsupportedSchema', foundVersion: 99 }, true)).toBe('notEvaluated')
  })

  it('delegates to computeReleaseStatus for a valid report', () => {
    expect(releaseStatusFromLoadResult({ kind: 'ok', report: makeReport() }, true)).toBe('ready')
  })
})
