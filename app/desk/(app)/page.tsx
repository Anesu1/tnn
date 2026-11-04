import Link from "next/link"

import { decideAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { PrintButton } from "@/components/desk/print-button"
import { Filters } from "@/components/desk/filters"
import { ItemRow, Meter, Tile } from "@/components/desk/ui"
import { requireDeskUser } from "@/lib/desk/auth"
import {
  ACTIVE_STATUSES,
  addDays,
  formatDay,
  formatMonth,
  formatStamp,
  formatWeek,
  METRICS,
  monthStart,
  REPORT_KINDS,
  todayISO,
  weekStart,
} from "@/lib/desk/config"
import {
  actualFor,
  decisions,
  listItems,
  listReports,
  monthActuals,
  people,
  recentRisks,
  targetSet,
  upcomingMilestones,
  weekSummary,
} from "@/lib/desk/data"
import { readFilters } from "@/lib/desk/filters"
import { webStories } from "@/lib/desk/sanity"

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireDeskUser()
  const params = await searchParams
  const filters = readFilters(params)
  const today = todayISO()
  const month = monthStart(today)
  const isCeo = user.role === "ceo"

  const [items, owners, open, risks, week, monthTargets, actuals, milestones, reports, web] = await Promise.all([
    listItems(filters, { includeClosed: true }),
    people(),
    decisions("open"),
    recentRisks(),
    weekSummary(weekStart(today)),
    targetSet(month),
    monthActuals(month),
    upcomingMilestones(today, addDays(today, 14)),
    listReports(undefined, 6),
    webStories(filters.from!, filters.to!).catch(() => null),
  ])

  const inRange = (day: string | null) => !!day && day >= filters.from! && day <= filters.to!
  const planned = items.filter((i) => i.status === "planned")
  const inProgress = items.filter((i) => ACTIVE_STATUSES.includes(i.status as never))
  const completed = items.filter((i) => i.status === "published" && inRange(i.completed_on))
  const overdue = items.filter((i) => i.overdue)
  const blocked = items.filter((i) => i.blocked && i.status !== "published" && i.status !== "dropped")
  const upcoming = items.filter((i) => i.deadline && i.deadline >= today && i.deadline <= addDays(today, 14) && !["published", "dropped"].includes(i.status))
  const query = (extra: Record<string, string>) => `/desk/tracker?${new URLSearchParams({ ...cleanParams(params), ...extra })}`
  const plannedDelivered = week.delivered.length

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">{isCeo ? "CEO view" : "Managing Editor"}</span>
          <h1 style={{ marginTop: 6 }}>Dashboard</h1>
          <p className="meta">
            {formatDay(filters.from!)} to {formatDay(filters.to!)} · updated {formatStamp(new Date())}
          </p>
        </div>
        <div className="actions">
          {!isCeo && (
            <>
              <Link href="/desk/reports/new/daily" className="button">
                Daily update
              </Link>
              <Link href="/desk/tracker/new" className="button outline">
                Add item
              </Link>
            </>
          )}
          <PrintButton />
        </div>
      </div>

      {params.welcome && (
        <div className="notice success" role="status">
          Your account is secured. Sign in next time with your email, password and a code from your authenticator app.
        </div>
      )}
      {params.denied && (
        <div className="notice" role="status">
          That page is only for the other Desk role.
        </div>
      )}

      <Filters action="/desk" filters={filters} owners={owners} />

      <div className="tiles">
        <Tile name="Planned" value={planned.length} note="Not started yet" href={query({ status: "planned" })} />
        <Tile name="In progress" value={inProgress.length} note="In progress, in edit or ready" href={query({ status: "active" })} />
        <Tile
          name="Published on website"
          value={web === null ? "—" : web.length}
          note={web === null ? "Couldn’t reach the website" : "All sections, in this period"}
        />
        <Tile name="Completed" value={completed.length} note="Delivered in this period" tone="good" href={query({ status: "published" })} />
        <Tile
          name="Overdue"
          value={overdue.length}
          note={blocked.length ? `${blocked.length} blocked` : "Past deadline, not delivered"}
          tone={overdue.length || blocked.length ? "alert" : undefined}
          href={query({ status: "overdue" })}
        />
      </div>

      <div className="columns wide-left">
        <div>
          <div className="section-head">
            <h2>Needs {isCeo ? "your" : "CEO"} attention</h2>
            <Link href="/desk/decisions">All decisions</Link>
          </div>
          {open.length === 0 && blocked.length === 0 && overdue.length === 0 && risks.length === 0 ? (
            <div className="empty">Nothing blocked, overdue or waiting for a decision.</div>
          ) : (
            <ul className="rows">
              {open.map((d) => (
                <li key={d.id}>
                  <div>
                    <span className="tags">
                      <span className="tag warn">Decision needed</span>
                      {d.due && <span className={d.due < today ? "tag overdue" : "tag"}>By {formatDay(d.due)}</span>}
                    </span>
                    <p style={{ marginTop: 4, fontWeight: "bold" }} className="pre">
                      {d.question}
                    </p>
                    <div className="detail">
                      {d.raised_by_name} · {formatStamp(d.raised_at)}
                      {d.item_title && (
                        <>
                          {" "}
                          · <Link href={`/desk/tracker/${d.item_id}`}>{d.item_title}</Link>
                        </>
                      )}
                      {d.report_id && (
                        <>
                          {" "}
                          · <Link href={`/desk/reports/${d.report_id}`}>From report</Link>
                        </>
                      )}
                    </div>
                    {isCeo && (
                      <ActionForm action={decideAction} className="form" resetOnSuccess>
                        <input type="hidden" name="id" value={d.id} />
                        <label htmlFor={`answer-${d.id}`} className="visually-hidden">
                          Your decision
                        </label>
                        <textarea id={`answer-${d.id}`} name="answer" placeholder="Your decision or reply" required style={{ minHeight: 64 }} />
                        <FormFooter>
                          <SubmitButton className="button small dark">Record decision</SubmitButton>
                        </FormFooter>
                      </ActionForm>
                    )}
                  </div>
                </li>
              ))}
              {blocked.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
              {overdue.filter((i) => !i.blocked).map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
              {risks.map((r) => (
                <li key={r.id}>
                  <div>
                    <span className="tags">
                      <span className="tag warn">Risk</span>
                    </span>
                    <p className="pre" style={{ marginTop: 4 }}>
                      {r.risks}
                    </p>
                    <div className="detail">
                      <Link href={`/desk/reports/${r.id}`}>Daily update, {formatDay(r.period_start)}</Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="section-head">
            <h2>Targets</h2>
            <Link href="/desk/targets">Set targets</Link>
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <h3>{formatWeek(week.monday)}</h3>
            {week.planned.length === 0 ? (
              <p className="meta">No weekly plan yet.</p>
            ) : (
              <Meter name="Planned deliverables delivered" actual={plannedDelivered} target={week.planned.length} />
            )}
            {week.unplanned.length > 0 && <p className="meta">Plus {week.unplanned.length} delivered that weren’t in the plan.</p>}
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <h3>{formatMonth(month)}</h3>
            {monthTargets.targets.length === 0 ? (
              <p className="meta">No targets entered for this month yet.</p>
            ) : (
              <>
                <p className="meta">
                  {monthTargets.set?.status === "agreed"
                    ? `Agreed by ${monthTargets.set.agreed_by_name ?? "the CEO"}`
                    : monthTargets.set?.status === "proposed"
                      ? "Proposed, waiting for the CEO to agree"
                      : "Draft, not yet agreed"}
                </p>
                {monthTargets.targets.map((t) => (
                  <Meter key={t.id} name={t.label} actual={actualFor(t, actuals)} target={Number(t.target)} unit={METRICS[t.metric]?.unit} />
                ))}
              </>
            )}
          </div>

          <div className="section-head">
            <h2>Next 14 days</h2>
            <Link href="/desk/pipeline">Pipeline</Link>
          </div>
          {upcoming.length === 0 && milestones.length === 0 ? (
            <div className="empty">No deadlines or milestones in the next two weeks.</div>
          ) : (
            <ul className="rows">
              {[
                ...upcoming.map((i) => ({ key: i.id, day: i.deadline!, title: i.title, href: `/desk/tracker/${i.id}`, kind: "Deadline", who: i.owner })),
                ...milestones.map((m) => ({ key: m.id, day: m.due!, title: `${m.name} · ${m.item_title}`, href: `/desk/tracker/${m.item_id}`, kind: "Milestone", who: m.owner })),
              ]
                .sort((a, b) => a.day.localeCompare(b.day))
                .map((row) => (
                  <li key={row.key}>
                    <div>
                      <Link href={row.href} className="title">
                        {row.title}
                      </Link>
                      <div className="detail">
                        {row.kind}
                        {row.who ? ` · ${row.who}` : ""}
                      </div>
                    </div>
                    <div className="side">
                      <span className={row.day < today ? "tag overdue" : undefined}>{row.day < today ? `Overdue, ${formatDay(row.day)}` : formatDay(row.day)}</span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      <div className="section-head">
        <h2>Work in this period</h2>
        <Link href={query({})}>Open in tracker</Link>
      </div>
      {items.length === 0 ? (
        <div className="empty">No items match these filters.</div>
      ) : (
        <ul className="rows">
          {items.slice(0, 30).map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
      {items.length > 30 && (
        <p className="meta">
          Showing 30 of {items.length}. <Link href={query({})}>See all in the tracker</Link>
        </p>
      )}

      <div className="section-head">
        <h2>Latest reports</h2>
        <Link href="/desk/reports">All reports</Link>
      </div>
      {reports.length === 0 ? (
        <div className="empty">No reports submitted yet.</div>
      ) : (
        <ul className="rows">
          {reports.map((r) => (
            <li key={r.id}>
              <div>
                <Link href={`/desk/reports/${r.id}`} className="title">
                  {REPORT_KINDS[r.kind]}
                </Link>
                <div className="detail">
                  {r.kind === "scorecard" || r.kind === "next_month" ? formatMonth(r.period_start) : formatDay(r.period_start)}
                  {r.version > 1 ? ` · version ${r.version}` : ""} · {r.submitted_by_name}
                </div>
              </div>
              <div className="side">
                {r.review_status === "reviewed" ? (
                  <span className="tag status-published">Reviewed</span>
                ) : r.review_status === "changes_requested" ? (
                  <span className="tag overdue">Changes requested</span>
                ) : (
                  <span className="tag warn">Not reviewed</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function cleanParams(params: Record<string, string | undefined>) {
  const keep: Record<string, string> = {}
  for (const key of ["from", "to", "kind", "platform", "owner"]) {
    if (params[key]) keep[key] = params[key]!
  }
  return keep
}
