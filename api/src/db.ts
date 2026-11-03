import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set (add it to .env)')
}

// prepare: false keeps it working behind Supabase's transaction pooler,
// which is what Lambda should use (many short-lived instances)
export const sql = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: process.env.AWS_LAMBDA_FUNCTION_NAME ? 1 : 10,
})
