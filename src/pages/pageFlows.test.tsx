import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'
import { LanguageProvider } from '../i18n/LanguageContext'

function renderApp(path = '/') {
  window.history.replaceState({}, '', path)
  return render(<LanguageProvider><App /></LanguageProvider>)
}

async function demoLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'כניסה למצב הדגמה' }))
}

describe('Lesson quiz and completion', () => {
  beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear() })

  it('requires every answer before scoring the quiz', async () => {
    const user = userEvent.setup()
    renderApp('/lessons/ai-llm-agent')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: 'בדיקת תשובות' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('scores answers and lets the learner retry', async () => {
    const user = userEvent.setup()
    renderApp('/lessons/ai-llm-agent')
    await demoLogin(user)
    await user.click(screen.getByRole('radio', { name: 'הקשר' }))
    await user.click(screen.getByRole('radio', { name: 'נכון' }))
    await user.click(screen.getByRole('radio', { name: 'אימות אנושי ותוצר שניתן לסקור' }))
    await user.click(screen.getByRole('button', { name: 'בדיקת תשובות' }))
    expect(screen.getByText(/הציון שלך/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ניסיון נוסף' }))
    expect(screen.getByRole('button', { name: 'בדיקת תשובות' })).toBeInTheDocument()
  })

  it('marks a lesson complete', async () => {
    const user = userEvent.setup()
    renderApp('/lessons/ai-llm-agent')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: 'סימון השיעור כהושלם' }))
    expect(screen.getByRole('status')).toHaveTextContent('השיעור הושלם')
  })

  it('saves a lesson draft locally and opens the Workshop with a prefilled sample', async () => {
    const user = userEvent.setup()
    renderApp('/lessons/professional-prompt-anatomy')
    await demoLogin(user)
    await user.type(screen.getByLabelText('טיוטת הפרומפט שלך'), 'טיוטה לבדיקה')
    expect(screen.getByLabelText('טיוטת הפרומפט שלך')).toHaveValue('טיוטה לבדיקה')
    await user.click(screen.getByRole('link', { name: 'פתח בסדנת הפרומפטים' }))
    expect(screen.getByLabelText('שם הפרומפט')).toHaveValue('QA Test Case Generator')
  })

  it('shows Not Found for an unknown lesson slug', async () => {
    const user = userEvent.setup()
    renderApp('/lessons/does-not-exist')
    await demoLogin(user)
    expect(screen.getByRole('heading', { name: 'השיעור לא נמצא' })).toBeInTheDocument()
  })
})

describe('Prompt Workshop and Library flows', () => {
  beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear() })

  it('loads a sample prompt into the Builder and shows a live preview', async () => {
    const user = userEvent.setup()
    renderApp('/prompts/new')
    await demoLogin(user)
    await user.click(screen.getByRole('button', { name: '1. QA Test Case Generator' }))
    expect(screen.getByLabelText('שם הפרומפט')).toHaveValue('QA Test Case Generator')
    expect(screen.getByLabelText('תצוגה מקדימה')).toHaveTextContent('משימה:')
  })

  it('creates, edits, duplicates, favorites and deletes a prompt', async () => {
    const user = userEvent.setup()
    renderApp('/prompts/new')
    await demoLogin(user)
    await user.type(screen.getByLabelText('שם הפרומפט'), 'שם לבדיקה')
    await user.type(screen.getByLabelText('משימה'), 'צור מקרי בדיקה מפורטים לתרחיש התחברות.')
    await user.click(screen.getByRole('button', { name: 'שמירה' }))
    expect(await screen.findByRole('heading', { name: 'שם לבדיקה' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'עריכה' }))
    await user.type(screen.getByLabelText('תיאור'), 'תיאור חדש')
    await user.click(screen.getByRole('button', { name: 'שמירה' }))
    expect(screen.getByLabelText('גרסה 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'שכפול' }))
    await user.click(screen.getByRole('button', { name: 'שמירה' }))
    expect(await screen.findByRole('heading', { name: 'שם לבדיקה עותק' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'הוספה למועדפים' }))
    expect(screen.getByRole('button', { name: 'הסרה מהמועדפים' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'מחיקה' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'מחיקה' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'מחיקה' }))
    expect(screen.getByRole('status')).toHaveTextContent('הפרומפט נמחק')
  })

  it('searches and filters the Prompt Library', async () => {
    const user = userEvent.setup()
    renderApp('/prompts/new')
    await demoLogin(user)
    await user.type(screen.getByLabelText('שם הפרומפט'), 'Unique Jira Prompt')
    await user.type(screen.getByLabelText('משימה'), 'נתח פערי בדיקות ותעדוף סיכונים לשחרור.')
    await user.click(screen.getByRole('button', { name: 'שמירה' }))
    await screen.findByRole('heading', { name: 'Unique Jira Prompt' })
    await user.click(screen.getByRole('link', { name: /חזרה לספרייה/ }))

    await user.type(screen.getByRole('searchbox', { name: 'חיפוש בפרומפטים' }), 'Unique')
    expect(screen.getByRole('heading', { name: 'Unique Jira Prompt' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('קטגוריה'), 'sql')
    expect(screen.getByText('לא נמצאו פרומפטים')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ניקוי מסננים' }))
    expect(screen.getByRole('heading', { name: 'Unique Jira Prompt' })).toBeInTheDocument()
  })

  it('validates required fields and shows Not Found for an unknown prompt', async () => {
    const user = userEvent.setup()
    renderApp('/prompts')
    await demoLogin(user)
    expect(screen.getByRole('heading', { name: 'עדיין לא שמרת פרומפטים' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'יצירת הפרומפט הראשון' }))
    await user.click(screen.getByRole('button', { name: 'שמירה' }))
    expect(screen.getAllByRole('alert')).toHaveLength(2)

    renderApp('/prompts/missing')
    expect(screen.getByRole('heading', { name: 'הפרומפט לא נמצא' })).toBeInTheDocument()
  })
})
