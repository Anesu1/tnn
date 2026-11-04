'use server'

import { revalidatePath } from 'next/cache'
import { redirect, unstable_rethrow } from 'next/navigation'

import {
  acceptInvite,
  audit,
  codeStep,
  getDeskUser,
  hashPassword,
  MIN_PASSWORD_LENGTH,
  passwordStep,
  resetAccount,
  setupStep,
  signOutDesk,
  type DeskUser,
} from '@/lib/desk/auth'
import {
  addMonths,
  formatDay,
  formatMonth,
  isISODate,
  KINDS,
  METRICS,
  monthEnd,
  monthStart,
  PIPELINE_KINDS,
  PLATFORMS,
  PRIORITIES,
  REPORT_KINDS,
  ROLE_LABELS,
  STAGES,
  STATUSES,
  todayISO,
  weekStart,
  type ReportKind,
  type Role,
} from '@/lib/desk/config'
import { actualFor, isUuid, monthActuals, openItems, targetSet, upcomingMilestones, weekSummary, type Item } from '@/lib/desk/data'
import { db, DeskSetupError, type Sql } from '@/lib/desk/db'
import { alertCeo, sendInvitation } from '@/lib/desk/notify'
import { recentWebStories, webStories } from '@/lib/desk/sanity'

export type FormState = { error?: string; message?: string; secret?: string }

class UserError extends Error {}

// Turns problems into a message on the form instead of a crashed page
function failure(err: unknown): FormState {
  // redirect() works by throwing; let Next handle it
  unstable_rethrow(err)
  if (err instanceof UserError) return { error: err.message }
  console.error('Editorial Desk error', err)
  if (err instanceof DeskSetupError) return { error: `The Desk isn’t set up on the server yet (${err.message}). Please tell the site admin.` }
  return { error: 'Something went wrong on our side and nothing was saved. Please try again.' }
}

async function actor(role?: Role): Promise<DeskUser> {
  const user = await getDeskUser()
  if (!user) redirect('/desk/login')
  if (role && user.role !== role) throw new UserError(`Only the ${ROLE_LABELS[role]} can do this.`)
  return user
}

// ----- Reading form fields -----

const text = (fd: FormData, key: string, max = 4000) => String(fd.get(key) ?? '').trim().slice(0, max)
const optional = (fd: FormData, key: string, max = 4000) => text(fd, key, max) || null

function dateField(fd: FormData, key: string, name: string) {
  const value = text(fd, key, 10)
  if (!value) return null
  if (!isISODate(value)) throw new UserError(`${name} isn’t a valid date.`)
  return value
}

function choice<T extends Record<string, string>>(list: T, value: string, name: string): keyof T & string {
  if (!(value in list)) throw new UserError(`Choose a ${name}.`)
  return value
}

function linkField(value: string | null, name = 'The link') {
  if (!value) return null
  if (value.startsWith('/')) return value
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString()
  } catch {}
  throw new UserError(`${name} must be a full web address starting with https://`)
}

const lines = (value: string) =>
  value.split('\n').map((line) => line.trim()).filter(Boolean)

const platformsFrom = (fd: FormData, key: string) =>
  fd.getAll(key).map(String).filter((p) => p in PLATFORMS)

function numberField(value: string, name: string) {
  if (value === '') return null
  const number = Number(value.replace(/,/g, ''))
  if (!Number.isFinite(number) || number < 0) throw new UserError(`${name} must be a number.`)
  return number
}

// ----- Sign-in -----

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, 'email', 200)
  const password = String(fd.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.' }
  let next: string
  try {
    const result = await passwordStep(email, password)
    if (!result.ok) return { error: result.error }
    next = result.next === 'code' ? '/desk/login?step=code' : '/desk/login/setup'
  } catch (err) {
    return failure(err)
  }
  redirect(next)
}

export async function codeAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const code = text(fd, 'code', 10)
  if (!/^\d{6}$/.test(code.replace(/\s/g, ''))) return { error: 'Enter the 6-digit code from your authenticator app.' }
  try {
    const result = await codeStep(code)
    if (!result.ok) return { error: result.error }
  } catch (err) {
    return failure(err)
  }
  redirect('/desk')
}

export async function setupAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const password = String(fd.get('password') ?? '')
  if (password.length < MIN_PASSWORD_LENGTH) return { error: `Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.` }
  if (password !== String(fd.get('confirm') ?? '')) return { error: 'The two passwords don’t match.' }
  try {
    const result = await setupStep(text(fd, 'secret', 64), text(fd, 'code', 10), password)
    if (!result.ok) return { error: result.error }
  } catch (err) {
    return failure(err)
  }
  redirect('/desk?welcome=1')
}

export async function signOutAction() {
  await signOutDesk()
  redirect('/desk/login')
}

// ----- Tracker items -----

const TRACKED_FIELDS = [
  'title', 'kind', 'format', 'platforms', 'priority', 'lead', 'contributors', 'owner', 'deadline', 'status',
  'next_action', 'blocked', 'blocker', 'risk', 'evidence_url', 'sanity_id', 'success_measure', 'stage',
  'planned_week', 'planned_month', 'archived',
] as const

