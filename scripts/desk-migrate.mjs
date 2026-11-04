// Creates or updates the Editorial Desk tables. Safe to run more than once:
//   node --env-file=.env.local scripts/desk-migrate.mjs
import { readFileSync } from 'node:fs'

import { connect } from './desk-db.mjs'

const client = connect()
await client.connect()
try {
  await client.query(readFileSync(new URL('../db/desk.sql', import.meta.url), 'utf8'))
  const { rows } = await client.query(`select tablename from pg_tables where schemaname = 'desk' order by tablename`)
  console.log(`Desk schema ready: ${rows.map((t) => t.tablename).join(', ')}`)
} finally {
  await client.end()
}
