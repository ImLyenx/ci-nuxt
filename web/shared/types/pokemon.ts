export type Pokemon = {
  id: number
  slug: string // pokeapi name, url-safe: "nidoran-f", "mr-mime"
  name: { fr: string; en: string }
  category: string
  sprite: string | null
  types: string[]
  stats: {
    hp: number
    attack: number
    defense: number
    'special-attack': number
    'special-defense': number
    speed: number
  }
  height: number // m
  weight: number // kg
}

// what the list endpoint returns for each pokemon
export type PokemonSummary = Pick<Pokemon, 'id' | 'slug' | 'name'>
