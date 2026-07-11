import { useMemo, useState } from 'react'
import { ConfirmDialog } from '../prompts/ConfirmDialog'
import { qaUi, type QaUiLanguage } from '../../quality/qaUiText'
import { readFileAsText } from '../../quality/fileText'
import {
  createIssue,
  deleteIssue,
  exportIssuesJson,
  mergeImportedIssues,
  parseImportedIssues,
  setIssueStatus,
  updateIssue,
  type QaIssueInput,
} from '../../quality/qualityStorage'
import type { IssueSeverity, IssueStatus, IssueType, QaIssue } from '../../quality/types'

const issueTypes: IssueType[] = ['bug', 'accessibility', 'performance', 'visual', 'automation', 'technicalDebt']
const severities: IssueSeverity[] = ['critical', 'high', 'medium', 'low']

const emptyForm: QaIssueInput = {
  title: '',
  description: '',
  type: 'bug',
  severity: 'medium',
  owner: '',
  source: '',
  targetVersion: '',
  relatedRoute: '',
  relatedTest: '',
  notes: '',
}

export function IssueRegister({ issues, onChange, ui }: { issues: QaIssue[]; onChange: (issues: QaIssue[]) => void; ui: QaUiLanguage }) {
  const s = qaUi[ui]
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all')
  const [editing, setEditing] = useState<QaIssue | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<QaIssueInput>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deletingId, setDeletingId] = useState<string>()
  const [importMessage, setImportMessage] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return issues.filter((issue) => {
      if (severityFilter !== 'all' && issue.severity !== severityFilter) return false
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false
      if (term && !issue.title.toLowerCase().includes(term) && !issue.description.toLowerCase().includes(term)) return false
      return true
    })
  }, [issues, search, severityFilter, statusFilter])

  const startCreate = () => {
    setForm(emptyForm)
    setErrors({})
    setCreating(true)
    setEditing(null)
  }

  const startEdit = (issue: QaIssue) => {
    setForm({
      title: issue.title,
      description: issue.description,
      type: issue.type,
      severity: issue.severity,
      owner: issue.owner,
      source: issue.source,
      targetVersion: issue.targetVersion ?? '',
      relatedRoute: issue.relatedRoute ?? '',
      relatedTest: issue.relatedTest ?? '',
      notes: issue.notes ?? '',
    })
    setErrors({})
    setEditing(issue)
    setCreating(false)
  }

  const closeForm = () => {
    setCreating(false)
    setEditing(null)
  }

  const submitForm = (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.title.trim()) nextErrors.title = s.issues.required
    if (!form.owner.trim()) nextErrors.owner = s.issues.required
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (editing) {
      onChange(updateIssue(issues, editing.id, form))
    } else {
      const { issues: next } = createIssue(issues, form)
      onChange(next)
    }
    closeForm()
  }

  const setStatus = (id: string, status: IssueStatus) => onChange(setIssueStatus(issues, id, status))

  const exportIssues = () => {
    const blob = new Blob([exportIssuesJson(issues)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qa-issues-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importIssues = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    readFileAsText(file).then((text) => {
      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        setImportMessage(s.issues.importInvalid)
        return
      }
      const { accepted, rejectedCount } = parseImportedIssues(parsed)
      onChange(mergeImportedIssues(issues, accepted))
      setImportMessage(
        s.issues.importSummary.replace('{accepted}', String(accepted.length)).replace('{rejected}', String(rejectedCount)),
      )
    })
  }

  return (
    <section className="settings-card qa-issues" aria-labelledby="qa-issues-title">
      <h2 id="qa-issues-title">{s.section.issues}</h2>
      <p>{s.issues.localNotice}</p>
      <div className="qa-issue-toolbar">
        <label>
          {s.issues.search}
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <label>
          {s.issues.filterSeverity}
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as IssueSeverity | 'all')}>
            <option value="all">{s.issues.all}</option>
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                {s.severity[sev]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {s.issues.filterStatus}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'all')}>
            <option value="all">{s.issues.all}</option>
            {(['open', 'inProgress', 'resolved', 'acceptedRisk'] as IssueStatus[]).map((st) => (
              <option key={st} value={st}>
                {s.issueStatus[st]}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={startCreate}>
          {s.issues.create}
        </button>
        <button type="button" onClick={exportIssues}>
          {s.issues.export}
        </button>
        <label className="qa-import-button">
          {s.issues.import}
          <input type="file" accept="application/json" onChange={importIssues} />
        </label>
      </div>
      {importMessage && <p role="status">{importMessage}</p>}
      {!issues.length ? (
        <p>{s.issues.empty}</p>
      ) : !filtered.length ? (
        <p>{s.issues.noResults}</p>
      ) : (
        <ul className="qa-issue-list">
          {filtered.map((issue) => (
            <li key={issue.id} className="qa-issue-row">
              <div>
                <strong>{issue.title}</strong>
                <p>{issue.description}</p>
                <div className="qa-issue-tags">
                  <span>{s.issueType[issue.type]}</span>
                  <span>{s.severity[issue.severity]}</span>
                  <span>{s.issueStatus[issue.status]}</span>
                  {issue.owner && <span>{issue.owner}</span>}
                </div>
              </div>
              <div className="card-actions">
                <button type="button" onClick={() => startEdit(issue)}>
                  {s.issues.edit}
                </button>
                {issue.status !== 'resolved' ? (
                  <button type="button" onClick={() => setStatus(issue.id, 'resolved')}>
                    {s.issues.resolve}
                  </button>
                ) : (
                  <button type="button" onClick={() => setStatus(issue.id, 'open')}>
                    {s.issues.reopen}
                  </button>
                )}
                <button type="button" onClick={() => setDeletingId(issue.id)}>
                  {s.issues.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {(creating || editing) && (
        <form className="qa-issue-form" onSubmit={submitForm} noValidate>
          <label>
            {s.issues.fieldTitle}
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} aria-invalid={Boolean(errors.title)} />
            {errors.title && <small role="alert">{errors.title}</small>}
          </label>
          <label>
            {s.issues.fieldDescription}
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </label>
          <div className="form-row">
            <label>
              {s.issues.fieldType}
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as IssueType })}>
                {issueTypes.map((t) => (
                  <option key={t} value={t}>
                    {s.issueType[t]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {s.issues.fieldSeverity}
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as IssueSeverity })}>
                {severities.map((sev) => (
                  <option key={sev} value={sev}>
                    {s.severity[sev]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            {s.issues.fieldOwner}
            <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} aria-invalid={Boolean(errors.owner)} />
            {errors.owner && <small role="alert">{errors.owner}</small>}
          </label>
          <label>
            {s.issues.fieldSource}
            <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </label>
          <label>
            {s.issues.fieldTargetVersion}
            <input value={form.targetVersion} onChange={(e) => setForm({ ...form, targetVersion: e.target.value })} />
          </label>
          <label>
            {s.issues.fieldRelatedRoute}
            <input value={form.relatedRoute} onChange={(e) => setForm({ ...form, relatedRoute: e.target.value })} />
          </label>
          <label>
            {s.issues.fieldRelatedTest}
            <input value={form.relatedTest} onChange={(e) => setForm({ ...form, relatedTest: e.target.value })} />
          </label>
          <label>
            {s.issues.fieldNotes}
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </label>
          <div className="card-actions">
            <button type="button" onClick={closeForm}>
              {s.issues.cancel}
            </button>
            <button className="save-prompt" type="submit">
              {s.issues.save}
            </button>
          </div>
        </form>
      )}
      {deletingId && (
        <ConfirmDialog
          title={s.issues.deleteConfirmTitle}
          description={s.issues.deleteConfirmDescription}
          cancel={s.issues.cancel}
          confirm={s.issues.delete}
          onCancel={() => setDeletingId(undefined)}
          onConfirm={() => {
            onChange(deleteIssue(issues, deletingId))
            setDeletingId(undefined)
          }}
        />
      )}
    </section>
  )
}
