// Creates a Desk account or resets one. If email is set up (RESEND_API_KEY and DESK_EMAIL_FROM),
// the person is emailed a single-use invitation link; otherwise a temporary password is printed.
// Either way they choose their own password and connect an authenticator app on first sign-in.
//   node --env-file=.env.local scripts/desk-user.mjs create --email ceo@example.org --name "Full Name" --role ceo
//   node --env-file=.env.local scripts/desk-user.mjs reset --email ceo@example.org
//   node --env-file=.env.local scripts/desk-user.mjs invite --email ceo@example.org   (send a new invitation)
//   node --env-file=.env.local scripts/desk-user.mjs list
// Add --no-email to print a temporary password instead of emailing an invitation.
import { createHash, randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'

import { INVITE_DAYS, inviteEmail, renderEmail, siteBase } from '../lib/desk/email.ts'
import { connect } from './desk-db.mjs'

const ROLE_NAMES = { ceo: 'CEO', editor: 'Managing Editor' }

const scryptAsync = promisify(scrypt)
// Same format as hashPassword() in lib/desk/auth.ts
async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
  return `scrypt$32768$8$1$${salt.toString('base64')}$${key.toString('base64')}`
}

const [command, ...rest] = process.argv.slice(2)
const noEmail = rest.includes('--no-email')
const args = Object.fromEntries(rest.reduce((pairs, value, i, all) => (value.startsWith('--') && value !== '--no-email' ? [...pairs, [value.slice(2), all[i + 1]]] : pairs), []))
const canEmail = !noEmail && !!process.env.RESEND_API_KEY && !!process.env.DESK_EMAIL_FROM

const client = connect()
await client.connect()
const query = (text, params = []) => client.query(text, params).then((r) => r.rows)

// Same as createInvite() in lib/desk/auth.ts and sendInvitation() in lib/desk/notify.ts
async function invite(userId) {
  const token = randomBytes(32).toString('base64url')
  const [user] = await query(
    `update desk.users set invite_token_hash = $1, invite_expires_at = now() + interval '${INVITE_DAYS} days'
     where id = $2 and must_change_password and not disabled returning email, name, role`,
    [createHash('sha256').update(token).digest('hex'), userId],
  )
  if (!user) throw new Error('This account is already set up. Use reset first.')
  const { html, text } = renderEmail(inviteEmail(user.name, ROLE_NAMES[user.role], `/desk/invite/${token}`))
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.DESK_EMAIL_FROM, to: [user.email], subject: 'TNN Desk: Your Editorial Desk invitation', html, text }),
  })
  if (!response.ok) throw new Error(`The invitation email failed (${response.status}): ${await response.text()}`)
  await query(`insert into desk.audit_log (user_id, action, entity, entity_id, summary) values (null, 'invite_sent', 'user', $1, $2)`, [userId, `Invitation emailed to ${user.email}`])
  console.log(`\nInvitation emailed to ${user.email}. The link works once, for ${INVITE_DAYS} days, and opens ${siteBase()}/desk/invite/…`)
}

try {
  const email = String(args.email ?? '').trim().toLowerCase()
  if (command === 'list') {
    console.table(await query('select name, email, role, disabled, totp_enabled, invite_expires_at > now() as invite_open from desk.users order by role, name'))
  } else if (command === 'invite') {
    const [user] = await query('select id from desk.users where email = $1', [email])
    if (!user) throw new Error('No account with that email')
    if (!canEmail) throw new Error('Email isn’t set up: RESEND_API_KEY and DESK_EMAIL_FROM are needed.')
    await invite(user.id)
  } else if (command === 'create' || command === 'reset') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Give --email')
    const temporary = randomBytes(12).toString('base64url')
    const hash = await hashPassword(temporary)
    let userId
    if (command === 'create') {
      if (!args.name) throw new Error('Give --name "Full Name"')
      if (!['ceo', 'editor'].includes(args.role)) throw new Error('Give --role ceo or --role editor')
      const [user] = await query('insert into desk.users (email, name, role, password_hash) values ($1, $2, $3, $4) returning id', [email, args.name, args.role, hash])
      await query(`insert into desk.audit_log (user_id, action, entity, entity_id, summary) values (null, 'account_created', 'user', $1, $2)`, [user.id, `${args.name} (${args.role}) from the command line`])
      userId = user.id
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
      userId = user.id
    }
    if (canEmail) {
      await invite(userId)
    } else {
      console.log(`\nTemporary password for ${email}:\n\n  ${temporary}\n\nSign in at /desk/login, then choose a new password and connect an authenticator app.`)
    }
  } else {
    console.log('Usage: node --env-file=.env.local scripts/desk-user.mjs create|reset|invite|list --email … [--name … --role ceo|editor] [--no-email]')
  }
} catch (err) {
  console.error(err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
