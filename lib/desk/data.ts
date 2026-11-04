import 'server-only'

import {
  ACTIVE_STATUSES,
  addDays,
  addMonths,
  CLOSED_STATUSES,
  METRICS,
  monthEnd,
  PIPELINE_KINDS,
  SCHEDULE,
  todayISO,
  weekStart,
  workingDay,
  type Metric,
  type ReportKind,
} from './config'
import { db, type Sql } from './db'
import { webStories } from './sanity'

export type Item = {
  id: string
  title: string
  kind: string
  format: string | null
  platforms: string[]
  priority: string
  lead: string | null
  contributors: string | null
  owner: string | null
  deadline: string | null
  status: string
  next_action: string | null
  blocked: boolean
  blocker: string | null
  risk: string | null
  evidence_url: string | null
  sanity_id: string | null
  success_measure: string | null
  planned_week: string | null
  planned_month: string | null
  stage: string | null
  completed_at: Date | null
  // Harare date the item was delivered
  completed_on: string | null
  archived: boolean
  created_at: Date
  updated_at: Date
  overdue: boolean
}

export type Milestone = {
  id: string
  item_id: string
  item_title?: string
  name: string
  due: string | null
  owner: string | null
  risk: string | null
  done_at: Date | null
  done_on: string | null
}

export type Filters = {
  from?: string
  to?: string
  kind?: string
  platform?: string
  status?: string
  owner?: string
  q?: string
}

const ITEM_COLUMNS = (today: string) => db()`
  i.*, (i.completed_at at time zone 'Africa/Harare')::date as completed_on,
  (i.deadline < ${today}::date and i.status <> all(${CLOSED_STATUSES})) as overdue`

// Items matching the dashboard and tracker filters. The date range covers what was due in
// it or delivered in it; items without a deadline are always included while open.
export async function listItems(filters: Filters = {}, options: { includeClosed?: boolean } = {}) {
  const sql = db()
  const today = todayISO()
  const { from, to, kind, platform, status, owner, q } = filters
  return sql<Item[]>`
    select ${ITEM_COLUMNS(today)} from items i
    where not i.archived
      ${kind ? sql`and i.kind = ${kind}` : sql``}
      ${platform ? sql`and ${platform} = any(i.platforms)` : sql``}
      ${status === 'overdue' ? sql`and i.deadline < ${today}::date and i.status <> all(${CLOSED_STATUSES})`
        : status === 'blocked' ? sql`and i.blocked and i.status <> all(${CLOSED_STATUSES})`
        : status === 'active' ? sql`and i.status = any(${ACTIVE_STATUSES})`
        : status ? sql`and i.status = ${status}` : sql``}
      ${owner ? sql`and (i.owner = ${owner} or i.lead = ${owner})` : sql``}
      ${q ? sql`and (i.title ilike ${'%' + q + '%'} or i.next_action ilike ${'%' + q + '%'})` : sql``}
      ${!options.includeClosed && !status ? sql`and i.status <> 'dropped'` : sql``}
      ${from && to
        ? sql`and (
            (i.deadline between ${from}::date and ${to}::date)
            or ((i.completed_at at time zone 'Africa/Harare')::date between ${from}::date and ${to}::date)
            or (i.deadline is null and i.status <> all(${CLOSED_STATUSES}))
            or (i.deadline < ${from}::date and i.status <> all(${CLOSED_STATUSES})))`
        : sql``}
    order by (i.status = any(${CLOSED_STATUSES})), i.deadline nulls last, i.priority = 'high' desc, i.created_at`
}

export async function getItem(id: string) {
  if (!isUuid(id)) return null
  const [item] = await db()<Item[]>`select ${ITEM_COLUMNS(todayISO())} from items i where i.id = ${id}`
  return item ?? null
}

export async function openItems() {
  return db()<Item[]>`
    select ${ITEM_COLUMNS(todayISO())} from items i
    where not i.archived and i.status <> all(${CLOSED_STATUSES})
    order by i.deadline nulls last, i.title`
}

export async function people() {
  const rows = await db()<{ name: string }[]>`
    select distinct name from (
      select owner as name from items where owner is not null and not archived
      union select lead from items where lead is not null and not archived
      union select owner from milestones where owner is not null
    ) names where name <> '' order by name`
  return rows.map((row) => row.name)
}

