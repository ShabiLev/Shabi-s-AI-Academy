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
