import { describe, expect, it } from 'vitest'
import { computeReportStaleness, sampleQualityReport } from './qualityData'

describe('computeReportStaleness', () => {
  it('flags no staleness for a fresh, matching report', () => {
    const staleness = computeReportStaleness(sampleQualityReport, '1.5.0-beta.1', 'sample01', '2026-07-11T12:30:00.000Z')
    expect(staleness).toEqual({ versionMismatch: false, commitMismatch: false, old: false })
  })

  it('flags a version mismatch', () => {
    const staleness = computeReportStaleness(sampleQualityReport, '0.6.0', 'sample01', '2026-07-11T12:30:00.000Z')
    expect(staleness.versionMismatch).toBe(true)
  })

  it('flags a commit mismatch only when both sides have a commit', () => {
    const withMismatch = computeReportStaleness(sampleQualityReport, '0.5.0', 'deadbeef', '2026-07-11T12:30:00.000Z')
    expect(withMismatch.commitMismatch).toBe(true)
    const withoutCurrentCommit = computeReportStaleness(sampleQualityReport, '0.5.0', null, '2026-07-11T12:30:00.000Z')
    expect(withoutCurrentCommit.commitMismatch).toBe(false)
  })

  it('flags a report older than the staleness threshold', () => {
    const staleness = computeReportStaleness(sampleQualityReport, '0.5.0', 'sample01', '2026-08-01T00:00:00.000Z')
    expect(staleness.old).toBe(true)
  })
})

describe('sampleQualityReport', () => {
  it('is a structurally valid, fully-passing example report', () => {
    expect(sampleQualityReport.overallStatus).toBe('ready')
    expect(sampleQualityReport.gates.build.status).toBe('passed')
  })
})
