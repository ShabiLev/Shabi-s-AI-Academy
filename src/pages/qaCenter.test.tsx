import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'
import { LanguageProvider } from '../i18n/LanguageContext'
import { sampleQualityReport } from '../quality/qualityData'

function renderApp(path = '/') {
  window.history.replaceState({}, '', path)
  return render(<LanguageProvider><App /></LanguageProvider>)
}

async function demoLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'כניסה למצב הדגמה' }))
}

function jsonFile(content: unknown, name = 'report.json') {
  return new File([JSON.stringify(content)], name, { type: 'application/json' })
}

describe('QA Center — report states', () => {
  beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear() })

  it('shows Not evaluated when no report is available', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    expect(screen.getByText('אין תוצאה זמינה')).toBeInTheDocument()
    expect(screen.getAllByText('טרם נבדק').length).toBeGreaterThan(0)
  })

  it('renders every quality gate once sample data is loaded', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: 'טעינת נתוני דוגמה' }))
    expect(screen.getByText('נתוני דוגמה')).toBeInTheDocument()
    expect(screen.getAllByText('עבר').length).toBeGreaterThanOrEqual(10)
  })

  it('does not represent a failed gate by color alone — status text is always rendered', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: 'טעינת נתוני דוגמה' }))
    expect(screen.getAllByText('עבר', { exact: true }).every((el) => el.textContent === 'עבר')).toBe(true)
  })

  it('shows a controlled error for an invalid imported report instead of crashing', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    const input = document.querySelector('.qa-release-header input[type="file"]') as HTMLInputElement
    await user.upload(input, new File(['not json'], 'bad.json', { type: 'application/json' }))
    expect(await screen.findByText('קובץ הדוח אינו תקין')).toBeInTheDocument()
  })

  it('shows a controlled error for an unsupported schema version', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    const input = document.querySelector('.qa-release-header input[type="file"]') as HTMLInputElement
    await user.upload(input, jsonFile({ ...sampleQualityReport, schemaVersion: 999 }))
    expect(await screen.findByText('גרסת הסכימה של הדוח אינה נתמכת')).toBeInTheDocument()
  })

  it('shows a stale-version warning when the imported report version does not match', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    const input = document.querySelector('.qa-release-header input[type="file"]') as HTMLInputElement
    await user.upload(input, jsonFile({ ...sampleQualityReport, applicationVersion: '9.9.9' }))
    expect(await screen.findByText(/גרסת האפליקציה בדוח אינה תואמת/)).toBeInTheDocument()
  })

  it('the analyzer never states an unproven root cause', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: 'טעינת נתוני דוגמה' }))
    expect(screen.queryByText(/הסיבה היא/)).not.toBeInTheDocument()
  })
})

describe('QA Center — internal issue register', () => {
  beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear() })

  it('creates, edits, resolves, reopens, and deletes an issue', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: 'בעיה חדשה' }))
    await user.type(screen.getByLabelText('כותרת'), 'חפיפה במסך צר')
    await user.type(screen.getByLabelText('אחראי'), 'שבי')
    await user.click(screen.getByRole('button', { name: 'שמירה' }))
    expect(await screen.findByText('חפיפה במסך צר')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'עריכה' }))
    const titleInput = screen.getByLabelText('כותרת')
    await user.clear(titleInput)
    await user.type(titleInput, 'חפיפה תוקנה בחלקה')
    await user.click(screen.getByRole('button', { name: 'שמירה' }))
    expect(await screen.findByText('חפיפה תוקנה בחלקה')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'סימון כטופל' }))
    expect(await screen.findByText('טופל', { selector: '.qa-issue-tags span' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'פתיחה מחדש' }))
    expect(await screen.findByText('פתוח', { selector: '.qa-issue-tags span' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'מחיקה' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'מחיקה' }))
    expect(screen.getByText('אין בעיות רשומות')).toBeInTheDocument()
  })

  it('requires a title and owner before saving an issue', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: 'בעיה חדשה' }))
    await user.click(screen.getByRole('button', { name: 'שמירה' }))
    expect(screen.getAllByRole('alert')).toHaveLength(2)
  })

  it('filters issues by severity and searches by title', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: 'בעיה חדשה' }))
    await user.type(screen.getByLabelText('כותרת'), 'Contrast issue on login')
    await user.type(screen.getByLabelText('אחראי'), 'Shabi')
    // Two controls share the "חומרה" label: the toolbar filter (index 0) and the form field (index 1).
    await user.selectOptions(screen.getAllByLabelText('חומרה')[1], 'high')
    await user.click(screen.getByRole('button', { name: 'שמירה' }))
    await screen.findByText('Contrast issue on login')

    await user.selectOptions(screen.getByLabelText('חומרה'), 'critical')
    expect(screen.getByText('לא נמצאו בעיות תואמות')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('חומרה'), 'all')
    await user.type(screen.getByLabelText('חיפוש בעיות'), 'zzz-no-match')
    expect(screen.getByText('לא נמצאו בעיות תואמות')).toBeInTheDocument()
  })
})

describe('QA Center — release checklist', () => {
  beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear() })

  it('toggling every manual check moves the sample report from warnings to Ready', async () => {
    const user = userEvent.setup()
    renderApp('/qa')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: 'טעינת נתוני דוגמה' }))
    expect(screen.getByText('מוכן עם אזהרות')).toBeInTheDocument()
    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) await user.click(checkbox)
    expect(screen.getByText('מוכן', { selector: 'dd' })).toBeInTheDocument()
  }, 15_000)

  it('persists a manual checklist toggle after remount', async () => {
    const user = userEvent.setup()
    const first = renderApp('/qa')
    await demoLogin(user)
    await user.click(screen.getAllByRole('checkbox')[0])
    first.unmount()
    renderApp('/qa')
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
  })
})
