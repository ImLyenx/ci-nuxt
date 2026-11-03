export type Locale = 'en' | 'fr' | 'es' | 'de'

export type Pokemon = {
  id: number
  slug: string // pokeapi name, url-safe: "nidoran-f", "mr-mime"
  name: Record<Locale, string>
  category: Record<Locale, string>
  sprite: string | null
  types: Record<Locale, string>[]
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

export type WishlistItem = PokemonSummary
