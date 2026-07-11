import {
  QUALITY_SCHEMA_VERSION,
  gateNames,
  type AccessibilitySummary,
  type CoverageSummary,
  type GateStatus,
  type KnownIssuesSummary,
  type PerformanceSummary,
  type QualityGates,
  type QualityReport,
  type QualityReportLoadResult,
  type TestSummary,
  type VisualSummary,
} from './types'

const gateStatuses: GateStatus[] = ['passed', 'failed', 'warning', 'notRun', 'notAvailable']

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isGateStatus(value: unknown): value is GateStatus {
  return typeof value === 'string' && (gateStatuses as string[]).includes(value)
}

function parseGates(value: unknown): QualityGates | null {
  if (!isPlainObject(value)) return null
  const gates = {} as QualityGates
  for (const name of gateNames) {
    const entry = value[name]
    if (!isPlainObject(entry) || !isGateStatus(entry.status)) {
      gates[name] = { status: 'notAvailable' }
      continue
    }
    gates[name] = {
      status: entry.status,
      durationMs: typeof entry.durationMs === 'number' ? entry.durationMs : undefined,
      message: typeof entry.message === 'string' ? entry.message : undefined,
    }
  }
  return gates
}

function parseTests(value: unknown): TestSummary {
  if (!isPlainObject(value)) return { vitest: null, playwright: null }
  const vitest = isPlainObject(value.vitest)
    ? {
        total: Number(value.vitest.total) || 0,
        failed: Number(value.vitest.failed) || 0,
        skipped: Number(value.vitest.skipped) || 0,
        durationMs: typeof value.vitest.durationMs === 'number' ? value.vitest.durationMs : undefined,
      }
    : null
  const playwright = isPlainObject(value.playwright)
    ? {
        total: Number(value.playwright.total) || 0,
        failed: Number(value.playwright.failed) || 0,
        skipped: Number(value.playwright.skipped) || 0,
        browserProjects: Number(value.playwright.browserProjects) || 0,
        durationMs: typeof value.playwright.durationMs === 'number' ? value.playwright.durationMs : undefined,
      }
    : null
  return { vitest, playwright }
}

function parseCoverage(value: unknown): CoverageSummary | null {
  if (!isPlainObject(value) || !isPlainObject(value.thresholds) || !isGateStatus(value.status)) return null
  return {
    statements: Number(value.statements) || 0,
    branches: Number(value.branches) || 0,
    functions: Number(value.functions) || 0,
    lines: Number(value.lines) || 0,
    thresholds: {
      statements: Number(value.thresholds.statements) || 0,
      branches: Number(value.thresholds.branches) || 0,
      functions: Number(value.thresholds.functions) || 0,
      lines: Number(value.thresholds.lines) || 0,
    },
    status: value.status,
  }
}

function parseAccessibility(value: unknown): AccessibilitySummary | null {
  if (!isPlainObject(value) || !isGateStatus(value.status)) return null
  const severities = isPlainObject(value.violationsBySeverity) ? value.violationsBySeverity : {}
  return {
    scannedPages: Number(value.scannedPages) || 0,
    violationsBySeverity: {
      critical: Number(severities.critical) || 0,
      serious: Number(severities.serious) || 0,
      moderate: Number(severities.moderate) || 0,
      minor: Number(severities.minor) || 0,
    },
    allowedIssues: Array.isArray(value.allowedIssues) ? (value.allowedIssues as AccessibilitySummary['allowedIssues']) : [],
    manualReviewStatus:
      value.manualReviewStatus === 'complete' || value.manualReviewStatus === 'incomplete'
        ? value.manualReviewStatus
        : 'notStarted',
    status: value.status,
  }
}

