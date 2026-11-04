import 'server-only'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'

// A small tagged-template layer over node-postgres, so queries read
//   sql<Item[]>`select * from items where id = ${id}`
// with every value sent as a parameter (never pasted into the SQL text).
// node-postgres sends each query in one step, which Supabase's pooler handles reliably.

export class DeskSetupError extends Error {}

type Row = Record<string, unknown>

class Fragment {
  constructor(
    readonly strings: readonly string[],
    readonly values: readonly unknown[],
  ) {}
}

// sql(row, columns): "(a, b) values ($1, $2)" after insert into, or "a = $1, b = $2" after set
class Columns {
  constructor(
    readonly row: Record<string, unknown>,
    readonly columns: string[],
  ) {}
}

class Json {
  constructor(readonly value: unknown) {}
}

export class Query<T> implements PromiseLike<T> {
  constructor(
    readonly fragment: Fragment,
    private readonly run: (text: string, params: unknown[]) => Promise<T>,
  ) {}

  then<A = T, B = never>(
    onFulfilled?: ((value: T) => A | PromiseLike<A>) | null,
    onRejected?: ((reason: unknown) => B | PromiseLike<B>) | null,
  ): Promise<A | B> {
    const params: unknown[] = []
    const text = compile(this.fragment, params)
    return this.run(text, params).then(onFulfilled, onRejected)
  }
}

const identifier = (name: string) => `"${name.replace(/"/g, '""')}"`

function compile(fragment: Fragment, params: unknown[]): string {
  let text = fragment.strings[0]
  fragment.values.forEach((value, i) => {
    text += encode(value, params, text) + fragment.strings[i + 1]
  })
  return text
}

function encode(value: unknown, params: unknown[], before: string): string {
  const param = (x: unknown) => {
    params.push(x instanceof Json ? JSON.stringify(x.value) : x === undefined ? null : x)
    return `$${params.length}`
  }
  if (value instanceof Query) return compile(value.fragment, params)
  if (value instanceof Columns) {
    if (/\bset\s*$/i.test(before)) return value.columns.map((c) => `${identifier(c)} = ${param(value.row[c])}`).join(', ')
    return `(${value.columns.map(identifier).join(', ')}) values (${value.columns.map((c) => param(value.row[c])).join(', ')})`
  }
  return param(value)
}

export interface Sql {
  <T = Row[]>(strings: TemplateStringsArray, ...values: unknown[]): Query<T>
  (row: Record<string, unknown>, columns: string[]): Columns
  json(value: unknown): Json
  begin<T>(fn: (sql: Sql) => Promise<T>): Promise<T>
}

type Runner = { query(text: string, params: unknown[]): Promise<pg.QueryResult> }

function makeSql(runner: Runner, begin: Sql['begin']): Sql {
  const sql = ((first: TemplateStringsArray | Record<string, unknown>, ...rest: unknown[]) => {
    if (Array.isArray(first) && 'raw' in first) {
      return new Query(new Fragment(first, rest), (text, params) => runner.query(text, params).then((r) => r.rows))
    }
    return new Columns(first as Record<string, unknown>, rest[0] as string[])
  }) as Sql
  sql.json = (value) => new Json(value)
  sql.begin = begin
  return sql
}

// Supabase signs its database certificates with its own root certificate. It comes from the
// DESK_DATABASE_CA setting (the certificate's text) or db/supabase-ca.crt, and the connection
// is refused unless the server's certificate checks out against it.
function supabaseCa() {
  if (process.env.DESK_DATABASE_CA) return process.env.DESK_DATABASE_CA.replace(/\\n/g, '\n')
  try {
    return readFileSync(join(process.cwd(), 'db', 'supabase-ca.crt'), 'utf8')
  } catch {
    throw new DeskSetupError('the Supabase certificate is missing (DESK_DATABASE_CA or db/supabase-ca.crt)')
  }
}

function connectionConfig(url: string): pg.PoolConfig {
  const parsed = new URL(url)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
  parsed.searchParams.delete('sslmode')
  return {
    connectionString: parsed.toString(),
    ssl: local ? false : { ca: supabaseCa(), rejectUnauthorized: true },
    // Set when the connection opens, so even the first query finds the desk tables
    options: '-c search_path=desk',
  }
}

// Keep dates as "YYYY-MM-DD" strings so a deadline never shifts by a day across time zones
const DATE_OID = 1082
const typeParsers = {
  getTypeParser: ((oid: number, format?: 'text' | 'binary') =>
    oid === DATE_OID ? (value: string) => value : pg.types.getTypeParser(oid, format as 'text')) as typeof pg.types.getTypeParser,
}

let sqlInstance: Sql | undefined

export function db(): Sql {
  if (sqlInstance) return sqlInstance
  const url = process.env.DESK_DATABASE_URL
  if (!url) throw new DeskSetupError('DESK_DATABASE_URL is not set')

  const pool = new pg.Pool({
    ...connectionConfig(url),
    // Local test databases (PGlite) handle one connection at a time: DESK_DATABASE_POOL=1
    max: Number(process.env.DESK_DATABASE_POOL) || 3,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    types: typeParsers,
  })
  // Some servers ignore the startup option (the local test database); set it again to be sure.
  // Dates and times are converted to Harare time in the queries themselves.
  pool.on('connect', (client) => {
    client.query('set search_path to desk').catch(() => {})
  })
  pool.on('error', (err) => console.error('Desk database connection error', err.message))

  sqlInstance = makeSql(pool, async (fn) => {
    const client = await pool.connect()
    try {
      await client.query('begin')
      // Inside a transaction, begin() runs the function in that same transaction
      const tx: Sql = makeSql(client, (inner) => inner(tx))
      const result = await fn(tx)
      await client.query('commit')
      return result
    } catch (err) {
      await client.query('rollback').catch(() => {})
      throw err
    } finally {
      client.release()
    }
  })
  return sqlInstance
}
