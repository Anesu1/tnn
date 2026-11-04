import Link from "next/link"
import { notFound } from "next/navigation"

import { DailyForm, NextMonthForm, ScorecardForm, WeeklyPlanForm, WeeklyReportForm } from "@/components/desk/report-forms"
import { requireDeskUser } from "@/lib/desk/auth"
import {
  addMonths,
  formatDay,
  formatMonth,
  formatWeek,
  isISODate,
  monthEnd,
  monthStart,
  REPORT_KINDS,
  todayISO,
  weekStart,
  type ReportKind,
} from "@/lib/desk/config"
import { latestReport, monthActuals, openItems, people, targetSet, upcomingMilestones, weekSummary } from "@/lib/desk/data"
import { db } from "@/lib/desk/db"
import { webStories } from "@/lib/desk/sanity"

// The period each report covers, from ?period= or the usual default
function periodFor(kind: ReportKind, requested?: string) {
  const today = todayISO()
  const base = requested && isISODate(requested) ? requested : undefined
  switch (kind) {
    case "daily":
      return base && base <= today ? base : today
    case "weekly_plan":
    case "weekly_report":
      return weekStart(base ?? today)
    case "scorecard":
      return monthStart(base ?? addMonths(today, -1))
    case "next_month":
      return monthStart(base ?? addMonths(today, 1))
  }
}

export default async function NewReport({ params, searchParams }: { params: Promise<{ kind: string }>; searchParams: Promise<{ period?: string }> }) {
  await requireDeskUser("editor")
  const { kind } = await params
  if (!(kind in REPORT_KINDS)) notFound()
  const reportKind = kind as ReportKind
  const period = periodFor(reportKind, (await searchParams).period)
  const existing = await latestReport(reportKind, period)
  const periodName =
    reportKind === "daily" ? formatDay(period) : reportKind === "scorecard" || reportKind === "next_month" ? formatMonth(period) : formatWeek(period)

  let form: React.ReactNode
  if (reportKind === "daily") {
    const [open, web, delivered] = await Promise.all([
      openItems(),
      webStories(period, period).catch(() => []),
      db()<{ title: string; evidence_url: string | null; sanity_id: string | null }[]>`
        select title, evidence_url, sanity_id from items where not archived and status = 'published'
          and (completed_at at time zone 'Africa/Harare')::date = ${period}::date`,
    ])
    const published = [
      ...web.map((s) => ({ title: s.title, url: s.url })),
      ...delivered.filter((i) => !web.some((s) => s.id === i.sanity_id)).map((i) => ({ title: i.title, url: i.evidence_url })),
    ]
    form = <DailyForm date={period} published={published} open={open} />
  } else if (reportKind === "weekly_plan") {
    const [open, names] = await Promise.all([openItems(), people()])
    form = <WeeklyPlanForm monday={period} open={open} people={names} />
  } else if (reportKind === "weekly_report") {
    form = <WeeklyReportForm week={await weekSummary(period)} />
  } else if (reportKind === "scorecard") {
    const [{ set, targets }, actuals] = await Promise.all([targetSet(period), monthActuals(period)])
    form = <ScorecardForm month={period} set={set} targets={targets} actuals={actuals} />
  } else {
    const [{ set, targets }, previous, open, milestones, names] = await Promise.all([
      targetSet(period),
      targetSet(addMonths(period, -1)),
      openItems(),
      upcomingMilestones(period, monthEnd(period)),
      people(),
    ])
    // Start from this month's targets so only the numbers need changing
    const source = targets.length ? targets : previous.targets
    form = (
      <NextMonthForm
        month={period}
        initialTargets={source.map((t) => ({ metric: t.metric, label: t.metric === "custom" ? t.label : "", target: targets.length ? String(Number(t.target)) : "" }))}
        locked={set?.status === "agreed"}
        open={open}
        milestones={milestones.filter((m) => m.due && m.due >= period)}
        people={names}
      />
    )
  }

  return (
    <>
      <p className="meta">
        <Link href="/desk/reports">Reports</Link> /
      </p>
      <h1 style={{ marginTop: 6 }}>{REPORT_KINDS[reportKind]}</h1>
      <p className="intro">{periodName}</p>
      {existing && (
        <div className="notice" role="status">
          Already submitted on {formatDay(new Date(existing.submitted_at).toISOString().slice(0, 10))}.{" "}
          <Link href={`/desk/reports/${existing.id}`}>View it</Link>. Submitting again saves a new version and keeps the old one.
          {existing.review_status === "changes_requested" && existing.review_note && (
            <p className="pre">
              <strong>The CEO asked for changes:</strong> {existing.review_note}
            </p>
          )}
        </div>
      )}
      {form}
    </>
  )
}
