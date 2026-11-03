import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchPokedex, type Species } from '../server/utils/pokedex'

const pikachu: Species = {
  id: 25,
  name: 'pikachu',
  pokemonspeciesnames: [
    { name: 'Pikachu', genus: 'Mouse Pokémon', language: { name: 'en' } },
    { name: 'Pikachu', genus: 'Pokémon Souris', language: { name: 'fr' } },
  ],
  pokemons: [
    {
      height: 4,
      weight: 60,
      pokemonsprites: [{ sprites: 'pikachu.png' }],
      pokemontypes: [
        {
          type: {
            name: 'electric',
            typenames: [
              { name: 'Electric', language: { name: 'en' } },
              { name: 'Électrik', language: { name: 'fr' } },
            ],
          },
        },
      ],
      pokemonstats: [{ base_stat: 35, stat: { name: 'hp' } }],
    },
  ],
}

function mockFetch(status: number, body: unknown) {
  const fetch = vi.fn(
    async () => new Response(JSON.stringify(body), { status }),
  )
  vi.stubGlobal('fetch', fetch)
  return fetch
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchPokedex', () => {
  it('maps a 200 response', async () => {
    const fetch = mockFetch(200, { data: { pokemonspecies: [pikachu] } })

    const [pokemon] = await fetchPokedex()

    expect(fetch).toHaveBeenCalledOnce()
    expect(pokemon).toEqual({
      id: 25,
      slug: 'pikachu',
      name: { en: 'Pikachu', fr: 'Pikachu', es: 'Pikachu', de: 'Pikachu' },
      category: {
        en: 'Mouse Pokémon',
        fr: 'Pokémon Souris',
        es: 'Mouse Pokémon',
        de: 'Mouse Pokémon',
      },
      sprite: 'pikachu.png',
      types: [
        { en: 'Electric', fr: 'Électrik', es: 'Electric', de: 'Electric' },
      ],
      stats: { hp: 35 },
      height: 0.4,
      weight: 6,
    })
  })

  it('throws when PokeAPI answers 404', async () => {
    mockFetch(404, { error: 'not found' })
    await expect(fetchPokedex()).rejects.toThrow('PokeAPI responded with 404')
  })
})
