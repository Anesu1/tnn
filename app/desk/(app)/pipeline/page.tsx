import Link from "next/link"

import { PrintButton } from "@/components/desk/print-button"
import { ItemTags } from "@/components/desk/ui"
import { requireDeskUser } from "@/lib/desk/auth"
import { formatDay, STAGES, todayISO } from "@/lib/desk/config"
import { pipeline } from "@/lib/desk/data"

export default async function Pipeline() {
  const user = await requireDeskUser()
  const projects = await pipeline()
  const today = todayISO()

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">Documentary and special-report pipeline</span>
          <h1 style={{ marginTop: 6 }}>Pipeline</h1>
          <p className="meta">Long-form projects by stage, with the next milestone for each.</p>
        </div>
        <div className="actions">
          {user.role === "editor" && (
            <Link href="/desk/tracker/new" className="button">
              Add a project
            </Link>
          )}
          <PrintButton />
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty">No documentaries or special reports in the tracker yet. Add one with the type “Documentary” or “Special report”.</div>
      ) : (
        <div className="table-wrap">
          <table className="stack">
            <thead>
              <tr>
                <th>Project</th>
                <th>Stage</th>
                <th>Next milestone</th>
                <th>Owner</th>
                <th>Due</th>
                <th>Risks</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(({ item, milestones, next }) => {
                const late = next?.due && next.due < today
                return (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/desk/tracker/${item.id}`}>{item.title}</Link>
                      <ItemTags item={item} />
                      <div className="meta">
                        {milestones.filter((m) => m.done_at).length} of {milestones.length} milestones met
                        {item.deadline && ` · release ${formatDay(item.deadline)}`}
                      </div>
                    </td>
                    <td data-label="Stage">{STAGES[item.stage as keyof typeof STAGES] ?? "—"}</td>
                    <td data-label="Next milestone">{next?.name ?? (item.status === "published" ? "Released" : "None set")}</td>
                    <td data-label="Owner">{next?.owner || item.owner || "—"}</td>
                    <td data-label="Due" style={{ whiteSpace: "nowrap" }}>
                      {next?.due ? <span className={late ? "tag overdue" : undefined}>{late ? `Overdue, ${formatDay(next.due)}` : formatDay(next.due)}</span> : "—"}
                    </td>
                    <td data-label="Risks" className="pre">
                      {[item.blocked && `Blocked: ${item.blocker}`, next?.risk, item.risk].filter(Boolean).join("\n") || "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
