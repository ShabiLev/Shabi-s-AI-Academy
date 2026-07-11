import { qaUi, type QaUiLanguage } from '../../quality/qaUiText'
import { manualChecklistKeys, type ManualChecklistKey } from '../../quality/checklist'
import type { GateName, QualityGates } from '../../quality/types'

const automatedGateOrder: GateName[] = [
  'lint',
  'unitTests',
  'coverage',
  'build',
  'e2eFast',
  'e2eFull',
  'accessibility',
  'visual',
  'performance',
]

export function ReleaseChecklist({
  version,
  gates,
  manualChecks,
  onToggle,
  ui,
}: {
  version: string
  gates: QualityGates | null
  manualChecks: Record<string, boolean>
  onToggle: (key: ManualChecklistKey, checked: boolean) => void
  ui: QaUiLanguage
}) {
  const s = qaUi[ui]
  return (
    <section className="settings-card qa-checklist" aria-labelledby="qa-checklist-title">
      <h2 id="qa-checklist-title">{s.checklist.title}</h2>
      <p>{s.checklist.versionNotice.replace('{version}', version)}</p>
      <h3>{s.checklist.automatedSection}</h3>
      <ul className="qa-checklist-automated">
        {automatedGateOrder.map((name) => (
          <li key={name}>
            <span aria-hidden="true">{gates?.[name].status === 'passed' ? '✓' : '—'}</span>
            <span>
              {s.checklist.automated[name as keyof typeof s.checklist.automated]}: {gates ? s.gateStatus[gates[name].status] : s.notAvailable}
            </span>
          </li>
        ))}
      </ul>
      <h3>{s.checklist.manualSection}</h3>
      <ul className="qa-checklist-manual">
        {manualChecklistKeys.map((key) => (
          <li key={key}>
            <label>
              <input type="checkbox" checked={Boolean(manualChecks[key])} onChange={(e) => onToggle(key, e.target.checked)} />
              {s.checklist.manual[key]}
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
