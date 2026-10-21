import { expect, test } from '@playwright/test'

test('loads a deep SPA route directly', async ({ page }) => {
  await page.goto('/entrar')

  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})

test('proxies /api before the SPA fallback', async ({ page, request }) => {
  const response = await request.get('/api/health')

  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('application/json')
  expect(await response.json()).toEqual({ status: 'ok', database: 'up' })

  await page.goto('/')
  await expect(page.getByText('API e banco conectados')).toBeVisible()
})

test('sets defensive headers on the document', async ({ page }) => {
  const response = await page.goto('/')
  const headers = response?.headers() ?? {}

  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['referrer-policy']).toBe('no-referrer')
})

test('authenticated vertical: login, dashboard, logout and 401 protection', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()

  await page.getByLabel('E-mail').fill('player@example.com')
  await page.getByLabel('Senha').fill('private password 2026!')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByRole('heading', { name: 'Olá, Jogador Playwright' })).toBeVisible()

  await page.getByRole('button', { name: 'Sair' }).first().click()
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})

test('activation is one-time and removes the token from the address bar', async ({ page }) => {
  await page.goto('/ativar-conta?token=playwright-activation-token-000000000000000000')
  await expect(page.getByRole('heading', { name: 'Defina sua senha' })).toBeVisible()
  expect(page.url()).not.toContain('token=')

  await page.getByLabel('Nova senha').fill('activated private password 2026!')
  await page.getByLabel('Confirmar senha').fill('activated private password 2026!')
  await page.getByRole('button', { name: 'Ativar conta' }).click()
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})
