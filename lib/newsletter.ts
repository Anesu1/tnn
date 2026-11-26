import 'server-only'

import { randomBytes } from 'node:crypto'

import { db } from '@/lib/desk/db'
import { renderEmail, type EmailContent } from '@/lib/desk/email'
import { formatDate, SITE_URL } from '@/lib/site/config'
import { getStoriesWith, storyUrl } from '@/lib/site/news'
import { episodeUrl, getLatestEpisodes } from '@/lib/site/watch'

// The TNN email briefing. Readers sign up on /newsletter and confirm from their inbox (double
// opt-in); the briefing goes out weekly once NEWSLETTER_ENABLED is "true". Subscribers live in
// the Desk database (desk.subscribers), sent through Resend.

export const NEWSLETTER = {
  weekday: 5, // Friday (0 = Sunday)
  hour: 7, // 07:00 Harare time
  days: 7, // stories from the last week
  maxStories: 8,
}

const FROM = () => process.env.NEWSLETTER_FROM || 'The Narrative Network <briefing@thenarrativenetwork.org>'
const REASON = 'You’re receiving this because you signed up for the TNN email briefing at thenarrativenetwork.org.'
const CONFIRM_THROTTLE_MINUTES = 10
const CONFIRMATIONS_PER_HOUR = 60

export const canEmail = () => !!process.env.RESEND_API_KEY
export const newsletterEnabled = () => process.env.NEWSLETTER_ENABLED === 'true' && canEmail()

export const normaliseEmail = (email: string) => email.trim().toLowerCase()
export const validEmail = (email: string) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)

const unsubscribeUrl = (token: string) => `${SITE_URL}/newsletter/unsubscribe?token=${token}`
const oneClickUrl = (token: string) => `${SITE_URL}/api/newsletter/unsubscribe?token=${token}`

type Email = { to: string; subject: string; html: string; text: string; headers?: Record<string, string> }

async function resend(path: '/emails' | '/emails/batch', body: unknown) {
  const response = await fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) console.error('Newsletter email failed', response.status, await response.text())
  return response.ok
}

const toResend = (email: Email) => ({ from: FROM(), to: [email.to], subject: email.subject, html: email.html, text: email.text, headers: email.headers })

export type SubscribeResult = 'confirm-sent' | 'already' | 'recently-sent' | 'busy' | 'unavailable'

// Sign-up: saves the address and emails a confirmation link. Throttled per address and overall,
// so the form can't be used to flood someone's inbox.
export async function subscribe(rawEmail: string): Promise<SubscribeResult> {
  if (!canEmail()) return 'unavailable'
  const email = normaliseEmail(rawEmail)
  const sql = db()
  const [existing] = await sql<{ confirmed: boolean; unsubscribed: boolean; recent: boolean }[]>`
    select confirmed_at is not null as confirmed, unsubscribed_at is not null as unsubscribed,
      coalesce(confirmation_sent_at > now() - make_interval(mins => ${CONFIRM_THROTTLE_MINUTES}), false) as recent
    from subscribers where email = ${email}`
  if (existing?.confirmed && !existing.unsubscribed) return 'already'
  if (existing?.recent) return 'recently-sent'
  const [{ count }] = await sql<{ count: number }[]>`
    select count(*)::int as count from subscribers where confirmation_sent_at > now() - interval '1 hour'`
  if (count >= CONFIRMATIONS_PER_HOUR) return 'busy'

  const [row] = await sql<{ token: string }[]>`
    insert into subscribers (email, token, confirmation_sent_at) values (${email}, ${randomBytes(24).toString('base64url')}, now())
    on conflict (email) do update set
      confirmation_sent_at = now(),
      -- Coming back after unsubscribing means confirming again
      confirmed_at = case when subscribers.unsubscribed_at is not null then null else subscribers.confirmed_at end,
      unsubscribed_at = null
    returning token`
  const content: EmailContent = {
    label: 'Confirm your subscription',
    title: 'One click to start the TNN briefing',
    intro: 'Please confirm that you want the TNN email briefing: the stories shaping Zimbabwe and Africa, once a week.',
    sections: [
      {
        heading: 'Didn’t sign up?',
        text: 'If you didn’t ask for this, ignore this email and you won’t hear from us again.',
      },
    ],
    action: { label: 'Confirm my subscription', href: `/newsletter/confirm?token=${row.token}` },
  }
  const { html, text } = renderEmail(content, { audience: 'public', unsubscribeUrl: unsubscribeUrl(row.token), reason: 'You’re receiving this because this address was entered on the TNN newsletter page.' })
  const sent = await resend('/emails', toResend({ to: email, subject: 'Confirm your TNN briefing subscription', html, text }))
  if (!sent) {
    // Nothing went out, so don't hold the reader to the 10-minute wait before trying again
    await sql`update subscribers set confirmation_sent_at = null where email = ${email}`
    return 'unavailable'
  }
  return 'confirm-sent'
}

const TOKEN = /^[A-Za-z0-9_-]{32}$/

