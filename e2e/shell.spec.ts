import { expect, test } from '@playwright/test'

test('loads a deep SPA route directly', async ({ page }) => {
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

test('proxies /api before the SPA fallback', async ({ page, request }) => {
  const response = await request.get('/api/health')

  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('application/json')
  expect(await response.json()).toEqual({ status: 'ok', database: 'up' })

  await page.goto('/')
  await expect(page.getByText('API e banco conectados')).toBeVisible()
})
