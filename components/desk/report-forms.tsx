import Link from "next/link"

import {
  submitDailyAction,
  submitNextMonthAction,
  submitScorecardAction,
  submitWeeklyPlanAction,
  submitWeeklyReportAction,
} from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import { NewItemRows, PlatformChecks, TargetRows } from "@/components/desk/repeat-rows"
import { ItemTags, Meter } from "@/components/desk/ui"
import { formatDay, formatMonth, formatWeek, METRICS, STATUSES } from "@/lib/desk/config"
import type { Actuals, Item, Milestone, Target, TargetSet } from "@/lib/desk/data"
import { actualFor } from "@/lib/desk/data"

function StatusSelect({ item }: { item: Item }) {
  return (
    <>
      <label className="visually-hidden" htmlFor={`status_${item.id}`}>
        Status of {item.title}
      </label>
      <select id={`status_${item.id}`} name={`status_${item.id}`} defaultValue={item.status}>
        {Object.entries(STATUSES).map(([value, name]) => (
          <option key={value} value={value}>
            {name}
          </option>
        ))}
      </select>
    </>
  )
}

// ----- Daily Editorial Update -----

export function DailyForm({ date, published, open }: { date: string; published: { title: string; url: string | null }[]; open: Item[] }) {
  return (
    <ActionForm action={submitDailyAction} className="form">
      <label htmlFor="period">Date</label>
      <input id="period" name="period" type="date" defaultValue={date} required style={{ maxWidth: 220 }} />

      <section className="form-section">
        <h2>Published today</h2>
        <p className="hint">Filled in from the website and from tracker items marked published on this date.</p>
        {published.length === 0 ? (
          <p className="meta">Nothing yet for {formatDay(date)}.</p>
        ) : (
          <ul>
            {published.map((p, n) => (
              <li key={n}>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.title}
                  </a>
                ) : (
                  p.title
                )}
              </li>
            ))}
          </ul>
        )}
        <label htmlFor="extra_links">
          Other links published today
          <span className="hint">YouTube, Facebook, Instagram and so on. One link per line.</span>
        </label>
        <textarea id="extra_links" name="extra_links" style={{ minHeight: 70 }} placeholder="https://" />
      </section>

      <section className="form-section">
        <h2>Work progressed</h2>
        <p className="hint">Tick what moved forward today. Changing a status here updates the tracker too.</p>
        {open.length === 0 ? (
          <p className="meta">
            No open items in the tracker. <Link href="/desk/tracker/new">Add one</Link>.
          </p>
        ) : (
          <ul className="pick">
            {open.map((item) => (
              <li key={item.id}>
                <div className="pick-top">
                  <input type="checkbox" id={`progressed_${item.id}`} name={`progressed_${item.id}`} aria-label={`${item.title} progressed today`} />
                  <label htmlFor={`progressed_${item.id}`} style={{ margin: 0, fontWeight: "normal" }}>
                    <span className="title">{item.title}</span>
                    <ItemTags item={item} />
                  </label>
                  <StatusSelect item={item} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <label htmlFor="progress_notes">Notes on progress (optional)</label>
        <textarea id="progress_notes" name="progress_notes" style={{ minHeight: 70 }} />
      </section>

      <section className="form-section">
        <h2>Tomorrow’s top three priorities</h2>
        {[1, 2, 3].map((n) => (
          <div className="grid-2" key={n}>
            <label>
              Priority {n}
              <select name={`priority_item_${n}`} defaultValue="">
                <option value="">Choose from the tracker…</option>
                {open.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title.slice(0, 70)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="visually-hidden">Priority {n}: </span>Or type it (or add a note)
              <input name={`priority_text_${n}`} maxLength={300} />
            </label>
          </div>
        ))}
      </section>

      <section className="form-section">
        <h2>Risks and decisions</h2>
        <label htmlFor="risks">
          Risks or delays
          <span className="hint">Shown to the CEO on the dashboard for a week.</span>
        </label>
        <textarea id="risks" name="risks" />
        <label htmlFor="ceo_ask">
          Decision or support needed from the CEO
          <span className="hint">Leave empty if none. Anything written here goes to the CEO’s decision list.</span>
        </label>
        <textarea id="ceo_ask" name="ceo_ask" />
      </section>

      <FormFooter sticky>
        <SubmitButton pendingLabel="Submitting…">Submit daily update</SubmitButton>
      </FormFooter>
    </ActionForm>
  )
}

// ----- Weekly Plan (Monday) -----

export function WeeklyPlanForm({ monday, open, people }: { monday: string; open: Item[]; people: string[] }) {
  return (
    <ActionForm action={submitWeeklyPlanAction} className="form full">
      <input type="hidden" name="period" value={monday} />
      <p className="meta">{formatWeek(monday)}. Tick what the team will deliver this week, then confirm the details.</p>

      <section className="form-section">
        <h2>From the tracker</h2>
        {open.length === 0 ? (
          <p className="meta">No open items yet. Add new deliverables below.</p>
        ) : (
          <ul className="pick">
            {open.map((item) => (
              <li key={item.id}>
                <div className="pick-top" style={{ gridTemplateColumns: "auto minmax(0, 1fr)" }}>
                  <input
                    type="checkbox"
                    className="include"
                    id={`include_${item.id}`}
                    name={`include_${item.id}`}
                    defaultChecked={item.planned_week === monday}
                    aria-label={`Include ${item.title} this week`}
                  />
                  <label htmlFor={`include_${item.id}`} style={{ margin: 0, fontWeight: "normal" }}>
                    <span className="title">{item.title}</span>
                    <ItemTags item={item} />
                  </label>
                </div>
                <div className="pick-more">
                  <div className="grid-3">
                    <label>
                      Format
                      <input name={`format_${item.id}`} defaultValue={item.format ?? ""} maxLength={120} />
                    </label>
                    <label>
                      Owner
                      <input name={`owner_${item.id}`} defaultValue={item.owner ?? ""} list="desk-people" maxLength={120} />
                    </label>
                    <label>
                      Deadline
                      <input name={`deadline_${item.id}`} type="date" defaultValue={item.deadline ?? ""} />
                    </label>
                  </div>
                  <label>
                    Success measure
                    <input name={`measure_${item.id}`} defaultValue={item.success_measure ?? ""} maxLength={300} placeholder="What does good look like?" />
                  </label>
                  <input type="hidden" name={`platforms_${item.id}_present`} value="1" />
                  <PlatformChecks name={`platforms_${item.id}`} selected={item.platforms} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="form-section">
        <h2>New this week</h2>
        <p className="hint">Each one is added to the tracker. Leave the title empty to skip a row.</p>
        <NewItemRows people={people} start={open.length ? 1 : 3} />
      </section>

      <label htmlFor="notes">Notes for the CEO (optional)</label>
      <textarea id="notes" name="notes" />

      <FormFooter sticky>
        <SubmitButton pendingLabel="Submitting…">Submit weekly plan</SubmitButton>
      </FormFooter>
    </ActionForm>
  )
}

// ----- Weekly Delivery Report (Friday) -----

type Week = { monday: string; planned: Item[]; delivered: Item[]; unplanned: Item[]; inProgress: Item[]; moved: Item[]; missed: Item[]; dropped: Item[] }

function WeekList({ title, items, note }: { title: string; items: Item[]; note?: string }) {
  return (
    <section className="form-section">
      <h2>
        {title} <span className="meta">({items.length})</span>
      </h2>
      {note && <p className="hint">{note}</p>}
      {items.length === 0 ? (
        <p className="meta">None.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/desk/tracker/${item.id}`}>{item.title}</Link>
              {item.evidence_url && (
                <>
                  {" "}
                  ·{" "}
                  <a href={item.evidence_url} target="_blank" rel="noopener noreferrer">
                    link
                  </a>
                </>
              )}
              {item.deadline && <span className="meta"> · due {formatDay(item.deadline)}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function WeeklyReportForm({ week }: { week: Week }) {
  const needReasons = [...week.moved, ...week.missed]
  return (
    <ActionForm action={submitWeeklyReportAction} className="form">
      <input type="hidden" name="period" value={week.monday} />
      <p className="meta">
        {formatWeek(week.monday)}. Worked out from the weekly plan and the tracker. If something is wrong, update the item in the{" "}
        <Link href="/desk/tracker">tracker</Link> and reload this page.
      </p>
      <div className="card" style={{ marginTop: 12 }}>
        {week.planned.length ? (
          <Meter name="Planned deliverables delivered" actual={week.delivered.length} target={week.planned.length} />
        ) : (
          <p className="meta">There was no weekly plan for this week.</p>
        )}
      </div>

      <WeekList title="Delivered as planned" items={week.delivered} />
      <WeekList title="Delivered, not in the plan" items={week.unplanned} />
      <WeekList title="Still in progress" items={week.inProgress} />

      <section className="form-section">
        <h2>
          Moved or missed <span className="meta">({needReasons.length})</span>
        </h2>
        <p className="hint">“Moved” means the deadline is now after this week; “missed” means the deadline passed without delivery. Give a short reason for each.</p>
        {needReasons.length === 0 ? (
          <p className="meta">Nothing moved or missed.</p>
        ) : (
          needReasons.map((item) => (
            <label key={item.id}>
              {item.title}{" "}
              <span className="hint">
                {week.moved.includes(item) ? `Moved to ${formatDay(item.deadline!)}` : `Missed, was due ${formatDay(item.deadline!)}`}
              </span>
              <input name={`reason_${item.id}`} maxLength={500} required />
            </label>
          ))
        )}
        {week.dropped.map((item) => (
          <label key={item.id}>
            {item.title} <span className="hint">Dropped. Reason (optional)</span>
            <input name={`reason_${item.id}`} maxLength={500} />
          </label>
        ))}
      </section>

      <section className="form-section">
        <h2>Signals and decisions</h2>
        <label htmlFor="signals">
          Audience or editorial signals
          <span className="hint">What performed well or badly, feedback, reactions, anything learned.</span>
        </label>
        <textarea id="signals" name="signals" />
        <label htmlFor="decisions">
          Decisions needed from the CEO
          <span className="hint">Leave empty if none. Goes to the CEO’s decision list.</span>
        </label>
        <textarea id="decisions" name="decisions" />
        <label htmlFor="notes">Other notes (optional)</label>
        <textarea id="notes" name="notes" />
      </section>

      <FormFooter sticky>
        <SubmitButton pendingLabel="Submitting…">Submit weekly report</SubmitButton>
      </FormFooter>
    </ActionForm>
  )
}

// ----- Monthly Scorecard -----

export function ScorecardForm({ month, targets, set, actuals }: { month: string; targets: Target[]; set: TargetSet | null; actuals: Actuals }) {
  return (
    <ActionForm action={submitScorecardAction} className="form">
      <input type="hidden" name="period" value={month} />
      <p className="meta">
        {formatMonth(month)}.{" "}
        {set?.status === "agreed" ? "Targets agreed by the CEO." : targets.length ? "These targets were never agreed." : ""}
      </p>

      <section className="form-section">
        <h2>Targets and actual delivery</h2>
        {targets.length === 0 ? (
          <p className="meta">
            No targets were set for {formatMonth(month)}. <Link href={`/desk/targets?month=${month}`}>Add them</Link> to compare, or submit the scorecard without.
          </p>
        ) : (
          targets.map((t) =>
            METRICS[t.metric]?.auto ? (
              <Meter key={t.id} name={t.label} actual={actualFor(t, actuals)} target={Number(t.target)} unit={METRICS[t.metric].unit} note="counted automatically" />
            ) : (
              <label key={t.id}>
                {t.label}
                <span className="hint">Target {Number(t.target)}. Enter the actual figure.</span>
                <input name={`actual_${t.id}`} inputMode="decimal" defaultValue={t.manual_actual ?? ""} style={{ maxWidth: 200 }} />
              </label>
            ),
          )
        )}
      </section>

      <section className="form-section">
        <h2>Publishing timeliness</h2>
        <p>
          {actuals.on_time === null
            ? "No delivered items had a deadline this month."
            : `${actuals.on_time}% delivered on or before deadline (${actuals.late.length} late of ${actuals.deliveredItems.filter((i) => i.deadline).length} with a deadline).`}
        </p>
        {actuals.late.length > 0 && (
          <ul>
            {actuals.late.map((i) => (
              <li key={i.id}>
                {i.title}: due {formatDay(i.deadline!)}, delivered {formatDay(i.completed_on!)}
              </li>
            ))}
          </ul>
        )}
        <p className="meta">
          {actuals.delivered} items delivered in the tracker; {actuals.web_stories ?? "—"} stories published on the website.
        </p>
      </section>

      <section className="form-section">
        <h2>Quality, audience and evidence</h2>
        <label htmlFor="quality">
          Corrections or quality issues
          <span className="hint">What went wrong and what was done about it.</span>
        </label>
        <textarea id="quality" name="quality" />
        <label htmlFor="audience">Audience performance</label>
        <textarea id="audience" name="audience" placeholder="Page views, video views, follower growth, top performers…" />
        <label htmlFor="evidence">
          Evidence links
          <span className="hint">Analytics screenshots, reports, published work. One link per line.</span>
        </label>
        <textarea id="evidence" name="evidence" placeholder="https://" />
        <label htmlFor="notes">Other notes (optional)</label>
        <textarea id="notes" name="notes" />
      </section>

      <FormFooter sticky>
        <SubmitButton pendingLabel="Submitting…">Submit scorecard</SubmitButton>
      </FormFooter>
    </ActionForm>
  )
}

// ----- Next Month's Plan -----

export function NextMonthForm({
  month,
  initialTargets,
  locked,
  open,
  milestones,
  people,
}: {
  month: string
  initialTargets: { metric: string; label: string; target: string }[]
  locked: boolean
  open: Item[]
  milestones: Milestone[]
  people: string[]
}) {
  return (
    <ActionForm action={submitNextMonthAction} className="form full">
      <input type="hidden" name="period" value={month} />
      <p className="meta">{formatMonth(month)}. Submitting sends the targets to the CEO to agree.</p>

      <section className="form-section">
        <h2>Proposed targets</h2>
        <p className="hint">Measures marked “counted automatically” fill themselves in from the tracker and website.</p>
        {locked ? (
          <p className="notice">The targets for {formatMonth(month)} are already agreed. Ask the CEO to unlock them to change them.</p>
        ) : (
          <TargetRows initial={initialTargets} />
        )}
      </section>

      <section className="form-section">
        <h2>Priority stories and projects</h2>
        <ul className="pick">
          {open.map((item) => (
            <li key={item.id}>
              <div className="pick-top" style={{ gridTemplateColumns: "auto minmax(0, 1fr)" }}>
                <input type="checkbox" id={`include_${item.id}`} name={`include_${item.id}`} defaultChecked={item.planned_month === month} aria-label={`Priority for ${formatMonth(month)}: ${item.title}`} />
                <label htmlFor={`include_${item.id}`} style={{ margin: 0, fontWeight: "normal" }}>
                  <span className="title">{item.title}</span>
                  <ItemTags item={item} />
                  {item.owner && <span className="meta"> Owner: {item.owner}</span>}
                </label>
              </div>
            </li>
          ))}
        </ul>
        <h3 style={{ marginTop: 16 }}>New priorities</h3>
        <NewItemRows people={people} />
      </section>

      <section className="form-section">
        <h2>Documentary milestones due</h2>
        <p className="hint">
          From the <Link href="/desk/pipeline">pipeline</Link>. Add or change milestones on each project’s page.
        </p>
        {milestones.length === 0 ? (
          <p className="meta">No milestones due in {formatMonth(month)}.</p>
        ) : (
          <ul>
            {milestones.map((m) => (
              <li key={m.id}>
                {m.item_title}: {m.name} · {m.due ? formatDay(m.due) : "no date"}
                {m.owner ? ` · ${m.owner}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="form-section">
        <label htmlFor="support">
          Support or decisions needed from the CEO
          <span className="hint">Leave empty if none. Goes to the CEO’s decision list.</span>
        </label>
        <textarea id="support" name="support" />
        <label htmlFor="notes">Other notes (optional)</label>
        <textarea id="notes" name="notes" />
      </section>

      <FormFooter sticky>
        <SubmitButton pendingLabel="Submitting…" disabled={locked}>
          Submit plan and propose targets
        </SubmitButton>
      </FormFooter>
    </ActionForm>
  )
}