export async function subscriberForToken(token: string) {
  if (!TOKEN.test(token)) return null
  const [row] = await db()<{ email: string; confirmed: boolean; unsubscribed: boolean }[]>`
    select email, confirmed_at is not null as confirmed, unsubscribed_at is not null as unsubscribed
    from subscribers where token = ${token}`
  return row ?? null
}

export async function confirmSubscription(token: string) {
  if (!TOKEN.test(token)) return false
  const rows = await db()`
    update subscribers set confirmed_at = coalesce(confirmed_at, now())
    where token = ${token} and unsubscribed_at is null returning id`
  return rows.length > 0
}

export async function unsubscribe(token: string) {
  if (!TOKEN.test(token)) return false
  const rows = await db()`update subscribers set unsubscribed_at = coalesce(unsubscribed_at, now()) where token = ${token} returning id`
  return rows.length > 0
}

export async function subscriberCounts() {
  const [row] = await db()<{ confirmed: number; pending: number; unsubscribed: number; lastSent: Date | null }[]>`
    select
      count(*) filter (where confirmed_at is not null and unsubscribed_at is null)::int as confirmed,
      count(*) filter (where confirmed_at is null and unsubscribed_at is null)::int as pending,
      count(*) filter (where unsubscribed_at is not null)::int as unsubscribed,
      (select max(sent_at) from newsletter_sends) as "lastSent"
    from subscribers`
  return row
}

// ISO week key, e.g. "week-2026-W48", so each week's briefing is sent once
function weekKey(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `week-${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function harareParts(now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Harare', weekday: 'short', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  )
  return { weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday), hour: Number(parts.hour) }
}

// The briefing itself: the week's stories and new episodes
export async function briefingContent(now = new Date()): Promise<{ content: EmailContent; stories: number } | null> {
  const since = new Date(now.getTime() - NEWSLETTER.days * 86_400_000).toISOString()
  const [stories, episodes] = await Promise.all([
    getStoriesWith('archived != true && dateTime(publishedAt) >= dateTime($since)', { since }, NEWSLETTER.maxStories),
    getLatestEpisodes(3),
  ])
  if (stories.length === 0) return null
  const newEpisodes = episodes.filter((e) => e.publishedAt >= since)
  return {
    stories: stories.length,
    content: {
      label: `TNN briefing · ${formatDate(now.toISOString())}`,
      title: 'This week from The Narrative Network',
      intro: 'The stories shaping Zimbabwe and Africa this week.',
      preheader: stories.slice(0, 3).map((s) => s.title).join(' · '),
      sections: [
        {
          heading: 'This week’s stories',
          rows: stories.map((s) => ({ title: s.title, href: storyUrl(s.slug), meta: [s.categoryLabel, formatDate(s.publishedAt)].filter(Boolean).join(' · ') })),
        },
        ...(newEpisodes.length
          ? [{ heading: 'Watch TNN', rows: newEpisodes.map((e) => ({ title: e.title, href: episodeUrl(e), meta: e.programme.title })) }]
          : []),
      ],
      action: { label: 'Read the latest on TNN', href: '/latest' },
    },
  }
}

// Run hourly; sends on Friday from 07:00 Harare time, once per week, to confirmed subscribers
export async function sendWeeklyBriefing(now = new Date()) {
  if (!newsletterEnabled()) return { sent: 0, skipped: 'NEWSLETTER_ENABLED is not "true"' }
  const { weekday, hour } = harareParts(now)
  if (weekday !== NEWSLETTER.weekday || hour < NEWSLETTER.hour) return { sent: 0, skipped: 'not the send time' }
  const sql = db()
  const key = weekKey(now)
  const [claimed] = await sql`insert into newsletter_sends (key) values (${key}) on conflict do nothing returning key`
  if (!claimed) return { sent: 0, skipped: 'already sent this week' }

  const briefing = await briefingContent(now)
  const subscribers = await sql<{ email: string; token: string }[]>`
    select email, token from subscribers where confirmed_at is not null and unsubscribed_at is null order by created_at`
  if (!briefing || subscribers.length === 0) {
    await sql`update newsletter_sends set recipients = 0, stories = ${briefing?.stories ?? 0} where key = ${key}`
    return { sent: 0, skipped: briefing ? 'no subscribers' : 'no stories this week' }
  }

  let sent = 0
  for (let i = 0; i < subscribers.length; i += 100) {
    const batch = subscribers.slice(i, i + 100).map((s) => {
      const { html, text } = renderEmail(briefing.content, { audience: 'public', unsubscribeUrl: unsubscribeUrl(s.token), reason: REASON })
      return toResend({
        to: s.email,
        subject: 'This week from The Narrative Network',
        html,
        text,
        headers: { 'List-Unsubscribe': `<${oneClickUrl(s.token)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      })
    })
    if (await resend('/emails/batch', batch)) sent += batch.length
  }
  if (sent === 0) {
    // Nothing went out: let the next hourly run try again
    await sql`delete from newsletter_sends where key = ${key}`
    return { sent: 0, skipped: 'sending failed; will retry next hour' }
  }
  await sql`update newsletter_sends set recipients = ${sent}, stories = ${briefing.stories} where key = ${key}`
  return { sent }
}