export async function milestonesFor(itemId: string) {
  return db()<Milestone[]>`
    select m.*, (m.done_at at time zone 'Africa/Harare')::date as done_on from milestones m
    where m.item_id = ${itemId} order by m.due nulls last, m.created_at`
}

export async function pipeline() {
  const sql = db()
  const items = await sql<Item[]>`
    select ${ITEM_COLUMNS(todayISO())} from items i
    where not i.archived and i.kind = any(${PIPELINE_KINDS}) and i.status <> 'dropped'
    order by i.status = 'published', i.deadline nulls last`
  const milestones = items.length
    ? await sql<Milestone[]>`
        select m.*, (m.done_at at time zone 'Africa/Harare')::date as done_on from milestones m
        where m.item_id = any(${items.map((i) => i.id)}::uuid[]) order by m.due nulls last, m.created_at`
    : []
  return items.map((item) => {
    const own = milestones.filter((m) => m.item_id === item.id)
    return { item, milestones: own, next: own.find((m) => !m.done_at) ?? null }
  })
}

export async function upcomingMilestones(from: string, to: string) {
  return db()<Milestone[]>`
    select m.*, i.title as item_title, null as done_on from milestones m join items i on i.id = m.item_id
    where m.done_at is null and not i.archived and m.due <= ${to}::date
      and (m.due >= ${from}::date or m.due < ${todayISO()}::date)
    order by m.due`
}

// ----- History and comments -----

export type AuditRow = {
  id: string
  at: Date
  user_name: string | null
  action: string
  entity: string | null
  entity_id: string | null
  summary: string | null
  changes: Record<string, { from: unknown; to: unknown }> | null
}

export async function history(options: { entity?: string; entityId?: string; limit?: number; before?: string } = {}) {
  const sql = db()
  return sql<AuditRow[]>`
    select a.id, a.at, u.name as user_name, a.action, a.entity, a.entity_id, a.summary, a.changes
    from audit_log a left join users u on u.id = a.user_id
    where true
      ${options.entity ? sql`and a.entity = ${options.entity}` : sql``}
      ${options.entityId ? sql`and a.entity_id = ${options.entityId}` : sql``}
      ${options.before && /^\d+$/.test(options.before) ? sql`and a.id < ${options.before}` : sql``}
    order by a.id desc limit ${options.limit ?? 100}`
}

export type Comment = { id: string; body: string; created_at: Date; user_name: string; role: string }

export async function commentsFor(entity: string, entityId: string) {
  return db()<Comment[]>`
    select c.id, c.body, c.created_at, u.name as user_name, u.role from comments c join users u on u.id = c.user_id
    where c.entity = ${entity} and c.entity_id = ${entityId} order by c.created_at`
}

// ----- Reports -----

export type Report = {
  id: string
  kind: ReportKind
  period_start: string
  version: number
  data: Record<string, unknown>
  submitted_at: Date
  submitted_by_name: string
  review_status: 'submitted' | 'reviewed' | 'changes_requested'
  review_note: string | null
  reviewed_by_name: string | null
  reviewed_at: Date | null
}

const REPORT_SELECT = (sql: Sql) => sql`
  r.id, r.kind, r.period_start, r.version, r.data, r.submitted_at, r.review_status, r.review_note, r.reviewed_at,
  s.name as submitted_by_name, v.name as reviewed_by_name
  from reports r join users s on s.id = r.submitted_by left join users v on v.id = r.reviewed_by`

export async function listReports(kind?: string, limit = 60) {
  const sql = db()
  return sql<Report[]>`
    select ${REPORT_SELECT(sql)}
    where true ${kind ? sql`and r.kind = ${kind}` : sql``}
    order by r.period_start desc, r.kind, r.version desc limit ${limit}`
}

export async function getReport(id: string) {
  if (!isUuid(id)) return null
  const sql = db()
  const [report] = await sql<Report[]>`select ${REPORT_SELECT(sql)} where r.id = ${id}`
  return report ?? null
}

export async function reportVersions(kind: string, periodStart: string) {
  const sql = db()
  return sql<Report[]>`select ${REPORT_SELECT(sql)} where r.kind = ${kind} and r.period_start = ${periodStart} order by r.version desc`
}

export async function latestReport(kind: ReportKind, periodStart: string) {
  return (await reportVersions(kind, periodStart))[0] ?? null
}

