// Creates a Desk account or resets one, printing a temporary password. On first sign-in the
// person chooses their own password and connects an authenticator app.
//   node --env-file=.env.local scripts/desk-user.mjs create --email ceo@example.org --name "Full Name" --role ceo
//   node --env-file=.env.local scripts/desk-user.mjs reset --email ceo@example.org
//   node --env-file=.env.local scripts/desk-user.mjs list
// Use it to add the first CEO account, or if the CEO loses their phone.
import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'

import { connect } from './desk-db.mjs'

const scryptAsync = promisify(scrypt)
// Same format as hashPassword() in lib/desk/auth.ts
async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
  return `scrypt$32768$8$1$${salt.toString('base64')}$${key.toString('base64')}`
}

const [command, ...rest] = process.argv.slice(2)
const args = Object.fromEntries(rest.reduce((pairs, value, i, all) => (value.startsWith('--') ? [...pairs, [value.slice(2), all[i + 1]]] : pairs), []))

const client = connect()
await client.connect()
const query = (text, params = []) => client.query(text, params).then((r) => r.rows)

try {
  if (command === 'list') {
    console.table(await query('select name, email, role, disabled, totp_enabled from desk.users order by role, name'))
  } else if (command === 'create' || command === 'reset') {
    const email = String(args.email ?? '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Give --email')
    const temporary = randomBytes(12).toString('base64url')
    const hash = await hashPassword(temporary)
    if (command === 'create') {
      if (!args.name) throw new Error('Give --name "Full Name"')
      if (!['ceo', 'editor'].includes(args.role)) throw new Error('Give --role ceo or --role editor')
      const [user] = await query('insert into desk.users (email, name, role, password_hash) values ($1, $2, $3, $4) returning id', [email, args.name, args.role, hash])
      await query(`insert into desk.audit_log (user_id, action, entity, entity_id, summary) values (null, 'account_created', 'user', $1, $2)`, [user.id, `${args.name} (${args.role}) from the command line`])
    } else {
      const [user] = await query(
        `update desk.users set password_hash = $1, must_change_password = true, totp_enabled = false, totp_secret = null,
           totp_last_step = 0, failed_attempts = 0, locked_until = null, disabled = false
         where email = $2 returning id`,
        [hash, email],
      )
      if (!user) throw new Error('No account with that email')
      await query('delete from desk.sessions where user_id = $1', [user.id])
      await query(`insert into desk.audit_log (user_id, action, entity, entity_id, summary) values (null, 'account_reset', 'user', $1, 'Reset from the command line')`, [user.id])
    }
    console.log(`\nTemporary password for ${email}:\n\n  ${temporary}\n\nSign in at /desk/login, then choose a new password and connect an authenticator app.`)
  } else {
    console.log('Usage: node --env-file=.env.local scripts/desk-user.mjs create|reset|list --email … [--name … --role ceo|editor]')
  }
} catch (err) {
  console.error(err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
