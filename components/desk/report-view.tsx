import Link from "next/link"

import { formatDay, formatMonth, label, STATUSES } from "@/lib/desk/config"
import type { Report } from "@/lib/desk/data"

type Ref = { id?: string; itemId?: string | null; title: string; link?: string | null; status?: string; owner?: string | null; deadline?: string | null; reason?: string | null }

function Links({ items, empty = "None.", showStatus = false }: { items?: Ref[]; empty?: string; showStatus?: boolean }) {
  if (!items?.length) return <p className="meta">{empty}</p>
  return (
    <ul>
      {items.map((item, n) => {
        const id = item.id ?? item.itemId
        return (
          <li key={n}>
            {item.link ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            ) : id ? (
              <Link href={`/desk/tracker/${id}`}>{item.title}</Link>
            ) : (
              item.title
            )}
            {showStatus && item.status && <span className="meta"> · {label(STATUSES, item.status)}</span>}
            {item.owner && <span className="meta"> · {item.owner}</span>}
            {item.deadline && <span className="meta"> · due {formatDay(item.deadline)}</span>}
            {item.reason && <div className="reason">Reason: {item.reason}</div>}
          </li>
        )
      })}
    </ul>
  )
}

function Text({ value, empty = "None." }: { value?: unknown; empty?: string }) {
  const text = typeof value === "string" ? value.trim() : ""
  return text ? <p className="pre">{text}</p> : <p className="meta">{empty}</p>
}

function LinkList({ links }: { links?: string[] }) {
  if (!links?.length) return <p className="meta">None.</p>
  return (
    <ul>
      {links.map((link) => (
        <li key={link}>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>
        </li>
      ))}
    </ul>
  )
}

