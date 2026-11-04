import Link from "next/link"

import { decideAction, raiseDecisionAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { requireDeskUser } from "@/lib/desk/auth"
import { formatDay, formatStamp, todayISO } from "@/lib/desk/config"
import { decisions, openItems, type Decision } from "@/lib/desk/data"

export default async function Decisions() {
  const user = await requireDeskUser()
  const isCeo = user.role === "ceo"
  const [open, decided, items] = await Promise.all([decisions("open"), decisions("decided", 50), isCeo ? Promise.resolve([]) : openItems()])
  const today = todayISO()

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">Decisions</span>
          <h1 style={{ marginTop: 6 }}>Decisions and support</h1>
          <p className="meta">
            What the Managing Editor needs from the CEO. Requests written in reports land here too.
          </p>
        </div>
      </div>

      <div className="columns wide-left">
        <section>
          <div className="section-head">
            <h2>Waiting for the CEO</h2>
            <span className="meta">{open.length}</span>
          </div>
          {open.length === 0 ? (
            <div className="empty">Nothing waiting.</div>
          ) : (
            <ul className="rows">
              {open.map((d) => (
                <li key={d.id}>
                  <div>
                    <DecisionText d={d} today={today} />
                    {isCeo && (
                      <ActionForm action={decideAction} resetOnSuccess>
                        <input type="hidden" name="id" value={d.id} />
                        <label htmlFor={`answer-${d.id}`}>Your decision or reply</label>
                        <textarea id={`answer-${d.id}`} name="answer" required style={{ minHeight: 70 }} />
                        <FormFooter>
                          <SubmitButton className="button small dark">Record decision</SubmitButton>
                        </FormFooter>
                      </ActionForm>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="section-head">
            <h2>Decided</h2>
          </div>
          {decided.length === 0 ? (
            <p className="meta">No decisions recorded yet.</p>
          ) : (
            <ul className="rows">
              {decided.map((d) => (
                <li key={d.id}>
                  <div>
                    <DecisionText d={d} today={today} />
                    <div className="review-box">
                      <strong>{d.decided_by_name}</strong>, {formatStamp(d.decided_at!)}
                      <p className="pre">{d.answer}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {!isCeo && (
          <section>
            <div className="section-head">
              <h2>Ask the CEO</h2>
            </div>
            <ActionForm action={raiseDecisionAction} resetOnSuccess>
              <label htmlFor="question">What do you need decided or supported?</label>
              <textarea id="question" name="question" required />
              <label htmlFor="context">Background (optional)</label>
              <textarea id="context" name="context" style={{ minHeight: 70 }} />
              <label htmlFor="item_id">Related item (optional)</label>
              <select id="item_id" name="item_id" defaultValue="">
                <option value="">None</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title.slice(0, 80)}
                  </option>
                ))}
              </select>
              <label htmlFor="due">Needed by (optional)</label>
              <input id="due" name="due" type="date" />
              <FormFooter>
                <SubmitButton>Send to the CEO</SubmitButton>
              </FormFooter>
            </ActionForm>
          </section>
        )}
      </div>
    </>
  )
}

function DecisionText({ d, today }: { d: Decision; today: string }) {
  return (
    <>
      <p style={{ margin: 0, fontWeight: "bold" }} className="pre">
        {d.question}
      </p>
      {d.context && <p className="pre meta">{d.context}</p>}
      <div className="detail">
        {d.raised_by_name}, {formatStamp(d.raised_at)}
        {d.due && (
          <>
            {" "}
            · <span className={d.status === "open" && d.due < today ? "tag overdue" : undefined}>needed by {formatDay(d.due)}</span>
          </>
        )}
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
    </>
  )
}