type ItemValues = Partial<Record<(typeof TRACKED_FIELDS)[number], unknown>>

function diff(before: Record<string, unknown> | null, after: ItemValues) {
  const changes: Record<string, { from: unknown; to: unknown }> = {}
  for (const field of TRACKED_FIELDS) {
    if (!(field in after)) continue
    const from = before?.[field] ?? null
    const to = after[field] ?? null
    if (JSON.stringify(from) !== JSON.stringify(to)) changes[field] = { from, to }
  }
  return changes
}

function describeChanges(changes: Record<string, { from: unknown; to: unknown }>) {
  if (changes.status) return `Status: ${STATUSES[changes.status.from as keyof typeof STATUSES] ?? '—'} → ${STATUSES[changes.status.to as keyof typeof STATUSES] ?? '—'}`
  if (changes.blocked) return changes.blocked.to ? 'Marked blocked' : 'No longer blocked'
  return `Changed ${Object.keys(changes).join(', ').replace(/_/g, ' ')}`
}

// Applies changes to one item: sets the delivery time when it becomes published, records the
// change in the history and alerts the CEO when it becomes blocked
async function writeItem(sql: Sql, user: DeskUser, id: string | null, values: ItemValues) {
  const before = id ? (await sql<Item[]>`select * from items where id = ${id} for update`)[0] : null
  if (id && !before) throw new UserError('That item no longer exists.')
  const changes = diff(before as unknown as Record<string, unknown>, values)
  if (id && Object.keys(changes).length === 0) return { id, changes }

  const row: Record<string, unknown> = { ...values, updated_at: new Date() }
  const status = (values.status ?? before?.status) as string
  if (status === 'published' && !before?.completed_at) row.completed_at = new Date()
  if (status !== 'published' && before?.completed_at) row.completed_at = null

  let savedId = id
  if (id) {
    await sql`update items set ${sql(row as never, Object.keys(row))} where id = ${id}`
  } else {
    row.created_by = user.id
    const [created] = await sql<{ id: string }[]>`insert into items ${sql(row as never, Object.keys(row))} returning id`
    savedId = created.id
  }
  await audit(sql, user.id, id ? 'item_updated' : 'item_created', {
    entity: 'item',
    entityId: savedId!,
    summary: id ? `${String(values.title ?? before!.title)}: ${describeChanges(changes)}` : `Added “${String(values.title)}”`,
    changes,
  })
  if (changes.blocked?.to === true) {
    const title = String(values.title ?? before?.title)
    alertCeo(`Blocked: ${title}`, {
      label: 'Alert · work blocked',
      title,
      intro: 'The Managing Editor has marked this item blocked. Work can’t move until it is resolved.',
      sections: [{ heading: 'What is blocking it', text: String(values.blocker ?? before?.blocker ?? 'Not given') }],
      action: { label: 'Open the item', href: `/desk/tracker/${savedId}` },
    })
  }
  return { id: savedId!, changes }
}

function itemValuesFrom(fd: FormData, prefix = ''): ItemValues {
  const field = (key: string) => `${prefix}${key}`
  const title = text(fd, field('title'), 200)
  if (!title) throw new UserError('Give the item a title.')
  const kind = choice(KINDS, text(fd, field('kind')), 'content type')
  const blocked = fd.get(field('blocked')) === 'on'
  const blocker = optional(fd, field('blocker'), 1000)
  if (blocked && !blocker) throw new UserError('Say what is blocking the item, so the CEO knows how to help.')
  return {
    title,
    kind,
    format: optional(fd, field('format'), 120),
    platforms: platformsFrom(fd, field('platforms')),
    priority: choice(PRIORITIES, text(fd, field('priority')) || 'normal', 'priority'),
    lead: optional(fd, field('lead'), 120),
    contributors: optional(fd, field('contributors'), 400),
    owner: optional(fd, field('owner'), 120),
    deadline: dateField(fd, field('deadline'), 'The deadline'),
    status: choice(STATUSES, text(fd, field('status')) || 'planned', 'status'),
    next_action: optional(fd, field('next_action'), 500),
    blocked,
    blocker: blocked ? blocker : null,
    risk: optional(fd, field('risk'), 1000),
    evidence_url: linkField(optional(fd, field('evidence_url'), 500), 'The evidence link'),
    success_measure: optional(fd, field('success_measure'), 300),
    stage: PIPELINE_KINDS.includes(kind as never) ? (text(fd, field('stage')) in STAGES ? text(fd, field('stage')) : 'idea') : null,
  }
}

