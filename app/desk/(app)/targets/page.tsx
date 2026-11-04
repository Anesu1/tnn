import Link from "next/link"

import { agreeTargetsAction, saveTargetsAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { PrintButton } from "@/components/desk/print-button"
import { TargetRows } from "@/components/desk/repeat-rows"
import { Comments, Meter } from "@/components/desk/ui"
import { requireDeskUser } from "@/lib/desk/auth"
import { addMonths, formatMonth, formatStamp, isISODate, METRICS, monthStart, todayISO } from "@/lib/desk/config"
import { actualFor, commentsFor, monthActuals, targetSet } from "@/lib/desk/data"

const STATUS_TEXT = {
  draft: "Draft. Not yet sent to the CEO.",
  proposed: "Proposed by the Managing Editor, waiting for the CEO to agree.",
  agreed: "Agreed and locked.",
  changes_requested: "Sent back by the CEO for changes.",
}

export default async function Targets({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const user = await requireDeskUser()
  const requested = (await searchParams).month
  const month = monthStart(requested && isISODate(requested) ? requested : todayISO())
  const [{ set, targets }, actuals, comments] = await Promise.all([targetSet(month), monthActuals(month), commentsFor("targets", month)])
  const isEditor = user.role === "editor"
  const locked = set?.status === "agreed"

  return (
    <>
      <div className="page-head">
        <div>
          <span className="label">Monthly targets</span>
          <h1 style={{ marginTop: 6 }}>{formatMonth(month)}</h1>
          <p className="meta">
            <Link href={`/desk/targets?month=${addMonths(month, -1)}`}>← {formatMonth(addMonths(month, -1))}</Link> ·{" "}
            <Link href={`/desk/targets?month=${addMonths(month, 1)}`}>{formatMonth(addMonths(month, 1))} →</Link>
          </p>
        </div>
        <div className="actions">
          <PrintButton />
        </div>
      </div>

      <div className={set?.status === "agreed" ? "notice success" : "notice"} role="status">
        <strong>{set ? STATUS_TEXT[set.status] : "No targets yet for this month."}</strong>
        {set?.agreed_at && ` ${set.agreed_by_name}, ${formatStamp(set.agreed_at)}.`}
        {set?.note && <p className="pre">CEO’s note: {set.note}</p>}
      </div>

      <div className="columns">
        <section>
          <div className="section-head">
            <h2>Target against actual</h2>
          </div>
          {targets.length === 0 ? (
            <div className="empty">Nothing to compare yet.</div>
          ) : (
            <div className="card" style={{ marginTop: 12 }}>
              {targets.map((t) => (
                <Meter
                  key={t.id}
                  name={t.label}
                  actual={actualFor(t, actuals)}
                  target={Number(t.target)}
                  unit={METRICS[t.metric]?.unit}
                  note={METRICS[t.metric]?.auto ? "counted automatically" : "entered in the scorecard"}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="section-head">
            <h2>{isEditor ? "Set the targets" : "Agree the targets"}</h2>
          </div>
          {isEditor ? (
            locked ? (
              <p className="meta">These targets are agreed and locked. Ask the CEO to unlock them if they need to change.</p>
            ) : (
              <ActionForm action={saveTargetsAction}>
                <input type="hidden" name="month" value={month} />
                <p className="hint" style={{ fontSize: 13 }}>
                  Choose what to measure and the number for the month. Usually done at the end of the previous month in Next Month’s Plan.
                </p>
                <TargetRows
                  key={targets.map((t) => t.id).join()}
                  initial={targets.map((t) => ({ metric: t.metric, label: t.metric === "custom" ? t.label : "", target: String(Number(t.target)) }))}
                />
                <FormFooter>
                  <SubmitButton name="intent" value="propose">
                    Send to the CEO to agree
                  </SubmitButton>
                  <SubmitButton name="intent" value="draft" className="button outline">
                    Save draft
                  </SubmitButton>
                </FormFooter>
              </ActionForm>
            )
          ) : !set || targets.length === 0 ? (
            <p className="meta">The Managing Editor hasn’t entered targets for this month yet.</p>
          ) : (
            <ActionForm action={agreeTargetsAction}>
              <input type="hidden" name="month" value={month} />
              <label htmlFor="note">
                Note
                <span className="hint">Needed when sending back or unlocking.</span>
              </label>
              <textarea id="note" name="note" />
              <FormFooter>
                {locked ? (
                  <SubmitButton name="outcome" value="unlock" className="button outline">
                    Unlock for changes
                  </SubmitButton>
                ) : (
                  <>
                    <SubmitButton name="outcome" value="agree" className="button dark">
                      Agree and lock
                    </SubmitButton>
                    <SubmitButton name="outcome" value="changes" className="button outline">
                      Send back for changes
                    </SubmitButton>
                  </>
                )}
              </FormFooter>
            </ActionForm>
          )}
          <Comments entity="targets" entityId={month} comments={comments} />
        </section>
      </div>
    </>
  )
}
