export default defineEventHandler(async (): Promise<PokemonSummary[]> =>
  (await getPokedex()).map(({ id, slug, name }) => ({ id, slug, name })),
)
