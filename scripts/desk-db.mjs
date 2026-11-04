// Database connection for the Desk command-line scripts. Same rules as lib/desk/db.ts:
// certificate checked against Supabase's root certificate, except for a local test database.
import { readFileSync } from 'node:fs'
import pg from 'pg'

export function connect() {
  const url = process.env.DESK_DATABASE_URL
  if (!url) {
    console.error('Set DESK_DATABASE_URL first (or run with: node --env-file=.env.local …).')
    process.exit(1)
  }
  const parsed = new URL(url)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
  parsed.searchParams.delete('sslmode')
  let ca
  if (!local) {
    ca = process.env.DESK_DATABASE_CA?.replace(/\\n/g, '\n')
    try {
      ca ??= readFileSync(new URL('../db/supabase-ca.crt', import.meta.url), 'utf8')
    } catch {
      console.error('Supabase certificate missing: save it as db/supabase-ca.crt (see docs/EDITORIAL-DESK.md).')
      process.exit(1)
    }
  }
  const client = new pg.Client({ connectionString: parsed.toString(), ssl: local ? false : { ca, rejectUnauthorized: true } })
  return client
}
