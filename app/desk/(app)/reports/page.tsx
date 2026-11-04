import Link from "next/link"

import { requireDeskUser } from "@/lib/desk/auth"
import { formatDay, formatMonth, formatStamp, formatWeek, REPORT_KINDS, type ReportKind } from "@/lib/desk/config"
import { dueReports, listReports } from "@/lib/desk/data"

const periodName = (kind: ReportKind, period: string) =>
  kind === "daily" ? formatDay(period) : kind === "scorecard" || kind === "next_month" ? formatMonth(period) : formatWeek(period)

export default async function Reports({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const user = await requireDeskUser()
  const { kind } = await searchParams
  const filter = kind && kind in REPORT_KINDS ? kind : undefined
  const [due, reports] = await Promise.all([dueReports(), listReports(filter, 120)])
  const isEditor = user.role === "editor"

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">Reports</span>
          <h1 style={{ marginTop: 6 }}>Reports</h1>
          <p className="meta">Every submitted report is kept as it was sent. Resubmitting saves a new version.</p>
        </div>
        <div className="actions">
          <Link href="/desk/emails" className="button outline">
            Preview reminder emails
          </Link>
        </div>
      </div>

      {isEditor && (
        <>
          <div className="section-head">
            <h2>Start a report</h2>
          </div>
          <div className="tiles" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
            {(Object.keys(REPORT_KINDS) as ReportKind[]).map((k) => {
              const pending = due.find((d) => d.kind === k)
              return (
                <Link key={k} href={pending?.href ?? `/desk/reports/new/${k}`} className={pending?.overdue ? "tile alert" : "tile"}>
                  <span className="name">{REPORT_KINDS[k]}</span>
                  <span className="meta">
                    {pending ? (pending.overdue ? `Overdue · ${periodName(k, pending.period)}` : `Due ${formatDay(pending.dueAt.slice(0, 10))} ${pending.dueAt.slice(11)}`) : "Nothing due"}
                  </span>
                </Link>
              )
            })}
          </div>
        </>
      )}

      <div className="section-head">
        <h2>Submitted</h2>
        <form method="get" className="quick-status">
          <label className="visually-hidden" htmlFor="kind">
            Report type
          </label>
          <select id="kind" name="kind" defaultValue={filter ?? ""}>
            <option value="">All reports</option>
            {Object.entries(REPORT_KINDS).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
          <button className="button small outline">Show</button>
        </form>
      </div>
      {reports.length === 0 ? (
        <div className="empty">No reports submitted yet.</div>
      ) : (
        <ul className="rows">
          {reports.map((r) => (
            <li key={r.id}>
              <div>
                <Link href={`/desk/reports/${r.id}`} className="title">
                  {REPORT_KINDS[r.kind]} · {periodName(r.kind, r.period_start)}
                </Link>
                <div className="detail">
                  {r.submitted_by_name}, {formatStamp(r.submitted_at)}
                  {r.version > 1 ? ` · version ${r.version}` : ""}
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
