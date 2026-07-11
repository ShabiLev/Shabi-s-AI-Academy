export const manualChecklistKeys = [
  'hebrewDesktop',
  'englishDesktop',
  'hebrewMobile',
  'englishMobile',
  'keyboardNav',
  'refreshRoutes',
  'exports',
  'typography',
  'overlap',
  'consoleErrors',
  'releaseNotes',
] as const

export type ManualChecklistKey = (typeof manualChecklistKeys)[number]

export function isChecklistComplete(manualChecks: Record<string, boolean>): boolean {
  return manualChecklistKeys.every((key) => manualChecks[key])
}
