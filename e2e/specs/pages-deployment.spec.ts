import { expect, test } from '@playwright/test'

test('serves a public route from the repository base through HashRouter', async ({ page }) => {
  await page.goto('./#/about')
  await expect(page).toHaveURL(/\/Shabi-s-AI-Academy\/#\/about$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('redirects a protected hash route to Login', async ({ page }) => {
  await page.goto('./#/dashboard')
  await expect(page).toHaveURL(/\/Shabi-s-AI-Academy\/#\/login\?from=%2Fdashboard$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('serves public authentication routes through HashRouter', async ({ page }) => {
  await page.goto('./#/auth/login?from=%2Flessons')
  await expect(page).toHaveURL(/#\/auth\/login\?from=%2Flessons$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.goto('./#/auth/register')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('handles an invalid authentication callback safely on Pages', async ({ page }) => {
  await page.goto('./#/auth/callback?error=access_denied&error_description=private-value')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('body')).not.toContainText('private-value')
})
