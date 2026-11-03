export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  const pokemon = (await getPokedex()).find((p) => p.slug === slug)
  if (!pokemon) {
    throw createError({ statusCode: 404, statusMessage: 'Pokémon not found' })
  }

  return pokemon
})