// Reports that are due now or overdue, worked out from SCHEDULE. Looks back far enough to
// catch anything missed in the last week (and last month for monthly reports).
export type DueReport = { kind: ReportKind; period: string; dueAt: string; overdue: boolean; href: string }

export async function dueReports(now = new Date()): Promise<DueReport[]> {
  const today = todayISO(now)
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Harare', hour: '2-digit', hourCycle: 'h23' }).format(now))
  const candidates: { kind: ReportKind; period: string; dueDay: string; dueHour: number }[] = []

  for (let back = 0; back < 7; back++) {
    const day = addDays(today, -back)
    const dow = new Date(`${day}T00:00:00Z`).getUTCDay()
    if (SCHEDULE.dailyWeekdays.includes(dow)) {
      candidates.push({ kind: 'daily', period: day, dueDay: day, dueHour: SCHEDULE.dailyDueHour })
    }
  }
  const monday = weekStart(today)
  candidates.push({ kind: 'weekly_plan', period: monday, dueDay: monday, dueHour: SCHEDULE.weeklyPlanDueHour })
  candidates.push({ kind: 'weekly_report', period: monday, dueDay: addDays(monday, 4), dueHour: SCHEDULE.weeklyReportDueHour })
  const lastMonday = addDays(monday, -7)
  candidates.push({ kind: 'weekly_report', period: lastMonday, dueDay: addDays(lastMonday, 4), dueHour: SCHEDULE.weeklyReportDueHour })

  const thisMonth = `${today.slice(0, 7)}-01`
  candidates.push({
    kind: 'scorecard',
    period: addMonths(thisMonth, -1),
    dueDay: workingDay(thisMonth, SCHEDULE.scorecardWorkingDay),
    dueHour: 17,
  })
  candidates.push({
    kind: 'next_month',
    period: addMonths(thisMonth, 1),
    dueDay: `${today.slice(0, 7)}-${String(SCHEDULE.nextMonthDueDay).padStart(2, '0')}`,
    dueHour: 17,
  })

  const submitted = await db()<{ kind: string; period_start: string }[]>`
    select distinct kind, period_start from reports where period_start >= ${addMonths(thisMonth, -1)}::date`
  const done = new Set(submitted.map((r) => `${r.kind}:${r.period_start}`))
  // Nothing is due from before the Desk was set up (its first account)
  const [{ start }] = await db()<{ start: string | null }[]>`
    select (min(created_at) at time zone 'Africa/Harare')::date as start from users`

  // Show a report from the morning of its due day (Monday's plan from the start of Monday,
  // the monthly ones from five days before)
  return candidates
    .filter((c) => !done.has(`${c.kind}:${c.period}`))
    .filter((c) => !start || c.dueDay >= start)
    .filter((c) => {
      const showFrom = c.kind === 'scorecard' || c.kind === 'next_month' ? addDays(c.dueDay, -5) : c.dueDay
      return today >= showFrom
    })
    .map((c) => ({
      kind: c.kind,
      period: c.period,
      dueAt: `${c.dueDay}T${String(c.dueHour).padStart(2, '0')}:00`,
      overdue: today > c.dueDay || (today === c.dueDay && hour >= c.dueHour),
      href: `/desk/reports/new/${c.kind}?period=${c.period}`,
    }))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
}

// ----- Weekly summary (used by the Friday report and the dashboard) -----

export async function weekSummary(monday: string) {
  const sql = db()
  const sunday = addDays(monday, 6)
  const today = todayISO()
  const planned = await sql<Item[]>`
    select ${ITEM_COLUMNS(today)} from items i where i.planned_week = ${monday}::date and not i.archived
    order by i.deadline nulls last`
  const unplanned = await sql<Item[]>`
    select ${ITEM_COLUMNS(today)} from items i
    where not i.archived and i.status = 'published' and (i.planned_week is distinct from ${monday}::date)
      and (i.completed_at at time zone 'Africa/Harare')::date between ${monday}::date and ${sunday}::date
    order by i.completed_at`

  const delivered = planned.filter((i) => i.status === 'published')
  const dropped = planned.filter((i) => i.status === 'dropped')
  const open = planned.filter((i) => !CLOSED_STATUSES.includes(i.status as never))
  const moved = open.filter((i) => i.deadline && i.deadline > sunday)
  const missed = open.filter((i) => i.deadline && i.deadline <= sunday && i.deadline < today)
  const inProgress = open.filter((i) => !moved.includes(i) && !missed.includes(i))
  return { monday, sunday, planned, delivered, dropped, moved, missed, inProgress, unplanned }
}

