import type { QualityGates, QualityReport, QualityReportLoadResult, ReleaseStatus } from './types'

function hasBlockingGateFailure(gates: QualityGates): boolean {
  const mandatory = ['lint', 'unitTests', 'coverage', 'build', 'e2eFast', 'e2eFull', 'accessibility', 'visual', 'performance', 'gitDiff'] as const
  return mandatory.some((name) => gates[name].status !== 'passed') || gates.manualChecklist.status === 'failed'
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

  const manualChecklistIncomplete = !checklistComplete

  if (manualChecklistIncomplete) {
    return 'readyWithWarnings'
  }

  return 'ready'
}

export function releaseStatusFromLoadResult(loadResult: QualityReportLoadResult, checklistComplete: boolean): ReleaseStatus {
  if (loadResult.kind !== 'ok') return 'notEvaluated'
  return computeReleaseStatus(loadResult.report, checklistComplete)
}