export async function saveItemAction(_prev: FormState, fd: FormData): Promise<FormState> {
  let id: string
  try {
    const user = await actor('editor')
    const existingId = text(fd, 'id', 40) || null
    if (existingId && !isUuid(existingId)) throw new UserError('That item no longer exists.')
    const values = itemValuesFrom(fd)
    // Linking a live website story fills in the evidence and marks the item published
    const storyId = text(fd, 'story', 120)
    const linkedBefore = text(fd, 'linked_story', 120)
    if (storyId && storyId !== linkedBefore) {
      const story = (await recentWebStories(120)).find((s) => s.id === storyId)
      if (story) {
        values.sanity_id = story.id
        values.evidence_url = story.url
        if (values.status !== 'dropped') values.status = 'published'
      }
    } else if (!storyId && linkedBefore) {
      values.sanity_id = null
    }
    if (!existingId) {
      values.planned_week = dateField(fd, 'planned_week', 'The week')
    }
    const saved = await db().begin((sql) => writeItem(sql, user, existingId, values))
    id = saved.id
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  redirect(`/desk/tracker/${id}?saved=1`)
}

// One-tap updates from the tracker and dashboard lists
export async function quickUpdateAction(fd: FormData) {
  const user = await actor('editor')
  const id = text(fd, 'id', 40)
  if (!isUuid(id)) return
  const values: ItemValues = {}
  const status = text(fd, 'status')
  if (status) values.status = choice(STATUSES, status, 'status')
  if (fd.has('unblock')) Object.assign(values, { blocked: false, blocker: null })
  await db().begin((sql) => writeItem(sql, user, id, values))
  revalidatePath('/desk', 'layout')
}

export async function archiveItemAction(fd: FormData) {
  const user = await actor('editor')
  const id = text(fd, 'id', 40)
  if (!isUuid(id)) return
  await db().begin((sql) => writeItem(sql, user, id, { archived: true }))
  revalidatePath('/desk', 'layout')
  redirect('/desk/tracker?archived=1')
}

// ----- Milestones -----

export async function addMilestoneAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await actor('editor')
    const itemId = text(fd, 'item_id', 40)
    const name = text(fd, 'name', 200)
    if (!isUuid(itemId)) throw new UserError('That item no longer exists.')
    if (!name) throw new UserError('Name the milestone, for example “Rough cut ready”.')
    const due = dateField(fd, 'due', 'The due date')
    await db().begin(async (sql) => {
      const [m] = await sql<{ id: string }[]>`
        insert into milestones (item_id, name, due, owner, risk)
        values (${itemId}, ${name}, ${due}, ${optional(fd, 'owner', 120)}, ${optional(fd, 'risk', 500)}) returning id`
      await audit(sql, user.id, 'milestone_added', { entity: 'item', entityId: itemId, summary: `Milestone added: ${name}${due ? ` (due ${formatDay(due)})` : ''}`, changes: { milestone: m.id } })
    })
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  return { message: 'Milestone added.' }
}

export async function toggleMilestoneAction(fd: FormData) {
  const user = await actor('editor')
  const id = text(fd, 'id', 40)
  if (!isUuid(id)) return
  await db().begin(async (sql) => {
    const [m] = await sql<{ item_id: string; name: string; done: boolean }[]>`
      update milestones set done_at = case when done_at is null then now() else null end
      where id = ${id} returning item_id, name, done_at is not null as done`
    if (m) await audit(sql, user.id, m.done ? 'milestone_done' : 'milestone_reopened', { entity: 'item', entityId: m.item_id, summary: `${m.done ? 'Milestone met' : 'Milestone reopened'}: ${m.name}` })
  })
  revalidatePath('/desk', 'layout')
}

export async function deleteMilestoneAction(fd: FormData) {
  const user = await actor('editor')
  const id = text(fd, 'id', 40)
  if (!isUuid(id)) return
  await db().begin(async (sql) => {
    const [m] = await sql<{ item_id: string; name: string }[]>`delete from milestones where id = ${id} returning item_id, name`
    if (m) await audit(sql, user.id, 'milestone_removed', { entity: 'item', entityId: m.item_id, summary: `Milestone removed: ${m.name}` })
  })
  revalidatePath('/desk', 'layout')
}

// ----- Comments (both roles) -----

export async function commentAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await actor()
    const entity = text(fd, 'entity', 20)
    const entityId = text(fd, 'entity_id', 40)
    const body = text(fd, 'body', 3000)
    if (!['item', 'report', 'targets'].includes(entity) || !entityId) throw new UserError('Something is missing. Reload the page.')
    if (!body) throw new UserError('Write a comment first.')
    await db().begin(async (sql) => {
      await sql`insert into comments (entity, entity_id, user_id, body) values (${entity}, ${entityId}, ${user.id}, ${body})`
      await audit(sql, user.id, 'commented', { entity, entityId, summary: body.slice(0, 160) })
    })
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  return { message: 'Comment added.' }
}

// ----- Decisions -----

async function createDecision(sql: Sql, user: DeskUser, question: string, extra: { context?: string | null; itemId?: string | null; reportId?: string | null; due?: string | null } = {}) {
  const [d] = await sql<{ id: string }[]>`
    insert into decisions (question, context, item_id, report_id, due, raised_by)
    values (${question}, ${extra.context ?? null}, ${extra.itemId ?? null}, ${extra.reportId ?? null}, ${extra.due ?? null}, ${user.id})
    returning id`
  await audit(sql, user.id, 'decision_raised', { entity: 'decision', entityId: d.id, summary: question.slice(0, 200) })
  return d.id
}

