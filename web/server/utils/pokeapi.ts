// the whole pokedex in one GraphQL query (~1000 species), cached: REST would
// need a request per species just to get the french names
const QUERY = `{
  pokemonspecies(order_by: { id: asc }) {
    id
    name
    pokemonspeciesnames(where: { language: { name: { _in: ["fr", "en"] } } }) {
      name
      genus
      language { name }
    }
    pokemons(where: { is_default: { _eq: true } }) {
      height
      weight
      pokemonsprites { sprites(path: "front_default") }
      pokemontypes(order_by: { slot: asc }) {
        type { typenames(where: { language: { name: { _eq: "fr" } } }) { name } }
      }
      pokemonstats { base_stat stat { name } }
    }
  }
}`

type Species = {
  id: number
  name: string
  pokemonspeciesnames: {
    name: string
    genus: string
    language: { name: 'fr' | 'en' }
  }[]
  pokemons: {
    height: number // dm
    weight: number // hg
    pokemonsprites: { sprites: string | null }[]
    pokemontypes: { type: { typenames: { name: string }[] } }[]
    pokemonstats: { base_stat: number; stat: { name: string } }[]
  }[]
}

function toPokemon(s: Species): Pokemon {
  const fr = s.pokemonspeciesnames.find((n) => n.language.name === 'fr')
  const en = s.pokemonspeciesnames.find((n) => n.language.name === 'en')
  const p = s.pokemons[0]!

  return {
    id: s.id,
    slug: s.name,
    name: { fr: fr?.name ?? s.name, en: en?.name ?? s.name },
    category: fr?.genus ?? '',
    sprite: p.pokemonsprites[0]?.sprites ?? null,
    types: p.pokemontypes.map((t) => t.type.typenames[0]?.name ?? '?'),
    stats: Object.fromEntries(
      p.pokemonstats.map((st) => [st.stat.name, st.base_stat]),
    ) as Pokemon['stats'],
    height: p.height / 10,
    weight: p.weight / 10,
  }
}

export const getPokedex = defineCachedFunction(
  async (): Promise<Pokemon[]> => {
    const res = await $fetch<{ data: { pokemonspecies: Species[] } }>(
      'https://graphql.pokeapi.co/v1beta2',
      { method: 'POST', body: { query: QUERY } },
    )
    return res.data.pokemonspecies.map(toPokemon)
  },
  { name: 'pokedex', maxAge: 60 * 60 * 24 },
)
