import { describe, expect, it } from 'vitest'
import { parseQualityReport } from './qualitySchema'
import { QUALITY_SCHEMA_VERSION } from './types'
import { makeReport } from './qualityFixtures'

function omit(report: unknown, ...keys: string[]): Record<string, unknown> {
  const clone = { ...(report as Record<string, unknown>) }
  for (const key of keys) delete clone[key]
  return clone
}

describe('parseQualityReport', () => {
  it('treats null/undefined as empty, not invalid', () => {
    expect(parseQualityReport(null)).toEqual({ kind: 'empty' })
    expect(parseQualityReport(undefined)).toEqual({ kind: 'empty' })
  })

  it('rejects a non-object value as invalid', () => {
    expect(parseQualityReport('not json')).toMatchObject({ kind: 'invalid' })
    expect(parseQualityReport(42)).toMatchObject({ kind: 'invalid' })
  })

  it('reports an unsupported schema version distinctly', () => {
    const result = parseQualityReport({ ...makeReport(), schemaVersion: 999 })
    expect(result).toEqual({ kind: 'unsupportedSchema', foundVersion: 999 })
  })

  it('rejects a report missing applicationVersion', () => {
    expect(parseQualityReport(omit(makeReport(), 'applicationVersion'))).toMatchObject({ kind: 'invalid' })
  })

  it('rejects a report with an invalid generatedAt', () => {
    const result = parseQualityReport({ ...makeReport(), generatedAt: 'not-a-date' })
    expect(result).toMatchObject({ kind: 'invalid' })
  })

  it('rejects a report missing gates', () => {
    expect(parseQualityReport(omit(makeReport(), 'gates'))).toMatchObject({ kind: 'invalid' })
  })

  it('accepts a fully valid report and preserves its fields', () => {
    const report = makeReport()
    const result = parseQualityReport(report)
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.report.applicationVersion).toBe(report.applicationVersion)
      expect(result.report.gates.build.status).toBe('passed')
    }
  })

  it('fills safe defaults for missing optional sections instead of crashing', () => {
    const result = parseQualityReport(
      omit(makeReport(), 'coverage', 'accessibility', 'visual', 'performance', 'knownIssues'),
    )
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.report.coverage).toBeNull()
      expect(result.report.accessibility).toBeNull()
      expect(result.report.visual).toBeNull()
      expect(result.report.performance).toBeNull()
      expect(result.report.knownIssues).toBeNull()
    }
  })

  it('defaults an unknown gate entry to notAvailable rather than crashing', () => {
    const report = makeReport()
    const result = parseQualityReport({ ...report, gates: { ...report.gates, lint: 'not-an-object' } })
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') expect(result.report.gates.lint.status).toBe('notAvailable')
  })

  it('defaults an unknown overallStatus to notEvaluated rather than fabricating Ready', () => {
    const result = parseQualityReport({ ...makeReport(), overallStatus: 'something-else' })
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') expect(result.report.overallStatus).toBe('notEvaluated')
  })

  it('current schema version constant matches what the parser accepts', () => {
    expect(QUALITY_SCHEMA_VERSION).toBe(1)
  })
})
