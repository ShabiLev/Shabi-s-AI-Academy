import type { QualityGates, QualityReport, QualityReportLoadResult, ReleaseStatus } from './types'

function hasBlockingGateFailure(gates: QualityGates): boolean {
  return (
    gates.build.status === 'failed' ||
    gates.lint.status === 'failed' ||
    gates.unitTests.status === 'failed' ||
    gates.e2eFast.status === 'failed' ||
    gates.e2eFull.status === 'failed' ||
    gates.gitDiff.status === 'failed'
  )
}

export function isCoverageBelowThreshold(report: QualityReport): boolean {
  const { coverage } = report
  if (!coverage) return false
  if (coverage.status === 'failed') return true
  const { thresholds } = coverage
  return (
    coverage.statements < thresholds.statements ||
    coverage.branches < thresholds.branches ||
    coverage.functions < thresholds.functions ||
    coverage.lines < thresholds.lines
  )
}

export function hasSevereAccessibilityViolation(report: QualityReport): boolean {
  if (report.gates.accessibility.status === 'failed') return true
  const { accessibility } = report
  if (!accessibility) return false
  return accessibility.violationsBySeverity.critical > 0 || accessibility.violationsBySeverity.serious > 0
}

/**
 * Implements the release-readiness rules from docs/quality-gates.md: Blocked beats
 * Ready with warnings beats Ready, and a report is never upgraded past what the
 * automated gates and manual checklist actually support.
 */
export function computeReleaseStatus(report: QualityReport, checklistComplete: boolean): ReleaseStatus {
  if (hasBlockingGateFailure(report.gates)) return 'blocked'
  if (isCoverageBelowThreshold(report)) return 'blocked'
  if (hasSevereAccessibilityViolation(report)) return 'blocked'

  const { gates } = report
  // Visual and performance never block on their own (section 20): a mismatch or a
  // below-target score means "review before release", not "release is broken".
  const visualNeedsReview = gates.visual.status !== 'passed'
  const e2eFullMissing = gates.e2eFull.status !== 'passed'
  const performanceWarning = gates.performance.status !== 'passed'
  const manualChecklistIncomplete = !checklistComplete

  if (visualNeedsReview || e2eFullMissing || performanceWarning || manualChecklistIncomplete) {
    return 'readyWithWarnings'
  }

  return 'ready'
}

export function releaseStatusFromLoadResult(loadResult: QualityReportLoadResult, checklistComplete: boolean): ReleaseStatus {
  if (loadResult.kind !== 'ok') return 'notEvaluated'
  return computeReleaseStatus(loadResult.report, checklistComplete)
}