// Shows a submitted report exactly as it was sent (its stored copy, not today's tracker)
export function ReportBody({ report }: { report: Report }) {
  const d = report.data as Record<string, never>
  switch (report.kind) {
    case "daily":
      return (
        <>
          <h2>Published</h2>
          <Links items={d.published} empty="Nothing published." />
          {(d.extraLinks as string[] | undefined)?.length ? <LinkList links={d.extraLinks} /> : null}
          <h2>Work progressed</h2>
          <ul>
            {((d.progressed as { id: string; title: string; from: string; to: string }[]) ?? []).map((p) => (
              <li key={p.id}>
                <Link href={`/desk/tracker/${p.id}`}>{p.title}</Link>
                <span className="meta"> · {p.from === p.to ? label(STATUSES, p.to) : `${label(STATUSES, p.from)} → ${label(STATUSES, p.to)}`}</span>
              </li>
            ))}
          </ul>
          {!(d.progressed as unknown[])?.length && !d.progressNotes && <p className="meta">Nothing recorded.</p>}
          {d.progressNotes && <Text value={d.progressNotes} />}
          <h2>Tomorrow’s top three priorities</h2>
          <ol>
            {((d.priorities as { itemId: string | null; title: string; note: string }[]) ?? []).map((p, n) => (
              <li key={n}>
                {p.itemId ? <Link href={`/desk/tracker/${p.itemId}`}>{p.title}</Link> : p.title}
                {p.note && <span className="meta"> · {p.note}</span>}
              </li>
            ))}
          </ol>
          <h2>Risks or delays</h2>
          <Text value={d.risks} />
          <h2>Decision or support needed from the CEO</h2>
          <Text value={d.ceoAsk} />
        </>
      )
    case "weekly_plan":
      return (
        <>
          <h2>Deliverables ({(d.deliverables as unknown[])?.length ?? 0})</h2>
          <div className="table-wrap">
            <table className="stack">
              <thead>
                <tr>
                  <th>Deliverable</th>
                  <th>Format / platforms</th>
                  <th>Owner</th>
                  <th>Deadline</th>
                  <th>Success measure</th>
                </tr>
              </thead>
              <tbody>
                {((d.deliverables as (Ref & { format: string | null; platforms: string[]; measure: string | null })[]) ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/desk/tracker/${row.id}`}>{row.title}</Link>
                    </td>
                    <td data-label="Format">{[row.format, row.platforms?.join(", ")].filter(Boolean).join(" · ") || "—"}</td>
                    <td data-label="Owner">{row.owner || "—"}</td>
                    <td data-label="Deadline">{row.deadline ? formatDay(row.deadline) : "—"}</td>
                    <td data-label="Success measure">{row.measure || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>Notes</h2>
          <Text value={d.notes} />
        </>
      )
    case "weekly_report": {
      const delivered = (d.delivered as Ref[]) ?? []
      return (
        <>
          <p>
            <strong>
              {delivered.length} of {d.planned ?? 0} planned deliverables delivered
            </strong>
            {(d.unplanned as Ref[])?.length ? `, plus ${(d.unplanned as Ref[]).length} not in the plan` : ""}.
          </p>
          <h2>Delivered as planned</h2>
          <Links items={delivered} />
          <h2>Delivered, not in the plan</h2>
          <Links items={d.unplanned} />
          <h2>Still in progress</h2>
          <Links items={d.inProgress} showStatus />
          <h2>Moved</h2>
          <Links items={d.moved} />
          <h2>Missed</h2>
          <Links items={d.missed} />
          {(d.dropped as Ref[])?.length ? (
            <>
              <h2>Dropped</h2>
              <Links items={d.dropped} />
            </>
          ) : null}
          <h2>Audience or editorial signals</h2>
          <Text value={d.signals} />
          <h2>Decisions needed</h2>
          <Text value={d.decisions} />
          {d.notes && (
            <>
              <h2>Notes</h2>
              <Text value={d.notes} />
            </>
          )}
        </>
      )
    }
    case "scorecard":
      return (
        <>
          <h2>Targets and actual delivery</h2>
          {(d.rows as unknown[])?.length ? (
            <div className="table-wrap">
              <table className="stack">
                <thead>
                  <tr>
                    <th>Measure</th>
                    <th className="num">Target</th>
                    <th className="num">Actual</th>
                    <th className="num">Of target</th>
                  </tr>
                </thead>
                <tbody>
                  {((d.rows as { label: string; target: number; actual: number | null; unit: string }[]) ?? []).map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td className="num" data-label="Target">
                        {row.target}
                        {row.unit}
                      </td>
                      <td className="num" data-label="Actual">
                        {row.actual === null ? "Not entered" : `${row.actual}${row.unit}`}
                      </td>
                      <td className="num" data-label="Of target">
                        {row.actual === null || !row.target ? "—" : `${Math.round((row.actual / row.target) * 100)}%`}
                        {row.actual !== null && row.actual >= row.target ? " · met" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="meta">No targets were set for this month.</p>
          )}
          <h2>Publishing timeliness</h2>
          <p>
            {d.onTime === null ? "No delivered items had a deadline." : `${d.onTime}% delivered on or before deadline.`} {d.delivered ?? 0} items delivered;{" "}
            {d.webStories ?? "—"} stories published on the website.
          </p>
          {(d.late as Ref[])?.length ? (
            <>
              <p className="meta">Delivered late:</p>
              <Links items={d.late} />
            </>
          ) : null}
          <h2>Corrections or quality issues</h2>
          <Text value={d.quality} />
          <h2>Audience performance</h2>
          <Text value={d.audience} />
          <h2>Evidence</h2>
          <LinkList links={d.evidence} />
          {d.notes && (
            <>
              <h2>Notes</h2>
              <Text value={d.notes} />
            </>
          )}
        </>
      )
    case "next_month":
      return (
        <>
          <h2>Proposed targets</h2>
          <ul>
            {((d.targets as { label: string; target: number; metric: string }[]) ?? []).map((t) => (
              <li key={t.label}>
                {t.label}: <strong>{t.target}{t.metric === "on_time" ? "%" : ""}</strong>
              </li>
            ))}
          </ul>
          <p className="meta">
            <Link href={`/desk/targets?month=${report.period_start}`}>See whether they’ve been agreed</Link>
          </p>
          <h2>Priority stories and projects</h2>
          <Links items={d.priorities} />
          <h2>Documentary milestones</h2>
          {(d.milestones as unknown[])?.length ? (
            <ul>
              {((d.milestones as { name: string; project: string; due: string | null; owner: string | null; risk: string | null }[]) ?? []).map((m, n) => (
                <li key={n}>
                  {m.project}: {m.name}
                  {m.due && <span className="meta"> · {formatDay(m.due)}</span>}
                  {m.owner && <span className="meta"> · {m.owner}</span>}
                  {m.risk && <div className="reason">Risk: {m.risk}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="meta">None due.</p>
          )}
          <h2>Support or decisions needed</h2>
          <Text value={d.support} />
          {d.notes && (
            <>
              <h2>Notes</h2>
              <Text value={d.notes} />
            </>
          )}
        </>
      )
  }
}

export function reportPeriod(report: Pick<Report, "kind" | "period_start">) {
  if (report.kind === "scorecard" || report.kind === "next_month") return formatMonth(report.period_start)
  if (report.kind === "daily") return formatDay(report.period_start)
  return `Week of ${formatDay(report.period_start)}`
}
