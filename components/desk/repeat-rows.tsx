"use client"

import { useState } from "react"

import { KINDS, METRICS, PLATFORMS } from "@/lib/desk/config"

// New deliverables typed straight into a plan. Each becomes a tracker item on submit.
export function NewItemRows({ people, start = 1 }: { people: string[]; start?: number }) {
  const [count, setCount] = useState(start)

  return (
    <div className="repeat">
      <input type="hidden" name="new_count" value={count} />
      {Array.from({ length: count }, (_, n) => (
        <fieldset className="row-card" key={n}>
          <legend>New deliverable {n + 1}</legend>
          <label>
            Title
            <input name={`new_${n}_title`} maxLength={200} placeholder="Working title" />
          </label>
          <div className="grid-3">
            <label>
              Type
              <select name={`new_${n}_kind`} defaultValue="story">
                {Object.entries(KINDS).map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Format
              <input name={`new_${n}_format`} maxLength={120} placeholder="e.g. Explainer, 3-min video" />
            </label>
            <label>
              Deadline
              <input name={`new_${n}_deadline`} type="date" />
            </label>
          </div>
          <div className="grid-2">
            <label>
              Owner
              <input name={`new_${n}_owner`} list="desk-people" maxLength={120} />
            </label>
            <label>
              Success measure
              <input name={`new_${n}_success_measure`} maxLength={300} placeholder="What does good look like?" />
            </label>
          </div>
          <PlatformChecks name={`new_${n}_platforms`} />
        </fieldset>
      ))}
      <datalist id="desk-people">
        {people.map((person) => (
          <option key={person} value={person} />
        ))}
      </datalist>
      <button type="button" className="button outline small" onClick={() => setCount((c) => Math.min(c + 1, 30))}>
        Add another deliverable
      </button>
    </div>
  )
}

export function PlatformChecks({ name, selected = [] }: { name: string; selected?: string[] }) {
  return (
    <fieldset className="checks">
      <legend>Platforms</legend>
      {Object.entries(PLATFORMS).map(([value, platform]) => (
        <label key={value}>
          <input type="checkbox" name={name} value={value} defaultChecked={selected.includes(value)} />
          {platform}
        </label>
      ))}
    </fieldset>
  )
}

type TargetRow = { metric: string; label: string; target: string }

// Monthly target rows: what is measured and the number agreed
export function TargetRows({ initial, locked = false }: { initial: TargetRow[]; locked?: boolean }) {
  const [rows, setRows] = useState<TargetRow[]>(initial.length ? initial : [{ metric: "delivered", label: "", target: "" }])
  const update = (n: number, change: Partial<TargetRow>) => setRows((all) => all.map((row, i) => (i === n ? { ...row, ...change } : row)))

  return (
    <div className="repeat">
      <input type="hidden" name="target_count" value={rows.length} />
      {rows.map((row, n) => (
        <div className="target-row" key={n}>
          <label>
            <span className="visually-hidden">Measure {n + 1}</span>
            <select
              name={`target_${n}_metric`}
              value={row.metric}
              disabled={locked}
              onChange={(e) => update(n, { metric: e.target.value })}
            >
              {Object.entries(METRICS).map(([value, metric]) => (
                <option key={value} value={value}>
                  {metric.label}
                  {metric.auto ? " (counted automatically)" : ""}
                </option>
              ))}
            </select>
          </label>
          {row.metric === "custom" && (
            <label>
              <span className="visually-hidden">Name of measure {n + 1}</span>
              <input
                name={`target_${n}_label`}
                value={row.label}
                maxLength={120}
                placeholder="Name the measure"
                disabled={locked}
                onChange={(e) => update(n, { label: e.target.value })}
              />
            </label>
          )}
          <label className="target-number">
            <span className="visually-hidden">Target for measure {n + 1}</span>
            <input
              name={`target_${n}_value`}
              value={row.target}
              inputMode="decimal"
              placeholder="Target"
              disabled={locked}
              onChange={(e) => update(n, { target: e.target.value })}
            />
            {METRICS[row.metric as keyof typeof METRICS]?.unit && <span className="unit">%</span>}
          </label>
          {!locked && (
            <button
              type="button"
              className="link-button danger"
              onClick={() => setRows((all) => all.filter((_, i) => i !== n))}
              aria-label={`Remove target ${n + 1}`}
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {!locked && (
        <button
          type="button"
          className="button outline small"
          onClick={() => setRows((all) => [...all, { metric: "custom", label: "", target: "" }])}
        >
          Add a target
        </button>
      )}
    </div>
  )
}
