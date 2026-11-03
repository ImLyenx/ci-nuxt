import { expect, test, type Page } from '@playwright/test'
import { API } from '../playwright.config'
import { reset, sql } from './db'

test.beforeEach(reset)

async function add(page: Page, name: string) {
  await page.getByTestId('search').fill(name)
  await page
    .getByTestId('result')
    .filter({ has: page.getByRole('link', { name, exact: true }) })
    .getByRole('button')
    .click()
}

test('adds a pokemon and keeps it after a reload', async ({ page }) => {
  await page.goto('/')
  await add(page, 'Pikachu')

  const wishlist = page.getByTestId('wishlist')
  await expect(wishlist).toContainText('Pikachu')

  await page.reload()
  await expect(wishlist).toContainText('Pikachu')
})

test('does not offer a pokemon twice', async ({ page, request }) => {
  await page.goto('/')
  await add(page, 'Pikachu')
  await expect(page.getByTestId('wishlist')).toContainText('Pikachu')
  await expect(page.getByTestId('result')).toHaveCount(0)

  const res = await request.post(`${API}/wishlist`, { data: { id: 25 } })
  expect(res.status()).toBe(409)
})

test('refuses a 7th pokemon', async ({ page }) => {
  await sql`INSERT INTO wishlist (pokemon_id) SELECT generate_series(1, 6)`
  await page.goto('/')
  await expect(page.getByTestId('wishlist').getByRole('listitem')).toHaveCount(
    6,
  )

  await add(page, 'Pikachu')
  await expect(page.getByTestId('error')).toHaveText(
    'The wishlist is limited to 6',
  )
  await expect(page.getByTestId('wishlist').getByRole('listitem')).toHaveCount(
    6,
  )
})

test('removes a pokemon', async ({ page }) => {
  await sql`INSERT INTO wishlist (pokemon_id) VALUES (25)`
  await page.goto('/')

  const wishlist = page.getByTestId('wishlist')
  await expect(wishlist).toContainText('Pikachu')
  await wishlist.getByRole('button', { name: 'Remove' }).click()
  await expect(wishlist).not.toContainText('Pikachu')
})
