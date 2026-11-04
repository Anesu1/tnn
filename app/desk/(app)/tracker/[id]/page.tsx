import Link from "next/link"
import { notFound } from "next/navigation"

import { addMilestoneAction, archiveItemAction, deleteMilestoneAction, toggleMilestoneAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { ItemForm } from "@/components/desk/item-form"
import { Comments, HistoryList, ItemTags } from "@/components/desk/ui"
import { requireDeskUser } from "@/lib/desk/auth"
import { formatDay, formatMonth, formatStamp, formatWeek, label, PIPELINE_KINDS, PLATFORMS, PRIORITIES, todayISO } from "@/lib/desk/config"
import { commentsFor, getItem, history, milestonesFor, people } from "@/lib/desk/data"
import { recentWebStories } from "@/lib/desk/sanity"

export default async function ItemPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireDeskUser()
  const { id } = await params
  const { saved } = await searchParams
  const item = await getItem(id)
  if (!item || item.archived) notFound()

  const isEditor = user.role === "editor"
  const [milestones, comments, changes, names, stories] = await Promise.all([
    milestonesFor(item.id),
    commentsFor("item", item.id),
    history({ entity: "item", entityId: item.id, limit: 50 }),
    isEditor ? people() : Promise.resolve([]),
    isEditor ? recentWebStories().catch(() => []) : Promise.resolve([]),
  ])
  const showMilestones = PIPELINE_KINDS.includes(item.kind as never) || milestones.length > 0
  const today = todayISO()

  return (
    <>
      <p className="meta">
        <Link href="/desk/tracker">Tracker</Link> /
      </p>
      <div className="page-head">
        <div>
          <h1 style={{ marginTop: 6 }}>{item.title}</h1>
          <ItemTags item={item} />
          <p className="meta">
            Added {formatStamp(item.created_at)} · last changed {formatStamp(item.updated_at)}
            {item.planned_week && ` · planned for ${formatWeek(item.planned_week).toLowerCase()}`}
            {item.planned_month && ` · priority for ${formatMonth(item.planned_month)}`}
          </p>
        </div>
      </div>
      {saved && (
        <div className="notice success" role="status">
          Saved. The dashboard and reports now show this update.
        </div>
      )}

      <div className="columns wide-left">
        <div>
          {isEditor ? (
            <ItemForm item={item} people={names} stories={stories} />
          ) : (
            <dl className="card details">
              <Detail name="Deadline" value={item.deadline ? formatDay(item.deadline) : null} />
              <Detail name="Format" value={item.format} />
              <Detail name="Platforms" value={item.platforms.map((p) => label(PLATFORMS, p)).join(", ")} />
              <Detail name="Priority" value={label(PRIORITIES, item.priority)} />
              <Detail name="Lead" value={item.lead} />
              <Detail name="Owner" value={item.owner} />
              <Detail name="Contributors" value={item.contributors} />
              <Detail name="Next action" value={item.next_action} />
              <Detail name="Blocked by" value={item.blocked ? item.blocker : null} />
              <Detail name="Risks" value={item.risk} />
              <Detail name="Success measure" value={item.success_measure} />
              <Detail name="Delivered" value={item.completed_at ? formatStamp(item.completed_at) : null} />
              <div>
                <dt>Published link or evidence</dt>
                <dd>
                  {item.evidence_url ? (
                    <a href={item.evidence_url} target="_blank" rel="noopener noreferrer">
                      {item.evidence_url}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          )}
        </div>

        <div>
          {showMilestones && (
            <section>
              <div className="section-head">
                <h2>Milestones</h2>
                <span className="meta">
                  {milestones.filter((m) => m.done_at).length} of {milestones.length} met
                </span>
              </div>
              {milestones.length === 0 ? (
                <p className="meta">No milestones yet.</p>
              ) : (
                <ul className="rows">
                  {milestones.map((m) => {
                    const late = !m.done_at && m.due && m.due < today
                    return (
                      <li key={m.id}>
                        <div>
                          <span className="title" style={m.done_at ? { textDecoration: "line-through" } : undefined}>
                            {m.name}
                          </span>
                          <span className="tags">
                            {m.done_at ? <span className="tag status-published">Met {formatDay(m.done_on!)}</span> : late ? <span className="tag overdue">Overdue</span> : null}
                          </span>
                          <div className="detail">
                            {[m.due && `Due ${formatDay(m.due)}`, m.owner].filter(Boolean).join(" · ")}
                          </div>
                          {m.risk && <div className="reason">Risk: {m.risk}</div>}
                        </div>
                        {isEditor && (
                          <div className="side">
                            <form action={toggleMilestoneAction}>
                              <input type="hidden" name="id" value={m.id} />
                              <button className="button small outline">{m.done_at ? "Reopen" : "Mark met"}</button>
                            </form>
                            <form action={deleteMilestoneAction}>
                              <input type="hidden" name="id" value={m.id} />
                              <button className="link-button danger">Remove</button>
                            </form>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
              {isEditor && (
                <ActionForm action={addMilestoneAction} resetOnSuccess>
                  <input type="hidden" name="item_id" value={item.id} />
                  <label htmlFor="m-name">Add a milestone</label>
                  <input id="m-name" name="name" maxLength={200} placeholder="e.g. Rough cut ready" required />
                  <div className="grid-2">
                    <label>
                      Due
                      <input name="due" type="date" />
                    </label>
                    <label>
                      Owner
                      <input name="owner" list="desk-people" maxLength={120} />
                    </label>
                  </div>
                  <label>
                    Risk
                    <input name="risk" maxLength={500} />
                  </label>
                  <FormFooter>
                    <SubmitButton className="button outline">Add milestone</SubmitButton>
                  </FormFooter>
                </ActionForm>
              )}
            </section>
          )}

          <Comments entity="item" entityId={item.id} comments={comments} />

          <div className="section-head">
            <h2>History</h2>
          </div>
          <HistoryList rows={changes} />

          {isEditor && (
            <form action={archiveItemAction} style={{ marginTop: 24 }}>
              <input type="hidden" name="id" value={item.id} />
              <button className="link-button danger">Archive this item</button>
              <span className="meta"> It disappears from lists but stays in the history.</span>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

function Detail({ name, value }: { name: string; value: string | null | undefined }) {
  return (
    <div>
      <dt>{name}</dt>
      <dd className="pre">{value || "—"}</dd>
    </div>
  )
}
