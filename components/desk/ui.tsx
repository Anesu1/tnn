import Link from "next/link"

import { commentAction } from "@/app/desk/actions"
import { ActionForm, FormFooter, SubmitButton } from "@/components/desk/action-form"
import {
  formatDay,
  formatStamp,
  KINDS,
  label,
  PLATFORMS,
  PRIORITIES,
  STAGES,
  STATUSES,
} from "@/lib/desk/config"
import type { AuditRow, Comment, Item } from "@/lib/desk/data"

export function StatusTag({ status }: { status: string }) {
  return <span className={`tag status-${status}`}>{label(STATUSES, status)}</span>
}

// Status, type and any warnings. Problems are spelled out in words, never colour alone.
export function ItemTags({ item }: { item: Item }) {
  return (
    <span className="tags">
      <StatusTag status={item.status} />
      {item.overdue && <span className="tag overdue">Overdue</span>}
      {item.blocked && <span className="tag blocked">Blocked</span>}
      {item.priority === "high" && <span className="tag high">{PRIORITIES.high} priority</span>}
      <span className="tag">{label(KINDS, item.kind)}</span>
      {item.stage && <span className="tag">{label(STAGES, item.stage)}</span>}
    </span>
  )
}

export function itemDetail(item: Item) {
  return [
    item.owner && `Owner: ${item.owner}`,
    item.lead && item.lead !== item.owner && `Lead: ${item.lead}`,
    item.platforms.length > 0 && item.platforms.map((p) => label(PLATFORMS, p)).join(", "),
  ]
    .filter(Boolean)
    .join(" · ")
}

export function ItemRow({ item, children, showNext = true }: { item: Item; children?: React.ReactNode; showNext?: boolean }) {
  return (
    <li>
      <div>
        <Link href={`/desk/tracker/${item.id}`} className="title">
          {item.title}
        </Link>
        <ItemTags item={item} />
        {itemDetail(item) && <div className="detail">{itemDetail(item)}</div>}
        {item.blocked && item.blocker && <div className="reason">Blocked: {item.blocker}</div>}
        {showNext && item.next_action && !item.blocked && <div className="detail">Next: {item.next_action}</div>}
        {children}
      </div>
      <div className="side">
        {item.deadline ? (
          <span className={item.overdue ? "tag overdue" : undefined}>Due {formatDay(item.deadline)}</span>
        ) : (
          <span className="meta">No deadline</span>
        )}
        {item.evidence_url && (
          <div>
            <a href={item.evidence_url} target="_blank" rel="noopener noreferrer">
              {item.status === "published" ? "View published" : "Evidence"}
            </a>
          </div>
        )}
      </div>
    </li>
  )
}

export function Meter({ name, actual, target, unit = "", note }: { name: string; actual: number | null; target: number; unit?: string; note?: string }) {
  const share = actual === null || target <= 0 ? 0 : Math.min(actual / target, 1)
  const done = actual !== null && actual >= target
  return (
    <div className={done ? "meter done" : "meter"}>
      <div className="meter-head">
        <span>{name}</span>
        <strong>
          {actual === null ? "Not entered" : `${actual}${unit}`} / {target}
          {unit}
        </strong>
      </div>
      <div
        className="meter-track"
        role="meter"
        aria-label={name}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={actual ?? 0}
        aria-valuetext={actual === null ? "not entered yet" : `${actual}${unit} of ${target}${unit}`}
      >
        <div className="meter-fill" style={{ width: `${Math.round(share * 100)}%` }} />
      </div>
      <span className="meta">{done ? "Target met" : actual === null ? "Enter this figure in the monthly scorecard" : `${Math.round(share * 100)}% of target`}{note ? ` · ${note}` : ""}</span>
    </div>
  )
}

export function Tile({ name, value, note, href, tone }: { name: string; value: number | string; note?: string; href?: string; tone?: "good" | "alert" }) {
  const body = (
    <>
      <span className="name">{name}</span>
      <span className="value">{value}</span>
      {note && <span className="meta">{note}</span>}
    </>
  )
  const className = tone ? `tile ${tone}` : "tile"
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

export function Comments({ entity, entityId, comments }: { entity: string; entityId: string; comments: Comment[] }) {
  return (
    <section>
      <div className="section-head">
        <h2>Comments</h2>
        <span className="meta">{comments.length}</span>
      </div>
      {comments.length === 0 ? (
        <p className="meta">No comments yet.</p>
      ) : (
        <ul className="comments">
          {comments.map((c) => (
            <li key={c.id} className={c.role}>
              <strong>{c.user_name}</strong> <span className="meta">{formatStamp(c.created_at)}</span>
              <p className="pre">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      <ActionForm action={commentAction} resetOnSuccess>
        <input type="hidden" name="entity" value={entity} />
        <input type="hidden" name="entity_id" value={entityId} />
        <label htmlFor={`comment-${entityId}`}>Add a comment</label>
        <textarea id={`comment-${entityId}`} name="body" maxLength={3000} required />
        <FormFooter>
          <SubmitButton className="button outline">Post comment</SubmitButton>
        </FormFooter>
      </ActionForm>
    </section>
  )
}

const FIELD_NAMES: Record<string, string> = {
  next_action: "next action",
  evidence_url: "evidence link",
  success_measure: "success measure",
  planned_week: "planned week",
  planned_month: "planned month",
  sanity_id: "website story",
}

function showValue(field: string, value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (field === "status") return label(STATUSES, String(value))
  if (field === "kind") return label(KINDS, String(value))
  if (field === "stage") return label(STAGES, String(value))
  if (Array.isArray(value)) return value.map((v) => label(PLATFORMS, String(v))).join(", ") || "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return formatDay(value.slice(0, 10))
  return String(value)
}

export function HistoryList({ rows }: { rows: AuditRow[] }) {
  if (rows.length === 0) return <p className="meta">Nothing recorded yet.</p>
  return (
    <ol className="history">
      {rows.map((row) => (
        <li key={row.id}>
          <time dateTime={new Date(row.at).toISOString()}>{formatStamp(row.at)}</time>
          <div>
            <strong>{row.user_name ?? "Unknown"}</strong> {row.summary ?? row.action.replace(/_/g, " ")}
            {row.changes && row.action === "item_updated" && Object.keys(row.changes).length > 1 && (
              <ul className="meta" style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                {Object.entries(row.changes).map(([field, change]) => (
                  <li key={field}>
                    {FIELD_NAMES[field] ?? field.replace(/_/g, " ")}: {showValue(field, change.from)} → {showValue(field, change.to)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
