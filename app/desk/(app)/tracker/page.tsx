import Link from "next/link"

import { quickUpdateAction } from "@/app/desk/actions"
import { Filters } from "@/components/desk/filters"
import { PrintButton } from "@/components/desk/print-button"
import { ItemTags, itemDetail } from "@/components/desk/ui"
import { requireDeskUser } from "@/lib/desk/auth"
import { formatDay, STATUSES } from "@/lib/desk/config"
import { listItems, people } from "@/lib/desk/data"
import { readFilters } from "@/lib/desk/filters"

export default async function Tracker({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireDeskUser()
  const params = await searchParams
  const filters = readFilters(params, false)
  const [items, owners] = await Promise.all([listItems(filters, { includeClosed: params.closed === "1" }), people()])
  const isEditor = user.role === "editor"

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">Live Editorial Tracker</span>
          <h1 style={{ marginTop: 6 }}>Tracker</h1>
          <p className="meta">
            One record per story, video, show, documentary or special report. Reports and the dashboard read from here.
          </p>
        </div>
        <div className="actions">
          {isEditor && (
            <Link href="/desk/tracker/new" className="button">
              Add item
            </Link>
          )}
          <PrintButton />
        </div>
      </div>
      {params.archived && (
        <div className="notice success" role="status">
          Item archived. It stays in the history.
        </div>
      )}

      <Filters action="/desk/tracker" filters={filters} owners={owners} search />
      <p className="meta" style={{ marginTop: 8 }}>
        {items.length} {items.length === 1 ? "item" : "items"}
        {params.closed === "1" ? (
          <>
            {" "}
            · including dropped · <Link href={`/desk/tracker?${new URLSearchParams({ ...params, closed: "" } as Record<string, string>)}`}>Hide dropped</Link>
          </>
        ) : (
          <>
            {" "}
            · <Link href={`/desk/tracker?${new URLSearchParams({ ...params, closed: "1" } as Record<string, string>)}`}>Show dropped</Link>
          </>
        )}
      </p>

      {items.length === 0 ? (
        <div className="empty">
          {Object.values(filters).some(Boolean) ? "No items match these filters." : "Nothing in the tracker yet."}
          {isEditor && (
            <>
              {" "}
              <Link href="/desk/tracker/new">Add the first item</Link>.
            </>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="stack">
            <thead>
              <tr>
                <th>Item</th>
                <th>Deadline</th>
                <th>Next action / blocker</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link href={`/desk/tracker/${item.id}`}>{item.title}</Link>
                    <ItemTags item={item} />
                    <div className="meta">{itemDetail(item)}</div>
                  </td>
                  <td data-label="Deadline" className={item.overdue ? "error" : undefined} style={{ whiteSpace: "nowrap", margin: 0 }}>
                    {item.deadline ? formatDay(item.deadline) : "—"}
                  </td>
                  <td data-label={item.blocked ? "Blocked" : "Next"}>
                    {item.blocked ? <strong className="error" style={{ margin: 0 }}>{item.blocker}</strong> : item.next_action || "—"}
                    {item.evidence_url && (
                      <div>
                        <a href={item.evidence_url} target="_blank" rel="noopener noreferrer">
                          {item.status === "published" ? "View published" : "Evidence"}
                        </a>
                      </div>
                    )}
                  </td>
                  <td data-label="Status">
                    {isEditor ? (
                      <form action={quickUpdateAction} className="quick-status">
                        <input type="hidden" name="id" value={item.id} />
                        <label className="visually-hidden" htmlFor={`status-${item.id}`}>
                          Status of {item.title}
                        </label>
                        <select id={`status-${item.id}`} name="status" defaultValue={item.status}>
                          {Object.entries(STATUSES).map(([value, name]) => (
                            <option key={value} value={value}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <button className="button small outline">Update</button>
                      </form>
                    ) : (
                      STATUSES[item.status as keyof typeof STATUSES]
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
