import 'server-only'

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import type { Role } from './config'
import { db, DeskSetupError, type Sql } from './db'

const COOKIE_NAME = 'tnn_desk'
const SESSION_HOURS = 12
const PENDING_MINUTES = 10
const MAX_FAILED_ATTEMPTS = 5
const LOCK_MINUTES = 15
export const MIN_PASSWORD_LENGTH = 12

export type DeskUser = { id: string; email: string; name: string; role: Role }

// ----- Passwords (scrypt; the same format is written by scripts/desk-user.mjs) -----

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number, options: object) => Promise<Buffer>
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, 32, SCRYPT)
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${key.toString('base64')}`
}

async function verifyPassword(password: string, stored: string) {
  const [scheme, N, r, p, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt') return false
  const expected = Buffer.from(hash, 'base64')
  const key = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  })
  return timingSafeEqual(key, expected)
}

// A dummy hash so a wrong email costs the same time as a wrong password
const DUMMY_HASH = 'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='

// ----- Authenticator app codes (TOTP, RFC 6238: 30-second steps, 6 digits, SHA-1) -----

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(bytes: Buffer) {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31]
  return out
}

function base32Decode(text: string) {
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const char of text.replace(/=+$/, '').toUpperCase()) {
    const index = BASE32.indexOf(char)
    if (index < 0) continue
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

function totpCode(secret: string, step: number) {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(step))
  const digest = createHmac('sha1', base32Decode(secret)).update(counter).digest()
  const offset = digest[digest.length - 1] & 15
  const number = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return number.toString().padStart(6, '0')
}

// Accepts the current code or one step either side (clock drift). Returns the matched
// step so the same code can't be used twice.
function checkTotp(secret: string, code: string, lastStep: number) {
  const now = Math.floor(Date.now() / 30_000)
  for (const step of [now - 1, now, now + 1]) {
    if (step > lastStep && totpCode(secret, step) === code) return step
  }
  return null
}

export function newTotpSecret() {
  return base32Encode(randomBytes(20))
}

export function totpUri(secret: string, email: string) {
  const label = encodeURIComponent(`TNN Desk:${email}`)
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent('TNN Editorial Desk')}&algorithm=SHA1&digits=6&period=30`
}

// ----- Encrypting the TOTP secret at rest -----

function encryptionKey() {
  const secret = process.env.DESK_SECRET
  if (!secret || secret.length < 32) throw new DeskSetupError('DESK_SECRET must be set to at least 32 characters')
  return createHash('sha256').update(`tnn-desk:${secret}`).digest()
}

function encrypt(text: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64')).join('.')
}

function decrypt(value: string) {
  const [iv, tag, data] = value.split('.').map((part) => Buffer.from(part, 'base64'))
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}

// ----- Request details and the audit trail -----

async function clientInfo() {
  const h = await headers()
  const ip = h.get('x-nf-client-connection-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  return { ip, userAgent: h.get('user-agent')?.slice(0, 300) ?? null }
}

export async function audit(
  sql: Sql,
  userId: string | null,
  action: string,
  details: { entity?: string; entityId?: string; summary?: string; changes?: unknown } = {},
) {
  const { ip } = await clientInfo()
  await sql`
    insert into audit_log (user_id, action, entity, entity_id, summary, changes, ip)
    values (${userId}, ${action}, ${details.entity ?? null}, ${details.entityId ?? null},
            ${details.summary ?? null}, ${details.changes === undefined ? null : sql.json(details.changes as never)}, ${ip})`
}

// ----- Sessions -----

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

async function startSession(userId: string, mfaPassed: boolean) {
  const token = randomBytes(32).toString('base64url')
  const expires = new Date(Date.now() + (mfaPassed ? SESSION_HOURS * 3600_000 : PENDING_MINUTES * 60_000))
  const { ip, userAgent } = await clientInfo()
  await db()`
    insert into sessions (token_hash, user_id, mfa_passed, expires_at, ip, user_agent)
    values (${hashToken(token)}, ${userId}, ${mfaPassed}, ${expires}, ${ip}, ${userAgent})`
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/desk',
    expires,
  })
}

async function sessionToken() {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null
}

type SessionRow = DeskUser & {
  mfa_passed: boolean
  totp_enabled: boolean
  totp_secret: string | null
  totp_last_step: string
  must_change_password: boolean
}

