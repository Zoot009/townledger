import { Pool } from 'pg'

// Same shared Supabase database as the sister directories. Read-only login: SELECT on the directory tables only.
const g = globalThis as unknown as { __pool?: Pool; __formsPool?: Pool }

function createPool(connectionString: string) {
  // `next build` prerenders with one worker per CPU, each with its own pool; the pooler caps total connections at 15.
  const max = process.env.NEXT_PHASE === 'phase-production-build' ? 1 : 4
  const p = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max, connectionTimeoutMillis: 10_000 })
  // The pooler sometimes drops idle connections. Without this listener that error would crash the whole server.
  p.on('error', err => console.warn('[db] idle connection dropped:', err.message))
  return p
}

function pool() {
  const url = process.env.WEB_DATABASE_URL
  if (!url) throw new Error('Set WEB_DATABASE_URL in .env.local (read-only Supabase login)')
  return (g.__pool ??= createPool(url))
}

// Network blips are retried after 1s, 2s and 4s; real SQL errors fail immediately.
const TRANSIENT = new Set(['ECONNRESET', 'EAI_AGAIN', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'EPIPE', '57P01', '08006', '08001'])

export async function sql<T>(text: string, params: unknown[] = []): Promise<T[]> {
  for (let attempt = 0; ; attempt++) {
    try {
      return (await pool().query(text, params)).rows as T[]
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      const transient = TRANSIENT.has(code) || /timeout|terminated/i.test((err as Error).message)
      if (!transient || attempt >= 3) throw err
      await new Promise(r => setTimeout(r, 1000 * 2 ** attempt))
    }
  }
}

// "Add a business" requests go to the shared listing_requests table through the insert-only login.
// No retries: an insert that timed out may still have been saved.
export async function insert(text: string, params: unknown[] = []) {
  const url = process.env.WEB_FORMS_DATABASE_URL
  if (!url) throw new Error('Set WEB_FORMS_DATABASE_URL in .env.local (insert-only forms login)')
  await (g.__formsPool ??= createPool(url)).query(text, params)
}
