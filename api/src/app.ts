import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sql } from './db.js'

const MAX_WISHLIST = 6

// pokedex ids, in insertion order
async function getWishlist(): Promise<number[]> {
  const rows = await sql<{ pokemon_id: number }[]>`
    SELECT pokemon_id FROM wishlist ORDER BY created_at
  `
  return rows.map((r) => r.pokemon_id)
}

const app = new Hono()

app.use(
  '*',
  // CORS_ORIGIN is a comma-separated list of allowed origins
  cors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
  }),
)

app.get('/', (c) => c.json({ message: 'Hello Hono!' }))

app.get('/health', (c) => c.json({ ok: true }))

app.get('/wishlist', async (c) => c.json(await getWishlist()))

app.post('/wishlist', async (c) => {
  const body = await c.req.json<{ id?: unknown }>().catch(() => ({}))
  const id = 'id' in body ? body.id : undefined

  if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) {
    return c.json({ error: 'id must be a positive integer' }, 400)
  }

  const wishlist = await getWishlist()
  if (wishlist.includes(id)) {
    return c.json({ error: 'already in wishlist' }, 409)
  }
  if (wishlist.length >= MAX_WISHLIST) {
    return c.json({ error: `wishlist is limited to ${MAX_WISHLIST}` }, 400)
  }

  await sql`INSERT INTO wishlist (pokemon_id) VALUES (${id})`
  return c.json(await getWishlist(), 201)
})

app.delete('/wishlist/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'not in wishlist' }, 404)
  }

  const deleted = await sql`DELETE FROM wishlist WHERE pokemon_id = ${id}`
  if (deleted.count === 0) {
    return c.json({ error: 'not in wishlist' }, 404)
  }

  return c.json(await getWishlist())
})

// likes per pokedex id. no accounts: the browser sends a random visitor id,
// and each visitor can like a pokemon once
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getLikes(id: number, visitor?: string) {
  const [row] = await sql<{ likes: number; liked: boolean }[]>`
    SELECT
      count(*)::int AS likes,
      coalesce(bool_or(visitor_id::text = ${visitor ?? ''}), false) AS liked
    FROM likes
    WHERE pokemon_id = ${id}
  `
  return { id, ...row! }
}

// GET /likes/:id?visitor=<uuid> -> { id, likes, liked }
app.get('/likes/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'id must be a positive integer' }, 400)
  }

  const visitor = c.req.query('visitor')
  return c.json(
    await getLikes(id, visitor && UUID.test(visitor) ? visitor : undefined),
  )
})

// POST /likes/:id { visitor: <uuid> } -> { id, likes, liked }
app.post('/likes/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'id must be a positive integer' }, 400)
  }

  const body = await c.req.json<{ visitor?: unknown }>().catch(() => ({}))
  const visitor = 'visitor' in body ? body.visitor : undefined
  if (typeof visitor !== 'string' || !UUID.test(visitor)) {
    return c.json({ error: 'visitor must be a uuid' }, 400)
  }

  const inserted = await sql`
    INSERT INTO likes (pokemon_id, visitor_id) VALUES (${id}, ${visitor})
    ON CONFLICT DO NOTHING
  `
  if (inserted.count === 0) {
    return c.json({ error: 'already liked' }, 409)
  }

  return c.json(await getLikes(id, visitor), 201)
})

// DELETE /likes/:id?visitor=<uuid> -> { id, likes, liked }
app.delete('/likes/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'id must be a positive integer' }, 400)
  }

  const visitor = c.req.query('visitor')
  if (!visitor || !UUID.test(visitor)) {
    return c.json({ error: 'visitor must be a uuid' }, 400)
  }

  const deleted = await sql`
    DELETE FROM likes WHERE pokemon_id = ${id} AND visitor_id = ${visitor}
  `
  if (deleted.count === 0) {
    return c.json({ error: 'not liked' }, 404)
  }

  return c.json(await getLikes(id, visitor))
})

export default app