function parseVisual(value: unknown): VisualSummary | null {
  if (!isPlainObject(value) || !isGateStatus(value.status)) return null
  return {
    baselineCount: Number(value.baselineCount) || 0,
    comparedCount: Number(value.comparedCount) || 0,
    mismatches: Number(value.mismatches) || 0,
    baselineEnvironment: typeof value.baselineEnvironment === 'string' ? value.baselineEnvironment : 'unknown',
    lastBaselineUpdate: typeof value.lastBaselineUpdate === 'string' ? value.lastBaselineUpdate : null,
    status: value.status,
  }
}

function parsePerformance(value: unknown): PerformanceSummary | null {
  if (!isPlainObject(value) || !isGateStatus(value.status) || !Array.isArray(value.routes)) return null
  if (!isPlainObject(value.thresholds)) return null
  return {
    routes: value.routes as unknown as PerformanceSummary['routes'],
    thresholds: value.thresholds as unknown as PerformanceSummary['thresholds'],
    status: value.status,
  }
}

function parseKnownIssues(value: unknown): KnownIssuesSummary | null {
  if (!isPlainObject(value)) return null
  const bySeverity = isPlainObject(value.bySeverity) ? value.bySeverity : {}
  return {
    openCount: Number(value.openCount) || 0,
    bySeverity: {
      critical: Number(bySeverity.critical) || 0,
      high: Number(bySeverity.high) || 0,
      medium: Number(bySeverity.medium) || 0,
      low: Number(bySeverity.low) || 0,
    },
  }
}

/**
 * Validates an unknown JSON value into a QualityReport, never throwing.
 * Missing optional sections become null (rendered as "not available" in the UI);
 * missing required identity fields or an unsupported schemaVersion are reported
 * as distinct load states so the UI never silently shows a fabricated result.
 */
export function parseQualityReport(value: unknown): QualityReportLoadResult {
  if (value === null || value === undefined) return { kind: 'empty' }
  if (!isPlainObject(value)) return { kind: 'invalid', reason: 'Report is not a JSON object.' }
  if (value.schemaVersion !== QUALITY_SCHEMA_VERSION) {
    return { kind: 'unsupportedSchema', foundVersion: value.schemaVersion }
  }
  if (typeof value.applicationVersion !== 'string' || !value.applicationVersion) {
    return { kind: 'invalid', reason: 'Missing applicationVersion.' }
  }
  if (typeof value.generatedAt !== 'string' || Number.isNaN(Date.parse(value.generatedAt))) {
    return { kind: 'invalid', reason: 'Missing or invalid generatedAt timestamp.' }
  }
  const gates = parseGates(value.gates)
  if (!gates) return { kind: 'invalid', reason: 'Missing or invalid gates.' }

  const overallStatus: QualityReport['overallStatus'] =
    value.overallStatus === 'ready' ||
    value.overallStatus === 'readyWithWarnings' ||
    value.overallStatus === 'blocked' ||
    value.overallStatus === 'notEvaluated'
      ? value.overallStatus
      : 'notEvaluated'

  const report: QualityReport = {
    schemaVersion: QUALITY_SCHEMA_VERSION,
    applicationVersion: value.applicationVersion,
    commitSha: typeof value.commitSha === 'string' ? value.commitSha : null,
    branch: typeof value.branch === 'string' ? value.branch : null,
    environment: typeof value.environment === 'string' ? value.environment : 'unknown',
    generatedAt: value.generatedAt,
    overallStatus,
    gates,
    tests: parseTests(value.tests),
    coverage: parseCoverage(value.coverage),
    accessibility: parseAccessibility(value.accessibility),
    visual: parseVisual(value.visual),
    performance: parsePerformance(value.performance),
    knownIssues: parseKnownIssues(value.knownIssues),
    analyzerSummary: null,
  }
  return { kind: 'ok', report }
}

/** Parses raw JSON text (e.g. an imported file) into a QualityReportLoadResult, never throwing. */
export function parseQualityReportText(raw: string | null): QualityReportLoadResult {
  if (raw === null || raw.trim() === '') return { kind: 'empty' }
  try {
    return parseQualityReport(JSON.parse(raw))
  } catch {
    return { kind: 'invalid', reason: 'The file is not valid JSON.' }
  }
}