async function currentSession(): Promise<SessionRow | null> {
  const token = await sessionToken()
  if (!token) return null
  const [row] = await db()<SessionRow[]>`
    select u.id, u.email, u.name, u.role, u.totp_enabled, u.totp_secret, u.totp_last_step,
           u.must_change_password, s.mfa_passed
    from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now() and not u.disabled`
  return row ?? null
}

// A fully signed-in user (password and authenticator code), checked once per request
export const getDeskUser = cache(async (): Promise<DeskUser | null> => {
  const session = await currentSession()
  if (!session?.mfa_passed || !session.totp_enabled || session.must_change_password) return null
  return { id: session.id, email: session.email, name: session.name, role: session.role }
})

export async function requireDeskUser(role?: Role): Promise<DeskUser> {
  const user = await getDeskUser()
  if (!user) redirect('/desk/login')
  if (role && user.role !== role) redirect('/desk?denied=1')
  return user
}

export async function signOutDesk() {
  const token = await sessionToken()
  if (token) {
    const [row] = await db()<{ user_id: string }[]>`delete from sessions where token_hash = ${hashToken(token)} returning user_id`
    if (row) await audit(db(), row.user_id, 'signed_out')
  }
  ;(await cookies()).delete({ name: COOKIE_NAME, path: '/desk' })
}

// ----- Sign-in steps -----

export type LoginStep = 'code' | 'setup' | 'done'
export type LoginResult = { ok: true; next: LoginStep } | { ok: false; error: string }

const GENERIC_LOGIN_ERROR = 'That email and password don’t match an active Desk account.'

// Step 1: email and password. Starts a short pending session that only allows step 2.
export async function passwordStep(email: string, password: string): Promise<LoginResult> {
  const sql = db()
  const [user] = await sql<
    { id: string; password_hash: string; failed_attempts: number; locked_until: Date | null; disabled: boolean; totp_enabled: boolean; must_change_password: boolean }[]
  >`select id, password_hash, failed_attempts, locked_until, disabled, totp_enabled, must_change_password
    from users where email = ${email.trim().toLowerCase()}`

  if (!user || user.disabled) {
    await verifyPassword(password, DUMMY_HASH)
    await audit(sql, user?.id ?? null, 'sign_in_failed', { summary: `Unknown or disabled account: ${email.slice(0, 120)}` })
    return { ok: false, error: GENERIC_LOGIN_ERROR }
  }
  if (user.locked_until && user.locked_until > new Date()) {
    return { ok: false, error: `Too many attempts. This account is locked for ${LOCK_MINUTES} minutes.` }
  }
  if (!(await verifyPassword(password, user.password_hash))) {
    const failed = user.failed_attempts + 1
    const lock = failed >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null
    await sql`update users set failed_attempts = ${lock ? 0 : failed}, locked_until = ${lock} where id = ${user.id}`
    await audit(sql, user.id, lock ? 'account_locked' : 'sign_in_failed', { summary: 'Wrong password' })
    return { ok: false, error: GENERIC_LOGIN_ERROR }
  }

  await sql`update users set failed_attempts = 0, locked_until = null where id = ${user.id}`
  await startSession(user.id, false)
  return { ok: true, next: user.totp_enabled && !user.must_change_password ? 'code' : 'setup' }
}

async function pendingSession() {
  const session = await currentSession()
  if (!session || session.mfa_passed) return null
  return session
}

// Step 2: the 6-digit code from the authenticator app
export async function codeStep(code: string): Promise<LoginResult> {
  const session = await pendingSession()
  if (!session || !session.totp_enabled || !session.totp_secret) {
    return { ok: false, error: 'Your sign-in timed out. Please start again.' }
  }
  const sql = db()
  const step = checkTotp(decrypt(session.totp_secret), code.replace(/\s/g, ''), Number(session.totp_last_step))
  if (step === null) {
    const [row] = await sql<{ failed_attempts: number }[]>`
      update users set failed_attempts = failed_attempts + 1 where id = ${session.id} returning failed_attempts`
    if (row.failed_attempts >= MAX_FAILED_ATTEMPTS) {
      await sql`update users set failed_attempts = 0, locked_until = ${new Date(Date.now() + LOCK_MINUTES * 60_000)} where id = ${session.id}`
      await sql`delete from sessions where user_id = ${session.id} and not mfa_passed`
      await audit(sql, session.id, 'account_locked', { summary: 'Wrong authenticator codes' })
      return { ok: false, error: `Too many attempts. This account is locked for ${LOCK_MINUTES} minutes.` }
    }
    await audit(sql, session.id, 'sign_in_failed', { summary: 'Wrong authenticator code' })
    return { ok: false, error: 'That code isn’t right. Check the time on your phone and try the newest code.' }
  }

  await sql`update users set totp_last_step = ${step}, failed_attempts = 0 where id = ${session.id}`
  await finishSignIn(session.id)
  return { ok: true, next: 'done' }
}

