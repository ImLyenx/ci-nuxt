import { expect, test } from '@playwright/test'
import { reset } from './db'

test.beforeEach(reset)

test('shows a pokemon page', async ({ page }) => {
  await page.goto('/pokemon/pikachu')
  await expect(page).toHaveTitle('Pikachu | PokéWishlist')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '#25 Pikachu',
  )
})

test('answers 404 for an unknown pokemon', async ({ page }) => {
  const res = await page.goto('/pokemon/missingno')
  expect(res?.status()).toBe(404)
  await expect(page.getByText('Pokémon "missingno" not found')).toBeVisible()
})

test('likes and unlikes a pokemon', async ({ page }) => {
  await page.goto('/pokemon/pikachu')
  const like = page.getByTestId('like')
  const count = page.getByTestId('likes')

  await expect(count).toHaveText('0')
  await like.click()
  await expect(count).toHaveText('1')
  await expect(like).toContainText('Liked')

  await page.reload()
  await expect(count).toHaveText('1')
  await like.click()
  await expect(count).toHaveText('0')
})