export async function raiseDecisionAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await actor('editor')
    const question = text(fd, 'question', 1000)
    if (!question) throw new UserError('Write the decision or support you need.')
    const itemId = text(fd, 'item_id', 40)
    const due = dateField(fd, 'due', 'The date')
    await db().begin((sql) =>
      createDecision(sql, user, question, { context: optional(fd, 'context', 2000), itemId: isUuid(itemId) ? itemId : null, due }),
    )
    alertCeo('Decision needed', {
      label: 'Decision needed',
      title: question,
      intro: due ? `Needed by ${formatDay(due)}.` : 'Raised by the Managing Editor.',
      action: { label: 'Answer it on the Desk', href: '/desk/decisions' },
    })
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  return { message: 'Sent to the CEO.' }
}

export async function decideAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await actor('ceo')
    const id = text(fd, 'id', 40)
    const answer = text(fd, 'answer', 2000)
    if (!isUuid(id)) throw new UserError('That decision no longer exists.')
    if (!answer) throw new UserError('Write your decision or reply.')
    await db().begin(async (sql) => {
      const [d] = await sql<{ question: string }[]>`
        update decisions set status = 'decided', answer = ${answer}, decided_by = ${user.id}, decided_at = now()
        where id = ${id} and status = 'open' returning question`
      if (!d) throw new UserError('This decision was already answered.')
      await audit(sql, user.id, 'decision_made', { entity: 'decision', entityId: id, summary: `${d.question.slice(0, 120)} → ${answer.slice(0, 120)}` })
    })
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  return { message: 'Decision recorded.' }
}

// ----- Reports -----

async function saveReport(sql: Sql, user: DeskUser, kind: ReportKind, period: string, data: Record<string, unknown>) {
  const [{ next }] = await sql<{ next: number }[]>`
    select coalesce(max(version), 0) + 1 as next from reports where kind = ${kind} and period_start = ${period}::date`
  const [report] = await sql<{ id: string }[]>`
    insert into reports (kind, period_start, version, data, submitted_by)
    values (${kind}, ${period}, ${next}, ${sql.json(data as never)}, ${user.id}) returning id`
  await audit(sql, user.id, 'report_submitted', {
    entity: 'report',
    entityId: report.id,
    summary: `${REPORT_KINDS[kind]} for ${kind === 'scorecard' || kind === 'next_month' ? formatMonth(period) : formatDay(period)}${next > 1 ? ` (version ${next})` : ''}`,
  })
  return report.id
}

const itemRef = (item: Pick<Item, 'id' | 'title' | 'status' | 'evidence_url' | 'owner' | 'deadline'>) => ({
  id: item.id,
  title: item.title,
  status: item.status,
  link: item.evidence_url,
  owner: item.owner,
  deadline: item.deadline,
})

