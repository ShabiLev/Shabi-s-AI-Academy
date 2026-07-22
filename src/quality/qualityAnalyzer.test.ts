import { describe, expect, it } from 'vitest'
import { analyzeQuality } from './qualityAnalyzer'
import { makeReport } from './qualityFixtures'

describe('analyzeQuality', () => {
  it('reports Ready with no recommended actions when everything passes', () => {
    const summary = analyzeQuality(makeReport(), true)
    expect(summary.overallStatus).toBe('ready')
    expect(summary.failedGates).toEqual([])
    expect(summary.warningGates).toEqual([])
    expect(summary.recommendedActions).toEqual([
      { en: 'No blocking or warning conditions were detected in this report.', he: 'לא זוהו תנאים חוסמים או מזהירים בדוח זה.' },
    ])
  })

  it('lists failed gates and recommends fixing the build first, in both languages', () => {
    const base = makeReport()
    const report = makeReport({ gates: { ...base.gates, build: { status: 'failed' }, lint: { status: 'failed' } } })
    const summary = analyzeQuality(report, true)
    expect(summary.overallStatus).toBe('blocked')
    expect(summary.failedGates).toEqual(expect.arrayContaining(['build', 'lint']))
    expect(summary.recommendedActions[0].en).toMatch(/Build failed/)
    expect(summary.recommendedActions[0].he).toMatch(/הבנייה נכשלה/)
    expect(summary.likelyAffectedAreas.map((a) => a.en)).toEqual(expect.arrayContaining(['Build / compilation', 'Source code quality']))
  })

  it('never claims a root cause the data does not prove', () => {
    const summary = analyzeQuality(makeReport(), true)
    for (const action of summary.recommendedActions) {
      expect(action.en).not.toMatch(/the cause is/i)
    }
  })

  it('flags a serious accessibility violation without needing gates.accessibility to be failed', () => {
    const base = makeReport()
    const report = makeReport({
      accessibility: { ...base.accessibility!, violationsBySeverity: { critical: 0, serious: 2, moderate: 0, minor: 0 } },
    })
    const summary = analyzeQuality(report, true)
    expect(summary.overallStatus).toBe('blocked')
    expect(summary.likelyAffectedAreas.map((a) => a.en)).toContain('Accessibility')
  })

  it('produces bilingual summaries that mention the status in both languages', () => {
    const summary = analyzeQuality(makeReport(), true)
    expect(summary.summaryHe).toContain('מוכן')
    expect(summary.summaryEn).toContain('Ready')
  })

  it('recommends completing the manual checklist without blocking release', () => {
    const summary = analyzeQuality(makeReport(), false)
    expect(summary.overallStatus).toBe('readyWithWarnings')
    expect(summary.recommendedActions.some((a) => /manual release checklist/.test(a.en))).toBe(true)
    expect(summary.recommendedActions.some((a) => /רשימת הבדיקה הידנית/.test(a.he))).toBe(true)
  })

  it('recommends running the full E2E matrix when it has not run', () => {
    const base = makeReport()
    const report = makeReport({ gates: { ...base.gates, e2eFull: { status: 'notRun' } } })
    const summary = analyzeQuality(report, true)
    expect(summary.recommendedActions.some((a) => /full E2E browser matrix/.test(a.en))).toBe(true)
    expect(summary.overallStatus).toBe('blocked')
  })

  it('blocks when the mandatory visual gate fails', () => {
    const base = makeReport()
    const report = makeReport({ gates: { ...base.gates, visual: { status: 'failed' } } })
    expect(analyzeQuality(report, false).overallStatus).toBe('blocked')
  })
})
