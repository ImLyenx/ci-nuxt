import { fetchPokedex } from './pokedex'

export const getPokedex = defineCachedFunction(fetchPokedex, {
  name: 'pokedex-i18n',
  maxAge: 60 * 60 * 24,
})