export async function submitDailyAction(_prev: FormState, fd: FormData): Promise<FormState> {
  let reportId: string
  try {
    const user = await actor('editor')
    const date = dateField(fd, 'period', 'The date') ?? todayISO()
    if (date > todayISO()) throw new UserError('The daily update can’t be for a future date.')
    const priorities = [1, 2, 3]
      .map((n) => ({ itemId: text(fd, `priority_item_${n}`, 40), text: text(fd, `priority_text_${n}`, 300) }))
      .filter((p) => p.itemId || p.text)
    if (priorities.length === 0) throw new UserError('Add at least one priority for tomorrow.')
    const risks = text(fd, 'risks', 3000)
    const ceoAsk = text(fd, 'ceo_ask', 2000)
    const progressNotes = text(fd, 'progress_notes', 3000)
    const extraLinks = lines(text(fd, 'extra_links', 3000))
    extraLinks.forEach((link) => linkField(link, `“${link.slice(0, 40)}”`))

    const open = await openItems()
    const byId = new Map(open.map((i) => [i.id, i]))
    let web: Awaited<ReturnType<typeof webStories>> = []
    try {
      web = await webStories(date, date)
    } catch (err) {
      console.error('Desk: could not read website stories', err)
    }
    reportId = await db().begin(async (sql) => {
      // Status changes made in the form update the tracker, so nothing is entered twice
      const progressed: { id: string; title: string; from: string; to: string; note: string | null }[] = []
      for (const item of open) {
        const newStatus = text(fd, `status_${item.id}`)
        const ticked = fd.get(`progressed_${item.id}`) === 'on'
        if (newStatus && newStatus !== item.status) {
          await writeItem(sql, user, item.id, { status: choice(STATUSES, newStatus, 'status') })
        }
        if (ticked || (newStatus && newStatus !== item.status)) {
          progressed.push({ id: item.id, title: item.title, from: item.status, to: newStatus || item.status, note: null })
        }
      }
      // What went live that day: website stories plus tracker items delivered that day
      const delivered = await sql<Item[]>`
        select * from items where not archived and status = 'published'
          and (completed_at at time zone 'Africa/Harare')::date = ${date}::date`
      const published = [
        ...web.map((s) => ({ title: s.title, link: s.url, source: 'website' })),
        ...delivered.filter((i) => !web.some((s) => s.id === i.sanity_id)).map((i) => ({ title: i.title, link: i.evidence_url, source: 'tracker', itemId: i.id })),
      ]
      const data = {
        date,
        published,
        extraLinks,
        progressed,
        progressNotes,
        priorities: priorities.map((p) => ({ itemId: isUuid(p.itemId) ? p.itemId : null, title: byId.get(p.itemId)?.title ?? p.text, note: p.itemId ? p.text : '' })),
        risks,
        ceoAsk,
      }
      const id = await saveReport(sql, user, 'daily', date, data)
      if (ceoAsk) await createDecision(sql, user, ceoAsk, { reportId: id, context: `From the Daily Editorial Update for ${formatDay(date)}` })
      return id
    })
    if (ceoAsk) {
      alertCeo('Decision or support needed', {
        label: 'Decision needed · daily update',
        title: ceoAsk,
        intro: 'From today’s Daily Editorial Update.',
        action: { label: 'Answer it on the Desk', href: '/desk/decisions' },
      })
    }
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  redirect(`/desk/reports/${reportId}?submitted=1`)
}

// New deliverables added inside the weekly plan or next month's plan
function newRows(fd: FormData) {
  const count = Math.min(Number(text(fd, 'new_count', 3)) || 0, 30)
  const rows: ItemValues[] = []
  for (let n = 0; n < count; n++) {
    if (!text(fd, `new_${n}_title`)) continue
    rows.push(itemValuesFrom(fd, `new_${n}_`))
  }
  return rows
}

export async function submitWeeklyPlanAction(_prev: FormState, fd: FormData): Promise<FormState> {
  let reportId: string
  try {
    const user = await actor('editor')
    const monday = weekStart(dateField(fd, 'period', 'The week') ?? todayISO())
    const open = await openItems()
    const added = newRows(fd)
    reportId = await db().begin(async (sql) => {
      const deliverables: ReturnType<typeof itemRef>[] = []
      for (const item of open) {
        const included = fd.get(`include_${item.id}`) === 'on'
        if (included) {
          const values: ItemValues = {
            planned_week: monday,
            deadline: dateField(fd, `deadline_${item.id}`, `The deadline for “${item.title}”`) ?? item.deadline,
            owner: optional(fd, `owner_${item.id}`, 120) ?? item.owner,
            format: optional(fd, `format_${item.id}`, 120) ?? item.format,
            success_measure: optional(fd, `measure_${item.id}`, 300) ?? item.success_measure,
          }
          if (fd.has(`platforms_${item.id}_present`)) values.platforms = platformsFrom(fd, `platforms_${item.id}`)
          await writeItem(sql, user, item.id, values)
          deliverables.push(itemRef({ ...item, ...values } as Item))
        } else if (item.planned_week === monday) {
          await writeItem(sql, user, item.id, { planned_week: null })
        }
      }
      for (const values of added) {
        const { id } = await writeItem(sql, user, null, { ...values, planned_week: monday })
        deliverables.push(itemRef({ id, ...values } as Item))
      }
      if (deliverables.length === 0) throw new UserError('Choose or add at least one deliverable for the week.')
      const full = await sql<Item[]>`select * from items where id = any(${deliverables.map((d) => d.id)}::uuid[])`
      const data = {
        monday,
        deliverables: full.map((i) => ({ ...itemRef(i), kind: i.kind, format: i.format, platforms: i.platforms, measure: i.success_measure })),
        notes: text(fd, 'notes', 3000),
      }
      return saveReport(sql, user, 'weekly_plan', monday, data)
    })
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  redirect(`/desk/reports/${reportId}?submitted=1`)
}

export async function submitWeeklyReportAction(_prev: FormState, fd: FormData): Promise<FormState> {
  let reportId: string
  try {
    const user = await actor('editor')
    const monday = weekStart(dateField(fd, 'period', 'The week') ?? todayISO())
    const week = await weekSummary(monday)
    const decisionsNeeded = text(fd, 'decisions', 2000)
    const reasons = Object.fromEntries(
      [...week.moved, ...week.missed, ...week.dropped].map((i) => [i.id, text(fd, `reason_${i.id}`, 500)]),
    )
    const unexplained = [...week.moved, ...week.missed].filter((i) => !reasons[i.id])
    if (unexplained.length) throw new UserError(`Give a short reason for “${unexplained[0].title}” moving or being missed.`)
    reportId = await db().begin(async (sql) => {
      const summarise = (list: Item[]) => list.map((i) => ({ ...itemRef(i), reason: reasons[i.id] || null }))
      const data = {
        monday,
        planned: week.planned.length,
        delivered: summarise(week.delivered),
        unplanned: summarise(week.unplanned),
        inProgress: summarise(week.inProgress),
        moved: summarise(week.moved),
        missed: summarise(week.missed),
        dropped: summarise(week.dropped),
        signals: text(fd, 'signals', 3000),
        decisions: decisionsNeeded,
        notes: text(fd, 'notes', 3000),
      }
      const id = await saveReport(sql, user, 'weekly_report', monday, data)
      if (decisionsNeeded) await createDecision(sql, user, decisionsNeeded, { reportId: id, context: `From the Weekly Delivery Report, ${formatDay(monday)}` })
      return id
    })
    if (decisionsNeeded) {
      alertCeo('Decision needed', {
        label: 'Decision needed · weekly report',
        title: decisionsNeeded,
        intro: 'From this week’s Weekly Delivery Report.',
        action: { label: 'Answer it on the Desk', href: '/desk/decisions' },
      })
    }
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  redirect(`/desk/reports/${reportId}?submitted=1`)
}

export async function submitScorecardAction(_prev: FormState, fd: FormData): Promise<FormState> {
  let reportId: string
  try {
    const user = await actor('editor')
    const month = monthStart(dateField(fd, 'period', 'The month') ?? addMonths(todayISO(), -1))
    const { targets } = await targetSet(month)
    const evidence = lines(text(fd, 'evidence', 4000))
    evidence.forEach((link) => linkField(link, `“${link.slice(0, 40)}”`))
    // Figures that can't be counted automatically are typed in and saved on the target itself
    const fresh = targets.map((target) =>
      METRICS[target.metric]?.auto
        ? target
        : { ...target, manual_actual: numberField(text(fd, `actual_${target.id}`, 30), target.label)?.toString() ?? null },
    )
    const actuals = await monthActuals(month)
    reportId = await db().begin(async (sql) => {
      for (const target of fresh) {
        if (!METRICS[target.metric]?.auto) await sql`update targets set manual_actual = ${target.manual_actual} where id = ${target.id}`
      }
      const data = {
        month,
        rows: fresh.map((t) => ({ label: t.label, metric: t.metric, target: Number(t.target), actual: actualFor(t, actuals), unit: METRICS[t.metric]?.unit ?? '' })),
        delivered: actuals.delivered,
        webStories: actuals.web_stories,
        onTime: actuals.on_time,
        late: actuals.late.map((i) => ({ ...itemRef(i), completed: i.completed_on })),
        quality: text(fd, 'quality', 3000),
        audience: text(fd, 'audience', 3000),
        evidence,
        notes: text(fd, 'notes', 3000),
      }
      return saveReport(sql, user, 'scorecard', month, data)
    })
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  redirect(`/desk/reports/${reportId}?submitted=1`)
}

function targetRows(fd: FormData) {
  const count = Math.min(Number(text(fd, 'target_count', 3)) || 0, 40)
  const rows: { metric: string; label: string; target: number }[] = []
  for (let n = 0; n < count; n++) {
    const metric = text(fd, `target_${n}_metric`)
    const value = text(fd, `target_${n}_value`, 30)
    if (!metric && !value) continue
    if (!(metric in METRICS)) throw new UserError('Choose what each target measures.')
    const name = metric === 'custom' ? text(fd, `target_${n}_label`, 120) : METRICS[metric as keyof typeof METRICS].label
    if (!name) throw new UserError('Name each “Other” target.')
    const target = numberField(value, `The target for “${name}”`)
    if (target === null) throw new UserError(`Enter a number for “${name}”.`)
    rows.push({ metric, label: name, target })
  }
  return rows
}

async function writeTargets(sql: Sql, user: DeskUser, month: string, rows: ReturnType<typeof targetRows>, propose: boolean) {
  const [current] = await sql<{ status: string }[]>`select status from target_sets where month = ${month}::date for update`
  if (current?.status === 'agreed') throw new UserError(`The targets for ${formatMonth(month)} are agreed and locked. Ask the CEO to unlock them first.`)
  const status = propose ? 'proposed' : current?.status === 'changes_requested' ? 'changes_requested' : 'draft'
  await sql`
    insert into target_sets (month, status, proposed_by, proposed_at)
    values (${month}, ${status}, ${user.id}, ${propose ? new Date() : null})
    on conflict (month) do update set status = excluded.status,
      proposed_by = coalesce(excluded.proposed_by, target_sets.proposed_by),
      proposed_at = coalesce(excluded.proposed_at, target_sets.proposed_at)`
  // Keep entered actuals when a target with the same name is kept
  const old = await sql<{ label: string; manual_actual: string | null }[]>`select label, manual_actual from targets where month = ${month}::date`
  await sql`delete from targets where month = ${month}::date`
  for (const [position, row] of rows.entries()) {
    const kept = old.find((o) => o.label === row.label)?.manual_actual ?? null
    await sql`insert into targets (month, metric, label, target, manual_actual, position)
              values (${month}, ${row.metric}, ${row.label}, ${row.target}, ${kept}, ${position})`
  }
  await audit(sql, user.id, propose ? 'targets_proposed' : 'targets_saved', {
    entity: 'targets',
    entityId: month,
    summary: `${formatMonth(month)}: ${rows.map((r) => `${r.label} ${r.target}`).join('; ')}`,
    changes: { targets: rows },
  })
}

export async function submitNextMonthAction(_prev: FormState, fd: FormData): Promise<FormState> {
  let reportId: string
  try {
    const user = await actor('editor')
    const month = monthStart(dateField(fd, 'period', 'The month') ?? addMonths(todayISO(), 1))
    const rows = targetRows(fd)
    if (rows.length === 0) throw new UserError('Add at least one target for the month.')
    const open = await openItems()
    const added = newRows(fd)
    const support = text(fd, 'support', 2000)
    const milestones = await upcomingMilestones(month, monthEnd(month))
    reportId = await db().begin(async (sql) => {
      await writeTargets(sql, user, month, rows, true)
      const priorities: ReturnType<typeof itemRef>[] = []
      for (const item of open) {
        if (fd.get(`include_${item.id}`) === 'on') {
          await writeItem(sql, user, item.id, { planned_month: month })
          priorities.push(itemRef(item))
        } else if (item.planned_month === month) {
          await writeItem(sql, user, item.id, { planned_month: null })
        }
      }
      for (const values of added) {
        const { id } = await writeItem(sql, user, null, { ...values, planned_month: month })
        priorities.push(itemRef({ id, ...values } as Item))
      }
      const data = {
        month,
        targets: rows,
        priorities,
        milestones: milestones
          .filter((m) => m.due && m.due >= month)
          .map((m) => ({ name: m.name, project: m.item_title, due: m.due, owner: m.owner, risk: m.risk })),
        support,
        notes: text(fd, 'notes', 3000),
      }
      const id = await saveReport(sql, user, 'next_month', month, data)
      if (support) await createDecision(sql, user, support, { reportId: id, context: `From Next Month’s Plan for ${formatMonth(month)}` })
      return id
    })
    alertCeo(`Targets for ${formatMonth(month)} are ready to agree`, {
      label: 'Targets to agree',
      title: `Next month’s plan for ${formatMonth(month)}`,
      intro: 'The Managing Editor has proposed targets and priorities. Agree them to lock them, or send them back.',
      sections: [{ heading: 'Proposed targets', rows: rows.map((r) => ({ title: r.label, meta: `Target ${r.target}${r.metric === 'on_time' ? '%' : ''}` })) }],
      action: { label: 'Review the targets', href: `/desk/targets?month=${month}` },
    })
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  redirect(`/desk/reports/${reportId}?submitted=1`)
}

export async function reviewReportAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await actor('ceo')
    const id = text(fd, 'id', 40)
    const outcome = text(fd, 'outcome', 30)
    const note = optional(fd, 'note', 2000)
    if (!isUuid(id) || !['reviewed', 'changes_requested'].includes(outcome)) throw new UserError('Reload the page and try again.')
    if (outcome === 'changes_requested' && !note) throw new UserError('Say what should change.')
    await db().begin(async (sql) => {
      const [r] = await sql<{ kind: ReportKind; period_start: string }[]>`
        update reports set review_status = ${outcome}, review_note = ${note}, reviewed_by = ${user.id}, reviewed_at = now()
        where id = ${id} returning kind, period_start`
      if (!r) throw new UserError('That report no longer exists.')
      await audit(sql, user.id, outcome === 'reviewed' ? 'report_reviewed' : 'report_changes_requested', {
        entity: 'report',
        entityId: id,
        summary: `${REPORT_KINDS[r.kind]}${note ? `: ${note.slice(0, 160)}` : ''}`,
      })
    })
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  return { message: 'Saved.' }
}

// ----- Monthly targets -----

export async function saveTargetsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const month = monthStart(text(fd, 'month', 10) || todayISO())
  const propose = text(fd, 'intent', 20) === 'propose'
  try {
    const user = await actor('editor')
    if (!isISODate(month)) throw new UserError('Choose a month.')
    const rows = targetRows(fd)
    if (rows.length === 0) throw new UserError('Add at least one target.')
    await db().begin((sql) => writeTargets(sql, user, month, rows, propose))
    if (propose) {
      alertCeo(`Targets for ${formatMonth(month)} are ready to agree`, {
        label: 'Targets to agree',
        title: `Targets for ${formatMonth(month)}`,
        intro: 'The Managing Editor has proposed these targets. Agree them to lock them, or send them back.',
        sections: [{ heading: 'Proposed targets', rows: rows.map((r) => ({ title: r.label, meta: `Target ${r.target}${r.metric === 'on_time' ? '%' : ''}` })) }],
        action: { label: 'Review the targets', href: `/desk/targets?month=${month}` },
      })
    }
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  return { message: propose ? 'Sent to the CEO to agree.' : 'Saved as a draft.' }
}

export async function agreeTargetsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await actor('ceo')
    const month = text(fd, 'month', 10)
    const outcome = text(fd, 'outcome', 20)
    const note = optional(fd, 'note', 2000)
    if (!isISODate(month)) throw new UserError('Choose a month.')
    if (outcome === 'changes' && !note) throw new UserError('Say what should change.')
    await db().begin(async (sql) => {
      const [set] = await sql<{ status: string }[]>`select status from target_sets where month = ${month}::date for update`
      if (!set) throw new UserError('No targets have been entered for this month yet.')
      if (outcome === 'agree') {
        await sql`update target_sets set status = 'agreed', agreed_by = ${user.id}, agreed_at = now(), note = ${note} where month = ${month}::date`
      } else if (outcome === 'changes' || outcome === 'unlock') {
        await sql`update target_sets set status = 'changes_requested', agreed_by = null, agreed_at = null, note = ${note} where month = ${month}::date`
      } else {
        throw new UserError('Reload the page and try again.')
      }
      const action = outcome === 'agree' ? 'targets_agreed' : outcome === 'unlock' ? 'targets_unlocked' : 'targets_sent_back'
      await audit(sql, user.id, action, { entity: 'targets', entityId: month, summary: `${formatMonth(month)}${note ? `: ${note.slice(0, 160)}` : ''}` })
    })
  } catch (err) {
    return failure(err)
  }
  revalidatePath('/desk', 'layout')
  return { message: 'Saved.' }
}

// ----- Accounts (CEO) -----

export async function addAccountAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await actor('ceo')
    const name = text(fd, 'name', 120)
    const email = text(fd, 'email', 200).toLowerCase()
    const role = choice(ROLE_LABELS, text(fd, 'role'), 'role')
    if (!name) throw new UserError('Enter their name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserError('Enter a valid email address.')
    const temporary = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    await db().begin(async (sql) => {
      const [exists] = await sql`select 1 from users where email = ${email}`
      if (exists) throw new UserError('There is already an account with that email.')
      const [created] = await sql<{ id: string }[]>`
        insert into users (email, name, role, password_hash) values (${email}, ${name}, ${role}, ${await hashPassword(temporary)}) returning id`
      await audit(sql, user.id, 'account_created', { entity: 'user', entityId: created.id, summary: `${name} (${ROLE_LABELS[role]})` })
    })
    const [{ id }] = await db()<{ id: string }[]>`select id from users where email = ${email}`
    const invited = await sendInvitation(id).catch((err) => (console.error('Desk invitation failed', err), false))
    revalidatePath('/desk/accounts')
    if (invited) return { message: `Account created. An invitation to set it up has gone to ${email}; the link works for 3 days.` }
    return { message: `Account created, but the invitation email couldn’t be sent. Give ${name} this temporary password in person or by phone. It is shown only once.`, secret: temporary }
  } catch (err) {
    return failure(err)
  }
}

export async function resetAccountAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await actor('ceo')
    const id = text(fd, 'id', 40)
    if (!isUuid(id)) throw new UserError('That account no longer exists.')
    const temporary = await resetAccount(user, id)
    const invited = await sendInvitation(id).catch((err) => (console.error('Desk invitation failed', err), false))
    revalidatePath('/desk/accounts')
    if (invited) return { message: 'Reset. A new invitation has been emailed so they can choose a password and connect their authenticator app again.' }
    return { message: 'Reset, but the invitation email couldn’t be sent. They sign in with this temporary password, then choose a new one and connect their authenticator app again. It is shown only once.', secret: temporary }
  } catch (err) {
    return failure(err)
  }
}

