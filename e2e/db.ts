import postgres from 'postgres'

export const sql = postgres(process.env.TEST_DATABASE_URL!, { max: 1 })

export async function reset() {
  await sql`TRUNCATE wishlist, likes`
}
