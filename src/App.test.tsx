import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { LanguageProvider } from './i18n/LanguageContext'

function renderApp(path = '/') {
  window.history.pushState({}, '', path)
  return render(<LanguageProvider><App /></LanguageProvider>)
}

describe("Shabi's AI Academy", () => {
  it('renders the dashboard successfully in Hebrew by default', () => {
    renderApp()
    expect(screen.getByRole('heading', { name: 'ברוך שובך, שאבי' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'he')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
  })

  it('switches to English and updates the document language and direction', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'English' }))
    await waitFor(() => expect(document.documentElement).toHaveAttribute('lang', 'en'))
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    expect(screen.getByRole('heading', { name: 'Welcome back, Shabi' })).toBeInTheDocument()
  })

  it('persists the selected language between mounts', async () => {
    const user = userEvent.setup()
    const first = renderApp()
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(window.localStorage.getItem('shabis-ai-academy-language')).toBe('en')
    first.unmount()
    renderApp()
    expect(screen.getByRole('heading', { name: 'Welcome back, Shabi' })).toBeInTheDocument()
  })

  it('renders accessible course progress', () => {
    renderApp()
    const progress = screen.getByRole('progressbar', { name: 'התקדמות כוללת בקורס' })
    expect(progress).toHaveAttribute('aria-valuenow', '2')
    expect(screen.getByText('שיעור 1 מתוך 40 הושלם')).toBeInTheDocument()
  })

  it.each([
    ['/lessons', 'שיעורים'], ['/prompt-library', 'ספריית פרומפטים'], ['/agents', 'הסוכנים שלי'],
    ['/projects', 'פרויקטים'], ['/radar', 'רדאר AI'], ['/settings', 'הגדרות'],
  ])('renders the main route %s', (path, heading) => {
    renderApp(path)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('opens and closes the mobile navigation with its controls', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'פתיחת תפריט הניווט' }))
    expect(screen.getByRole('dialog', { name: 'מרחב הלמידה' })).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'סגירת תפריט הניווט' })[1])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the mobile navigation with Escape', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'פתיחת תפריט הניווט' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