// Emails a fresh invitation to an account that hasn't been set up yet
export async function resendInviteAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    await actor('ceo')
    const id = text(fd, 'id', 40)
    if (!isUuid(id)) throw new UserError('That account no longer exists.')
    if (!(await sendInvitation(id))) throw new UserError('The invitation couldn’t be sent. Check the email settings, or use Reset to get a temporary password.')
    revalidatePath('/desk/accounts')
    return { message: 'A new invitation has been emailed. Earlier links no longer work.' }
  } catch (err) {
    return failure(err)
  }
}

export async function acceptInviteAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    if (!(await acceptInvite(text(fd, 'token', 100)))) {
      return { error: 'This invitation has expired or was already used. Ask the CEO to send a new one.' }
    }
  } catch (err) {
    return failure(err)
  }
  redirect('/desk/login/setup')
}

export async function toggleAccountAction(fd: FormData) {
  const user = await actor('ceo')
  const id = text(fd, 'id', 40)
  if (!isUuid(id) || id === user.id) return
  await db().begin(async (sql) => {
    const [u] = await sql<{ name: string; disabled: boolean }[]>`update users set disabled = not disabled where id = ${id} returning name, disabled`
    if (!u) return
    if (u.disabled) await sql`delete from sessions where user_id = ${id}`
    await audit(sql, user.id, u.disabled ? 'account_disabled' : 'account_enabled', { entity: 'user', entityId: id, summary: u.name })
  })
  revalidatePath('/desk/accounts')
}

export async function signOutEverywhereAction() {
  const user = await actor()
  await db().begin(async (sql) => {
    await sql`delete from sessions where user_id = ${user.id}`
    await audit(sql, user.id, 'signed_out_everywhere')
  })
  redirect('/desk/login')
}
