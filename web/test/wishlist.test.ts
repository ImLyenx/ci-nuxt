import { describe, expect, it } from 'vitest'
import { addPokemon, MAX_WISHLIST } from '../app/utils/wishlist'

const item = (id: number) => ({
  id,
  slug: `p${id}`,
  name: { en: `P${id}`, fr: `P${id}`, es: `P${id}`, de: `P${id}` },
})

describe('addPokemon', () => {
  it('adds a pokemon', () => {
    expect(addPokemon([item(1)], item(2))).toEqual([item(1), item(2)])
  })

  it('does not mutate the list', () => {
    const list = [item(1)]
    addPokemon(list, item(2))
    expect(list).toEqual([item(1)])
  })

  it('refuses a duplicate', () => {
    expect(() => addPokemon([item(1)], item(1))).toThrow('duplicate')
  })

  it('refuses when the list is full', () => {
    const full = Array.from({ length: MAX_WISHLIST }, (_, i) => item(i + 1))
    expect(() => addPokemon(full, item(99))).toThrow('full')
  })
})
