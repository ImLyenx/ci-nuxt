import { LOCALES } from '../../shared/utils/locale'

const LANGUAGES = '["en", "fr", "es", "de"]'

// the whole pokedex in one GraphQL query (~1000 species): REST would need a
// request per species just to get the translated names
const QUERY = `{
  pokemonspecies(order_by: { id: asc }) {
    id
    name
    pokemonspeciesnames(where: { language: { name: { _in: ${LANGUAGES} } } }) {
      name
      genus
      language { name }
    }
    pokemons(where: { is_default: { _eq: true } }) {
      height
      weight
      pokemonsprites { sprites(path: "front_default") }
      pokemontypes(order_by: { slot: asc }) {
        type {
          name
          typenames(where: { language: { name: { _in: ${LANGUAGES} } } }) {
            name
            language { name }
          }
        }
      }
      pokemonstats { base_stat stat { name } }
    }
  }
}`

type Translation = { name: string; language: { name: string } }

export type Species = {
  id: number
  name: string
  pokemonspeciesnames: (Translation & { genus: string })[]
  pokemons: {
    height: number // dm
    weight: number // hg
    pokemonsprites: { sprites: string | null }[]
    pokemontypes: { type: { name: string; typenames: Translation[] } }[]
    pokemonstats: { base_stat: number; stat: { name: string } }[]
  }[]
}

function translate<T extends Translation>(
  translations: T[],
  pick: (t: T) => string,
  fallback: string,
): Record<Locale, string> {
  const get = (lang: string) =>
    translations.find((t) => t.language.name === lang)
  const en = get('en')
  return Object.fromEntries(
    LOCALES.map((lang) => {
      const t = get(lang) ?? en
      return [lang, t ? pick(t) : fallback]
    }),
  ) as Record<Locale, string>
}

export function toPokemon(s: Species): Pokemon {
  const p = s.pokemons[0]!

  return {
    id: s.id,
    slug: s.name,
    name: translate(s.pokemonspeciesnames, (n) => n.name, s.name),
    category: translate(s.pokemonspeciesnames, (n) => n.genus, ''),
    sprite: p.pokemonsprites[0]?.sprites ?? null,
    types: p.pokemontypes.map((t) =>
      translate(t.type.typenames, (n) => n.name, t.type.name),
    ),
    stats: Object.fromEntries(
      p.pokemonstats.map((st) => [st.stat.name, st.base_stat]),
    ) as Pokemon['stats'],
    height: p.height / 10,
    weight: p.weight / 10,
  }
}

export async function fetchPokedex(): Promise<Pokemon[]> {
  const res = await fetch('https://graphql.pokeapi.co/v1beta2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY }),
  })
  if (!res.ok) {
    throw new Error(`PokeAPI responded with ${res.status}`)
  }

  const { data } = (await res.json()) as {
    data: { pokemonspecies: Species[] }
  }
  return data.pokemonspecies.map(toPokemon)
}
