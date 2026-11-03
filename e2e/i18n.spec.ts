import { expect, test } from '@playwright/test'
import { API } from '../playwright.config'
import { reset, sql } from './db'

test.beforeEach(reset)

test('switches language and remembers it', async ({ page }) => {
  await page.goto('/pokemon/charmander')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Charmander',
  )

  await page.getByRole('combobox').selectOption('fr')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Salamèche',
  )
  await expect(page.getByRole('link', { name: 'Retour' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Salamèche',
  )
})

test('translates API errors', async ({ request }) => {
  await sql`INSERT INTO wishlist (pokemon_id) VALUES (25)`
  const res = await request.post(`${API}/wishlist`, {
    data: { id: 25 },
    headers: { 'Accept-Language': 'de' },
  })
  expect(await res.json()).toEqual({ error: 'bereits auf der Wunschliste' })
})
