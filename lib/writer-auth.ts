import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { hashAccessCode } from '@/sanity/lib/accessCode'
import { getWriteClient } from '@/sanity/lib/writeClient'

const COOKIE_NAME = 'tnn_writer'
const SESSION_DAYS = 30
// Cloudflare Workers cap PBKDF2 at 100k iterations
const PBKDF2_ITERATIONS = 100_000

export type Writer = {
  _id: string
  name: string
  active?: boolean
  accessCodeHash?: string
  author?: { _ref: string }
}

// Login details live in "writerAccount.<writerId>" documents. IDs containing a dot are
// private in Sanity, so emails and password hashes can't be read from the public dataset.
type WriterAccount = {
  _id: string
  writerId: string
  email: string
  passwordHash: string
  salt: string
  inviteHash: string
}

const WRITER_FIELDS = '_id, name, active, accessCodeHash, author'
const accountId = (writerId: string) => `writerAccount.${writerId}`

const encoder = new TextEncoder()

function toHex(bytes: ArrayBuffer | Uint8Array) {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

function toBase64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS },
    key,
    256,
  )
  return toHex(bits)
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// The session is signed with a key derived from the Sanity write token,
// so there is no extra secret to manage. Rotating the token signs everyone out.
async function signingKey() {
  const secret = encoder.encode(`tnn-writer-session:${process.env.SANITY_API_WRITE_TOKEN}`)
  return crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

// Session value: <writerId>.<expiry>.<password hash prefix>.<signature>
// Including part of the password hash means a password reset ends old sessions.
async function createSession(account: WriterAccount) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const payload = `${account.writerId}.${expires}.${account.passwordHash.slice(0, 16)}`
  const signature = await crypto.subtle.sign('HMAC', await signingKey(), encoder.encode(payload))
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, `${payload}.${toBase64Url(signature)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expires),
  })
}

export type JoinResult = { ok: true } | { ok: false; error: string }

// Redeem an invite code from the chief editor: create the writer's login, or reset
// their password if the editor has generated a new code since they last joined.
export async function joinWithInvite(code: string, email: string, password: string): Promise<JoinResult> {
  const client = getWriteClient()
  const inviteHash = await hashAccessCode(code)
  const writer = await client.fetch<Writer | null>(
    `*[_type == "writer" && accessCodeHash == $inviteHash && active != false && !(_id in path("drafts.**"))][0]{${WRITER_FIELDS}}`,
    { inviteHash },
  )
  if (!writer) return { ok: false, error: 'That invite code isn’t valid. Check it with your editor.' }

  const account = await client.fetch<WriterAccount | null>(`*[_id == $id][0]`, { id: accountId(writer._id) })
  if (account?.inviteHash === inviteHash) {
    return { ok: false, error: 'This invite code has already been used. Sign in instead, or ask your editor for a new code.' }
  }

  const normalizedEmail = normalizeEmail(email)
  const emailTaken = await client.fetch<boolean>(
    `count(*[_type == "writerAccount" && email == $email && writerId != $writerId]) > 0`,
    { email: normalizedEmail, writerId: writer._id },
  )
  if (emailTaken) return { ok: false, error: 'Another writer already uses that email address.' }

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const saved: WriterAccount = {
    _id: accountId(writer._id),
    writerId: writer._id,
    email: normalizedEmail,
    salt,
    passwordHash: await hashPassword(password, salt),
    inviteHash,
  }
  await client.createOrReplace({ _type: 'writerAccount', ...saved })
  await createSession(saved)
  return { ok: true }
}

export async function signIn(email: string, password: string): Promise<boolean> {
  const client = getWriteClient()
  const account = await client.fetch<WriterAccount | null>(
    `*[_type == "writerAccount" && email == $email][0]`,
    { email: normalizeEmail(email) },
  )
  if (!account) {
    // Spend the same time as a real check so response timing doesn't reveal which emails exist
    await hashPassword(password, 'no-account')
    return false
  }
  if (!safeEqual(await hashPassword(password, account.salt), account.passwordHash)) return false

  const writer = await client.fetch<Writer | null>(`*[_type == "writer" && _id == $id][0]{${WRITER_FIELDS}}`, {
    id: account.writerId,
  })
  if (!writer || writer.active === false) return false

  await createSession(account)
  return true
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getCurrentWriter(): Promise<Writer | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE_NAME)?.value
  if (!value) return null

  const parts = value.split('.')
  if (parts.length < 4) return null
  const [signature, hashPrefix, expires] = [parts.pop()!, parts.pop()!, parts.pop()!]
  const writerId = parts.join('.')

  let valid = false
  try {
    valid = await crypto.subtle.verify(
      'HMAC',
      await signingKey(),
      fromBase64Url(signature),
      encoder.encode(`${writerId}.${expires}.${hashPrefix}`),
    )
  } catch {
    return null
  }
  if (!valid || Number(expires) < Date.now()) return null

  // Re-check on every request so turning off "Can sign in" or resetting a password takes effect immediately
  const result = await getWriteClient().fetch<{ writer: Writer | null; passwordHash?: string }>(
    `{
      "writer": *[_type == "writer" && _id == $id][0]{${WRITER_FIELDS}},
      "passwordHash": *[_id == $accountId][0].passwordHash
    }`,
    { id: writerId, accountId: accountId(writerId) },
  )
  const { writer, passwordHash } = result
  if (!writer || writer.active === false || passwordHash?.slice(0, 16) !== hashPrefix) return null
  return writer
}

export async function requireWriter(): Promise<Writer> {
  const writer = await getCurrentWriter()
  if (!writer) redirect('/write/login')
  return writer
}