async function finishSignIn(userId: string) {
  const token = await sessionToken()
  if (token) await db()`delete from sessions where token_hash = ${hashToken(token)}`
  await startSession(userId, true)
  await audit(db(), userId, 'signed_in')
}

// First sign-in, or after a reset: choose a new password and connect an authenticator app.
// The secret is kept on the pending session's user only once the code is confirmed.
export async function setupDetails() {
  const session = await pendingSession()
  if (!session || (session.totp_enabled && !session.must_change_password)) return null
  return { email: session.email, name: session.name }
}

export async function setupStep(secret: string, code: string, newPassword: string): Promise<LoginResult> {
  const session = await pendingSession()
  if (!session) return { ok: false, error: 'Your sign-in timed out. Please start again.' }
  // Only new or reset accounts can connect an app; otherwise a password alone could replace it
  if (session.totp_enabled && !session.must_change_password) {
    return { ok: false, error: 'This account already has an authenticator app. Ask the CEO to reset it.' }
  }
  if (!/^[A-Z2-7]{32}$/.test(secret)) return { ok: false, error: 'Please reload the page and try again.' }
  const step = checkTotp(secret, code.replace(/\s/g, ''), 0)
  if (step === null) return { ok: false, error: 'That code doesn’t match. Scan the QR code again and enter the newest code.' }

  const sql = db()
  await sql`
    update users set password_hash = ${await hashPassword(newPassword)}, must_change_password = false,
      totp_secret = ${encrypt(secret)}, totp_enabled = true, totp_last_step = ${step}
    where id = ${session.id}`
  // Any other sessions belonged to the old password
  await sql`delete from sessions where user_id = ${session.id}`
  await audit(sql, session.id, 'account_set_up', { summary: 'New password and authenticator app' })
  await startSession(session.id, true)
  await audit(sql, session.id, 'signed_in')
  return { ok: true, next: 'done' }
}

// CEO only: give someone a temporary password and make them set up their authenticator again
export async function resetAccount(actor: DeskUser, userId: string) {
  const temporary = randomBytes(12).toString('base64url')
  const sql = db()
  await sql`
    update users set password_hash = ${await hashPassword(temporary)}, must_change_password = true,
      totp_enabled = false, totp_secret = null, totp_last_step = 0, failed_attempts = 0, locked_until = null
    where id = ${userId}`
  await sql`delete from sessions where user_id = ${userId}`
  await audit(sql, actor.id, 'account_reset', { entity: 'user', entityId: userId })
  return temporary
}

// ----- Invitations -----

const INVITE_HOURS = 72

// A new single-use link for an account that still needs setting up (new or reset). Making a new
// one replaces any earlier link.
export async function createInvite(userId: string) {
  const token = randomBytes(32).toString('base64url')
  const sql = db()
  const [user] = await sql<{ email: string; name: string; role: Role }[]>`
    update users set invite_token_hash = ${hashToken(token)}, invite_expires_at = ${new Date(Date.now() + INVITE_HOURS * 3600_000)}
    where id = ${userId} and must_change_password and not disabled
    returning email, name, role`
  if (!user) return null
  await audit(sql, null, 'invite_sent', { entity: 'user', entityId: userId, summary: `Invitation emailed to ${user.email}` })
  return { ...user, token }
}

const INVITE_MATCH = (token: string) => db()`
  invite_token_hash = ${hashToken(token)} and invite_expires_at > now() and must_change_password and not disabled`

// Who an invitation is for, without using it up (email apps open links to scan them)
export async function inviteDetails(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null
  const [user] = await db()<{ name: string; email: string; role: Role }[]>`
    select name, email, role from users where ${INVITE_MATCH(token)}`
  return user ?? null
}

// Uses the invitation: starts the short set-up session and makes the link stop working
export async function acceptInvite(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return false
  const sql = db()
  const [user] = await sql<{ id: string }[]>`
    update users set invite_token_hash = null, invite_expires_at = null
    where ${INVITE_MATCH(token)} returning id`
  if (!user) return false
  await startSession(user.id, false)
  await audit(sql, user.id, 'invite_used')
  return true
}
