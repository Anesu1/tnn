import 'server-only'

import { createHash } from 'node:crypto'

import { db } from '@/lib/desk/db'
import { renderEmail, type EmailAudience, type EmailContent } from '@/lib/desk/email'
import { storyUrl } from '@/lib/site/news'
import { getWriteClient } from '@/sanity/lib/writeClient'

// Emails about stories going between reporters and the editor:
// - a reporter submits or resubmits a story → the reviewer (REVIEW_EMAIL, the Managing Editor)
// - the editor sends a story back with a note → the reporter
// - the editor publishes a reporter's story → the reporter
// The first is sent straight from the writer portal. The other two happen in the Studio, so a job
// every five minutes looks for them (runStoryNotifications). Each email goes once: its key is
// stored in desk.reminders_sent. Set STORY_EMAILS=off to stop them all.

const enabled = () => !!process.env.RESEND_API_KEY && process.env.STORY_EMAILS !== 'off'
const FROM = () => process.env.DESK_EMAIL_FROM || 'The Narrative Network <desk@thenarrativenetwork.org>'

// Wait this long after the editor's last edit before emailing a send-back, so a note that is
// still being typed isn't sent half-written
const SETTLE_MINUTES = 3
// Published stories are announced to their reporter if they went live within this window
const PUBLISHED_WINDOW_HOURS = 6

async function send(to: string[], subject: string, content: EmailContent, audience: EmailAudience) {
  if (!enabled() || to.length === 0) return false
  const { html, text } = renderEmail(content, audience)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM(), to, subject, html, text }),
  })
  if (!response.ok) console.error('Story email failed', response.status, await response.text())
  return response.ok
}

// Claim a key first, so two runs can't both send; give it back if sending failed
async function once(key: string, sendIt: () => Promise<boolean>) {
  const sql = db()
  const [claimed] = await sql`insert into reminders_sent (key) values (${key}) on conflict do nothing returning key`
  if (!claimed) return false
  const ok = await sendIt().catch((error) => {
    console.error('Story email failed', error)
    return false
  })
  if (!ok) await sql`delete from reminders_sent where key = ${key}`
  return ok
}

// Who reviews submissions: REVIEW_EMAIL (comma-separated), otherwise the Desk's CEO and Managing Editor
async function reviewers() {
  const configured = (process.env.REVIEW_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
  if (configured.length) return configured
  const rows = await db()<{ email: string }[]>`select email from users where not disabled and role in ('ceo', 'editor')`
  return rows.map((r) => r.email)
}

const studioLink = (baseId: string) => `/studio/intent/edit/id=${baseId};type=newsItem`
const hash = (text: string) => createHash('sha256').update(text).digest('hex').slice(0, 16)

// The three emails (also shown on the Desk's Emails page)
export function submittedEmail(story: { baseId: string; title: string; writerName: string; resubmitted: boolean }): { subject: string; content: EmailContent } {
  return {
    subject: story.resubmitted ? `Updated story to review: ${story.title}` : `New story to review: ${story.title}`,
    content: {
      label: story.resubmitted ? 'Story updated' : 'New story',
      title: story.title,
      intro: story.resubmitted
        ? `${story.writerName} has made changes and sent the story back for review.`
        : `${story.writerName} has sent a story for review.`,
      preheader: `${story.writerName}: ${story.title}`,
      sections: [
        {
          heading: 'What to do',
          text: 'Open it in the Studio. To publish it, click Publish. To ask for changes, open the Review tab, choose “Changes requested”, write what to change, and leave it unpublished. The reporter gets an email with your note.',
        },
      ],
      action: { label: 'Open in the Studio', href: studioLink(story.baseId) },
    },
  }
}

export function sentBackEmail(d: { baseId: string; title?: string; writerName?: string; note: string }): { subject: string; content: EmailContent } {
  return {
    subject: `Changes requested: ${d.title ?? 'your story'}`,
    content: {
      label: 'Changes requested',
      title: d.title ?? 'Your story',
      intro: `Hi ${d.writerName?.split(' ')[0] ?? 'there'}, the editor has looked at your story and asked for some changes before it can be published.`,
      preheader: d.note.slice(0, 120),
      sections: [{ heading: 'Note from the editor', text: d.note }],
      action: { label: 'Make the changes', href: `/write/${d.baseId}` },
    },
  }
}

export function publishedEmail(p: { title?: string; slug: string; writerName?: string }): { subject: string; content: EmailContent } {
  return {
    subject: `Published: ${p.title ?? 'your story'}`,
    content: {
      label: 'Published',
      title: p.title ?? 'Your story',
      intro: `Hi ${p.writerName?.split(' ')[0] ?? 'there'}, your story is now live on The Narrative Network. Thank you.`,
      action: { label: 'Read it on the website', href: storyUrl(p.slug) },
    },
  }
}

// Called by the writer portal after a story is saved
export async function notifySubmitted(story: { baseId: string; title: string; writerName: string; resubmitted: boolean; key: string }) {
  if (!enabled()) return
  const to = await reviewers()
  const { subject, content } = submittedEmail(story)
  await once(`story-submitted:${story.baseId}:${story.key}`, () => send(to, subject, content, { audience: 'desk' }))
}

type Draft = { _id: string; title?: string; editorNote?: string; writerName?: string; email?: string }
type Published = { _id: string; title?: string; slug?: string; writerName?: string; email?: string }

// Every five minutes: send-backs and newly published stories → the reporter
export async function runStoryNotifications(now = new Date()) {
  if (!enabled()) return { sentBack: 0, published: 0, skipped: 'emails are off' }
  const client = getWriteClient()
  const settled = new Date(now.getTime() - SETTLE_MINUTES * 60_000).toISOString()
  const since = new Date(now.getTime() - PUBLISHED_WINDOW_HOURS * 3_600_000).toISOString()
  const account = `"writerName": submittedBy->name, "email": *[_id == "writerAccount." + ^.submittedBy._ref][0].email`
  const { drafts, published } = await client.fetch<{ drafts: Draft[]; published: Published[] }>(
    `{
      "drafts": *[_type == "newsItem" && _id in path("drafts.**") && reviewStatus == "changesRequested"
        && defined(editorNote) && editorNote != "" && defined(submittedBy) && _updatedAt < $settled]{_id, title, editorNote, ${account}},
      "published": *[_type == "newsItem" && !(_id in path("drafts.**")) && defined(submittedBy)
        && dateTime(publishedAt) <= dateTime($now) && dateTime(publishedAt) > dateTime($since)]{_id, title, "slug": slug.current, ${account}}
    }`,
    { settled, since, now: now.toISOString() },
  )

  let sentBack = 0
  for (const d of drafts) {
    if (!d.email) continue
    const baseId = d._id.replace(/^drafts\./, '')
    const { subject, content } = sentBackEmail({ baseId, title: d.title, writerName: d.writerName, note: d.editorNote! })
    const ok = await once(`story-sentback:${baseId}:${hash(d.editorNote!)}`, () => send([d.email!], subject, content, { audience: 'writer' }))
    if (ok) sentBack++
  }

  let live = 0
  for (const p of published) {
    if (!p.email || !p.slug) continue
    const { subject, content } = publishedEmail({ title: p.title, slug: p.slug, writerName: p.writerName })
    const ok = await once(`story-published:${p._id}`, () => send([p.email!], subject, content, { audience: 'writer' }))
    if (ok) live++
  }
  return { sentBack, published: live }
}
