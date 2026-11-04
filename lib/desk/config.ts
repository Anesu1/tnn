// Lists, labels and schedules for the Editorial Desk. Change the options here and every
// form, filter and report picks them up.

export type Role = 'ceo' | 'editor'
export const ROLE_LABELS: Record<Role, string> = { ceo: 'CEO', editor: 'Managing Editor' }

export const KINDS = {
  story: 'Story',
  video: 'Video',
  show: 'Show',
  documentary: 'Documentary',
  special_report: 'Special report',
} as const
export type Kind = keyof typeof KINDS
// These get a production stage and milestones, and appear in the pipeline
export const PIPELINE_KINDS: Kind[] = ['documentary', 'special_report']

export const PLATFORMS = {
  website: 'Website',
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
} as const

export const PRIORITIES = { high: 'High', normal: 'Normal', low: 'Low' } as const

export const STATUSES = {
  planned: 'Planned',
  in_progress: 'In progress',
  in_edit: 'In edit',
  ready: 'Ready',
  published: 'Published / delivered',
  on_hold: 'On hold',
  dropped: 'Dropped',
} as const
export type Status = keyof typeof STATUSES
export const ACTIVE_STATUSES: Status[] = ['in_progress', 'in_edit', 'ready']
export const CLOSED_STATUSES: Status[] = ['published', 'dropped']

export const STAGES = {
  idea: 'Idea',
  development: 'Development',
  research: 'Research',
  pre_production: 'Pre-production',
  production: 'Filming / production',
  post_production: 'Edit / post-production',
  review: 'Review',
  released: 'Released',
} as const

// Metrics a monthly target can measure. "auto" ones are counted from the tracker and the
// website; the rest are entered by the editor in the monthly scorecard.
export const METRICS = {
  delivered: { label: 'Items published or delivered', auto: true, unit: '' },
  web_stories: { label: 'Stories published on the website', auto: true, unit: '' },
  videos: { label: 'Videos and shows delivered', auto: true, unit: '' },
  long_form: { label: 'Documentaries and special reports released', auto: true, unit: '' },
  milestones: { label: 'Documentary milestones met', auto: true, unit: '' },
  on_time: { label: 'Delivered on or before deadline', auto: true, unit: '%' },
  corrections: { label: 'Corrections published', auto: false, unit: '' },
  web_views: { label: 'Website page views', auto: false, unit: '' },
  video_views: { label: 'Video views (all platforms)', auto: false, unit: '' },
  followers: { label: 'New followers (all platforms)', auto: false, unit: '' },
  custom: { label: 'Other (name it)', auto: false, unit: '' },
} as const
export type Metric = keyof typeof METRICS

export const REPORT_KINDS = {
  daily: 'Daily Editorial Update',
  weekly_plan: 'Weekly Plan',
  weekly_report: 'Weekly Delivery Report',
  scorecard: 'Monthly Scorecard',
  next_month: "Next Month's Plan",
} as const
export type ReportKind = keyof typeof REPORT_KINDS

// When each report is due, in Harare time. Daily updates are expected on these weekdays
// (0 = Sunday). Reminder emails go out a couple of hours before each deadline.
export const SCHEDULE = {
  dailyWeekdays: [1, 2, 3, 4, 5],
  dailyDueHour: 18,
  weeklyPlanDueHour: 10, // Monday
  weeklyReportDueHour: 16, // Friday
  scorecardWorkingDay: 3, // the 3rd working day of the month, for the previous month
  nextMonthDueDay: 25,
  ceoDigestHour: 7,
  reminderLeadHours: 2,
}

export const TIME_ZONE = 'Africa/Harare'

// ----- Dates. Everything is "YYYY-MM-DD" in Harare time. -----

export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now)
}

export function harareHour(now = new Date()) {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', hourCycle: 'h23' }).format(now))
}

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`)
const fromDate = (date: Date) => date.toISOString().slice(0, 10)

export function addDays(iso: string, days: number) {
  const date = toDate(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return fromDate(date)
}

export function weekday(iso: string) {
  return toDate(iso).getUTCDay()
}

// Monday of the week containing the date
export function weekStart(iso: string) {
  return addDays(iso, -((weekday(iso) + 6) % 7))
}

export function monthStart(iso: string) {
  return `${iso.slice(0, 7)}-01`
}

export function addMonths(iso: string, months: number) {
  const date = toDate(monthStart(iso))
  date.setUTCMonth(date.getUTCMonth() + months)
  return fromDate(date)
}

export function monthEnd(iso: string) {
  return addDays(addMonths(iso, 1), -1)
}

// The nth Monday-to-Friday day of the month
export function workingDay(month: string, n: number) {
  let day = monthStart(month)
  let count = 0
  while (true) {
    if (weekday(day) >= 1 && weekday(day) <= 5) count++
    if (count === n) return day
    day = addDays(day, 1)
  }
}

export function isISODate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toDate(value).getTime())
}

const dayFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' })
const longDayFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const monthFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'long', year: 'numeric' })
const stampFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatDay = (iso: string) => dayFormat.format(toDate(iso))
export const formatLongDay = (iso: string) => longDayFormat.format(toDate(iso))
export const formatMonth = (iso: string) => monthFormat.format(toDate(iso))
export const formatStamp = (value: Date | string) => stampFormat.format(new Date(value))
export const formatWeek = (monday: string) => `Week of ${formatDay(monday)}`

export function label<T extends Record<string, string>>(list: T, key: string | null | undefined) {
  return (key && (list as Record<string, string>)[key]) || key || ''
}
