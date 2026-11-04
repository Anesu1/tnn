import 'server-only'

import { after } from 'next/server'

import { addDays, formatDay, harareHour, label, REPORT_KINDS, SCHEDULE, todayISO, type Role } from './config'
import { db } from './db'
import { decisions, dueReports, listItems, type DueReport } from './data'
import { renderEmail, type EmailContent } from './email'

// Emails are only sent once DESK_REMINDERS_ENABLED is "true", so nothing goes out while the
// Desk is being reviewed. In-app reminders and alerts always show.
export function emailEnabled() {
  return process.env.DESK_REMINDERS_ENABLED === 'true' && !!process.env.RESEND_API_KEY && !!process.env.DESK_EMAIL_FROM
}

async function emailsFor(role?: Role) {
  const sql = db()
  const rows = await sql<{ email: string }[]>`
    select email from users where not disabled ${role ? sql`and role = ${role}` : sql``}`
  return rows.map((row) => row.email)
}

async function sendEmail(to: string[], subject: string, content: EmailContent) {
  if (!emailEnabled() || to.length === 0) return false
  const { html, text } = renderEmail(content)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.DESK_EMAIL_FROM, to, subject: `TNN Desk: ${subject}`, html, text }),
  })
  if (!response.ok) console.error('Desk email failed', response.status, await response.text())
  return response.ok
}

// Sends a message once per key (reminders run every hour)
async function once(key: string, send: () => Promise<boolean>) {
  const [claimed] = await db()`insert into reminders_sent (key) values (${key}) on conflict do nothing returning key`
  if (!claimed) return false
  const sent = await send()
  if (!sent) await db()`delete from reminders_sent where key = ${key}`
  return sent
}

// ----- The emails -----

export function reportEmail(report: DueReport): { subject: string; content: EmailContent } {
  const name = REPORT_KINDS[report.kind]
  const [dueDay, dueTime] = report.dueAt.split('T')
  return report.overdue
    ? {
        subject: `${name} is overdue`,
        content: {
          label: 'Report overdue',
          title: `The ${name} is overdue`,
          intro: `It was due ${formatDay(dueDay)} at ${dueTime}. The CEO can see it hasn’t been submitted.`,
          action: { label: `Submit the ${name}`, href: report.href },
        },
      }
    : {
        subject: `${name} due at ${dueTime}`,
        content: {
          label: 'Reminder',
          title: `${name} due today at ${dueTime}`,
          intro: 'Most of it is filled in from the tracker and the website already. It takes a few minutes.',
          action: { label: `Start the ${name}`, href: report.href },
        },
      }
}

export async function digestEmail(now = new Date()): Promise<EmailContent> {
  const today = todayISO(now)
  const items = await listItems({}, {})
  const overdue = items.filter((i) => i.overdue)
  const blocked = items.filter((i) => i.blocked && i.status !== 'published' && i.status !== 'dropped')
  const dueSoon = items.filter((i) => i.deadline && i.deadline >= today && i.deadline <= addDays(today, 1) && !['published', 'dropped'].includes(i.status))
  const open = await decisions('open')
  const reports = (await dueReports(now)).filter((r) => r.overdue)
  const itemHref = (id: string) => `/desk/tracker/${id}`
  const attention = overdue.length + blocked.length + open.length + reports.length
  return {
    label: `Morning summary · ${formatDay(today)}`,
    title: attention ? `${attention} ${attention === 1 ? 'thing needs' : 'things need'} attention today` : 'Nothing blocked or overdue today',
    preheader: `${overdue.length} overdue, ${blocked.length} blocked, ${open.length} decisions waiting, ${dueSoon.length} due soon`,
    sections: [
      { heading: 'Decisions waiting for the CEO', rows: open.slice(0, 10).map((d) => ({ title: d.question, href: '/desk/decisions', meta: [d.raised_by_name, d.due && `needed by ${formatDay(d.due)}`].filter(Boolean).join(' · ') })), empty: 'None waiting.' },
      { heading: 'Blocked', rows: blocked.slice(0, 10).map((i) => ({ title: i.title, href: itemHref(i.id), flag: 'Blocked', meta: i.blocker ?? undefined })), empty: 'Nothing blocked.' },
      { heading: 'Overdue', rows: overdue.filter((i) => !i.blocked).slice(0, 10).map((i) => ({ title: i.title, href: itemHref(i.id), flag: 'Overdue', meta: `Due ${formatDay(i.deadline!)}${i.owner ? ` · ${i.owner}` : ''}` })), empty: 'Nothing overdue.' },
      { heading: 'Due today or tomorrow', rows: dueSoon.slice(0, 10).map((i) => ({ title: i.title, href: itemHref(i.id), meta: `Due ${formatDay(i.deadline!)}${i.owner ? ` · ${i.owner}` : ''}` })), empty: 'No deadlines today or tomorrow.' },
      ...(reports.length ? [{ heading: 'Reports not yet submitted', rows: reports.map((r) => ({ title: label(REPORT_KINDS, r.kind), href: r.href, flag: 'Overdue', meta: `Due ${formatDay(r.dueAt.slice(0, 10))}` })) }] : []),
    ],
    action: { label: 'Open the dashboard', href: '/desk' },
  }
}

// Immediate alerts to the CEO: an item is blocked, a decision is needed, targets are proposed.
// Sent after the response, so it never runs inside a save and never slows the editor down.
export function alertCeo(subject: string, content: EmailContent) {
  if (!emailEnabled()) return
  after(async () => {
    try {
      await sendEmail(await emailsFor('ceo'), subject, content)
    } catch (err) {
      console.error('Desk alert failed', err)
    }
  })
}

// Run every hour by netlify/functions/desk-reminders.mts
export async function runReminders(now = new Date()) {
  if (!emailEnabled()) return { sent: 0, skipped: 'email not enabled' }
  const today = todayISO(now)
  const hour = harareHour(now)
  let sent = 0

  // Report reminders to the editor a couple of hours before each is due, and once when overdue
  const editors = await emailsFor('editor')
  for (const report of await dueReports(now)) {
    const [dueDay, dueTime] = report.dueAt.split('T')
    const dueSoon = dueDay === today && hour >= Number(dueTime.slice(0, 2)) - SCHEDULE.reminderLeadHours
    if (!report.overdue && !dueSoon) continue
    const { subject, content } = reportEmail(report)
    const key = `${report.overdue ? 'overdue' : 'remind'}:${report.kind}:${report.period}`
    if (await once(key, () => sendEmail(editors, subject, content))) sent++
  }

  // Morning summary for both accounts
  if (hour >= SCHEDULE.ceoDigestHour) {
    const content = await digestEmail(now)
    const everyone = [...(await emailsFor('ceo')), ...editors]
    if (await once(`digest:${today}`, () => sendEmail(everyone, 'Morning summary', content))) sent++
  }
  return { sent }
}
