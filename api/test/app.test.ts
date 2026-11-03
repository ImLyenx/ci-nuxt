import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import app from '../src/app.js'
import { sql } from '../src/db.js'

const VISITOR = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b'

function post(path: string, body: unknown, lang = 'en') {
  return app.request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept-Language': lang },
    body: JSON.stringify(body),
  })
}

beforeEach(async () => {
  await sql`TRUNCATE wishlist, likes`
})

afterAll(async () => {
  await sql.end()
})

describe('health', () => {
  it('returns 200', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })
})

describe('wishlist', () => {
  it('starts empty', async () => {
    const res = await app.request('/wishlist')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  it('adds a pokemon', async () => {
    const res = await post('/wishlist', { id: 25 })
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual([25])
  })

  it('persists in the database', async () => {
    await post('/wishlist', { id: 1 })
    await post('/wishlist', { id: 4 })
    expect(await (await app.request('/wishlist')).json()).toEqual([1, 4])
  })

  it('refuses a duplicate', async () => {
    await post('/wishlist', { id: 25 })
    const res = await post('/wishlist', { id: 25 })
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'already in wishlist' })
  })

  it('refuses a 7th pokemon', async () => {
    for (let id = 1; id <= 6; id++) await post('/wishlist', { id })
    const res = await post('/wishlist', { id: 7 })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'wishlist is limited to 6' })
  })

  it.each([{}, { id: 0 }, { id: -1 }, { id: 1.5 }, { id: '25' }])(
    'refuses invalid input %j',
    async (body) => {
      const res = await post('/wishlist', body)
      expect(res.status).toBe(400)
    },
  )

  it('refuses a body that is not json', async () => {
    const res = await app.request('/wishlist', { method: 'POST', body: 'x' })
    expect(res.status).toBe(400)
  })

  it('deletes a pokemon', async () => {
    await post('/wishlist', { id: 25 })
    const res = await app.request('/wishlist/25', { method: 'DELETE' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  it('returns 404 when deleting a missing pokemon', async () => {
    const res = await app.request('/wishlist/25', { method: 'DELETE' })
    expect(res.status).toBe(404)
  })

  it('returns 404 when deleting an invalid id', async () => {
    const res = await app.request('/wishlist/abc', { method: 'DELETE' })
    expect(res.status).toBe(404)
  })
})

describe('likes', () => {
  it('counts likes per visitor', async () => {
    const res = await post('/likes/25', { visitor: VISITOR })
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ id: 25, likes: 1, liked: true })

    const other = await app.request('/likes/25')
    expect(await other.json()).toEqual({ id: 25, likes: 1, liked: false })
  })

  it('refuses a second like from the same visitor', async () => {
    await post('/likes/25', { visitor: VISITOR })
    const res = await post('/likes/25', { visitor: VISITOR })
    expect(res.status).toBe(409)
  })

  it('refuses an invalid visitor', async () => {
    const res = await post('/likes/25', { visitor: 'nope' })
    expect(res.status).toBe(400)
  })

  it('refuses an invalid id', async () => {
    expect((await app.request('/likes/0')).status).toBe(400)
  })

  it('unlikes', async () => {
    await post('/likes/25', { visitor: VISITOR })
    const res = await app.request(`/likes/25?visitor=${VISITOR}`, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ id: 25, likes: 0, liked: false })
  })

  it('returns 404 when unliking without a like', async () => {
    const res = await app.request(`/likes/25?visitor=${VISITOR}`, {
      method: 'DELETE',
    })
    expect(res.status).toBe(404)
  })
})

describe('i18n', () => {
  it.each([
    ['fr-FR,fr;q=0.9', 'déjà dans la wishlist'],
    ['es', 'ya está en la wishlist'],
    ['de', 'bereits auf der Wunschliste'],
    ['ja', 'already in wishlist'],
  ])('translates errors for %s', async (lang, error) => {
    await post('/wishlist', { id: 25 })
    const res = await post('/wishlist', { id: 25 }, lang)
    expect(await res.json()).toEqual({ error })
  })
})
