import { describe, expect, it } from 'vitest'
import { computeReportStaleness, sampleQualityReport } from './qualityData'

// sampleQualityReport.generatedAt is computed at module load time (see
// qualityData.ts), so these tests express "how long after generation" in
// relative offsets from it rather than hardcoded absolute dates.
const generatedAtMs = Date.parse(sampleQualityReport.generatedAt)
const minutesAfter = (minutes: number) => new Date(generatedAtMs + minutes * 60_000).toISOString()

describe('computeReportStaleness', () => {
  it('flags no staleness for a fresh, matching report', () => {
    const staleness = computeReportStaleness(sampleQualityReport, '1.8.0-beta.1', 'sample01', minutesAfter(30))
    expect(staleness).toEqual({ versionMismatch: false, commitMismatch: false, old: false })
  })

  it('flags a version mismatch', () => {
    const staleness = computeReportStaleness(sampleQualityReport, '0.6.0', 'sample01', minutesAfter(30))
    expect(staleness.versionMismatch).toBe(true)
  })

  it('flags a commit mismatch only when both sides have a commit', () => {
    const withMismatch = computeReportStaleness(sampleQualityReport, '0.5.0', 'deadbeef', minutesAfter(30))
    expect(withMismatch.commitMismatch).toBe(true)
    const withoutCurrentCommit = computeReportStaleness(sampleQualityReport, '0.5.0', null, minutesAfter(30))
    expect(withoutCurrentCommit.commitMismatch).toBe(false)
  })

  it('flags a report older than the staleness threshold', () => {
    const staleness = computeReportStaleness(sampleQualityReport, '0.5.0', 'sample01', minutesAfter(15 * 24 * 60))
    expect(staleness.old).toBe(true)
  })
})

describe('sampleQualityReport', () => {
  it('is a structurally valid, fully-passing example report', () => {
    expect(sampleQualityReport.overallStatus).toBe('ready')
    expect(sampleQualityReport.gates.build.status).toBe('passed')
  })

  it('is never stale relative to its own generation time (real page-load use)', () => {
    const staleness = computeReportStaleness(sampleQualityReport, sampleQualityReport.applicationVersion, sampleQualityReport.commitSha, new Date().toISOString())
    expect(staleness.old).toBe(false)
  })
})