// ----- Monthly targets and actuals -----

export type TargetSet = {
  month: string
  status: 'draft' | 'proposed' | 'agreed' | 'changes_requested'
  note: string | null
  proposed_at: Date | null
  agreed_at: Date | null
  agreed_by_name: string | null
}

export type Target = {
  id: string
  month: string
  metric: Metric
  label: string
  target: string
  manual_actual: string | null
  position: number
}

export async function targetSet(month: string) {
  const sql = db()
  const [set] = await sql<TargetSet[]>`
    select t.month, t.status, t.note, t.proposed_at, t.agreed_at, u.name as agreed_by_name
    from target_sets t left join users u on u.id = t.agreed_by where t.month = ${month}::date`
  const targets = await sql<Target[]>`select * from targets where month = ${month}::date order by position, label`
  return { set: set ?? null, targets }
}

export type Actuals = Record<Exclude<Metric, 'custom'>, number | null> & {
  deliveredItems: Item[]
  late: Item[]
  webStoryList: Awaited<ReturnType<typeof webStories>>
}

export async function monthActuals(month: string): Promise<Actuals> {
  const sql = db()
  const end = monthEnd(month)
  const deliveredItems = await sql<Item[]>`
    select ${ITEM_COLUMNS(todayISO())} from items i
    where not i.archived and i.status = 'published'
      and (i.completed_at at time zone 'Africa/Harare')::date between ${month}::date and ${end}::date
    order by i.completed_at`
  const [{ count: milestones }] = await sql<{ count: number }[]>`
    select count(*)::int as count from milestones m join items i on i.id = m.item_id
    where not i.archived and (m.done_at at time zone 'Africa/Harare')::date between ${month}::date and ${end}::date`
  let webStoryList: Awaited<ReturnType<typeof webStories>> = []
  let web: number | null = null
  try {
    webStoryList = await webStories(month, end)
    web = webStoryList.length
  } catch (err) {
    console.error('Desk: could not count website stories', err)
  }
  const withDeadline = deliveredItems.filter((i) => i.deadline && i.completed_on)
  const late = withDeadline.filter((i) => i.completed_on! > i.deadline!)
  return {
    delivered: deliveredItems.length,
    web_stories: web,
    videos: deliveredItems.filter((i) => i.kind === 'video' || i.kind === 'show').length,
    long_form: deliveredItems.filter((i) => PIPELINE_KINDS.includes(i.kind as never)).length,
    milestones,
    on_time: withDeadline.length ? Math.round(((withDeadline.length - late.length) / withDeadline.length) * 100) : null,
    corrections: null,
    web_views: null,
    video_views: null,
    followers: null,
    deliveredItems,
    late,
    webStoryList,
  }
}

export function actualFor(target: Target, actuals: Actuals) {
  const meta = METRICS[target.metric]
  if (meta?.auto) return actuals[target.metric as keyof Actuals] as number | null
  return target.manual_actual === null ? null : Number(target.manual_actual)
}

// ----- Decisions -----

export type Decision = {
  id: string
  question: string
  context: string | null
  item_id: string | null
  item_title: string | null
  report_id: string | null
  due: string | null
  status: 'open' | 'decided'
  answer: string | null
  raised_at: Date
  raised_by_name: string | null
  decided_at: Date | null
  decided_by_name: string | null
}

export async function decisions(status?: 'open' | 'decided', limit = 100) {
  const sql = db()
  return sql<Decision[]>`
    select d.*, i.title as item_title, r.name as raised_by_name, c.name as decided_by_name
    from decisions d left join items i on i.id = d.item_id
      left join users r on r.id = d.raised_by left join users c on c.id = d.decided_by
    where true ${status ? sql`and d.status = ${status}` : sql``}
    order by d.status = 'decided', d.due nulls last, d.raised_at desc limit ${limit}`
}

// ----- Latest risks from daily updates -----

export async function recentRisks(days = 7) {
  return db()<{ id: string; period_start: string; risks: string }[]>`
    select distinct on (period_start) id, period_start, data->>'risks' as risks from reports
    where kind = 'daily' and period_start >= ${addDays(todayISO(), -days)}::date and coalesce(data->>'risks', '') <> ''
    order by period_start desc, version desc`
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}
